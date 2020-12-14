export function density(params: NormalDistribution) {
    return (x: number) => 1 / ( Math.sqrt(2*params.v*Math.PI) * Math.exp((x-params.m)**2 / (2*params.v)) )
}