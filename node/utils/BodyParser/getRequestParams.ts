import readBody from './readRequestBody'

const expectedFields = ['InitializingWorkspace', 'Hours', 'Proportion']

export default async (ctx: Context) => {   
    const bodyContent = await readBody(ctx)
    checkForExpectedFields(bodyContent)
    const { InitializingWorkspace, Hours, Proportion, Type } = bodyContent  

    return { InitializingWorkspace, Hours, Proportion, Type }
}

const checkForExpectedFields = (object: object) => {
    for (let idx = 0; idx < expectedFields.length; idx++) {
        const field = expectedFields[idx]
        if (!(field in object)) {
            throw new Error(`Error getting request's parameters: make sure to set the ${field} field`)
        }
    }
}