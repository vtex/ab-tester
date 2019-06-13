import { betaDensity, intermediateBeta } from './betaDistribution'

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

export const pValue = (control: ABTestParameters, alternative: ABTestParameters): number => {
    const alternativeConversion = (alternative.a - 1) / (alternative.a + alternative.b - 2)
    return customBetaProbability(alternativeConversion, control.a, control.b)
}

export const customBetaProbability = (x: number, a: number, b: number): number => {
    const lambda = (a - 1) / (a + b - 2)
    const lambda1 = lambda - BoundError
    const lambda2 = lambda + BoundError
    const a1 = 1 + Math.floor((lambda1 / lambda) * (a - 1))
    const b1 = a + b - a1
    const a2 = 1 + Math.floor((lambda2 / lambda) * (a - 1))
    const b2 = a + b - a2
    const h = betaDensity(lambda, a, b)
    const half = x > lambda
    const xminus = x - BoundError
    const xplus = x + BoundError

    const totalMass = 1 + (2 * BoundError * h)

    if (Math.abs(lambda - x) < 2 * BoundError) {
        let probability = BoundError
        probability += half ? intermediateBeta(lambda2, xplus, a2, b2) + (h * (lambda2 - x)) : intermediateBeta(xminus, lambda1, a1, b1) + (h * (x - lambda1))
        return probability / totalMass
    }

    return half ? intermediateBeta(xminus, xplus, a2, b2) / totalMass : intermediateBeta(x - BoundError, x + BoundError, a1, b1) / totalMass
}