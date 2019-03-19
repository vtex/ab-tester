import axios from 'axios'

const baseURL = 'http://api.vtex.com/api/storedash/'
const metricsStoredashPath = '/metrics/storedash/sessioncube'

export async function getDataFromStoreDash(endPoint: string, ctx: ColossusContext): Promise<JSON[]> {
    return new Promise<JSON[]>((resolve, _reject) => {
        axios.get(endPoint,
            {
                headers: {
                    'Proxy-Authorization': ctx.vtex.authToken,
                    'VtexIdclientAutCookie': ctx.vtex.authToken
                }
            })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                console.log(error)
            })
    })
}

export const AggregationQuery = (from: string): string => (
    '?from=' + from + '&to=now&operation=sum&fields=count&aggregateBy=workspace,data.orderPlaced')

export const StoreDashRequestURL = (account: string, ABTestBeginning: string): string => (
    baseURL + account + metricsStoredashPath + AggregationQuery(ABTestBeginning))