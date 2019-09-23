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

function ProbabilityAllBeatY(Y: ABTestParameters, X: Array<ABTestParameters>, idxs: Array<number>, next: number) {
    let x = Y.a
    let y = Y.b
    for (let i = 0; i < idxs.length; i++) {
        x += idxs[i]
        y += X[i].b
    }
    let ret = logBeta(x, y)

    let den = 0
    for (let i = 0; i < idxs.length; i++) {
        den += Math.log(X[i].b + idxs[i])
        den += logBeta(idxs[i] + 1, X[i].b)
    }
    den += logBeta(Y.a, Y.b)

    ret -= den
    ret = Math.exp(ret)
    if (idxs[next] + 1 < X[next].a) {
        let copyIdxs = [...idxs]
        copyIdxs[next]++
        ret += ProbabilityAllBeatY(Y, X, copyIdxs, next)
    }
    if (next + 1 < idxs.length) {
        let copyIdxs = [...idxs]
        copyIdxs[++next]++
        ret += ProbabilityAllBeatY(Y, X, copyIdxs, next)
    }
    return ret
}

function NextComb(v: Array<number>) {
    v[0] += 1
    let i = 0
    while (v[i] === 2) {
        v[i] = 0
        i++
        v[i]++
    }
}

export function ProbabilityYBeatsAll(Y: ABTestParameters, X: Array<ABTestParameters>) {
    let ret = 1
    let els = Array<number>(X.length)
    for (let i = 0; i < els.length; i++) {
        els[i] = 0
    }
    let maxi = Math.pow(2, X.length) - 1
    for (let i = 0; i < maxi; i++) {
        let curr = 0
        NextComb(els)
        let CurrX = Array<ABTestParameters>(0)
        let idxs = []
        for (let j = 0; j < els.length; j++) {
            if (els[j] === 1) {
                CurrX.push(X[j])
                idxs.push(0)
            }
        }
        curr += ProbabilityAllBeatY(Y, CurrX, idxs, 0)
        curr *= Math.pow(-1, idxs.length)
        ret += curr
    }
    ret *= 10000
    ret = Math.round(ret)
    return {a:ret, b:1}
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