export function convertIntoNormal(params: BayesianRevenueParams) {
    return {
        m: params.r * params.a/(params.a+params.b),
        v: params.r**2 * params.a*params.b / ( (params.a+params.b)**2 * (params.a+params.b+1) )
    }
}

export function differenceDistribution(A: NormalDistribution, B: NormalDistribution) {
    return {
        m: A.m - B.m,
        v: A.v + B.v
    }
}