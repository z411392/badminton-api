export class GroupCreatingInProgress extends Error {
    constructor({ userId }: { userId: string }) {
        super(
            JSON.stringify({
                type: `GroupCreatingInProgress`,
                payload: {
                    userId,
                },
            }),
        )
    }
}
