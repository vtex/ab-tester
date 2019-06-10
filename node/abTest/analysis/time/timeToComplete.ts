import Storedash from '../../../clients/storedash'
import { BoundError, NumberOfSamples } from '../../../utils/mathTools/statistics/samplesRestrictions'

export async function TimeToCompleteAbTest(probability: number, storedash: Storedash): Promise<number> {
    const averageSessions = await AverageDaySessions(storedash)
    let timeToComplete = NumberOfSamples(BoundError, probability) / averageSessions
    timeToComplete = Math.floor(timeToComplete) + 1
    return timeToComplete
}

export async function AverageDaySessions(storedash: Storedash): Promise<number> {
    const workspacesData = await storedash.getWorkspacesData('now-7d')
    let totalSessions = 0
    for (const workspaceData of workspacesData) {
        totalSessions += workspaceData.Sessions / 7
    }
    return totalSessions
}