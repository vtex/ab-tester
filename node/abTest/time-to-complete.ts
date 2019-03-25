import { GetWorkspacesData, StoreDashRequestURL } from '../clients/storedash'
import { BoundError, NumberOfSamples } from '../../mathTools/statistics/samples-restrictions'

export async function TimeToCompleteAbTest(account: string, probability: number, ctx: ColossusContext): Promise<number> {
    const workspacesData = await GetWorkspacesData(StoreDashRequestURL(account, 'now-7d'), ctx)
    let totalSessions = 0
    for (var workspaceData of workspacesData) {
        totalSessions += workspaceData.Sessions / 7
    }
    let timeToComplete = NumberOfSamples(BoundError, probability) / totalSessions
    timeToComplete = Math.floor(timeToComplete) + 1

    return timeToComplete
}