import { AverageDaySessions } from './time-to-complete'

const TIME_STEP_FACTOR = (2 / 3) * (1 / 24)

export const WorkspaceToBetaDistribution = (sessions: number, dailySessions: number): boolean => (
    sessions < (TIME_STEP_FACTOR * 6 * dailySessions)
)

export async function InitialStageProbability(account: string, sessions: number, ctx: ColossusContext): Promise<number> {
    const timeStep = await TimeStep(account, sessions, ctx)
    if(timeStep === 1) {
        return 10000
    }
    if(timeStep === 2) {
        return 3
    }
    if(timeStep === 3) {
        return 2
    }
}

export async function TimeStep(account: string, sessions: number, ctx: ColossusContext): Promise<number> {
    const dailySessions = await AverageDaySessions(account, ctx)
    const sessionsTimeStep = TIME_STEP_FACTOR * dailySessions
    const time = Math.cbrt(sessions / sessionsTimeStep)
    return Math.floor(time) + 1
}