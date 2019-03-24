import { DefaultABTestParameters } from '../utils/workspace-meta-data'

export function MinimumABTestParameter(workspace: ABWorkspaceMetadata) {
    const params = workspace["abTestParameters"] || DefaultABTestParameters
    return Math.min(params.a, params.b)
}