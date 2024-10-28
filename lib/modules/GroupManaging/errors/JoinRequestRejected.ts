export class JoinRequestRejected extends Error {
    constructor({ userId, groupId }: { userId: string; groupId: string }) {
        super(
            JSON.stringify({
                type: `JoinRequestRejected`,
                payload: {
                    userId,
                    groupId,
                },
            }),
        )
    }
}
