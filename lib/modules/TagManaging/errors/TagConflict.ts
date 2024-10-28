export class TagConflict extends Error {
    constructor({ groupId, name }: { groupId: string; name: string }) {
        super(
            JSON.stringify({
                type: `TagConflict`,
                payload: {
                    groupId,
                    name,
                },
            }),
        )
    }
}
