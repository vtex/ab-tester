
// Euler's gamma constant
var GAMMA_CONST = 0.577215664901532860606512090;

// numerator coefficients for approximation over the interval (1,2)
var P_COFF = [
  -1.71618513886549492533811E+0,
   2.47656508055759199108314E+1,
  -3.79804256470945635097577E+2,
   6.29331155312818442661052E+2,
   8.66966202790413211295064E+2,
  -3.14512729688483675254357E+4,
  -3.61444134186911729807069E+4,
   6.64561438202405440627855E+4
];

// denominator coefficients for approximation over the interval (1,2)
var Q_COFF = [
  -3.08402300119738975254353E+1,
   3.15350626979604161529144E+2,
  -1.01515636749021914166146E+3,
  -3.10777167157231109440444E+3,
   2.25381184209801510330112E+4,
   4.75584627752788110767815E+3,
  -1.34659959864969306392456E+5,
  -1.15132259675553483497211E+5
];

function gamma(x) {
    if (x <= 0.0) {
      throw new RangeError('Argument must be positive.');
      }
  
      /*
        For small x, 1/Gamma(x) has power series x + gamma x^2  - ...
        So in this range, 1/Gamma(x) = x + gamma x^2 with error on the order of x^3.
      */
    else if (x < 0.001) {
      return 1.0/(x*(1.0 + GAMMA_CONST*x));
    }
    
    // The algorithm directly approximates gamma over (1,2) and uses
    // reduction identities to reduce other arguments to this interval.
    else
    {
        var y = x, n = 0, lessOne = (y < 1.0);
  
        // Add or subtract integers as necessary to bring y into (1,2)
        if (lessOne) {
            y += 1.0;
        } else {
            n = Math.floor(y) - 1;
            y -= n;
        }
      
        var num = 0.0, den = 1.0, z = y - 1;
        for (var i = 0; i < 8; i++) {
            num = (num + P_COFF[i])*z;
            den = den*z + Q_COFF[i];
        }
        var result = num/den + 1.0;
  
        // Apply correction if argument was not initially in (1,2)
        if (lessOne) 
        {
            result /= (y-1.0);
        } else 
            {
                // Use the identity gamma(z+n) = z*(z+1)* ... *(z+n-1)*gamma(z)
                for (i = 0; i < n; i++)
                result *= y++;
            }
  
        return result;
    }
}
exports.Gamma = gamma;

function beta(x, y) 
{
    if (x < 0 || y < 0) 
    {
        throw RangeError('Arguments must be positive.');
	}

    // Some special cases
    else if (x === 0 && y === 0) return NaN;
    else if (x === 0 || y === 0) return Infinity;
    else 
    {
        return gamma(x) * gamma(y) / gamma(x + y);
    }
}
exports.Beta = beta;