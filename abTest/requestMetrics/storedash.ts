import axios from 'axios'

const baseURL = 'http://api.vtex.com/api/storedash/'
const metricsStoredashURL = '/metrics/storedash/SessionCube?from='
const aggregationURL = '&to=now&operation=sum&aggregateBy=workspace,data.orders'

export async function getDataFromStoreDash(endPoint, ctx: ColossusContext): Promise<JSON[]> {
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

export const StoreDashRequestURL = (account, ABTestBeginning): string => (
    baseURL + account + metricsStoredashURL + ABTestBeginning + aggregationURL)