export type IssueStatus = 'draft' | 'collecting' | 'analyzing' | 'pending_decision' | 'decided' | 'closed';
export type EvidenceSourceType = 'survey' | 'social' | 'competitor' | 'report' | 'manual';
export type EvidenceStance = 'pro' | 'con' | 'neutral';
export type DecisionStatus = 'pending_review' | 'adopted' | 'rejected' | 'expired';
export type ActionStatus = 'todo' | 'in_progress' | 'done' | 'verified';
export type ReviewAssessment = 'effective' | 'partial' | 'ineffective' | 'negative';
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'member';
}
export interface Issue {
    id: string;
    tenantId: string;
    title: string;
    description: string;
    domain: 'brand' | 'product' | 'market' | 'strategy';
    status: IssueStatus;
    ownerId: string;
    ownerName: string;
    decisionDueAt: string;
    createdAt: string;
    updatedAt: string;
}
export interface Evidence {
    id: string;
    issueId: string;
    tenantId: string;
    sourceType: EvidenceSourceType;
    sourceLabel: string;
    sourceRef: string;
    content: string;
    summary: string;
    stance: EvidenceStance;
    tags: string[];
    confidence: number;
    freshnessAt: string;
    citation: string;
}
export interface DecisionEvidenceRef {
    evidenceId: string;
    argument: string;
    strength: number;
}
export interface ConflictItem {
    description: string;
    evidenceIds: string[];
    interpretation: string;
}
export interface BlindSpotItem {
    description: string;
    importance: 'high' | 'medium' | 'low';
}
export interface DecisionCard {
    id: string;
    issueId: string;
    version: number;
    recommendation: string;
    proEvidence: DecisionEvidenceRef[];
    conEvidence: DecisionEvidenceRef[];
    conflicts: ConflictItem[];
    blindSpots: BlindSpotItem[];
    assumptions: string[];
    failureWarnings: string[];
    confidenceScore: number;
    confidenceReason: string;
    status: DecisionStatus;
    createdAt: string;
}
export interface ActionItem {
    id: string;
    decisionCardId: string;
    title: string;
    description: string;
    ownerName: string;
    dueAt: string;
    expectedMetric: string;
    status: ActionStatus;
}
export interface ReviewResult {
    id: string;
    actionItemId: string;
    decisionCardId: string;
    baselineMetric: string;
    actualMetric: string;
    delta: string;
    assessment: ReviewAssessment;
    learnings: string;
    createdAt: string;
}
export interface DashboardStats {
    activeIssues: number;
    pendingDecisionCards: number;
    overdueActions: number;
    completedActions: number;
    totalActions: number;
}
export interface DashboardFeedItem {
    id: string;
    type: 'decision' | 'evidence' | 'action';
    title: string;
    subtitle: string;
    timestamp: string;
}
export interface DashboardPayload {
    stats: DashboardStats;
    focusDecisions: Array<{
        id: string;
        issueId: string;
        issueTitle: string;
        confidenceScore: number;
        recommendation: string;
        status: DecisionStatus;
    }>;
    recentEvidence: DashboardFeedItem[];
    actionProgress: {
        completed: number;
        total: number;
        percent: number;
    };
}
