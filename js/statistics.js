// Every number here is calculated from the saved history, nothing is invented.
const Stats = {
  compute() {
    const h = Store.state.history, wins = h.filter(x => x.win), inv = Store.state.inv;
    const ids = Object.keys(inv), tot = ids.reduce((a, i) => a + inv[i].count, 0);
    return { plays: h.length, wins: wins.length, rate: h.length ? Math.round(wins.length / h.length * 100) : 0, total: tot, unique: ids.length,
      rare: ids.filter(i => ['rare', 'epic', 'legendary'].includes(PRIZES.find(p => p.id === i).rarity)).length };
  },
  render() {
    const s = this.compute(), st = Store.state;
    const recent = st.history.slice(-5).reverse().map(x => `<li>${x.win ? '✅ Grabbed ' + x.prize : '❌ Missed'} <small>(${x.machine}, est. ${x.chance}%)</small></li>`).join('') || '<li>No plays yet.</li>';
    return `<div class="stats">${[['Plays', s.plays], ['Grabs', s.wins], ['Win rate', s.rate + '%'], ['Prizes', s.total], ['Unique', s.unique + '/' + PRIZES.length], ['Rare+', s.rare]].map(a => `<div class="card stat"><small>${a[0]}</small><b>${a[1]}</b></div>`).join('')}</div>
    <div class="card"><h3>Level ${Store.level()}</h3><div class="bar"><i style="width:${st.xp % 100}%"></i></div><small>${st.xp % 100}/100 XP</small></div>
    <div class="card"><h3>Recent activity</h3><ul>${recent}</ul></div>`;
  }
};
