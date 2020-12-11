import { RandomBeta } from '../mathTools/forBetaDistribution/statistics/betaSampling'
import { WorkspaceToBetaDistribution, RevenuePerConversion } from '../workspace'

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

function relativeChangeFrequentistConversion(_workspaceData: WorkspaceCompleteData): number {
    return 1    // Provisional, until we implement the respective analysis
}

function relativeChangeFrequentistRevenue(_workspaceData: WorkspaceCompleteData): number {
    return 1    // Provisional, until we implement the respective analysis
}