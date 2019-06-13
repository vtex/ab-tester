import { WorkspaceToBetaDistribution } from '../../workspace'
import { logBeta } from '../beta-function'
import { pValue } from '../statistics/samplesRestrictions'

const Confidence = 0.95

/*
*   The reason for using the function logBeta is that we're dealing with very large numbers and the
*   Beta with parameters that big will be infiinity and we wont have a determined value for the fraction
*   of these "infinity" values. But the fraction calculated is small - not too small - and the logBeta
*   of these large numbers are possible to calculate. So we do the calculations using the logarithmics
*   and then exponatiating.
*/

export function ProbabilityOfOneBeatTwo(a: number, b: number, c: number, d: number) {
    let result = 1

    for (let j = 0; j < c; j++) {
        result -= Math.exp(logBeta(a + j, b + d) - logBeta(1 + j, d) - logBeta(a, b) - Math.log(d + j))
    }
    return result
}

export function LossFunctionChossingVariantOne(Beta1: ABTestParameters, Beta2: ABTestParameters) {
    const a = Beta2.a
    const b = Beta2.b
    const c = Beta1.a
    const d = Beta1.b

    const logCoefficient1 = logBeta(a + 1, b) - logBeta(a, b)
    const logCoefficient2 = logBeta(c + 1, d) - logBeta(c, d)

    return Math.exp(logCoefficient1) * ProbabilityOfOneBeatTwo(a + 1, b, c, d) - Math.exp(logCoefficient2) * ProbabilityOfOneBeatTwo(a, b, c + 1, d)
}

export function ChooseWinner(WorkspaceA: WorkspaceData, WorkspaceB: WorkspaceData, epsilon: number) {
    const betaA = WorkspaceToBetaDistribution(WorkspaceA)
    const betaB = WorkspaceToBetaDistribution(WorkspaceB)
    const pvalue = pValue(betaA, betaB)

    const chooseA = LossFunctionChossingVariantOne(betaA, betaB) < epsilon
    const chooseB = LossFunctionChossingVariantOne(betaB, betaA) < epsilon
    const draw = pvalue > Confidence
    const distinct = pvalue < 1 - Confidence

    if (chooseA && chooseB && draw) {
        return 'draw'
    }
    else if (chooseA && distinct) {
        return WorkspaceA.Workspace
    }
    else if (chooseB && distinct) {
        return WorkspaceB.Workspace
    }
    else {
        return null
    }
}