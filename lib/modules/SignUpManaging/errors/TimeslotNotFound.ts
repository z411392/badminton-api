export class TimeslotNotFound extends Error {
    constructor({ timeslotId }: { timeslotId: string }) {
        super(
            JSON.stringify({
                type: `TimeslotNotFound`,
                payload: {
                    timeslotId,
                },
            }),
        )
    }
}
