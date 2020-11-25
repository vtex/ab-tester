import { beta, logBeta } from '../beta-function'

export function betaDensity(x: number, a: number, b: number) {
    return Math.exp( (a-1)*Math.log(x) + (b-1)*Math.log(1-x) - logBeta(a, b) )
}

export function incompleteBeta(x: number, a: number, b: number) {
    let value = Math.pow(x, a)
    for (let i: number = 1; i < b; i++) {
        value += Math.exp( a*Math.log(x) + i*Math.log(1-x) - Math.log(i) - logBeta(a, i) )
    }
    return value * beta(a, b)
}