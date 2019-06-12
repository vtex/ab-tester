import { beta } from '../beta-function'

export function betaDensity(x: number, a: number, b: number) {
    return Math.pow(x, a - 1) * Math.pow(1 - x, b - 1) / beta(a, b)
}

export function incompleteBeta(x: number, a: number, b: number) {
    let value = x
    for (let i: number = 1; i < a; i++) {
        value -= Math.pow(x, i - 1) / (i * beta(i, 1))
    }
    for (let j: number = 1; j < b; j++) {
        value += Math.pow(x, a) * Math.pow(1 - x, j) / (b * beta(a, j))
    }

    return value
}

export function intermediateBeta(x: number, y: number, a: number, b: number) {
    return Math.abs(incompleteBeta(y, a, b) - incompleteBeta(x, a, b))
}
