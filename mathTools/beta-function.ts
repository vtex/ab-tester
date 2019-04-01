import { gamma, logGamma } from './gamma-function'

const BIGGEST_POSITIVE_NUMBER = 170

export function beta(x: number, y: number): number {
  if (x < 0 || y < 0) {
    throw RangeError('Arguments must be positive.')
  }

  // Special cases
  else if (x === 0 && y === 0) return NaN
  else if (x === 0 || y === 0) return Infinity

  // make sure x + y doesn't exceed the upper limit of usable values
  else if (x + y > BIGGEST_POSITIVE_NUMBER) {
    return Math.exp(logBeta(x, y))
  }

  else {
    return gamma(x) * gamma(y) / gamma(x + y)
  }
}

export function logBeta(x: number, y: number): number {
  if (x < 0 || y < 0) {
    throw RangeError('Arguments must be positive.')
  }

  // Some special cases
  else if (x === 0 && y === 0) return NaN
  else if (x === 0 || y === 0) return Infinity

  else {
    return logGamma(x) + logGamma(y) - logGamma(x + y)
  }
}