import { bounds, has0or1Probability } from '../forNormalDistribution/densityEstimation'
import { density } from '../forNormalDistribution/distribution'
import { ProbabilityUnderDiagonal } from '../riemannIntegration'
import { Gaussian } from 'ts-gaussian'

const confidence = 0.95

export function ProbabilityXIsBest(X: NormalDistribution, Others: NormalDistribution[]) {
    const boundsX = bounds(X)
    const boundsOthers = Others.map(workspace => bounds(workspace))

    const fastResult = has0or1Probability(boundsX, boundsOthers)
    if (fastResult[0]) return fastResult[1]

    const densityX = density(X)
    const densitiesOthers = Others.map(workspace => density(workspace))

    return ProbabilityUnderDiagonal(densityX, densitiesOthers, boundsX, boundsOthers)
}

export function UpLiftChoosingA(A: NormalDistribution, B: NormalDistribution) {
    return (A.m - B.m) / B.m
}

export function PValue(A: NormalDistribution, B: NormalDistribution) {
    const gaussianA = new Gaussian(A.m, A.v)
    return 2 * gaussianA.cdf(A.m - Math.abs(A.m-B.m))
}

export function PickWinner(workspaceA: string, workspaceB: string, dataA: NormalDistribution, dataB: NormalDistribution, pvalue: number) {
    if (pvalue < 1-confidence) {
        if (dataA.m > dataB.m) return workspaceA
        return workspaceB
    }
    if (pvalue > confidence) return 'draw'

    return 'Not yet decided'
}