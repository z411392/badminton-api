export class LevelNotFound extends Error {
    constructor({ levelId }: { levelId: string }) {
        super(
            JSON.stringify({
                type: `LevelNotFound`,
                payload: {
                    levelId,
                },
            }),
        )
    }
}
