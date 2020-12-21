import { Evaluate as evaluateBayesianConversion, Winner as winnerBayesianConversion } from './bayesianConversion'
import { Evaluate as evaluateBayesianRevenue, Winner as winnerBayesianRevenue } from './bayesianRevenue'
import { Evaluate as evaluateFrequentistConversion, Winner as winnerFrequentistConversion } from './frequentistConversion'
import { Evaluate as evaluateFrequentistRevenue, Winner as winnerFrequentistRevenue } from './frequentistRevenue'

export function Evaluate(testType: TestType, testApproach: TestApproach, abTestBeginning: string, workspaceA: WorkspaceCompleteData, workspaceB: WorkspaceCompleteData): EvaluationResult {
    return evaluateFunctions[testApproach][testType](abTestBeginning, workspaceA, workspaceB)
}

export function WinnerOverAll(testType: TestType, testApproach: TestApproach, testResult: TestResult): WinnerOverAll {
    return { Winner: winnerFunctions[testApproach][testType](testResult) }
}

const evaluateFunctions = {
    "bayesian": {
        "conversion": evaluateBayesianConversion,
        "revenue": evaluateBayesianRevenue
    },
    "frequentist": {
        "conversion": evaluateFrequentistConversion,
        "revenue": evaluateFrequentistRevenue
    }
}

const winnerFunctions = {
    "bayesian": {
        "conversion": winnerBayesianConversion,
        "revenue": winnerBayesianRevenue
    },
    "frequentist": {
        "conversion": winnerFrequentistConversion,
        "revenue": winnerFrequentistRevenue
    }
}