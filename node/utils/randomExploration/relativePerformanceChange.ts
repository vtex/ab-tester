import { RandomBeta } from '../mathTools/forBetaDistribution/statistics/betaSampling'
import { normalQuantile } from '../mathTools/forNormalDistribution/quantile'
import { WorkspaceToBetaDistribution, RevenuePerConversion, ConversionToNormalDistribution, RevenueToNormalDistribution } from '../workspace'

export function relativeChange(approach: TestApproach, type: TestType, workspaceData: WorkspaceCompleteData): number {
    return relativeChangeFunctions[approach][type](workspaceData)
}

const relativeChangeFunctions = {
    "bayesian": {
        "conversion": relativeChangeBayesianConversion,
        "revenue": relativeChangeBayesianRevenue
    },
    "frequentist": {
        "conversion": relativeChangeFrequentistConversion,
        "revenue": relativeChangeFrequentistRevenue
    }
}

function relativeChangeBayesianConversion(workspaceData: WorkspaceCompleteData): number {
    const betaVariateOld = RandomBeta(WorkspaceToBetaDistribution(workspaceData.SinceBeginning))
    const betaVariateRecent = RandomBeta(WorkspaceToBetaDistribution(workspaceData.Last24Hours))

    return betaVariateRecent /  betaVariateOld
}

function relativeChangeBayesianRevenue(workspaceData: WorkspaceCompleteData): number {
    const betaVariateOld = RandomBeta(WorkspaceToBetaDistribution(workspaceData.SinceBeginning))
    const betaVariateRecent = RandomBeta(WorkspaceToBetaDistribution(workspaceData.Last24Hours))

    const averageRevenueOld = RevenuePerConversion(workspaceData.SinceBeginning)
    const averageRevenueRecent = RevenuePerConversion(workspaceData.Last24Hours)

    return (averageRevenueRecent*betaVariateRecent) / (averageRevenueOld*betaVariateOld)
}

function relativeChangeFrequentistConversion(workspaceData: WorkspaceCompleteData): number {
    const normalVariateOld = normalQuantile(ConversionToNormalDistribution(workspaceData.SinceBeginning), Math.random())
    const normalVariateRecent = normalQuantile(ConversionToNormalDistribution(workspaceData.Last24Hours), Math.random())

    return normalVariateRecent / normalVariateOld
}

function relativeChangeFrequentistRevenue(workspaceData: WorkspaceCompleteData): number {
    const normalVariateOld = normalQuantile(RevenueToNormalDistribution(workspaceData.SinceBeginning), Math.random())
    const normalVariateRecent = normalQuantile(RevenueToNormalDistribution(workspaceData.Last24Hours), Math.random())

    return normalVariateRecent / normalVariateOld
}