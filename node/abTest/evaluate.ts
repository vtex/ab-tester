import { ChooseWinner, LossFunctionChossingVariantOne } from '../../mathTools/decision-rule';
import { BoundError } from '../../mathTools/statistics/samples-restrictions'
import { KLDivergence } from '../../mathTools/statistics/kullback-leibler'
import { WorkspaceToBetaDistribution } from './workspace-to-distribution'
import { getDataFromStoreDash, StoreDashRequestURL } from '../clients/storedash'

export async function Evaluate(account: string, aBTestBeginning: string, workspaceA: string, workspaceB: string, ctx: ColossusContext): Promise<TestResult> {
    const endPoint = StoreDashRequestURL(account, aBTestBeginning)

    const workspaceAData = await GetWorkspaceData(endPoint, workspaceA, ctx),
        workspaceBData = await GetWorkspaceData(endPoint, workspaceB, ctx)

    if (workspaceAData["Sessions"] == 0 || workspaceBData["Sessions"] == 0) {
        return EvaluationResponse('A/B Test not initialized for one of the workspaces or it does not already has visitors.', 0, 0, 0)
    }

    const lossA = LossFunctionChossingVariantOne(WorkspaceToBetaDistribution(workspaceAData), WorkspaceToBetaDistribution(workspaceBData)),
        lossB = LossFunctionChossingVariantOne(WorkspaceToBetaDistribution(workspaceBData), WorkspaceToBetaDistribution(workspaceAData)),
        kldivergence = KLDivergence(WorkspaceToBetaDistribution(workspaceAData), WorkspaceToBetaDistribution(workspaceBData))

    const winner = ChooseWinner(workspaceAData, workspaceBData, BoundError) || 'not yet decided'
    return EvaluationResponse(winner, lossA, lossB, kldivergence)
}

export async function GetWorkspaceData(endPoint: string, workspace: string, ctx: ColossusContext) {
    var metrics = await getDataFromStoreDash(endPoint, ctx)
    var total = 0,
        noOrders = 0
    for (var metric of metrics) {
        if (metric["workspace"] == workspace) {
            if (metric["data.orderPlaced"] == 'false') {
                noOrders += metric["count"]
                total += metric["count"]
            }
            else {
                total += metric["count"]
            }
        }
    }
    return WorkspaceData(workspace, total, noOrders)
}

export const WorkspaceData = (Workspace, TotalSessions, NoOrderSessions): WorkspaceData => ({
    Workspace: Workspace,
    Sessions: TotalSessions,
    OrderSessions: (TotalSessions - NoOrderSessions),
    NoOrderSessions: NoOrderSessions
})

export const EvaluationResponse = (winner, lossA, lossB, KullbackLeibler): TestResult => ({
    Winner: winner,
    ExpectedLossChoosingA: lossA,
    ExpectedLossChoosingB: lossB,
    KullbackLeibler: KullbackLeibler
})