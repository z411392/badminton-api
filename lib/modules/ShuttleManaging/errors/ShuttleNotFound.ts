export class ShuttleNotFound extends Error {
    constructor({ shuttleId }: { shuttleId: string }) {
        super(
            JSON.stringify({
                type: `ShuttleNotFound`,
                payload: {
                    shuttleId,
                },
            }),
        )
    }
}
