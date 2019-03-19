import { logBeta } from './beta-function'
import { WorkspaceToBetaDistribution } from '../node/abTest/workspace-to-distribution'
import { BoundError, SamplesRestriction } from './statistics/samples-restrictions';

const BoundProbability = 0.05

/*
*   The reason for using the function logBeta is that we're dealing with very large numbers and the
*   Beta with parameters that big will be infiinity and we wont have a determined value for the fraction
*   of these "infinity" values. But the fraction calculated is small - not too small - and the logBeta
*   of these large numbers are possible to calculate. So we do the calculations using the logarithmics
*   and then exponatiating.
*/

export function ProbabilityOfOneBeatTwo(a, b, c, d) {
    var result = 1

    for (var j = 0; j < c; j++) {
        result -= Math.exp(logBeta(a + j, b + d) - logBeta(1 + j, d) - logBeta(a, b) - Math.log(d + j))
    }
    return result
}

export function LossFunctionChossingVariantOne(Beta1: BetaDistribution, Beta2: BetaDistribution) {
    const a = Beta2["parameterA"],
        b = Beta2["parameterB"],
        c = Beta1["parameterA"],
        d = Beta1["parameterB"]

    const logCoefficient1 = logBeta(a + 1, b) - logBeta(a, b),
        logCoefficient2 = logBeta(c + 1, d) - logBeta(c, d)

    return Math.exp(logCoefficient1) * ProbabilityOfOneBeatTwo(a + 1, b, c, d) - Math.exp(logCoefficient2) * ProbabilityOfOneBeatTwo(a, b, c + 1, d)
}

export function ChooseWinner(WorkspaceA: WorkspaceData, WorkspaceB: WorkspaceData, epsilon: number) {
    const chooseA = LossFunctionChossingVariantOne(WorkspaceToBetaDistribution(WorkspaceA), WorkspaceToBetaDistribution(WorkspaceB)) < epsilon,
        chooseB = LossFunctionChossingVariantOne(WorkspaceToBetaDistribution(WorkspaceB), WorkspaceToBetaDistribution(WorkspaceA)) < epsilon

    if (!SamplesRestriction(WorkspaceA, WorkspaceB, BoundError, BoundProbability)) {
        return null
    }
    if (chooseA && chooseB) {
        return 'draw'
    }
    else if (chooseA) {
        return WorkspaceA["Workspace"]
    }
    else if (chooseB) {
        return WorkspaceB["Workspace"]
    }
    else {
        return null
    }
}