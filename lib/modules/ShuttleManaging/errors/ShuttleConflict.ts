export class ShuttleConflict extends Error {
    constructor({ brand, name }: { brand: string; name: string }) {
        super(
            JSON.stringify({
                type: `ShuttleConflict`,
                payload: {
                    name,
                    brand,
                },
            }),
        )
    }
}
