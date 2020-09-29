const expectedFields = ['InitializingWorkspace', 'Hours', 'Proportion']

export const checkForExpectedFields = (object: object) => {
    for (let idx = 0; idx < expectedFields.length; idx++) {
        const field = expectedFields[idx]
        if (!(field in object)) {
            throw new Error(`Error getting request's parameters: make sure to set the ${field} field`)
        }
    }
}

export const checkTestType = (Type: string) => {
    if (Type !== 'conversion' && Type !== 'revenue') {
        throw new Error(`Error setting test type: please make sure to spell it correctly (either 'conversion' or 'revenue')`)
    }
}