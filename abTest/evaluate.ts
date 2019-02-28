import axios from 'axios'
import { ChooseWinner, LossFunctionChossingVariantOne } from '../mathTools/decision-rule';
import { boundError } from '../mathTools/statistics/bound-error'
import { KLDivergence } from '../mathTools/statistics/kullback-leibler'
import { WorkspaceToBetaDistribution } from '../abTest/workspace-to-distribution'
import { getDataFromStoreDash, StoreDashRequestURL} from './requestMetrics/storedash'

export async function Evaluate(account, ABTestBeginning, workspaceA, workspaceB, ctx: ColossusContext): Promise<TestResult> {
    const endPoint = StoreDashRequestURL(account, ABTestBeginning)

    const workspaceAData = await GetSessionsFromStoreDash(endPoint, workspaceA, ctx),
        workspaceBData = await GetSessionsFromStoreDash(endPoint, workspaceB, ctx)

    console.log(workspaceAData)
    console.log(workspaceBData)
    if (workspaceAData["sessions"] == 0 || workspaceBData["sessions"] == 0) {
        return EvaluationResponse('A/B Test not initialized for one of the workspaces or it does not already has visitors.', 0, 0, 0)
    }

    const lossA = LossFunctionChossingVariantOne(WorkspaceToBetaDistribution(workspaceAData), WorkspaceToBetaDistribution(workspaceBData)),
        lossB = LossFunctionChossingVariantOne(WorkspaceToBetaDistribution(workspaceBData), WorkspaceToBetaDistribution(workspaceAData)),
        kldivergence = KLDivergence(workspaceAData, workspaceBData)

    const winner = ChooseWinner(workspaceAData, workspaceBData, boundError()) || 'not yet decided'
    return EvaluationResponse(winner, lossA, lossB, kldivergence)
}

export async function GetSessionsFromStoreDash(endPoint, workspace, ctx: ColossusContext) {
    var metrics = await getDataFromStoreDash(endPoint, ctx)
    var total = 0,
        noOrders = 0
    for (var metric of metrics) {
        if (metric["workspace"] == workspace) {
            if (metric["data.orders"] == 0) {
                noOrders += metric["sum"]
                total += metric["sum"]
            }
            else {
                total += metric["sum"]
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