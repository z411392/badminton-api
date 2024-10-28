export class TagNotFound extends Error {
    constructor({ groupId, tagId }: { groupId: string; tagId: string }) {
        super(
            JSON.stringify({
                type: `TagNotFound`,
                payload: {
                    groupId,
                    tagId,
                },
            }),
        )
    }
}
