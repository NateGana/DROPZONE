// Page routing and UI. Game rules live in the other files.
const VIEWS = { dash: 'Dashboard', play: 'Play Claw Machine', machines: 'Machines', collection: 'Prize Collection', academy: 'RNG Academy', settings: 'Settings & Profile' };
const App = {
  view: 'dash',
  refreshTop() { const s = Store.state; $('#t-tokens').textContent = s.tokens; $('#t-tickets').textContent = s.tickets; $('#t-level').textContent = Store.level(); $('#t-name').textContent = s.name; },
  go(v) {
    this.view = v; $('#welcome').classList.add('hide');
    $('#nav').innerHTML = Object.keys(VIEWS).map(k => `<button class="${k === v ? 'on' : ''}" onclick="App.go('${k}')">${VIEWS[k]}</button>`).join('');
    const m = $('#view'); m.innerHTML = this['v_' + v](); this.refreshTop(); if (this['after_' + v]) this['after_' + v]();
  },
  today() { return new Date().toISOString().slice(0, 10); },
  claimDaily() { const s = Store.state; if (s.lastDaily === this.today()) return; s.lastDaily = this.today(); s.tokens += 20; Store.save(); toast('+20 daily tokens'); this.go('dash'); },
  v_dash() {
    const claimed = Store.state.lastDaily === this.today();
    return `<h2>Dashboard</h2><div class="card"><h3>Featured machine: Classic Claw</h3><button class="btn" onclick="App.go('play')">PLAY MACHINE</button></div>
    <div class="card"><h3>Daily reward</h3><button class="btn" onclick="App.claimDaily()" ${claimed ? 'disabled' : ''}>${claimed ? 'Claimed today' : 'Claim 20 tokens'}</button></div>` + Stats.render();
  },
  v_play() {
    const opts = MACHINES.map(m => `<option value="${m.id}" ${Store.level() < m.unlock ? 'disabled' : ''} ${m.id === Store.state.machine ? 'selected' : ''}>${m.name} (${m.cost} tokens)${Store.level() < m.unlock ? ' 🔒 Lv' + m.unlock : ''}</option>`).join('');
    return `<div id="tut"></div><div class="play"><div><canvas id="cv"></canvas><div class="ctl mv"><button class="btn mv hold" data-d="-1">◀ LEFT</button><button class="btn" id="drop" onclick="Claw.drop()">DROP</button><button class="btn mv hold" data-d="1">RIGHT ▶</button></div><div class="ctl"><button class="btn alt" onclick="Claw.state==='IDLE'&&(Claw.x=280)">RESET POSITION</button></div></div>
    <div><div class="card"><select id="msel">${opts}</select><p id="chance"></p><small>Keys: ← → move, Space drops. Cost per attempt: shown in the list. Virtual tokens only.</small></div><div class="card" id="rngp"></div></div></div>`;
  },
  after_play() {
    Claw.init($('#cv')); Claw.onEnd = () => { this.rngPanel(); if (Tutorial.on) Tutorial.notify(); };
    $('#msel').onchange = e => { if (Claw.state === 'IDLE') Claw.setMachine(e.target.value); this.rngPanel(); };
    document.querySelectorAll('.hold').forEach(b => { const d = +b.dataset.d; const down = e => { e.preventDefault(); if (['IDLE', 'MOVING'].includes(Claw.state)) Claw.dir = d; }, up = () => { Claw.dir = 0; };
      b.addEventListener('pointerdown', down); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, up)); });
    this.rngPanel(); Tutorial.render(); this.tutLoop();
  },
  tutLoop() { if (Tutorial.on && $('#cv')) { const b = $('#t-next'), s = Tutorial.steps[Tutorial.i]; if (b && s.gate && s.gate()) b.disabled = false; setTimeout(() => this.tutLoop(), 300); } },
  rngPanel() { const h = Store.state.history, w = h.filter(x => x.win).length, m = Claw.machine;
    $('#rngp').innerHTML = `<h3>RNG transparency</h3><small>Rarity odds (sample, virtual): ${Object.values(RARITIES).map(r => r.label + ' ' + r.odds + '%').join(' · ')} = 100%.<br>Grip strength: ${m.grip} · Cost: ${m.cost} · Attempts: ${h.length} · Grabs: ${w} · Misses: ${h.length - w}.<br>Grip chance = grip × (1 − 0.5×weight) × aim factor. Prize selection and grip are separate rolls. No pity system.</small>`; },
  v_machines() { return '<h2>Machines</h2><div class="grid">' + MACHINES.map(m => { const lock = Store.level() < m.unlock;
    return `<div class="card"><h3>${m.name}</h3><small>${m.desc}<br>Cost ${m.cost} · Grip ${m.grip}<br>Prizes: ${m.pool().length}</small><br><button class="btn" ${lock ? 'disabled' : ''} onclick="Store.state.machine='${m.id}';App.go('play')">${lock ? 'Unlocks at level ' + m.unlock : 'Play'}</button></div>`; }).join('') + '</div>'; },
  v_collection() { return Collection.render(); },
  after_collection() { $('#c-q').oninput = e => { Collection.filter.q = e.target.value.toLowerCase(); const p = e.target.selectionStart; $('#view').innerHTML = Collection.render(); this.after_collection(); $('#c-q').focus(); }; $('#c-r').onchange = e => { Collection.filter.r = e.target.value; $('#view').innerHTML = Collection.render(); this.after_collection(); }; },
  v_academy() { return '<h2>The RNG Academy</h2><button class="btn" onclick="Tutorial.start()">Replay interactive tutorial</button><br><br>' + LESSONS.map((l, i) => `<details><summary>Lesson ${i + 1}: ${l[0]}</summary><p>${l[1]}</p></details>`).join(''); },
  v_settings() { const s = Store.state; return `<h2>Settings & Profile</h2><div class="card"><p>Username <input id="s-name" value="${s.name}" maxlength="16"> <button class="btn alt" onclick="Store.state.name=$('#s-name').value||'Player 01';Store.save();App.refreshTop();toast('Saved')">Save</button></p>
    <p><label><input type="checkbox" id="s-snd" ${s.settings.sound ? 'checked' : ''}> Sound effects</label> <label><input type="checkbox" id="s-red" ${s.settings.reduced ? 'checked' : ''}> Reduced motion</label></p>
    <div class="row"><button class="btn alt" onclick="Store.export()">Export data</button><input type="file" id="s-imp" accept=".json"><button class="btn alt" onclick="if(confirm('Reset ALL progress?')){Store.reset();App.go('dash')}">Reset progress</button></div></div>`; },
  after_settings() {
    $('#s-snd').onchange = e => { Store.state.settings.sound = e.target.checked; Store.save(); };
    $('#s-red').onchange = e => { Store.state.settings.reduced = e.target.checked; Store.save(); document.body.classList.toggle('reduced', e.target.checked); };
    $('#s-imp').onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { if (Store.import(t)) { toast('Import complete'); App.go('dash'); } else toast('Invalid save file'); }); };
  }
};
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.toggle('reduced', Store.state.settings.reduced); App.refreshTop();
  const start = () => { App.go('play'); if (!Store.state.tutorial && confirm('First time here? Play the interactive tutorial?')) Tutorial.start(); };
  document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => b.dataset.go === 'play' ? start() : App.go(b.dataset.go));
  $('#b-how').onclick = () => Tutorial.start();
  document.addEventListener('keydown', e => { if (App.view !== 'play') return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); if (['IDLE', 'MOVING'].includes(Claw.state)) Claw.dir = e.key === 'ArrowLeft' ? -1 : 1; }
    else if (e.key === ' ' || e.key === 'Enter') { if (document.activeElement.tagName === 'BUTTON') return; e.preventDefault(); Claw.drop(); } });
  document.addEventListener('keyup', e => { if (e.key.startsWith('Arrow')) Claw.dir = 0; });
});
