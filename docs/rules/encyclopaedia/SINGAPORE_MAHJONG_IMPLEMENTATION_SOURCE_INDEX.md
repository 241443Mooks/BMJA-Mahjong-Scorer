# SingaporeMahjong.com profile — 251A1 source-local Fan index

Status: **counted named implementation corpus; not a claim of universal Singapore rules**  
Parent: #251  
Date checked: 18 September 2026

## Source pin

First-party rules for the SingaporeMahjong.com web/mobile implementation:

- https://www.singaporemahjong.com/rules/
- site root: https://www.singaporemahjong.com/

The site describes and implements a 148-tile Singapore Mahjong profile and has published its own rules material for many years. It is **not** treated here as a Singapore national association or universal authority. Its value to A1 is that it is a bounded, named implementation profile whose source can be audited directly.

The page itself also identifies rule variations and differences between web/mobile support, which reinforces that local/table variation exists.

## Finite Fan catalogue boundary

The source contains an explicit section headed **How To Earn Fan (or Doubles)**. It states that the following is the list of ways to earn Fan and then gives a finite sequence of rows. The next heading is **Maximum Fan Limit (Doubles Limit)**.

That closed section contains **26 source-local Fan conditions**.

Immediate side payouts (Kongs, animal pairs, bonus-tile pairs/sets) and later `Pay All` liability situations are settlement/procedure mechanics outside this 26-item Fan catalogue and are therefore not added to the A1 concept count in this file.

## 26 source-local Fan conditions

| Local index | Source-local condition | Source value |
| --- | --- | ---: |
| SG-01 | Pong or Kong of Dragon Tiles | 1 Fan for each |
| SG-02 | Pong or Kong of Prevailing Wind | 1 Fan |
| SG-03 | Pong or Kong of Player Game Wind | 1 Fan |
| SG-04 | Chicken game | 0 Fan |
| SG-05 | All Chow game | 1 Fan |
| SG-06 | Ping Wu game | 4 Fan |
| SG-07 | All Pong game | 2 Fan |
| SG-08 | Half Color game | 2 Fan |
| SG-09 | Full Color game | 4 Fan |
| SG-10 | All Terminal game | 9 Fan |
| SG-11 | Half Terminal game | 2 Fan |
| SG-12 | 13 Wonders Game | 8 Fan |
| SG-13 | Animal Tiles | 1 Fan for each |
| SG-14 | Complete Animal Set | 1 extra Fan |
| SG-15 | Flower Tile matching Player Wind | 1 Fan for each |
| SG-16 | Complete Flower Set | 1 extra Fan |
| SG-17 | Complete Season Set | 1 extra Fan |
| SG-18 | Win with a Replacement Tile | 1 Fan |
| SG-19 | Win with the last valid tile | 1 Fan |
| SG-20 | Robbing the Kong | 1 Fan |
| SG-21 | Win with Eight Flower Tiles | 12 Fan |
| SG-22 | Win with Seven Flower Tiles | 10 Fan |
| SG-23 | All Dragon game | 7 Fan |
| SG-24 | All Wind game | 12 Fan |
| SG-25 | Two Dragon sets plus the third Dragon as Eye | 1 extra Fan |
| SG-26 | Three-of-four honour-set combination plus fourth as Eye | 4 Fan total; source wording ambiguity noted below |

## Source wording ambiguity — SG-26

The source row says, in substance, that the hand has a Pong/Kong of **three of the four Dragon Tiles** and the remaining Dragon as the Eye. Standard Mahjong has only three Dragon types, while the source elsewhere separately defines four Winds and describes the corresponding Wind-set pattern.

A1 must not silently rewrite source text merely because the intended meaning appears obvious. Therefore SG-26 is indexed neutrally as a three-of-four honour-set combination and flagged for later source/runtime clarification.

This is exactly the sort of ambiguity that 251A1 should preserve rather than hide.

## Profile facts relevant later

The same source defines, among other things:

- a 148-tile set including four Animal tiles;
- default minimum 1 Fan;
- default maximum payable Fan limit 5, configurable in the implementation;
- self-draw/discard settlement differences;
- separate immediate payouts for Kongs, animal pairs/sets and bonus-tile sets;
- `Pay All` liability situations;
- optional/unsupported variations such as Seven Pairs, extra concealed/self-draw treatment and some automatic Wind/Dragon wins.

Those facts are useful for future runtime/profile research but are not additional entries in the 26-item Fan catalogue.

## 251A1 treatment

These remain **26 SingaporeMahjong.com-profile-local records**.

Do not yet equate names such as Ping Wu, 13 Wonders, All Dragons, All Winds, Full Color, Robbing the Kong or the bonus-tile treatments with HKMA, Taiwanese, MCR, Riichi, IMJ or other rulesets.

The later 251A2 audit must compare exact predicates, stacking rules, automatic-win behaviour, evidence requirements and executable profile identity.

## Evidence grade

```text
named bounded implementation profile   yes
first-party to that implementation      yes
national/association rules authority    no
finite Fan catalogue                     yes — 26
universal Singapore-rules claim          no
```
