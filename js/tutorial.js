// Guided tutorial. Some steps are gated until the player really does the action.
const Tutorial = {
  i: 0, on: false,
  steps: [
    { t: 'Welcome to your first DROPZONE machine! Look at the glass cabinet, the prize pile, the claw on its rail, the control panel below and the exit chute at bottom-left.', hl: '#cv' },
    { t: 'Move the claw: press LEFT and RIGHT (or the arrow keys). Hold to keep moving.', hl: '.mv', gate: () => Claw.moved },
    { t: 'Aim: line the claw up above a prize. The closer you are to its centre, the higher the estimated grip chance shown here.', hl: '#chance' },
    { t: 'The DROP button (or Spacebar) lowers the claw. You cannot move it while it descends.', hl: '#drop' },
    { t: 'Practice drop: press DROP above any prize. This guided round is free and a guaranteed demo win, so it does not count in your stats.', hl: '#drop', gate: () => Tutorial.done },
    { t: 'About RNG: in normal rounds, good aim only sets your chance (say 60%). The game then rolls a random number: it is like 6 wins out of 10 on average, never a promise. Heavy prizes lower the chance.', hl: '#chance' },
    { t: "You're ready! Welcome to the DROPZONE Arcade. Finish to get 30 free tokens.", hl: '' }],
  start() { this.i = 0; this.on = true; this.done = false; Claw.moved = false; Claw.tutorial = true; App.go('play'); },
  notify() { this.done = true; this.render(); },
  render() {
    const el = $('#tut'); if (!el) return;
    document.querySelectorAll('.hl').forEach(e => e.classList.remove('hl'));
    if (!this.on) { el.innerHTML = ''; return; }
    const s = this.steps[this.i]; if (s.hl) document.querySelectorAll(s.hl).forEach(e => e.classList.add('hl'));
    const ok = !s.gate || s.gate(), last = this.i === this.steps.length - 1;
    el.innerHTML = `<div class="card tut"><small>Stage ${this.i + 1} of ${this.steps.length}</small><div class="bar"><i style="width:${(this.i + 1) / this.steps.length * 100}%"></i></div><p>${s.t}</p>
      <div class="row"><button class="btn alt" onclick="Tutorial.go(-1)" ${this.i ? '' : 'disabled'}>Previous</button><button class="btn" id="t-next" onclick="Tutorial.go(1)" ${ok ? '' : 'disabled'}>${last ? 'Finish' : 'Next'}</button><button class="btn alt" onclick="Tutorial.end(false)">Skip</button><button class="btn alt" onclick="Tutorial.start()">Restart</button></div></div>`;
  },
  go(d) { if (this.i + d >= this.steps.length) return this.end(true); this.i = Math.max(0, this.i + d); this.done = false; this.render(); },
  end(finished) {
    this.on = false; Claw.tutorial = false; Claw.refill(); Store.state.tutorial = true; // tutorial completion is saved
    if (finished && !Store.state.tutorialReward) { Store.state.tokens += 30; Store.state.tutorialReward = true; toast('Tutorial complete! +30 tokens'); }
    Store.save(); this.render(); App.refreshTop();
  }
};
