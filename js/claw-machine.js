// The playable claw machine: a canvas drawn every frame plus a small state machine.
// States: IDLE/MOVING -> DROPPING -> GRABBING -> RETURNING -> (CARRYING -> WIN) or FAILED -> back to IDLE
const Claw = {
  W: 480, H: 520, TOP: 70, FLOOR: 395, CHUTE_X: 60,
  state: 'IDLE', x: 280, y: 70, close: 0, dir: 0, pile: [], held: null, heldY: 0, machine: null,
  tutorial: false, msg: '', timer: 0, chance: 0, moved: false, last: 0, running: false, onEnd: null,

  init(cv) {
    this.cv = cv; this.ctx = cv.getContext('2d'); cv.width = this.W; cv.height = this.H;
    this.state = 'IDLE'; this.y = this.TOP; this.close = 0; this.held = null; this.msg = '';
    this.setMachine(Store.state.machine);
    if (!this.running) { this.running = true; requestAnimationFrame(t => this.loop(t)); }
  },
  setMachine(id) {
    let m = MACHINES.find(x => x.id === id) || MACHINES[0];
    if (Store.level() < m.unlock) m = MACHINES[0];
    this.machine = m; Store.state.machine = m.id; this.refill();
  },
  refill() {
    this.pile = [];
    for (let i = 0; i < 7; i++) this.pile.push({ p: RNG.pick(this.machine.pool()), x: 120 + i * 55 });
    if (this.tutorial) this.pile[3].p = PRIZES[0]; // easy target for the guided practice drop
  },
  drop() {
    if (!['IDLE', 'MOVING'].includes(this.state)) return; // no double drops while animating
    const cost = this.tutorial ? 0 : this.machine.cost;
    if (!Store.spend(cost)) { toast('Not enough tokens!'); beep(150, 0.3); return; } // charged once, here only
    this.dir = 0; this.msg = ''; this.state = 'DROPPING'; App.refreshTop(); beep(300, 0.15);
  },
  nearest() {
    let best = null, d = 1e9;
    for (const s of this.pile) { const dd = Math.abs(s.x - this.x); if (dd < d) { d = dd; best = s; } }
    return { slot: best, dist: d };
  },
  estimate() { const n = this.nearest(); return this.tutorial ? 1 : RNG.grip(this.machine, n.slot.p, n.dist); },

  loop(t) {
    if (!this.cv.isConnected) { this.running = false; return; } // stop when the player leaves the play page
    const k = Math.min(3, (t - this.last) / 16.7 || 1); this.last = t;
    this.update(k); this.draw(); requestAnimationFrame(t2 => this.loop(t2));
  },
  update(k) {
    const s = this.state;
    if (s === 'IDLE' || s === 'MOVING') {
      this.state = this.dir ? 'MOVING' : 'IDLE';
      // Keep the claw inside the machine so the player cannot move it outside the cabinet.
      if (this.dir) { this.x = clamp(this.x + this.dir * 3 * k, 105, this.W - 30); this.moved = true; }
      const el = $('#chance'); if (el) { const n = this.nearest(), c = this.estimate();
        el.textContent = n.dist < n.slot.p.size * 1.2 ? `Estimated grip: ${Math.round(c * 100)}% (${RARITIES[n.slot.p.rarity].label} · ${n.slot.p.name}) — an estimate, not a guarantee` : 'No prize in range'; }
    } else if (s === 'DROPPING') { this.y += 4 * k; if (this.y >= this.FLOOR) { this.y = this.FLOOR; this.state = 'GRABBING'; beep(500, 0.1); }
    } else if (s === 'GRABBING') {
      this.close = Math.min(1, this.close + 0.03 * k);
      if (this.close >= 1) { // Evaluate using position, size, weight and grip, then roll.
        const n = this.nearest(); this.chance = this.estimate(); this.target = n.slot;
        this.win = this.chance > 0 && (this.tutorial || RNG.roll(this.chance));
        this.held = this.win ? n.slot : null; this.state = 'RETURNING'; }
    } else if (s === 'RETURNING') {
      this.y -= 3 * k; if (!this.win && this.y < (this.TOP + this.FLOOR) / 2) this.close = Math.max(0, this.close - 0.05 * k); // slips out
      if (this.y <= this.TOP) { this.y = this.TOP; if (this.win) this.state = 'CARRYING'; else { this.state = 'FAILED'; this.timer = 70; this.msg = 'Better Luck Next Time!'; beep(180, 0.4); } }
    } else if (s === 'CARRYING') {
      this.x -= 3 * k; if (this.x <= this.CHUTE_X) { this.x = this.CHUTE_X; this.state = 'WIN'; this.timer = 90; this.heldY = this.y + 30; this.close = 0; this.msg = 'YOU GOT IT!'; beep(880, 0.3); }
    } else if (s === 'WIN') {
      this.heldY = Math.min(this.FLOOR + 10, this.heldY + 4 * k); this.timer -= k; if (this.timer <= 0) this.finish();
    } else if (s === 'FAILED') { this.timer -= k; if (this.timer <= 0) this.finish(); }
  },
  finish() { // Update the player's statistics after each completed round.
    const slot = this.target, p = slot.p, st = Store.state;
    if (!this.tutorial) {
      st.history.push({ win: this.win, prize: this.win ? p.name : null, machine: this.machine.id, chance: Math.round(this.chance * 100), t: Date.now() });
      st.xp += this.win ? RARITIES[p.rarity].xp : 2;
      if (this.win) { Collection.add(p); st.tickets += 1; toast(`${RARITIES[p.rarity].label}: ${p.name}!`); } // prize added only after reaching the chute
      else toast('Missed — the prize stays in the machine.');
    }
    if (this.win) { const i = this.pile.indexOf(slot); this.pile[i] = { p: RNG.pick(this.machine.pool()), x: slot.x }; } // replace the won prize
    Store.save(); this.held = null; this.close = 0; this.x = 280; this.state = 'IDLE'; this.msg = '';
    App.refreshTop(); if (this.onEnd) this.onEnd();
  },

  prize(c, p, x, y) {
    const R = RARITIES[p.rarity], s = p.size;
    c.fillStyle = CATS[p.cat].color; c.strokeStyle = R.color; c.lineWidth = 3;
    c.beginPath(); c.roundRect(x - s, y - s, s * 2, s * 2, 12); c.fill(); c.stroke();
    c.fillStyle = '#10101C'; c.font = (s) + 'px sans-serif'; c.textAlign = 'center';
    c.fillText(p.cat === 'cinna' ? '☁' : p.cat === 'gta' ? '🌴' : p.cat === 'poke' ? '◓' : '☺', x, y + s * 0.35);
  },
  draw() {
    const c = this.ctx, W = this.W, H = this.H;
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1b1440'); g.addColorStop(1, '#2b1a55'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = '#444466'; c.fillRect(0, 50, W, 10); // rail
    c.fillStyle = '#35D6E8'; for (let i = 0; i < 12; i++) c.fillRect(8 + i * 40, 8, 14, 6); // lights
    c.fillStyle = '#0b0b18'; c.fillRect(0, this.FLOOR + 40, 100, H); c.fillStyle = '#FFC857'; c.font = '14px Space Grotesk'; c.textAlign = 'center'; c.fillText('EXIT CHUTE', 50, this.FLOOR + 80);
    c.fillStyle = '#33335a'; c.fillRect(0, this.FLOOR + 38, W, 6);
    for (const s of this.pile) if (s !== this.held) this.prize(c, s.p, s.x, this.FLOOR + 10 - s.p.size * 0.0 + 0);
    c.strokeStyle = '#aaa'; c.lineWidth = 3; c.beginPath(); c.moveTo(this.x, 55); c.lineTo(this.x, this.y); c.stroke();
    c.fillStyle = '#bbb'; c.fillRect(this.x - 22, 48, 44, 14);
    const a = 24 - 14 * this.close; c.lineWidth = 5; c.strokeStyle = '#35D6E8'; c.lineCap = 'round';
    for (const d of [-1, 1]) { c.beginPath(); c.moveTo(this.x, this.y); c.lineTo(this.x + d * a, this.y + 28); c.stroke(); }
    if (this.held) this.prize(c, this.held.p, this.x, this.state === 'WIN' ? this.heldY : this.y + 32);
    c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(20, 70, 40, H); // glass reflection
    if (this.msg) { c.fillStyle = this.win ? '#FFC857' : '#FB7185'; c.font = '700 30px Space Grotesk'; c.fillText(this.msg, W / 2, 200); }
  }
};
