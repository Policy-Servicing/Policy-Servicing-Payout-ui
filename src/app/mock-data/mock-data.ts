import {
  Module, Product, StageCount, Stage, TrendPoint,
  PolicyRecord, StageSummary, RunHistory, Scheduler
} from '../core/models/app.models';

// ────────────────── MODULES ──────────────────
export const MOCK_MODULES: Module[] = [
  { code: 'SB',   name: 'Survival Benefit',  description: 'Periodic survival benefit payouts' },
  { code: 'MAT',  name: 'Maturity',           description: 'Policy maturity payouts' },
  { code: 'ANN',  name: 'Annuity',            description: 'Regular annuity disbursements' },
  { code: 'SUR',  name: 'Surrender',          description: 'Surrender value processing' },
  { code: 'DC',   name: 'Death Claim',        description: 'Death claim settlements' }
];

// ────────────────── PRODUCTS ──────────────────
export const MOCK_PRODUCTS: Product[] = [
  { id: 'SB001', name: 'SB Classic Plan',        moduleCode: 'SB'  },
  { id: 'SB002', name: 'SB Premium Plus',        moduleCode: 'SB'  },
  { id: 'SB003', name: 'SB Child Lite',          moduleCode: 'SB'  },
  { id: 'MAT001',name: 'Maturity Gold',          moduleCode: 'MAT' },
  { id: 'MAT002',name: 'Maturity Silver',        moduleCode: 'MAT' },
  { id: 'MAT003',name: 'Maturity Direct',        moduleCode: 'MAT' },
  { id: 'ANN001',name: 'Annuity Regular',        moduleCode: 'ANN' },
  { id: 'ANN002',name: 'Annuity Deferred',       moduleCode: 'ANN' },
  { id: 'SUR001',name: 'Surrender Standard',     moduleCode: 'SUR' },
  { id: 'SUR002',name: 'Surrender Partial',      moduleCode: 'SUR' },
  { id: 'DC001', name: 'Death Claim Standard',   moduleCode: 'DC'  },
  { id: 'DC002', name: 'Death Claim Accidental', moduleCode: 'DC'  },
  { id: 'DC003', name: 'Death Claim Group',      moduleCode: 'DC'  }
];

// ────────────────── STAGE CONFIGS ──────────────────
const stageConfigs: { stage: Stage; label: string; color: string; icon: string }[] = [
  { stage: 'EXTRACT',    label: 'Extract',     color: '#3B82F6', icon: 'download' },
  { stage: 'APPROVE',    label: 'Approve',     color: '#6366F1', icon: 'check_circle' },
  { stage: 'TECH_BUCKET',label: 'Tech Bucket', color: '#F59E0B', icon: 'settings' },
  { stage: 'SANCTION',   label: 'Sanction',    color: '#F97316', icon: 'gavel' },
  { stage: 'PAID',       label: 'Paid',        color: '#22C55E', icon: 'payments' }
];

export function buildStageCounts(module: string): StageCount[] {
  const base: { [key: string]: Array<[number, number, number]> } = {
    SB:  [[428,390,18],[312,298,5],[87,95,12],[203,187,8],[876,820,0]],
    MAT: [[193,175,7],[147,160,2],[43,38,6],[98,105,3],[412,390,0]],
    ANN: [[567,540,22],[409,430,11],[128,115,18],[287,265,9],[1102,1050,0]],
    SUR: [[84,90,4],[63,58,1],[19,22,3],[45,40,2],[198,188,0]],
    DC:  [[156,148,9],[112,120,6],[33,29,5],[78,85,4],[331,310,0]]
  };
  const rows = base[module] || base['SB'];
  return stageConfigs.map((cfg, i) => ({
    ...cfg,
    count: rows[i][0],
    previousCount: rows[i][1],
    agingCount: rows[i][2],
    agingThresholdDays: 3
  }));
}

// ────────────────── TREND DATA ──────────────────
export function buildTrendData(module: string): TrendPoint[] {
  const days = 7;
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    const base = 300 + Math.round(Math.random() * 200);
    return {
      date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      extract:    base + Math.round(Math.random() * 100),
      approve:    base - 50 + Math.round(Math.random() * 80),
      techBucket: Math.round(base * 0.3 + Math.random() * 40),
      sanction:   Math.round(base * 0.5 + Math.random() * 60),
      paid:       base + 100 + Math.round(Math.random() * 120)
    };
  });
}

// ────────────────── POLICY RECORDS ──────────────────
const firstNames = ['Ravi','Suresh','Priya','Meena','Vijay','Lakshmi','Arjun','Kavitha','Dinesh','Anitha'];
const lastNames  = ['Kumar','Sharma','Narayanan','Raj','Iyer','Agarwal','Menon','Nair','Pillai','Reddy'];
const statuses: ('PENDING'|'PROCESSING'|'FAILED')[] = ['PENDING','PENDING','PENDING','PROCESSING','FAILED'];

export function buildPolicyRecords(stage: Stage, module: string, productId?: string): PolicyRecord[] {
  return Array.from({ length: 60 }, (_, i) => {
    const products = MOCK_PRODUCTS.filter(p => p.moduleCode === module);
    const pid = productId || (products.length > 0 ? products[0].id : 'SB001');
    const agingDays = Math.floor(Math.random() * 10);
    const dt = new Date();
    dt.setDate(dt.getDate() - agingDays);
    return {
      policyNo:   `PLY${module}${String(100000 + i).padStart(6, '0')}`,
      productId:  pid,
      moduleCode: module,
      holderName: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
      stage,
      amount:     Math.round((5000 + Math.random() * 95000) * 100) / 100,
      enteredAt:  dt,
      agingDays,
      status:     statuses[i % statuses.length],
      remarks:    agingDays > 3 ? 'Aging alert — review required' : undefined
    };
  });
}

// ────────────────── SCHEDULERS ──────────────────
export const MOCK_SCHEDULERS: Scheduler[] = [
  {
    id: 'SCH001', name: 'SB Extract Job',       jobClass: 'com.policyserve.scheduler.SBExtractJob',
    moduleCode: 'SB',  cronExpression: '0 0 6 * * ?',  status: 'SUCCESS', enabled: true,
    lastRunTime: new Date(Date.now() - 3600000),  lastRunStatus: 'SUCCESS',
    nextRunTime: new Date(Date.now() + 3600000),
    recordsProcessed: 428, durationMs: 12450,
    description: 'Extracts SB policy records from core system'
  },
  {
    id: 'SCH002', name: 'SB Approval Processor', jobClass: 'com.policyserve.scheduler.SBApproveJob',
    moduleCode: 'SB',  cronExpression: '0 30 6 * * ?', status: 'RUNNING', enabled: true,
    lastRunTime: new Date(Date.now() - 600000),   lastRunStatus: 'RUNNING',
    nextRunTime: new Date(Date.now() + 82800000),
    recordsProcessed: 0,  durationMs: 0,
    description: 'Processes approval queue for SB'
  },
  {
    id: 'SCH003', name: 'MAT Extract Job',        jobClass: 'com.policyserve.scheduler.MATExtractJob',
    moduleCode: 'MAT', cronExpression: '0 0 7 * * ?',  status: 'FAILED', enabled: true,
    lastRunTime: new Date(Date.now() - 7200000),  lastRunStatus: 'FAILED',
    nextRunTime: new Date(Date.now() + 3600000),
    recordsProcessed: 0, durationMs: 3200,
    errorMessage: 'DB connection timeout after 3 retries',
    description: 'Extracts maturity records'
  },
  {
    id: 'SCH004', name: 'ANN Payment Trigger',    jobClass: 'com.policyserve.scheduler.ANNPaymentJob',
    moduleCode: 'ANN', cronExpression: '0 0 8 1 * ?',  status: 'SUCCESS', enabled: true,
    lastRunTime: new Date(Date.now() - 86400000), lastRunStatus: 'SUCCESS',
    nextRunTime: new Date(Date.now() + 2592000000),
    recordsProcessed: 1102, durationMs: 54320,
    description: 'Monthly annuity payment trigger'
  },
  {
    id: 'SCH005', name: 'SUR Sanction Job',        jobClass: 'com.policyserve.scheduler.SURSanctionJob',
    moduleCode: 'SUR', cronExpression: '0 0 9 * * MON-FRI', status: 'IDLE', enabled: true,
    lastRunTime: new Date(Date.now() - 172800000), lastRunStatus: 'SUCCESS',
    nextRunTime: new Date(Date.now() + 57600000),
    recordsProcessed: 45, durationMs: 8900,
    description: 'Sanctions approved surrender requests'
  },
  {
    id: 'SCH006', name: 'DC Claim Validator',      jobClass: 'com.policyserve.scheduler.DCValidateJob',
    moduleCode: 'DC',  cronExpression: '0 0 10 * * ?', status: 'SUCCESS', enabled: true,
    lastRunTime: new Date(Date.now() - 5400000),  lastRunStatus: 'SUCCESS',
    nextRunTime: new Date(Date.now() + 68400000),
    recordsProcessed: 156, durationMs: 22100,
    description: 'Validates death claim documents'
  },
  {
    id: 'SCH007', name: 'SB Tech Bucket Mover',   jobClass: 'com.policyserve.scheduler.SBTechBucketJob',
    moduleCode: 'SB',  cronExpression: '0 15 6 * * ?', status: 'SUCCESS', enabled: true,
    lastRunTime: new Date(Date.now() - 3000000),  lastRunStatus: 'SUCCESS',
    nextRunTime: new Date(Date.now() + 75600000),
    recordsProcessed: 87, durationMs: 6780,
    description: 'Moves SB records to tech bucket'
  },
  {
    id: 'SCH008', name: 'Daily Aging Report',      jobClass: 'com.policyserve.scheduler.AgingReportJob',
    moduleCode: 'SB',  cronExpression: '0 0 22 * * ?', status: 'IDLE', enabled: true,
    lastRunTime: new Date(Date.now() - 54000000), lastRunStatus: 'SUCCESS',
    nextRunTime: new Date(Date.now() + 36000000),
    recordsProcessed: 120, durationMs: 4500,
    description: 'Generates daily aging report email'
  },
  {
    id: 'SCH009', name: 'MAT Approval Job',        jobClass: 'com.policyserve.scheduler.MATApproveJob',
    moduleCode: 'MAT', cronExpression: '0 30 7 * * ?', status: 'DISABLED', enabled: false,
    lastRunTime: new Date(Date.now() - 604800000), lastRunStatus: 'SUCCESS',
    nextRunTime: undefined,
    recordsProcessed: 147, durationMs: 18900,
    description: 'Maturity approval processing — temporarily disabled'
  },
  {
    id: 'SCH010', name: 'ANN Extract Job',         jobClass: 'com.policyserve.scheduler.ANNExtractJob',
    moduleCode: 'ANN', cronExpression: '0 0 5 * * ?',  status: 'SUCCESS', enabled: true,
    lastRunTime: new Date(Date.now() - 9000000),  lastRunStatus: 'SUCCESS',
    nextRunTime: new Date(Date.now() + 64800000),
    recordsProcessed: 567, durationMs: 31200,
    description: 'Annuity data extraction from core'
  },
  {
    id: 'SCH011', name: 'DC Payment Disburser',   jobClass: 'com.policyserve.scheduler.DCPaymentJob',
    moduleCode: 'DC',  cronExpression: '0 0 11 * * MON-FRI', status: 'FAILED', enabled: true,
    lastRunTime: new Date(Date.now() - 14400000), lastRunStatus: 'FAILED',
    nextRunTime: new Date(Date.now() + 57600000),
    recordsProcessed: 0, durationMs: 1200,
    errorMessage: 'Payment gateway authentication failed',
    description: 'Disburses approved death claim payments'
  },
  {
    id: 'SCH012', name: 'Data Sync — Core to Stage', jobClass: 'com.policyserve.scheduler.CoreSyncJob',
    moduleCode: 'SB',  cronExpression: '0 */30 * * * ?', status: 'SUCCESS', enabled: true,
    lastRunTime: new Date(Date.now() - 1800000),  lastRunStatus: 'SUCCESS',
    nextRunTime: new Date(Date.now() + 1800000),
    recordsProcessed: 0, durationMs: 890,
    description: 'Half-hourly sync of reference data'
  }
];

// ────────────────── RUN HISTORY ──────────────────
export function buildRunHistory(schedulerId: string): RunHistory[] {
  const results: Array<'SUCCESS'|'FAILED'|'RUNNING'> = ['SUCCESS','SUCCESS','FAILED','SUCCESS','SUCCESS','SUCCESS','FAILED','SUCCESS','SUCCESS','SUCCESS'];
  return results.map((status, i) => {
    const dt = new Date();
    dt.setDate(dt.getDate() - i);
    const triggered: 'SCHEDULER' | 'MANUAL' = i === 1 ? 'MANUAL' : 'SCHEDULER';
    return {
      id: `RH${schedulerId}${i}`,
      schedulerId,
      runTime: dt,
      status,
      recordsProcessed: status === 'FAILED' ? 0 : Math.floor(Math.random() * 500 + 50),
      durationMs: status === 'FAILED' ? Math.floor(Math.random() * 3000) : Math.floor(Math.random() * 60000 + 5000),
      errorMessage: status === 'FAILED' ? 'Connection timeout / DB lock detected' : undefined,
      triggeredBy: triggered
    };
  });
}
