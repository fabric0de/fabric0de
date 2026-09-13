# Still becoming

BIT is a digital life that awakens inside this profile. Visitors choose how it responds to unfamiliar signals, damaged memories, and other lifeforms. Choices become lasting experience; AI generates new appearances without a predetermined species or evolution tree.

[Profile](../README.md) · [Growth album](./creature-album.md) · [Journey log](./journey-log.md)

## Participate

Open the current voting issue from the profile and comment with just **A**, **B**, or **C**. The story and artwork are visible on GitHub; voting requires a GitHub account. No separate website or server is needed.

- One vote per account: its latest valid comment or edit within the published window. Case and surrounding whitespace do not matter.
- Comments must be created and last edited before the cutoff. An edit at or after the cutoff makes that comment ineligible; an earlier valid comment may then count. Deleted comments cannot be collected. Frozen results never change on retry.
- Bot comments, prose containing a letter, and unavailable choices do not count. Ties use A → B → C.
- Without votes, the public autopilot makes a decision using the state shown before voting.

One encounter is scheduled daily at **08:00 UTC (17:00 KST)**. GitHub Actions may run late. The first run opens a vote without awarding XP. Subsequent due runs resolve one encounter and open the next. Missed schedules do not invent several days of adventures. Each issue's cutoff is fixed when it opens; existing deadlines do not move on retry.

## A digital world

These are fictional game values, not real system measurements:

| State          | Meaning                                       | Range |
| -------------- | --------------------------------------------- | ----- |
| Energy         | Readiness to explore and act                  | 0–100 |
| Core stability | How steadily BIT holds its form               | 0–100 |
| Bond           | Connection with signals and other lifeforms   | 0–100 |
| Data fragments | Material collected and used along the journey | 0–999 |

A choice applies its disclosed changes, then restores six energy. Values stop at their limits. A choice is unavailable if BIT cannot pay its energy or fragment cost **before** recovery, or if it would learn an ability already known. Rest and recovery choices ensure there is always a way forward.

When stability is below 35, BIT is recovering; otherwise energy below 25 makes it tired, and the remaining condition is curious. Energy below 20 or stability below 35 prioritizes a safe-haven encounter. There is no death, scheduled reset, memory loss, or penalty for low visitor turnout.

The twelve authored encounters cover awakening, fragment rain, glitch storms, damaged memories, a forge, an echo chamber, hidden routes, sky crossings, protection, shared dreams, quiet days, and recovery. Recent encounters are avoided where alternatives exist. The resulting state and day deterministically select the next eligible encounter.

Four persistent abilities open additional encounters: **Echo Map**, **Phase Step**, **Aegis**, and **Memory Thread**. They do not prescribe anatomy or permanently assign a species. Their current purpose is to unlock story routes; they do not silently change the costs shown on another choice.

Autopilot evaluates each available choice's resulting state with:

`min(energy, 75) + min(stability, 75) + min(bond, 60) / 4 + min(fragments, 24) / 2 + 20 if learning a new ability`

The final bonus is added to the other terms. A → B → C breaks ties. Saturation prevents endless optimization of already-full meters. The planned selection is disclosed in the profile details and voting issue.

## Growth and appearance

Each completed encounter earns **3 XP**, with **2 additional XP** for a newly learned ability. Every **24 XP** advances growth. Reruns, page views, and wall-clock time award nothing. This is an experience threshold, not a fixed number of days or a season deadline.

Every decision also records two learning points across **exploration**, **resolve**, **resonance**, and **insight**. Mixed choices can award one point to two tendencies. Experience and tendencies are derived from stored historical results, so subsequent event-copy changes do not rewrite memories. The leading tendency is shown after it reaches three points; ties follow the listed order.

BIT starts as a tiny unformed cluster of data. It has no established face, anatomy, emblem or species. Even its initial neutral colors can change. At 24 XP, the first adaptation is one small change; it does not require hatching, eyes, or a complete animal body. Delayed image generation cannot skip this first modest step. Later forms can gradually become powerful or unfamiliar, without a fixed final form.

BIT's identity is its name and accumulated memories. Each accepted appearance must carry forward at least one visible feature from the immediately preceding one. That feature is chosen afresh for each transition and is not locked forever. Color, silhouette, eyes, markings and anatomy may all eventually change. A consistent pixel-art style and some digital quality remain, without requiring literal circuits, a specific palette or mechanical parts. There is no automatic mapping from a tendency to a species.

When growth is due, Cloudflare first examines **only the latest accepted image**, recent actual decisions, accumulated tendencies, learned abilities and the last three recorded transitions. It proposes one visible change, one parent feature to retain, a reason linked to the decisions, and the supporting encounter days. Referenced days must exist in the supplied recent history; invalid plans stop before image generation. The image model then follows this plan. A separate vision review checks whether the change is visible, the selected parent feature carries through, and the transition is plausible. The first image stays in the archive and is not sent again as a permanent template after a later appearance exists.

The [album](./creature-album.md) records what changed, what was carried forward, why, the relevant memory days, and the exact generation prompt. These are AI interpretations of real fictional game events, not claims about biological evolution or an AI model retraining itself. The selected initial image and its exact prompt are also recorded there. Earlier robot, creature and egg concepts are retained separately in the assets directory and are not part of the active lineage. No future appearances have been generated in advance.

Cloudflare FLUX has no explicit transparent-output option. References are resized to 480 pixels; the model is asked for a plain magenta backdrop, which is removed locally. An adaptation uses one planning call, one image call and one vision review; PNG checks and the review must both pass. These reduce drift and artifacts without guaranteeing perfect quality. Rejected or failed generations keep the last accepted portrait while XP continues. Overdue growth generates the current appearance rather than fabricating missed intermediate forms.

The [manifest](../data/creature.json) records accepted PNGs, exact prompts, reference assets, transition plans, and provenance separately from the [world history](../data/life-state.json). Accepted artwork remains in `assets/creature/` and is never routinely overwritten.

## Run and activate

Use Node.js 22 or later:

```sh
npm ci
npm run game:preview
npm test
npm run type-check
npm run game:simulate -- 365
```

`game:preview` renders the profile, journey log, and album from saved state. It makes no API requests, opens no issues, and does not advance time. It creates the initial state only when the state file is absent. The profile boundary is `START_SECTION:digital-life` / `END_SECTION:digital-life`; personal content outside it is preserved.

`game:simulate` runs three policies entirely in memory. Tests mock GitHub and Cloudflare. A separate live text smoke check previously confirmed structured JSON access with the existing Cloudflare credentials; the new evolutionary image prompts still need a live growth run to assess their visual results.

To activate:

1. Put the code on the repository's default branch with Issues and Actions enabled.
2. Ensure the workflow's `GITHUB_TOKEN` can write contents and issues, and branch rules permit the workflow's commits.
3. Reuse repository Secrets **`CF_ACCOUNT_ID`** and **`CF_API_TOKEN`**, with Workers AI access.
4. Run **Raise a digital life** once from Actions, or wait for the next schedule.

No OpenAI key or provider-selection variables are used. Optional repository Variables:

| Variable                | Default                                 | Purpose                                               |
| ----------------------- | --------------------------------------- | ----------------------------------------------------- |
| `GAME_NARRATION`        | Enabled with credentials                | Set `off` for authored lines only                     |
| `CREATURE_IMAGES`       | Enabled with credentials                | Set `off` to retain existing art without new requests |
| `GAME_AI_MODEL`         | `@cf/google/gemma-4-26b-a4b-it`         | Structured narration                                  |
| `CREATURE_IMAGE_MODEL`  | `@cf/black-forest-labs/flux-2-klein-4b` | Reference-based image generation                      |
| `CREATURE_REVIEW_MODEL` | `@cf/google/gemma-4-26b-a4b-it`         | Transition planning and vision review                 |

Never commit real credentials. `npm run creature:grow` makes a due image attempt using local `.env` or environment credentials, without advancing time or publishing to GitHub. It consumes Cloudflare allowance and can incur charges. The first appearance already exists, so the initial state makes no new image request.

Narration receives only established story facts, status, tendencies, and the last decision. It cannot change rules, votes, or state, and must not claim visible anatomy before an image exists. Invalid output, API errors, or absent credentials use the authored line. Failed publishing retries can repeat narration calls.

The workflow commits the daily decision first and handles image generation afterward. Once its attempt marker is saved, image generation is limited to one attempt per UTC day, including failures. Failed saves or pushes can cause another charged attempt on retry. Generated candidates are not published unless accepted; failures do not undo the daily encounter.

Bot-authored round markers include a digest of the world and day. Retries reuse the same issue and deadline. Decisions are frozen before creating the next issue; previous issues are closed with a result. The CLI only publishes in the trusted scheduled/manual Actions workflow. Workflow concurrency prevents overlapping runs.

## Saved history

The world is schema version 2. The former unpublished server simulation had no completed rounds or open vote and was replaced during development. Live histories are never automatically migrated or reset. Do not delete state, alter frozen issue metadata, or rewrite experience during a live vote. Git retains the complete history; the readable journey log shows the latest sixty encounters.

The old quiz survives only as a [static archive](./archive.md). The Korean [profile translation](./profile-ko.md) is a static editorial preview of Day 1, not a second automatically updated profile.

| Module                            | Responsibility                                                   |
| --------------------------------- | ---------------------------------------------------------------- |
| `scripts/game/events.ts`          | Encounters, effects, abilities, learning, and explanations       |
| `scripts/game/engine.ts`          | Voting, progression, recovery, eligibility, and state validation |
| `scripts/game/creature.ts`        | Experience, tendencies, identity, and evolutionary prompts       |
| `scripts/game/cloudflare.ts`      | Image/text requests and background conversion                    |
| `scripts/game/creature-images.ts` | Transition planning, image lifecycle, and continuity review      |
| `scripts/game/github.ts`          | Issues, frozen decisions, and retry recovery                     |
| `scripts/game/runner.ts`          | One publication cycle                                            |
| `scripts/game/render.ts`          | Profile, issues, journey log, and album                          |
| `scripts/game/run.ts`             | Local preview and Actions entry point                            |

API references: [Cloudflare FLUX reference images](https://developers.cloudflare.com/changelog/post/2026-01-15-flux-2-klein-4b-workers-ai/) and [Gemma vision](https://developers.cloudflare.com/workers-ai/models/gemma-4-26b-a4b-it/).
