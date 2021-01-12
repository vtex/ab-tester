import { probabilityUnderDiagonal, differenceExpectationUnderDiagonal } from '../riemannIntegration'
import { betaDensity } from '../forBetaDistribution/statistics/betaDistribution'
import { calculateBound, has0or1Probability } from '../forBetaDistribution/statistics/densityEstimations'
import { positiveRevenueWorkspaces } from '../../workspace'
import { convertIntoNormal } from '../forBetaDistribution/normalApprox'
import { ProbabilityXIsBest as frequentistProb } from './frequentist'

export function ProbabilityXIsBest(X: BayesianRevenueParams, Others: BayesianRevenueParams[]) {
    if (X.r === 0) return 0

    const relevantWorkspaces = positiveRevenueWorkspaces(Others)
    if (relevantWorkspaces.length === 0) return 1

    if (hasEnoughData(X, ...relevantWorkspaces)) return NormalApproximationProb(X, relevantWorkspaces)

    const r = relevantWorkspaces.map(workspace => X.r / workspace.r)
    const boundX = calculateBound(X.a, X.b)
    const boundsOthers = relevantWorkspaces.map((workspace) => calculateBound(workspace.a, workspace.b))

    const fastResult = has0or1Probability(X, relevantWorkspaces, boundX, boundsOthers, r)
    if (fastResult[0]) return fastResult[1]

    const densityX = (x: number) => betaDensity(x, X.a, X.b)
    const densitiesOthers = relevantWorkspaces.map((workspace) => ((y: number) => betaDensity(y, workspace.a, workspace.b)))

    return probabilityUnderDiagonal(densityX, densitiesOthers, r, boundX, boundsOthers)
}

function NormalApproximationProb(X: BayesianRevenueParams, Others: BayesianRevenueParams[]) {
    const normalX = convertIntoNormal(X)
    const normalOthers = Others.map(workspace => convertIntoNormal(workspace))

    return frequentistProb(normalX, normalOthers)
}

export function LossChoosingB(A: BayesianRevenueParams, B: BayesianRevenueParams) {
    if (A.r === 0) return 0
    if (B.r === 0) return A.r * A.a/(A.a+A.b)

    const boundA = calculateBound(A.a, A.b)
    const boundB = calculateBound(B.a, B.b)

    const fastResult = has0or1Probability(A, [B], boundA, [boundB], [A.r/B.r])
    if (fastResult[0]) return fastResult[1] * (A.r * A.a/(A.a+A.b) - B.r * B.a/(B.a+B.b))

    const densityA = (x: number) => betaDensity(x, A.a, A.b)
    const densityB = (y: number) => betaDensity(y, B.a, B.b)

    return differenceExpectationUnderDiagonal(densityA, densityB, A.r, B.r, boundA, boundB)
}

export function PickWinner(workspaceA: string, workspaceB: string, lossChoosingA: number, lossChoosingB: number): string {
    if (lossChoosingA < lossChoosingB) return workspaceA
    if (lossChoosingA > lossChoosingB) return workspaceB
    return 'draw'
}

const hasEnoughData = (...workspaces: BayesianRevenueParams[]) => {
    for (const workspace of workspaces) {
        if (workspace.a < 100 || workspace.b < 1e+5) return false
    }
    return true
}