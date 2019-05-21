import { RandomBeta } from './mathTools/statistics/betaSampling'
import { WorkspaceToBetaDistribution } from './workspace'

const BoundDeviation = 1e-1

export function RandomRestart(workspaceAData: WorkspaceCompleteData, workspaceBData: WorkspaceCompleteData): boolean {
    const betaVariateAOld = RandomBeta(WorkspaceToBetaDistribution(workspaceAData.SinceBeginning))
    const betaVariateARecent = RandomBeta(WorkspaceToBetaDistribution(workspaceAData.Last24Hours))
    const betaVariateBOld = RandomBeta(WorkspaceToBetaDistribution(workspaceBData.SinceBeginning))
    const betaVariateBRecent = RandomBeta(WorkspaceToBetaDistribution(workspaceBData.Last24Hours))

    const relativeChangeA = betaVariateARecent /  betaVariateAOld
    const relativeChangeB = betaVariateBRecent /  betaVariateBOld

    if (Math.abs(relativeChangeA - relativeChangeB) > BoundDeviation) {
        return true
    }
    return false
}