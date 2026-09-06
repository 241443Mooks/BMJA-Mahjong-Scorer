# BMJA whole-game rule interpretation

The game layer uses the BMJA-aligned explanations at:

- https://mahjongbritishrules.wordpress.com/the-game/preparing-to-play/
- https://mahjongbritishrules.wordpress.com/questions/scoring

## Settlement

Settlement is pairwise:

1. Each non-winner pays the winner the winner's score.
2. Each pair of non-winners settles the difference between their hand scores;
   the lower scorer pays the higher scorer.
3. A transfer is doubled whenever East is either payer or recipient.
4. A wash-out has no transfers.

This produces the published Bill/Rod/Ben/Jack result:

| Player | Net change |
| --- | ---: |
| Bill | +336 |
| Rod (East) | -1096 |
| Ben | -36 |
| Jack | +796 |

Every settlement is checked to total zero before it is returned.

## Progression

- East remains East when East wins.
- East remains East after a drawn hand (wash-out).
- When another player wins, winds rotate anti-clockwise: South becomes East,
  East becomes North, North becomes West, and West becomes South.
- The prevailing wind advances only when rotation returns East to the player
  who began the current prevailing-wind cycle, meaning all four players have
  served as East.

## Remaining interpretation note

The cited material explicitly says East and the winds do not change after a
draw. It describes tally settlement as occurring once someone has gone
Mah-Jong, so a wash-out is implemented with no transfers. No separate published
worked wash-out settlement example was found.