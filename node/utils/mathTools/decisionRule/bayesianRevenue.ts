import { probabilityUnderDiagonal, differenceExpectationUnderDiagonal } from '../riemannIntegration'
import { betaDensity } from '../forBetaDistribution/statistics/betaDistribution'
import { calculateBound, has0or1Probability } from '../forBetaDistribution/statistics/densityEstimations'
import { positiveRevenueWorkspaces, WorkspaceToBetaDistribution } from '../../workspace'

export function ProbabilityXIsBest(X: ABTestParameters, Others: ABTestParameters[], rX: number, rOthers: number[]) {
    if (rX === 0) return 0

    const [relevantWorkspaces, revenues] = positiveRevenueWorkspaces(Others, rOthers)
    const r = revenues.map((rev: number) => rX/rev)
    const boundX = calculateBound(X.a, X.b)
    const boundsOthers = relevantWorkspaces.map((workspace) => calculateBound(workspace.a, workspace.b))

    const fastResult = has0or1Probability(X, relevantWorkspaces, boundX, boundsOthers, r)
    if (fastResult[0]) return fastResult[1]

    const densityX = (x: number) => betaDensity(x, X.a, X.b)
    const densitiesOthers = relevantWorkspaces.map((workspace) => ((y: number) => betaDensity(y, workspace.a, workspace.b)))

    return probabilityUnderDiagonal(densityX, densitiesOthers, r, boundX, boundsOthers)
}

export function LossChoosingB(A: ABTestParameters, B: ABTestParameters, rA: number, rB: number) {
    if (rA === 0) return 0
    if (rB === 0) return rA * A.a/(A.a+A.b)

    const boundA = calculateBound(A.a, A.b)
    const boundB = calculateBound(B.a, B.b)

    const fastResult = has0or1Probability(A, [B], boundA, [boundB], [rA/rB])
    if (fastResult[0]) return fastResult[1] * (rA * A.a/(A.a+A.b) - rB * B.a/(B.a+B.b))

    const densityA = (x: number) => betaDensity(x, A.a, A.b)
    const densityB = (y: number) => betaDensity(y, B.a, B.b)

    return differenceExpectationUnderDiagonal(densityA, densityB, rA, rB, boundA, boundB)
}

export function PickWinner(WorkspaceA: WorkspaceData, WorkspaceB: WorkspaceData, rA: number, rB: number): string {
    const A = WorkspaceToBetaDistribution(WorkspaceA)
    const B = WorkspaceToBetaDistribution(WorkspaceB)

    const lossA = LossChoosingB(B, A, rB, rA)
    const lossB = LossChoosingB(A, B, rA, rB)

    if (lossA < lossB) return WorkspaceA.Workspace
    if (lossA > lossB) return WorkspaceB.Workspace
    return 'draw'
}