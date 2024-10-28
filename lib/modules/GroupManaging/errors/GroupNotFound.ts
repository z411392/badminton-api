export class GroupNotFound extends Error {
    constructor({ groupId }: { groupId: string }) {
        super(
            JSON.stringify({
                type: `GroupNotFound`,
                payload: {
                    groupId,
                },
            }),
        )
    }
}
