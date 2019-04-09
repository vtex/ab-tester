import axios from 'axios'
import { LoggerClient as Logger } from './logger'

const baseURL = 'http://ab-tester.vtex.aws-us-east-2.vtex.io/'
const abTesterPath = '/_v/private/abtesting/status?__v=0.3.0'

export async function callABTestStatus(endPoint: string, ctx: ColossusContext): Promise<JSON[]> {
    return new Promise<JSON[]>((resolve, _reject) => {
        axios.get(endPoint,
            {
                headers: {
                    'Proxy-Authorization': ctx.vtex.authToken,
                    'VtexIdclientAutCookie': ctx.vtex.authToken,
                },
            })
            .then(response => {
                resolve(response.data)
            })
            .catch(err => {
                const logger = new Logger(ctx, {})
                logger.sendLog(err, { status: ctx.status, message: err.message })
            })
    })
}

export const ABTesterRequestURL = (account: string, workspace: string): string => (
    baseURL + account + '/' + workspace + abTesterPath)