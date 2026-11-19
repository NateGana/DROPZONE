// All progress is kept in one LocalStorage key so export/import stays simple.
const KEY = 'dropzone_state';
const Store = {
  state: null,
  fresh() { return { name: 'Player 01', tokens: 50, tickets: 0, xp: 0, inv: {}, history: [], tutorial: false, lastDaily: '', machine: 'classic', settings: { sound: true, reduced: false } }; },
  load() { // Load the saved player information before showing the dashboard.
    try { const s = JSON.parse(localStorage.getItem(KEY)); this.state = this.valid(s) ? Object.assign(this.fresh(), s) : this.fresh(); }
    catch (e) { this.state = this.fresh(); }
  },
  save() { localStorage.setItem(KEY, JSON.stringify(this.state)); },
  valid(s) { return s && typeof s.tokens === 'number' && s.tokens >= 0 && typeof s.tickets === 'number' && s.tickets >= 0 && typeof s.xp === 'number' && s.inv && typeof s.inv === 'object' && Array.isArray(s.history) && s.settings; },
  spend(n) { if (this.state.tokens < n) return false; this.state.tokens -= n; this.save(); return true; }, // never goes negative
  level() { return Math.floor(this.state.xp / 100) + 1; },
  export() { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(this.state)], { type: 'application/json' })); a.download = 'dropzone-save.json'; a.click(); },
  import(text) { try { const s = JSON.parse(text); if (!this.valid(s)) return false; this.state = Object.assign(this.fresh(), s); this.save(); return true; } catch (e) { return false; } },
  reset() { this.state = this.fresh(); this.save(); }
};
Store.load();
