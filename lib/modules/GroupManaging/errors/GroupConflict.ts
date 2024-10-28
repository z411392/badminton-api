export class GroupConflict extends Error {
    constructor({ name }: { name: string }) {
        super(
            JSON.stringify({
                type: `GroupConflict`,
                payload: {
                    name,
                },
            }),
        )
    }
}
