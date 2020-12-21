export function calculateVariance(nonZeroValues: number[], zeroValues: number) {
    if (nonZeroValues.length + zeroValues === 0) return 0

    return ( sumSquares(nonZeroValues) / ( nonZeroValues.length + zeroValues ) ) - calculateMean(nonZeroValues, zeroValues)**2
}

export function aggregatedVariance(variance: number, mean: number, n: number, newValues: number[], newZeroes: number) {
    const newN = n + newValues.length + newZeroes

    const squaresSum = n * ( variance + mean**2 )
    const newSquaresSum = squaresSum + sumSquares(newValues)

    const newSum = mean * n + sum(newValues)
    const newMean = newSum / newN

    return ( newSquaresSum / newN ) - newMean**2
}

const sum = (values: number[]) => values.reduce((sum, value) => sum + value)

const calculateMean = (values: number[], zeroValues: number) => sum(values) / ( values.length + zeroValues )

const sumSquares = (values: number[]) => values.reduce((sum, value) => sum + value*value)