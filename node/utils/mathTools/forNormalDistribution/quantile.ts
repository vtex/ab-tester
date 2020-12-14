/* 
*  The function below gives an aproximation to the inverse of the normal distribution's cumulative distribution function, 
*  i.e., to the normal distribution's quantile function.
*  Algorithm taken from https://web.archive.org/web/20070505093933/http://home.online.no/~pjacklam/notes/invnorm/
*/

export function normalQuantile(distribution: NormalDistribution, prob: number) {
    return ( Math.sqrt(distribution.v) * StandardNormalQuantile(prob) ) + distribution.m
}

function StandardNormalQuantile(prob: number) {
    if (prob <= 0 || prob >= 1) throw new Error('Error calculating normal distribution\'s quantile')

    // coefficients of rational approximations
    const a = [ -3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02,
                -3.066479806614716e+01, 2.506628277459239e+00 ]
    const b = [ -5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01 ]
    const c = [ -7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00,
                4.374664141464968e+00, 2.938163982698783e+00 ]
    const d = [ 7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00 ]

    // break-points
    const plow  = 0.02425
    const phigh = 1 - plow

    // calculate quantile
    if (prob < plow) {
        const q  = Math.sqrt(-2*Math.log(prob))
        return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)
    }
    if (prob > phigh) {
        const q  = Math.sqrt(-2*Math.log(1-prob))
        return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)
    }
    const q = prob - 0.5
    const r = q*q
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1)
}