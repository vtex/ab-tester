export default (ctx: Context) => {
    const bodyMessage = ctx.body ? ctx.body : parseBody(ctx)
    return bodyMessage
}

const parseBody = async <BodyType>(ctx: Context): Promise<BodyType> => {
    const req = ctx.req
    return new Promise((resolve, reject) => {
        let body = ''
        req.on('data', chunk => {
            body += chunk.toString()
        })
        req.on('end', () => {
            ctx.body = JSON.parse(body)
            resolve(ctx.body)
        })
        req.on('error', err => {
            err.message = concatErrorMessages(`Error reading request's body`, err.message)
            reject(err)
        })
    })
} 

const concatErrorMessages = (newMessage: string, previousMessage: string | undefined): string => {
    const message = previousMessage
        ? newMessage + ': ' + previousMessage
        : newMessage
    return message
}