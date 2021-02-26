
const a = [
    -3.969683028665376e+1,
    2.209460984245205e+2,
    -2.759285104469687e+2,
    1.383577518672690e+2,
    -3.066479806614716e+1,
    2.506628277459239,
]
const b = [
    -5.447609879822406e+1,
    1.615858368580409e+2,
    -1.556989798598866e+2,
    6.680131188771972e+1,
    -1.328068155288572e+1,
]
const c = [
    -7.784894002430293e-3,
    -3.223964580411365e-1,
    -2.400758277161838,
    -2.549732539343734,
    4.374664141464968,
    2.938163982698783,
]
const d = [
    7.784695709041462e-3,
    3.224671290700398e-1,
    2.445134137142996,
    3.754408661907416,
]

const P_LOW = 0.02425
const P_HIGH = 1 - P_LOW


export function inverseNormal(p: number)
{
    if (p <= 0 || p >= 1)
    {
        throw new Error('Invalid parameters for inverse cumulative function of normal distribution')
    }

    let q = Math.sqrt(-2*Math.log(1-p))

    if (p < P_LOW)
    {
        q = Math.sqrt(-2 * Math.log(p))
        return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    }

    if (p <= P_HIGH)
    {
        q = p - 0.5
        const r = q * q
        return (((((a[0] * r + a[1]) * r +a[2]) * r + a[3]) * r + a[4]) * r +a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    }

    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q +1)

}