import type { Choice, ChoiceId, Effect, Affinity, Incident } from './types.js';

function choice(
  id: ChoiceId,
  title: string,
  hint: string,
  effect: Effect,
  learning: Partial<Record<Affinity, number>>,
  explanation: string
): Choice {
  return { id, title, hint, effect, learning, explanation };
}

// Authored story facts and explicit effects. AI supplies voice and appearances,
// never winning votes or game rules. No choice locks BIT into a species.
export const incidents: Incident[] = [
  {
    id: 'first-signal',
    title: 'Something in the static knows your name.',
    description:
      'Still a loose cluster of data, BIT senses a faint signal repeating its name. How should it answer?',
    quip: 'I have a name. Apparently someone else knows it too.',
    eligible: () => true,
    choices: [
      choice(
        'A',
        'Follow the signal into the unknown',
        'A bold first journey, with a little strain.',
        { energy: -12, stability: -4, fragments: 6 },
        { exploration: 2 },
        'BIT followed the signal beyond its birthplace and brought back unfamiliar data fragments.'
      ),
      choice(
        'B',
        'Gather fragments and reinforce the core',
        'Use nearby fragments to become steadier.',
        { fragments: -6, stability: 12 },
        { resolve: 2 },
        'BIT arranged nearby fragments around its core and learned to hold its form steady.'
      ),
      choice(
        'C',
        'Send a pulse back',
        'Make contact before leaving familiar ground.',
        { energy: -4, bond: 8 },
        { resonance: 2 },
        'BIT answered in the same rhythm. A second pulse returned through the static.'
      ),
    ],
  },
  {
    id: 'fragment-rain',
    title: 'Fragments are falling like luminous snow.',
    description:
      'A slow stream of lost data crosses BIT’s path. Some pieces carry an unfamiliar pattern.',
    quip: 'I tried catching the light. This time it stayed.',
    eligible: () => true,
    choices: [
      choice(
        'A',
        'Chase the brightest fragments',
        'Collect more, but spend energy reaching them.',
        { energy: -16, fragments: 12 },
        { exploration: 2 },
        'BIT followed the brightest fragments and gathered unfamiliar patterns.'
      ),
      choice(
        'B',
        'Study the pattern in the falling data',
        'Gather a few pieces and learn their rhythm.',
        { energy: -8, fragments: 5, stability: 4 },
        { insight: 2 },
        'BIT recognized a repeating pattern and steadied its core to match the rhythm.'
      ),
      choice(
        'C',
        'Share the fragments with a nearby spark',
        'Keep fewer pieces and build a connection.',
        { fragments: 2, bond: 6 },
        { resonance: 2 },
        'BIT shared what it caught. The nearby spark stayed a little longer.'
      ),
    ],
  },
  {
    id: 'glitch-storm',
    title: 'A glitch storm is crossing the quiet sector.',
    description:
      'Broken pixels flicker at the edge of BIT’s shelter. There is still time to choose a way through.',
    quip: 'The sky is buffering. I would like it to stop.',
    eligible: () => true,
    choices: [
      choice(
        'A',
        'Cross the storm for the data beyond it',
        'An energy-intensive route with a stability cost.',
        { energy: -20, stability: -12, fragments: 14 },
        { exploration: 1, resolve: 1 },
        'BIT crossed the unstable sector and recovered data from the far side, but its core needs time to settle.'
      ),
      choice(
        'B',
        'Anchor the shelter with collected fragments',
        'Spend fragments to shelter a wandering spark.',
        { fragments: -8, stability: 8, bond: 4 },
        { resolve: 2 },
        'BIT anchored the shelter and made room for a wandering spark until the storm passed.'
      ),
      choice(
        'C',
        'Wait and map the gaps in the storm',
        'Conserve energy and observe a safe route.',
        { energy: 8, stability: 5 },
        { insight: 2 },
        'BIT waited, observed the gaps, and found a safe way around the storm.'
      ),
    ],
  },
  {
    id: 'lost-memory',
    title: 'A damaged memory is asking to be remembered.',
    description:
      'A tiny recording loops without an ending. BIT can hear a voice, but cannot make out the words.',
    quip: 'I do not know whose memory this is. It sounds lonely.',
    eligible: () => true,
    choices: [
      choice(
        'A',
        'Reconstruct the missing pieces',
        'Use fragments and concentration to restore the recording.',
        { fragments: -8, energy: -8, bond: 5 },
        { insight: 2 },
        'BIT reconstructed enough of the recording for its final note to play.'
      ),
      choice(
        'B',
        'Carry it until its owner is found',
        'Take responsibility for the unfinished memory.',
        { energy: -6, bond: 7 },
        { resolve: 1, resonance: 1 },
        'BIT kept the unfinished recording safe rather than rewriting what it could not understand.'
      ),
      choice(
        'C',
        'Answer with a memory of our own',
        'Offer connection without claiming to repair the data.',
        { energy: -4, bond: 8 },
        { resonance: 2 },
        'BIT placed its own first signal beside the recording. The two rhythms began to alternate.'
      ),
    ],
  },
  {
    id: 'fragment-forge',
    title: 'The fragments can become something more.',
    description:
      'A dormant forge responds to BIT’s core. It can weave collected data into a new ability.',
    quip: 'I brought a collection of shiny things. The forge calls it potential.',
    eligible: (w) =>
      !w.abilities.includes('aegis') || !w.abilities.includes('phase-step'),
    choices: [
      choice(
        'A',
        'Learn Aegis, a protective field',
        'Unlock a lasting ability; no fixed body shape is prescribed.',
        { fragments: -12, stability: 8, learn: 'aegis' },
        { resolve: 2 },
        'BIT learned Aegis, a field that opens new protective adventures.'
      ),
      choice(
        'B',
        'Learn Phase Step, a way across gaps',
        'Unlock a lasting movement ability.',
        { fragments: -12, energy: -4, learn: 'phase-step' },
        { exploration: 2 },
        'BIT learned Phase Step and can now reach routes beyond ordinary gaps.'
      ),
      choice(
        'C',
        'Study the forge and save the fragments',
        'Gather a few discarded pieces for another day.',
        { fragments: 4, energy: 4 },
        { insight: 2 },
        'BIT studied the forge without choosing an ability yet and collected a few unused fragments.'
      ),
    ],
  },
  {
    id: 'echo-chamber',
    title: 'Every pulse returns with a different answer.',
    description:
      'BIT enters a chamber filled with overlapping signals. There may be a map hidden in the echoes.',
    quip: 'I said hello. The room had several opinions.',
    eligible: (w) =>
      !w.abilities.includes('echo-map') ||
      !w.abilities.includes('memory-thread'),
    choices: [
      choice(
        'A',
        'Learn to read an Echo Map',
        'Turn fragments and careful listening into a lasting ability.',
        { fragments: -10, energy: -6, learn: 'echo-map' },
        { insight: 2 },
        'BIT learned Echo Map, a way to read routes carried by returning signals.'
      ),
      choice(
        'B',
        'Weave a Memory Thread between the voices',
        'Learn a lasting ability to connect scattered signals.',
        { fragments: -10, bond: 8, learn: 'memory-thread' },
        { resonance: 2 },
        'BIT learned Memory Thread, linking scattered voices without erasing their differences.'
      ),
      choice(
        'C',
        'Listen without changing the chamber',
        'Recover energy while learning its rhythm.',
        { energy: 8, bond: 3 },
        { resonance: 1, insight: 1 },
        'BIT listened until it could distinguish the individual rhythms in the chamber.'
      ),
    ],
  },
  {
    id: 'hidden-route',
    title: 'The Echo Map reveals a forgotten route.',
    description:
      'A path appears where BIT once heard only static. Something is still transmitting from the other end.',
    quip: 'It was not empty space. I just did not know how to listen.',
    eligible: (w) => w.abilities.includes('echo-map'),
    choices: [
      choice(
        'A',
        'Explore the forgotten route',
        'Spend energy to recover more fragments.',
        { energy: -14, fragments: 10 },
        { exploration: 2 },
        'BIT followed its Echo Map and recovered fragments from the forgotten route.'
      ),
      choice(
        'B',
        'Chart the route before entering',
        'Use a few fragments to make the path easier to read.',
        { fragments: -4, stability: 8 },
        { insight: 2 },
        'BIT marked the uncertain sections and turned the route into a clearer memory.'
      ),
      choice(
        'C',
        'Send a welcoming pulse down the path',
        'Connect with whatever is still listening.',
        { energy: -4, bond: 7 },
        { resonance: 2 },
        'BIT sent a welcoming pulse. A distant signal answered.'
      ),
    ],
  },
  {
    id: 'sky-gap',
    title: 'A stream of light runs above the broken ground.',
    description:
      'Phase Step reveals footholds in the gap. BIT can cross, test the route, or guide a smaller spark.',
    quip: 'The ground ends here. Apparently the possibilities do not.',
    eligible: (w) => w.abilities.includes('phase-step'),
    choices: [
      choice(
        'A',
        'Leap between the streams of light',
        'A demanding crossing with a rich fragment trail.',
        { energy: -18, stability: -6, fragments: 12 },
        { exploration: 2 },
        'BIT used Phase Step to cross the gap and gather the fragments suspended beyond it.'
      ),
      choice(
        'B',
        'Practice shorter crossings first',
        'Practice control and conserve some energy.',
        { energy: -8, stability: 8 },
        { resolve: 2 },
        'BIT practiced shorter crossings until its movements became steadier.'
      ),
      choice(
        'C',
        'Guide a smaller spark across',
        'Use the new route to help another life.',
        { energy: -10, bond: 10 },
        { resonance: 2 },
        'BIT guided the smaller spark across the gap, one pulse at a time.'
      ),
    ],
  },
  {
    id: 'guardian-pulse',
    title: 'Something small is hiding behind BIT’s field.',
    description:
      'A cluster of young sparks has gathered inside Aegis. Outside, a broken signal keeps circling.',
    quip: 'I was practicing a shield. It seems I built a meeting place.',
    eligible: (w) => w.abilities.includes('aegis'),
    choices: [
      choice(
        'A',
        'Hold the field until the signal passes',
        'Spend energy to protect the group.',
        { energy: -16, bond: 10, stability: 3 },
        { resolve: 2 },
        'BIT held Aegis steady until the circling signal faded.'
      ),
      choice(
        'B',
        'Study what the signal is trying to say',
        'Concentrate on the pattern outside the field.',
        { energy: -10, fragments: 6 },
        { insight: 2 },
        'BIT discovered repeating fragments inside the broken signal and recorded them.'
      ),
      choice(
        'C',
        'Lead the sparks to a quieter place',
        'Take a gentle route together.',
        { energy: -6, bond: 7 },
        { resonance: 2 },
        'BIT led the sparks to a quieter sector while keeping the group together.'
      ),
    ],
  },
  {
    id: 'shared-dream',
    title: 'A familiar voice appears in an unfamiliar memory.',
    description:
      'Memory Thread carries a fragment of someone else’s dream. BIT can explore it without claiming it as its own.',
    quip: 'Someone dreamed of a sky. I have been thinking about it all morning.',
    eligible: (w) => w.abilities.includes('memory-thread'),
    choices: [
      choice(
        'A',
        'Explore the edge of the dream',
        'Follow an unfamiliar image at an energy cost.',
        { energy: -12, fragments: 8 },
        { exploration: 2 },
        'BIT explored the dream’s edge and returned with new patterns to remember.'
      ),
      choice(
        'B',
        'Keep the dream’s details intact',
        'Use fragments to preserve another life’s memory.',
        { fragments: -6, bond: 10 },
        { insight: 1, resolve: 1 },
        'BIT preserved the dream without rewriting its unfamiliar details.'
      ),
      choice(
        'C',
        'Send a small dream in return',
        'Offer a connection of its own.',
        { energy: -5, bond: 8 },
        { resonance: 2 },
        'BIT sent a memory of its own awakening back along the thread.'
      ),
    ],
  },
  {
    id: 'quiet-sector',
    title: 'For once, the static is quiet.',
    description:
      'Nothing needs an immediate answer. BIT has space to rest, practice, or simply sit with a familiar signal.',
    quip: 'No great discovery today. I think I like being here.',
    eligible: () => true,
    choices: [
      choice(
        'A',
        'Practice holding a steady pulse',
        'Build control while recovering.',
        { energy: 8, stability: 10 },
        { resolve: 2 },
        'BIT practiced a steady pulse and found it easier to hold its core together.'
      ),
      choice(
        'B',
        'Sort the fragments collected along the way',
        'Recover useful pieces from familiar patterns.',
        { energy: 4, fragments: 6 },
        { insight: 2 },
        'BIT sorted its collection and found usable fragments among the familiar patterns.'
      ),
      choice(
        'C',
        'Rest beside a familiar signal',
        'Recover energy and deepen a connection.',
        { energy: 16, bond: 5 },
        { resonance: 2 },
        'BIT rested beside a familiar signal. The quiet became a memory too.'
      ),
    ],
  },
  {
    id: 'safe-haven',
    title: 'BIT’s core needs a quiet place to settle.',
    description:
      'The journey has taken its toll. A sheltered pocket of the network offers time to recover without losing any memories.',
    quip: 'I am still here. Today, that is enough.',
    eligible: (w) => w.energy < 20 || w.stability < 35,
    choices: [
      choice(
        'A',
        'Rest and rebuild a steady rhythm',
        'Recover energy and stability without spending fragments.',
        { energy: 28, stability: 22 },
        { resolve: 2 },
        'BIT rested until its core settled. All of its memories and learned abilities remain.'
      ),
      choice(
        'B',
        'Let a familiar signal guide the recovery',
        'Recover together and strengthen the connection.',
        { energy: 22, stability: 18, bond: 8 },
        { resonance: 2 },
        'A familiar signal guided BIT back to a steadier rhythm.'
      ),
      choice(
        'C',
        'Study the disturbance while resting',
        'Recover while learning from the experience.',
        { energy: 20, stability: 20, fragments: 3 },
        { insight: 2 },
        'BIT studied the disturbance from a safe place and kept a useful fragment of the lesson.'
      ),
    ],
  },
];

export function getIncident(id: string): Incident {
  const incident = incidents.find((entry) => entry.id === id);
  if (!incident) throw new Error(`Unknown incident: ${id}`);
  return incident;
}
