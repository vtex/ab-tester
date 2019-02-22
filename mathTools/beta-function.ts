import { gamma, logGamma} from './gamma-function'
// import * as Math from 'math.ts'

//
// The beta functions are taken from the jStat library, and modified to fit
// the API and style pattern used in this module.
// See: https://github.com/jstat/jstat/
// License: MIT
//

export function beta(x, y) {
	if (x < 0 || y < 0) {
   throw RangeError('Arguments must be positive.')
	}

  // Some special cases
  else if (x === 0 && y === 0) return NaN
  else if (x === 0 || y === 0) return Infinity

	// make sure x + y doesn't exceed the upper limit of usable values
  else if (x + y > 170) {
    //return Math.exp(logBeta(x, y))
    return Math.exp(logBeta(x, y))
  }

  else {
    return gamma(x) * gamma(y) / gamma(x + y)
  }
}

export function logBeta(x, y) {
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