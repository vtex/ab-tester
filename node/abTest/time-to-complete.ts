import { BoundError, NumberOfSamples } from '../../mathTools/statistics/samplesRestrictions'
import { GetWorkspacesData, StoreDashRequestURL } from '../clients/storedash'

export async function TimeToCompleteAbTest(account: string, probability: number, ctx: ColossusContext): Promise<number> {
    const averageSessions = await AverageDaySessions(account, ctx)
    let timeToComplete = NumberOfSamples(BoundError, probability) / averageSessions
    timeToComplete = Math.floor(timeToComplete) + 1

    return timeToComplete
}

export async function AverageDaySessions(account: string, ctx: ColossusContext): Promise<number> {
    const workspacesData = await GetWorkspacesData(StoreDashRequestURL(account, 'now-7d'), ctx)
    let totalSessions = 0
    for (const workspaceData of workspacesData) {
        totalSessions += workspaceData.Sessions / 7
    }
    return totalSessions
}