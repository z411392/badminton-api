export class HasJoinedGroup extends Error {
    constructor({ userId, groupId }: { userId: string; groupId: string }) {
        super(
            JSON.stringify({
                type: `HasJoinedGroup`,
                payload: {
                    userId,
                    groupId,
                },
            }),
        )
    }
}
