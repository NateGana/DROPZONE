// Static game data: rarities, collections, prizes and machine settings.
const RARITIES = {
  common:   { label: 'Common',    color: '#9ca3af', odds: 50, size: 24, weight: 0.2,  xp: 5 },
  uncommon: { label: 'Uncommon',  color: '#4ADE80', odds: 25, size: 26, weight: 0.35, xp: 10 },
  rare:     { label: 'Rare',      color: '#3b82f6', odds: 15, size: 28, weight: 0.5,  xp: 20 },
  epic:     { label: 'Epic',      color: '#8B5CF6', odds: 8,  size: 30, weight: 0.65, xp: 40 },
  legendary:{ label: 'Legendary', color: '#FFC857', odds: 2,  size: 32, weight: 0.8,  xp: 100 }
};
const CATS = { gta: { label: 'GTA VI-inspired', color: '#F472B6' }, cinna: { label: 'Cinnamoroll-inspired', color: '#7dd3fc' },
  poke: { label: 'Pokémon-inspired', color: '#FFC857' }, nathan: { label: "Nathan's Mini Collection", color: '#8B5CF6' } };
const _p = [
 ['Common Cinnamoroll Keychain','cinna','common'],['Basic Mystery Plush','poke','common'],['Small Poké Ball Collectible','poke','common'],['Mini Arcade Souvenir','gta','common'],
 ['Cinnamoroll Mini Plush','cinna','uncommon'],['Eevee-Inspired Figure','poke','uncommon'],['Neon City Keychain','gta','uncommon'],['Nathan Casual Figure','nathan','uncommon'],
 ['GTA VI Collector Mini Case','gta','rare'],['Pikachu-Style Plush','poke','rare'],['Cinnamoroll Premium Figure','cinna','rare'],['Nathan Arcade Edition','nathan','rare'],
 ['Vice City Neon Collectible','gta','epic'],['Premium Cinnamoroll Plush','cinna','epic'],['Rare Pokémon Collectible','poke','epic'],['Nathan Limited Figure','nathan','epic'],
 ['GTA VI Ultimate Collector Item','gta','legendary'],['Cinnamoroll Golden Edition','cinna','legendary'],['Legendary Pokémon Collectible','poke','legendary'],['Nathan Golden Figure','nathan','legendary']];
const PRIZES = _p.map((x, i) => ({ id: 'p' + i, name: x[0], cat: x[1], rarity: x[2], size: RARITIES[x[2]].size, weight: RARITIES[x[2]].weight,
  desc: `A ${RARITIES[x[2]].label.toLowerCase()} fan-made collectible from the ${CATS[x[1]].label} set.` }));
// Machine differences are real numbers used by the grab calculation (grip, cost), not only labels.
const MACHINES = [
 { id: 'classic', name: 'Classic Claw', desc: 'Beginner friendly. Normal grip.', grip: 0.7, cost: 10, unlock: 1, pool: () => PRIZES },
 { id: 'cute', name: 'Cute Prize Machine', desc: 'Cinnamoroll-style prizes, easier to grab.', grip: 0.85, cost: 8, unlock: 1, pool: () => PRIZES.filter(p => p.cat === 'cinna') },
 { id: 'mystery', name: 'Mystery Machine', desc: 'Mixed pool, random display.', grip: 0.65, cost: 15, unlock: 2, pool: () => PRIZES },
 { id: 'hunter', name: 'Legendary Hunter', desc: 'GTA, Pokémon and Nathan. Weak grip, high cost.', grip: 0.55, cost: 20, unlock: 3, pool: () => PRIZES.filter(p => p.cat !== 'cinna') }
];
const LESSONS = [
 ['What is a gacha game?','Players spend a virtual currency for a random reward. Rarer rewards have lower chances.'],
 ['What is RNG?','Random number generation: the game picks a number and compares it to a chance. Each roll is independent.'],
 ['How claw machines work','A crane moves on two axes, drops a claw with limited grip strength, and tries to lift a prize. Real machines differ in settings.'],
 ['Understanding odds','A 10% chance does not mean "once every 10 tries". You can win twice in a row or miss 30 times.'],
 ['Understanding rarity','Common, uncommon, rare, epic and legendary tiers. Higher tiers appear less often in the prize pool (sample odds 50/25/15/8/2 = 100%, virtual only).'],
 ['Skill vs. luck','Skill: aiming the claw. Luck: the final roll. Heavier, larger prizes are harder to grip. Prize selection and grip chance are two separate calculations.'],
 ['Pity systems','Some gacha games raise odds after many misses. DROPZONE does NOT: a failed attempt never changes your next chance.'],
 ['Responsible gaming','Results are unpredictable and losses do not make wins "due". Real-money gambling is risky: set limits and play for fun.']];
