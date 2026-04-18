export interface ProcessRequest {
  policyNo: string;
  requestId: string;
  action: string;
  remarks: string;
}

export interface ProcessResponse {
  status: string;
  message: string;
  newStage: string;
  processedAt: Date;
}

export interface AuditPayload {
  policyNo: string;
  requestId: string;
  actionTaken: string;
  performedBy: string;
  remarks: string;
  status: string;
}
