export class UserNotFound extends Error {
    constructor({ userId }: { userId: string }) {
        super(
            JSON.stringify({
                type: `UserNotFound`,
                payload: {
                    userId,
                },
            }),
        )
    }
}
