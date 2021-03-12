import { inverseNormal } from './normal'

const HALF_PI = Math.PI * 0.5

// In the following, n represents degrees of freedom and P is the level of
// the quantile
export function inverseTStudent(n: number, P: number)
{
    if (n < 1 || P > 1 || P <= 0)
    {
        throw new Error('Invalid parameters for inverse cumulative function of t-student distribution')
    }

    if (n === 1)
    {
        const h = P * HALF_PI
        return (Math.cos(h))/(Math.sin(h))
    }

    if (n === 2)
    {
        return Math.sqrt(2.0/(P * (2.0-P))-2.0)
    }

    const a = 1.0/(n-0.5)
    const b = Math.pow(48.0/a, 2)
    let c = ((20700 * a / b - 98 ) * a - 16) * a + 96.36
    const d = ((94.5/(b+c)-3.0)/b + 1.0) * Math.sqrt(a * HALF_PI) * n

    let x = P * d
    let y = Math.pow(x, 2.0/n)

    if (y > 0.05 + a)
    {
        x = inverseNormal(P * 0.5)
        y = x * x

        if (n < 5)
        {
            c = c + 0.3 * (n - 4.5) * (x + 0.6)
        }

        c =  (((0.05 * d * x - 5.0) * x - 7.0) * x - 2.0) * x + b + c
        y = (((((0.4 * y + 6.3) * y + 36.0) * y + 94.5) / c - y - 3.0) / b + 1.0) * x
        y = a * y * y

        y = y > 0.002 ? Math.exp(y) - 1 : 0.5 * y * y + y
    }
    else
    {
        y =  ((1.0/(((n+6.0)/(n * y)-0.089 * d - 0.822) * (n + 2.0) * 3.0)+0.5/(n + 4.0)) * y - 1.0) * (n+1.0)/(n+2.0) + 1.0/y
    }

    return Math.sqrt(n * y)
}