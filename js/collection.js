const Collection = {
  filter: { q: '', r: '' },
  add(p) { const inv = Store.state.inv; // Only called after the prize really reaches the chute.
    if (inv[p.id]) inv[p.id].count++; else inv[p.id] = { count: 1, date: new Date().toLocaleDateString() }; },
  render() {
    const inv = Store.state.inv, f = this.filter;
    const cards = PRIZES.filter(p => (!f.r || p.rarity === f.r) && p.name.toLowerCase().includes(f.q)).map(p => {
      const o = inv[p.id], R = RARITIES[p.rarity];
      return `<div class="pc ${o ? p.rarity : 'lock'}" style="--rc:${R.color}">${art(p)}<div>${o ? p.name : '???'}</div><span class="badge">${R.label}</span>
      <div><small>${o ? CATS[p.cat].label + ' · x' + o.count + '<br>' + o.date + '<br>' + p.desc : 'Locked'}</small></div></div>`; }).join('');
    return `<h2>Prize Collection (${Object.keys(inv).length}/${PRIZES.length})</h2><div class="row"><input id="c-q" placeholder="Search" value="${f.q}"><select id="c-r"><option value="">All rarities</option>${Object.keys(RARITIES).map(k => `<option value="${k}" ${f.r === k ? 'selected' : ''}>${RARITIES[k].label}</option>`).join('')}</select></div><div class="grid">${cards}</div>`;
  }
};
