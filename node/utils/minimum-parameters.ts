import { DefaultABTestParameters } from '../utils/workspace'

export function MinimumABTestParameter(workspace: ABWorkspaceMetadata) {
    const params = workspace.abTestParameters || DefaultABTestParameters
    return Math.min(params.a, params.b)
}