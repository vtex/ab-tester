import readBody from './readRequestBody'
import { checkForExpectedFields } from './Checks'

export default async (ctx: Context) => {   
    const bodyContent = await readBody(ctx)
    checkForExpectedFields(bodyContent)
    const { InitializingWorkspace, Hours, Proportion, Type } = bodyContent  

    return { InitializingWorkspace, Hours, Proportion, Type }
}