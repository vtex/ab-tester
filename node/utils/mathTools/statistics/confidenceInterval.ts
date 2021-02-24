import { inverseTStudent } from './t-student'

export interface ConfidenceInterval
{
    LowerBound: number
    UpperBound: number
}

export function confidenceInterval(degreesOfFreedom: number, confidence: number, mean: number, stdDev: number): ConfidenceInterval
{
    const A = inverseTStudent(degreesOfFreedom, 1 - confidence)

    const x = {
        LowerBound: mean - stdDev * A / Math.sqrt(degreesOfFreedom + 1),
        UpperBound: mean + stdDev * A / Math.sqrt(degreesOfFreedom + 1),
    } as ConfidenceInterval
    return x
}