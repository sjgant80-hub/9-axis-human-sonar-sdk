export interface Axis {
  p: number;
  key: string;
  sym: string;
  name: string;
  angle: number;
  hue: string;
  question: string;
  kw: string[];
  hedge: string[];
  landed: string[];
}

export interface Turn {
  speaker: string;
  text: string;
}

export interface AxisAggregate {
  presence: number;
  fidelity: number;
  coherence: number;
  composite: number;
  count: number;
  verdict: string;
}

export interface SonarResult {
  perTurn: Array<{ perAxis: Record<string, any>; dominant: string; wordCount: number; text: string; speaker: string }>;
  axisAgg: Record<string, AxisAggregate>;
  trajectory: Array<{ i: number; coherence: number; dominant: string }>;
  arc: 'climbing' | 'flat' | 'falling';
  meanCoh: number;
  touched: number;
  weakest: string;
  strongest: string;
  suggestions: Array<{ axis: string; sym: string; name: string; probe: string }>;
  thin: string[];
  defended: string[];
  turnsAnalysed: number;
}

export interface Session {
  title: string;
  focus: string;
  turns: Turn[];
  result: SonarResult;
  schema: '9-axis-human-sonar-v1';
}

export interface Probe {
  axis: string;
  sym: string;
  name: string;
  probe: string;
}

export const AXES: Axis[];
export const AXIS_BY_KEY: Record<string, Axis>;
export const PROBES: Record<string, string[]>;

export function parseTranscript(raw: string): Turn[];
export function uniqueSpeakers(turns: Turn[]): string[];
export function focusSpeakerAuto(turns: Turn[]): string | null;
export function countMatches(text: string, list: string[]): number;
export function scoreTurn(text: string): { perAxis: Record<string, any>; dominant: string; wordCount: number };
export function readAxis(v: AxisAggregate): string;
export function axisClass(v: AxisAggregate): 'strong' | 'thin' | 'defended';
export function analyseSession(turns: Turn[], focus: string): SonarResult;
export function growthHypothesis(result: SonarResult): { text: string; strongest: { sym: string; name: string }; weakest: { sym: string; name: string }; arc: string };
export function nextProbe(currentMap: Record<string, AxisAggregate>): Probe;
export function suggestProbe(currentMap: Record<string, AxisAggregate>): Probe;
export function mapTranscript(raw: string, opts?: { focus?: string; title?: string }): Session;
export function exportJson(session: Session): string;
export function exportMarkdown(session: Session): string;
export function isSpeechAvailable(): boolean;
export function startCapture(onUpdate: (text: string, isFinal: boolean) => void, opts?: { lang?: string }): { stop: () => void; text: () => string };

export const VERSION: string;
