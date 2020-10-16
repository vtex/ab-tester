import { beta } from '../beta-function'

export function betaDensity(x: number, a: number, b: number) {
    return Math.pow(x, a - 1) * Math.pow(1 - x, b - 1) / beta(a, b)
}

export function incompleteBeta(x: number, a: number, b: number) {
    let value = Math.pow(x, a)
    for (let i: number = 1; i < b; i++) {
        value += Math.pow(x, a) * Math.pow(1 - x, i) / (i * beta(a, i))
    }

    return value * beta(a, b)
}