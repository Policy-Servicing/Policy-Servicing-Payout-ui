// ───────────────────────── Dashboard Models ─────────────────────────

export interface Module {
  code: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  moduleCode: string;
}

export type Stage = 'EXTRACT' | 'APPROVE' | 'TECH_BUCKET' | 'SANCTION' | 'PAID';

export interface StageCount {
  stage: Stage;
  label: string;
  count: number;
  previousCount: number;
  agingCount: number;       // records older than 3 days
  agingThresholdDays: number;
  color: string;
  icon: string;
}

export interface StageSummary {
  module: string;
  productId: string;
  dateRange: string;
  stageCounts: StageCount[];
  totalPending: number;
  totalAmount: number;
  slaBreaches: number;
  lastUpdated: Date;
}

export interface TrendPoint {
  date: string;
  extract: number;
  approve: number;
  techBucket: number;
  sanction: number;
  paid: number;
}

export interface PolicyRecord {
  policyNo: string;
  productId: string;
  moduleCode: string;
  holderName: string;
  stage: Stage;
  amount: number;
  enteredAt: Date;
  agingDays: number;
  status: 'PENDING' | 'PROCESSING' | 'FAILED';
  remarks?: string;
}

export interface DrillDownResponse {
  stage: Stage;
  records: PolicyRecord[];
  totalCount: number;
  page: number;
  size: number;
}

export interface DateRangeOption {
  label: string;
  value: string;
}

// ───────────────────────── Scheduler Models ─────────────────────────

export type SchedulerStatus = 'RUNNING' | 'SUCCESS' | 'FAILED' | 'IDLE' | 'DISABLED';

export interface Scheduler {
  id: string;
  name: string;
  jobClass: string;
  moduleCode: string;
  cronExpression: string;
  status: SchedulerStatus;
  lastRunTime?: Date;
  lastRunStatus?: 'SUCCESS' | 'FAILED' | 'RUNNING';
  nextRunTime?: Date;
  recordsProcessed?: number;
  durationMs?: number;
  errorMessage?: string;
  enabled: boolean;
  description?: string;
}

export interface RunHistory {
  id: string;
  schedulerId: string;
  runTime: Date;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING';
  recordsProcessed: number;
  durationMs: number;
  errorMessage?: string;
  triggeredBy: 'SCHEDULER' | 'MANUAL';
}

export interface SchedulerFilterState {
  search: string;
  status: SchedulerStatus | 'ALL';
  moduleCode: string;
}
