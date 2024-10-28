export class VenueConflict extends Error {
    constructor({ name }: { name: string }) {
        super(
            JSON.stringify({
                type: `VenueConflict`,
                payload: {
                    name,
                },
            }),
        )
    }
}
