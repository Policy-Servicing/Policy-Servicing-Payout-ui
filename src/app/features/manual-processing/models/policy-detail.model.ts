export interface StageHistory {
  stageName: string;
  status: 'COMPLETED' | 'CURRENT' | 'PENDING';
  completedAt: Date | null;
  entryDate: Date | null;
}

export interface PolicyDetail {
  policyNo: string;
  requestId: string;
  moduleName: string;
  customerName: string;
  productId: string;
  currentStage: string;
  payoutAmount: number;
  dateOfCommencement: Date | null;
  maturityDate: Date | null;
  stageHistory: StageHistory[];
}
