import readBody from './readRequestBody'
import { checkForExpectedFields } from './Checks'

export default async (ctx: Context) => {   
    const bodyContent = await readBody(ctx)
    checkForExpectedFields(bodyContent)
    const { InitializingWorkspaces, Hours, Proportion, Type, Approach, IsMAB } = bodyContent  

    return { InitializingWorkspaces, Hours, Proportion, Type, Approach, IsMAB }
}