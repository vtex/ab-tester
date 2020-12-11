import { relativeChange } from './relativePerformanceChange'

const BoundDeviation = 1e-1

export function RandomRestart(approach: TestApproach, type: TestType, workspaceAData: WorkspaceCompleteData, workspaceBData: WorkspaceCompleteData): boolean {
    const relativeChangeA = relativeChange(approach, type, workspaceAData)
    const relativeChangeB = relativeChange(approach, type, workspaceBData)

    if (Math.abs(relativeChangeA - relativeChangeB) > BoundDeviation) {
        return true
    }
    return false
}