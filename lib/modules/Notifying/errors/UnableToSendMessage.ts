export class UnableToSendMessage extends Error {
    constructor({ reason }: { reason: string }) {
        super(
            JSON.stringify({
                type: `UnableToSendMessage`,
                payload: {
                    reason,
                },
            }),
        )
    }
}
