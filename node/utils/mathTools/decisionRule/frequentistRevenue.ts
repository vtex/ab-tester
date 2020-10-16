import { Gaussian } from 'ts-gaussian'

const confidence = 0.95

export function CalculateUValue(OrdersValueHistory: number[][], idx: number): number {
    const valuesAndLabels = CreateOrdersValueHistoryWithLabels(OrdersValueHistory, idx)
    let iterator = 0
    let U = 0
    while(iterator < valuesAndLabels.length) {
        let countIdx = 0
        let countTotal = 0
        let repetitions = iterator
        while (repetitions < valuesAndLabels.length && valuesAndLabels[repetitions][0] == valuesAndLabels[iterator][0]) {
            if (valuesAndLabels[repetitions][1] == 0) {
                countIdx++
            }
            countTotal++
            repetitions++
        }
        let avg = (2 * iterator + countTotal + 1) /2.0
        U += avg * countIdx
        iterator = repetitions
    }
    U -= OrdersValueHistory[idx].length * (OrdersValueHistory[idx].length + 1) / 2.0
    return U
}

function CreateOrdersValueHistoryWithLabels(OrdersValueHistory: number[][], idx: number) {
    let valuesAndLabels: Array<[number, number]> = []
    for (const value of OrdersValueHistory[idx]) {
        valuesAndLabels.push([value, 0])
    }
    for (let i = 0; i < OrdersValueHistory.length; i++) {
        if (i != idx) {
            for (const value of OrdersValueHistory[i]) {
                valuesAndLabels.push([value, 1])
            }
        }
    }
    valuesAndLabels = valuesAndLabels.sort((a, b) => a[0] - b[0])
    return valuesAndLabels
}

export function CalculatePValue(U: number, nA: number, nB: number): number {
    const z = (U - (nA * nB / 2)) / Math.sqrt(nA * nB * (nA + nB + 1) / 12)
    const dist = new Gaussian(0, 1)
    return 1 - dist.cdf(z)
}

export function CalculateEffectSize(U: number, nA: number, nB: number) {
    return U / (nA * nB)
}

export function PickWinner(pValue: number, original: string, alternative: string): string {
    if (pValue > confidence) {
        return alternative
    }
    if (pValue < (1 - confidence)) {
        return original
    } 
    return 'draw'
}

export function CalculateMedian(values: number[]): number {
    if (values.length === 0) {
        return 0
    }
    const sortedValues = values.sort()
    const half = Math.floor(sortedValues.length/2)
    if (sortedValues.length % 2 === 1) {
        return sortedValues[half]
    }
    return ((sortedValues[half - 1] + sortedValues[half]) / 2)
} 