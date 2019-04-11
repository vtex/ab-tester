import { IOContext } from '@vtex/api'
import { AverageDaySessions } from './time-to-complete'

const TIME_STEP_FACTOR = (1 / 24)

const IsInitialConstraint = (sessions: number, dailySessions: number): boolean => (
    sessions < (TIME_STEP_FACTOR * dailySessions)
)

export async function IsInitialStage(account: string, workspaceData: WorkspaceData, ctx: IOContext) {
    const dailySessions = await AverageDaySessions(account, ctx)
    return IsInitialConstraint(workspaceData.Sessions, dailySessions)
}