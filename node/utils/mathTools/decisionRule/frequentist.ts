import { bounds } from '../forNormalDistribution/densityEstimation'
import { integrate } from '../riemannIntegration'
import { Gaussian } from 'ts-gaussian'

const confidence = 0.95

export function ProbabilityXIsBest(X: NormalDistribution, Others: NormalDistribution[]) {
    if (Others.length === 1) return ProbabilityXbeatsY(X, Others[0])

    const normalX = new Gaussian(X.m, X.v)
    const normalOthers = Others.map(parameters => new Gaussian(parameters.m, parameters.v))

    const integrand = (p: number) => {
        let value = normalX.pdf(p) 
        for (const normal of normalOthers) value *= normal.cdf(p)
        return value
    }

    const boundsX = bounds(X)

    return integrate(integrand, boundsX.l, boundsX.u)
}

function ProbabilityXbeatsY(X: NormalDistribution, Y: NormalDistribution) {
    const difference_mean = X.m - Y.m
    const difference_variance = X.v + Y.v
    const difference = new Gaussian(difference_mean, difference_variance)

    return 1 - difference.cdf(0)
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