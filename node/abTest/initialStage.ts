import { AverageDaySessions } from './time-to-complete'

const TIME_STEP_FACTOR = (1 / 24)

const IsInitialConstraint = (sessions: number, dailySessions: number): boolean => (
    sessions < (TIME_STEP_FACTOR * 6 * dailySessions)
)

export async function IsInitialStage(account: string, workspaceData: WorkspaceData, ctx: ColossusContext) {
    const dailySessions = await AverageDaySessions(account, ctx)
    return IsInitialConstraint(workspaceData.Sessions, dailySessions)
}