export class VenueNotFound extends Error {
    constructor({ venueId }: { venueId: string }) {
        super(
            JSON.stringify({
                type: `VenueNotFound`,
                payload: {
                    venueId,
                },
            }),
        )
    }
}
