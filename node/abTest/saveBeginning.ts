const bucket = 'ABTest'
const fileName = 'currentABTest.json'

// TODO: `testId` should be determined in a general way based on account and workspaces
const testId = '0001'

export async function initializeABtest(probability: number, ctx: ColossusContext): Promise<void> {
    const { resources: { vbase } } = ctx
    const beginning = new Date().toISOString().substr(0, 16)
    console.log('Id: '+ testId + 'dateOfBeginning: ' + beginning + 'probability: ' + probability)
    return vbase.save(bucket, fileName, {
        Id: testId,
        dateOfBeginning: beginning,
        probability: (probability),
    } as ABTestData)
}