export type TestCategory = 'happy' | 'negative' | 'edge';

export type ModelId = 'qwen-coder' | 'phi-mini';

export interface TestStep {
  type: 'goto' | 'click' | 'fill' | 'assert-visible' | 'assert-text' | 'assert-count' | 'assert-contain-text' | 'select' | 'wait';
  selector?: string;
  value?: string;
  expected?: string | number;
  raw: string;
}

export interface ParsedTest {
  name: string;
  category: TestCategory;
  steps: TestStep[];
}

export type StepStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped';

export interface StepResult {
  step: TestStep;
  status: StepStatus;
  duration: number;
  error?: string;
  expected?: string;
  actual?: string;
  screenshot?: string;
}

export interface TestResult {
  test: ParsedTest;
  steps: StepResult[];
  passed: boolean;
  duration: number;
}

export interface RunReport {
  tests: TestResult[];
  totalPassed: number;
  totalFailed: number;
  totalDuration: number;
  byCategory: Record<TestCategory, { passed: number; total: number }>;
}

export interface RecordedAction {
  type: 'click' | 'fill' | 'select' | 'navigate' | 'scroll';
  selector: string;
  value?: string;
  timestamp: number;
  tagName: string;
  textContent?: string;
}

export type AppMode = 'text' | 'record';

export type ExportFormat = 'playwright' | 'cypress';

export interface AIMessage {
  type: 'load-model' | 'generate' | 'fix';
  modelId: ModelId;
  prompt?: string;
  domSnapshot?: string;
  userStory?: string;
  actions?: RecordedAction[];
  failureContext?: { error: string; expected: string; actual: string; stepCode: string; domSnapshot: string };
}

export interface AIResponse {
  type: 'progress' | 'token' | 'complete' | 'error';
  data: string;
  progress?: number;
}
