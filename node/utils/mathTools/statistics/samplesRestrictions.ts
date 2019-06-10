import { beta } from '../beta-function'

export const BoundError = 2e-4

/*
*  The next function is based on convergence rate for Thompson Sampling, which is proved
*  in ANALYSIS OF THOMPSON SAMPLING FOR GAUSSIAN PROCESS OPTIMIZATION IN THE BANDIT SETTING
*  found in https://arxiv.org/pdf/1705.06808.pdf
*  A brief explanation can be found in https://arxiv.org/pdf/1702.00001.pdf section 3.1
*/

export function NumberOfSamples(boundError: number, BoundProbability: number): number {
    return - Math.log(BoundProbability) / Math.pow(boundError, 2) / 36
}

export const SamplesRestriction = (WorkspaceA: WorkspaceData, WorkspaceB: WorkspaceData, boundError: number, boundProbability: number): boolean => {
    return WorkspaceA.Sessions + WorkspaceB.Sessions > NumberOfSamples(boundError, boundProbability)
}

export const pValue = (control: ABTestParameters, alternative: ABTestParameters): number => {
    const controlConversion = (control.a - 1) / (control.a + control.b - 2)
    return Math.pow(controlConversion, alternative.a - 1) * Math.pow(1 - controlConversion, alternative.b - 1) * beta(alternative.a, alternative.b)
}