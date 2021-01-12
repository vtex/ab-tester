import readBody from './readRequestBody'
import { checkForExpectedFields } from './Checks'

export default async (ctx: Context) => {   
    const bodyContent = await readBody(ctx)
    checkForExpectedFields(bodyContent)
    const { InitializingWorkspaces, Proportion, Type, Approach, IsMAB } = bodyContent
    const Hours = bodyContent["Hours"] ? bodyContent["Hours"] : "1" 

    return { InitializingWorkspaces, Hours, Proportion, Type, Approach, IsMAB }
}