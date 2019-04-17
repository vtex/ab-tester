import { IOContext } from '@vtex/api'
import { totalSessions } from '../utils/totalSessions'
import { AverageDaySessions } from './timeToComplete'

const TIME_STEP_FACTOR = (1 / 24)

const IsInitialConstraint = (sessions: number, dailySessions: number): boolean => (
    sessions < (168 * TIME_STEP_FACTOR * dailySessions)
)

export async function IsInitialStage(account: string, workspacesData: WorkspaceData[], ctx: IOContext) {
    const dailySessions = await AverageDaySessions(account, ctx)
    return IsInitialConstraint(totalSessions(workspacesData), dailySessions)
}