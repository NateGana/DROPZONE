// Two separate calculations: which prize is in the pile (rarity weights) and whether the claw grips it.
const RNG = {
  pick(pool) { // weighted by rarity odds
    const tot = pool.reduce((a, p) => a + RARITIES[p.rarity].odds, 0); let r = Math.random() * tot;
    for (const p of pool) { r -= RARITIES[p.rarity].odds; if (r <= 0) return p; }
    return pool[0];
  },
  // I separated the grab calculation so it is easier to adjust the machine difficulty.
  grip(machine, prize, dist) {
    const q = clamp(1 - dist / (prize.size * 1.2), 0, 1); // 1 = perfectly centred, 0 = out of reach
    if (q <= 0) return 0;
    return clamp(machine.grip * (1 - prize.weight * 0.5) * (0.15 + 0.85 * q), 0, 0.95);
  },
  roll(chance) { return Math.random() < chance; } // no hidden pity or loss-based adjustment
};
