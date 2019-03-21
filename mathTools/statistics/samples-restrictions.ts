export const BoundError = 5e-4

/*
*  The next function is based on convergence rate for Thompson Sampling, which is proved
*  in ANALYSIS OF THOMPSON SAMPLING FOR GAUSSIAN PROCESS OPTIMIZATION IN THE BANDIT SETTING
*  found in https://arxiv.org/pdf/1705.06808.pdf
*  A brief explanation can be found in https://arxiv.org/pdf/1702.00001.pdf section 3.1
*/

export function NumberOfSamples(BoundError: number, BoundProbability: number): number {
    return - Math.log(BoundProbability) / Math.pow(BoundError, 2)
}

export const SamplesRestriction = (WorkspaceA: WorkspaceData, WorkspaceB: WorkspaceData, boundError: number, boundProbability: number): boolean => {
    return WorkspaceA["Sessions"] > NumberOfSamples(boundError, boundProbability) &&
        WorkspaceB["Sessions"] > NumberOfSamples(boundError, boundProbability)
}