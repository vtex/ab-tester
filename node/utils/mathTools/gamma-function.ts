const GAMMA_CONST = 0.577215664901532860606512090

// numerator coefficients for approximation over the interval (1,2)
const P_COFF = [
  -1.71618513886549492533811E+0,
   2.47656508055759199108314E+1,
  -3.79804256470945635097577E+2,
   6.29331155312818442661052E+2,
   8.66966202790413211295064E+2,
  -3.14512729688483675254357E+4,
  -3.61444134186911729807069E+4,
   6.64561438202405440627855E+4,
]

// denominator coefficients for approximation over the interval (1,2)
const Q_COFF = [
  -3.08402300119738975254353E+1,
   3.15350626979604161529144E+2,
  -1.01515636749021914166146E+3,
  -3.10777167157231109440444E+3,
   2.25381184209801510330112E+4,
   4.75584627752788110767815E+3,
  -1.34659959864969306392456E+5,
  -1.15132259675553483497211E+5,
]

export function gamma(x: number): number {
  if (x <= 0.0) {
    throw new RangeError('Argument must be positive.')
	}

	// The relative error over this interval is less than 6e-7.
  else if (x < 0.001) {
    return 1.0/(x*(1.0 + GAMMA_CONST*x))
  }

  // The algorithm directly approximates gamma over (1,2) and uses
  // reduction identities to reduce other arguments to this interval.
  else if (x < 12.0) {
    let y = x
    let n = 0
    const lessOne = (y < 1.0)

    // Add or subtract integers as necessary to bring y into (1,2)
    if (lessOne) {
      y += 1.0
    } else {
      n = Math.floor(y) - 1
      y -= n
    }

    let num = 0.0
    let den = 1.0
    const z = y - 1
    for (let i = 0; i < 8; i++) {
      num = (num + P_COFF[i])*z
      den = den*z + Q_COFF[i]
    }
    let result = num/den + 1.0

    // Apply correction if argument was not initially in (1,2)
    if (lessOne) {
      result /= (y-1.0)
    } else {
      // Use the identity gamma(z+n) = z*(z+1)* ... *(z+n-1)*gamma(z)
      for (let i = 0; i < n; i++) {
        result *= y++
      }
    }

    return result
  }

  // Correct answer too large to display. Force +infinity.
  else if (x > 171.624) {
		return Infinity
  }

  else {
    return Math.exp(logGamma(x))
  }
}

const C_COFF = [
   1.0/12.0,
  -1.0/360.0,
   1.0/1260.0,
  -1.0/1680.0,
   1.0/1188.0,
  -691.0/360360.0,
   1.0/156.0,
  -3617.0/122400.0,
]

const HALF_LOG_TWO_PI = 0.91893853320467274178032973640562

export function logGamma(x: number): number {
  if (x <= 0.0) {
    throw new RangeError('Argument must be positive.')
	}

  else if (x < 12.0) {
    return Math.log(Math.abs(gamma(x)))
  }

  // Abramowitz and Stegun 6.1.41
  // Asymptotic series should be good to at least 11 or 12 figures
  // For error analysis, see Whittiker and Watson
  // A Course in Modern Analysis (1927), page 252

  else {
    const  z = 1.0/(x*x)
    let sum = C_COFF[7]
    for (let i = 6; i >= 0; i--) {
      sum *= z
      sum += C_COFF[i]
    }
    const series = sum/x
    return (x - 0.5)*Math.log(x) - x + HALF_LOG_TWO_PI + series
  }
}