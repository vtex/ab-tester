import { ChooseWinner, LossFunctionChossingVariantOne, ProbabilityOfOneBeatTwo } from '../../mathTools/decision-rule';
import { BoundError } from '../../mathTools/statistics/samples-restrictions'
import { KLDivergence } from '../../mathTools/statistics/kullback-leibler'
import { WorkspaceToBetaDistribution } from '../abTest/workspace-to-distribution'
import { TestingWorkspaces } from '../workspace/list'
import { GetAndUpdateWorkspaceData } from '../workspace/modify'
import { DefaultEvaluationResponse, EvaluationResponse } from '../utils/evaluation-response'

export async function Evaluate(account: string, workspaceAData: WorkspaceData, workspaceBData: WorkspaceData, ctx: ColossusContext): Promise<TestResult> {
    console.log(await TestingWorkspaces(account, ctx))

    if (workspaceAData["Sessions"] == 0 || workspaceBData["Sessions"] == 0) {
        return DefaultEvaluationResponse(workspaceAData, workspaceBData)
    }

    const lossA = LossFunctionChossingVariantOne(WorkspaceToBetaDistribution(workspaceAData), WorkspaceToBetaDistribution(workspaceBData)),
        lossB = LossFunctionChossingVariantOne(WorkspaceToBetaDistribution(workspaceBData), WorkspaceToBetaDistribution(workspaceAData)),
        probabilityOneBeatTwo = ProbabilityOfOneBeatTwo(WorkspaceToBetaDistribution(workspaceBData).parameterA, WorkspaceToBetaDistribution(workspaceBData).parameterB, WorkspaceToBetaDistribution(workspaceAData).parameterA, WorkspaceToBetaDistribution(workspaceAData).parameterB),
        kldivergence = KLDivergence(WorkspaceToBetaDistribution(workspaceAData), WorkspaceToBetaDistribution(workspaceBData))

    const winner = ChooseWinner(workspaceAData, workspaceBData, BoundError) || 'not yet decided'
    return EvaluationResponse(workspaceAData, workspaceBData, winner, lossA, lossB, probabilityOneBeatTwo, kldivergence)
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