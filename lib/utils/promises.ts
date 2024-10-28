export const withResolvers = <T = unknown>() => {
    let resolve: (resolved: T) => void
    let reject: (error: Error) => void
    const promise = new Promise<T>((_resolve, _reject) => {
        resolve = _resolve
        reject = _reject
    })
    return {
        promise,
        resolve: resolve!,
        reject: reject!,
    }
}
