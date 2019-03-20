import { ChooseWinner, LossFunctionChossingVariantOne } from '../../mathTools/decision-rule';
import { BoundError } from '../../mathTools/statistics/samples-restrictions'
import { KLDivergence } from '../../mathTools/statistics/kullback-leibler'
import { WorkspaceToBetaDistribution } from '../abTest/workspace-to-distribution'
import { TestingWorkspaces } from '../workspace/list'
import { GetAndUpdateWorkspaceData } from '../workspace/modify'

export async function Evaluate(account: string, workspaceAData: WorkspaceData, workspaceBData: WorkspaceData, ctx: ColossusContext): Promise<TestResult> {
    console.log(await TestingWorkspaces(account, ctx))

    if (workspaceAData["Sessions"] == 0 || workspaceBData["Sessions"] == 0) {
        return EvaluationResponse('A/B Test not initialized for one of the workspaces or it does not already has visitors.', 0, 0, 0)
    }

    const lossA = LossFunctionChossingVariantOne(WorkspaceToBetaDistribution(workspaceAData), WorkspaceToBetaDistribution(workspaceBData)),
        lossB = LossFunctionChossingVariantOne(WorkspaceToBetaDistribution(workspaceBData), WorkspaceToBetaDistribution(workspaceAData)),
        kldivergence = KLDivergence(WorkspaceToBetaDistribution(workspaceAData), WorkspaceToBetaDistribution(workspaceBData))

    const winner = ChooseWinner(workspaceAData, workspaceBData, BoundError) || 'not yet decided'
    return EvaluationResponse(winner, lossA, lossB, kldivergence)
}

export async function TestWorkspaces(account: string, aBTestBeginning: string, ctx: ColossusContext): Promise<TestResult[]> {
    let Results: TestResult[] = []
    let workspaceData: WorkspaceData = null
    const masterWorkspace = await GetAndUpdateWorkspaceData(account, aBTestBeginning, 'master', ctx)
    const testingWorkspaces = await TestingWorkspaces(account, ctx)
    for (var workspace of testingWorkspaces) {
        if (workspace.name != masterWorkspace.Workspace) {
            workspaceData = await GetAndUpdateWorkspaceData(account, aBTestBeginning, workspace.name, ctx)
            Results.push(await Evaluate(account, masterWorkspace, workspaceData, ctx))
        }
    }
    return Results
}

export const EvaluationResponse = (winner: string, lossA: number, lossB: number, KullbackLeibler: number): TestResult => ({
    Winner: winner,
    ExpectedLossChoosingA: lossA,
    ExpectedLossChoosingB: lossB,
    KullbackLeibler: KullbackLeibler
})