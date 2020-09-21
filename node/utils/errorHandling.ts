export const concatErrorMessages = (newMessage: string, previousMessage: string | undefined): string => {
    const message = previousMessage
        ? newMessage + ': ' + previousMessage
        : newMessage
    return message
}