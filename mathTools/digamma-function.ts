export function evalpoly(P: number[], x)
{
    var num =0;
    var length = P.length;

	if ( length < 2 || x === 0 ) {
		if ( length === 0 ) {
			return 0;
		}
		return P[ 0 ];
	}
	length -= 1;
    num = P[ length ]*x + P[ length - 1 ];
	length -= 2;
	while ( length >= 0 ) {
		num = num*x + P[ length ];
		length -= 1;
	}
	return num;
}

export function evalrational(P: number[], Q: number[], x)
{
    var num = evalpoly(P, x),
        den = evalpoly(Q, x)

    return num / den
}

// CONSTANTS //

const root1 = 1569415565 / 1073741824
const root2 = (381566830 / 1073741824) / 1073741824
const root3 = 0.9016312093258695918615325266959189453125e-19
const Y = 0.99558162689208984;
const P = [
    0.25479851061131551,
    -0.32555031186804491,
    -0.65031853770896507,
    -0.28919126444774784,
    -0.045251321448739056,
    -0.0020713321167745952,
    0
]
const Q = [
    1.0,
    2.0767117023730469,
    1.4606242909763515,
    0.43593529692665969,
    0.054151797245674225,
    0.0021284987017821144,
    -0.55789841321675513e-6
]

const H = [
    0.083333333333333333333333333333333333333333333333333,
    -0.0083333333333333333333333333333333333333333333333333,
    0.003968253968253968253968253968253968253968253968254,
    -0.0041666666666666666666666666666666666666666666666667,
    0.0075757575757575757575757575757575757575757575757576,
    -0.021092796092796092796092796092796092796092796092796,
    0.083333333333333333333333333333333333333333333333333,
    -0.44325980392156862745098039215686274509803921568627
]

const MIN_SAFE_ASYMPTOTIC = 10
const PI = 3.14159265358979323846264338327950288419716939937510

/*
* FUNCTION: digammaRationalApprox( x )
*	Evaluates the digamma function over interval [1,2].
*/
export function digammaRationalApprox(x) {
    var r = evalrational(P, Q, x - 1),
        g = x - root1
    g -= root2;
    g -= root3;
    return g * Y + g * r;
}

/*
* FUNCTION: digammaAsymptoticApprox( x )
*	Evaluate the digamma function via asymptotic expansion.
*/
export function digammaAsymptoticApprox(x) {
    var y;
    var z;
    x -= 1;
    y = Math.log(x) + 1 / (2 * x);
    z = 1 / (x * x);
    return y - (z * evalpoly(H, z));
}

// DIGAMMA //

export function digamma(x) {
    var rem;
    var tmp;
    if (x !== x || x === 0) {
        return NaN;
    }
    // If `x` is negative, use reflection...
    if (x <= -1) {
        // Reflect:
        x = 1 - x;

        // Argument reduction for tan:
        rem = x - Math.floor(x);

        // Shift to negative if > 0.5:
        if (rem > 0.5) {
            rem -= 1;
        }
        // Check for evaluation at a negative pole:
        if (rem === 0) {
            return NaN;
        }
        tmp = PI / Math.tan(PI * rem);
    } else {
        tmp = 0;
    }
    // If we're above the lower-limit for the asymptotic expansion, then use it...
    if (x >= MIN_SAFE_ASYMPTOTIC) {
        tmp += digammaAsymptoticApprox(x);
        return tmp;
    }
    // If x > 2, reduce to the interval [1,2]...
    while (x > 2) {
        x -= 1;
        tmp += 1 / x;
    }
    // If x < 1, use recurrence to shift to > 1..
    while (x < 1) {
        tmp -= 1 / x;
        x += 1;
    }
    tmp += digammaRationalApprox(x);
    return tmp;
}