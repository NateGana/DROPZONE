# DROPZONE — Test Your Luck. Grab Your Prize.


## Play
Pick a machine, move with LEFT/RIGHT (or ← →, hold to keep moving), line the claw over a prize (estimated grip chance is shown), press DROP (or Space). Each attempt costs tokens; successful grabs go to your collection and give XP and tickets. Use "How to play" for the guided tutorial.

## RNG
Prize selection (weighted rarity odds 50/25/15/8/2 = 100%) and claw grip are separate. Grip chance = machine grip × (1 − 0.5 × prize weight) × aim factor. The roll is plain `Math.random()`; there is no hidden pity or loss-based adjustment. Sample odds only, not real-world machine odds.


