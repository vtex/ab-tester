export function convertIntoNormal(params: BayesianRevenueParams) {
    return {
        m: params.r * params.a/(params.a+params.b),
        v: params.r**2 * params.a*params.b / ( (params.a+params.b)**2 * (params.a+params.b+1) )
    }
}