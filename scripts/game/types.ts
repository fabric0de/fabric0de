export type ChoiceId = 'A' | 'B' | 'C';
export const affinities = [
  'exploration',
  'resolve',
  'resonance',
  'insight',
] as const;
export type Affinity = (typeof affinities)[number];
export const abilities = [
  'echo-map',
  'aegis',
  'phase-step',
  'memory-thread',
] as const;
export type Ability = (typeof abilities)[number];

export interface World {
  energy: number;
  stability: number;
  bond: number;
  fragments: number;
  abilities: Ability[];
}
export interface Effect {
  energy?: number;
  stability?: number;
  bond?: number;
  fragments?: number;
  learn?: Ability;
}
export interface Choice {
  id: ChoiceId;
  title: string;
  hint: string;
  effect: Effect;
  learning: Partial<Record<Affinity, number>>;
  explanation: string;
}
export interface Incident {
  id: string;
  title: string;
  description: string;
  quip: string;
  eligible: (world: World) => boolean;
  choices: [Choice, Choice, Choice];
}
export interface Metrics {
  status: 'curious' | 'tired' | 'recovering';
}
export interface Round {
  day: number;
  incidentId: string;
  openedAt: string | null;
  closesAt: string | null;
  issueNumber: number | null;
  quip: string;
}
export interface VoteComment {
  id: number;
  body: string;
  user: { id: number; type: string } | null;
  created_at: string;
  updated_at: string;
}
export interface Decision {
  choice: ChoiceId;
  reason: 'vote' | 'tie' | 'autopilot';
  counts: Record<ChoiceId, number>;
  voters: number;
}
export interface HistoryEntry {
  day: number;
  incidentId: string;
  title: string;
  resolvedAt: string;
  issueNumber: number | null;
  decision: Decision;
  choiceTitle: string;
  explanation: string;
  learning: Partial<Record<Affinity, number>>;
  experience: number;
  before: World;
  after: World;
  metrics: Metrics;
}
export interface Game {
  version: 2;
  world: World;
  round: Round;
  history: HistoryEntry[];
}
