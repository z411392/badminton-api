export class JoinRequestAlreadySubmitted extends Error {
    constructor({ userId, groupId }: { userId: string; groupId: string }) {
        super(
            JSON.stringify({
                type: `JoinRequestAlreadySubmitted`,
                payload: {
                    userId,
                    groupId,
                },
            }),
        )
    }
}
