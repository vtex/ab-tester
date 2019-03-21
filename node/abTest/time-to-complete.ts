import { GetWorkspaceData, StoreDashRequestURL } from '../clients/storedash'
import { BoundError, NumberOfSamples } from '../../mathTools/statistics/samples-restrictions'

export async function TimeToCompleteAbTest(account: string, probability: number, ctx: ColossusContext): Promise<number> {
    const workspaceData = await GetWorkspaceData(StoreDashRequestURL(account, 'now-7d'), 'master', ctx)
    const totalSessions = workspaceData.Sessions / 7
    let timeToComplete = NumberOfSamples(BoundError, probability) / totalSessions
    timeToComplete = Math.floor(timeToComplete) + 1

    return timeToComplete
}