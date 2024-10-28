export class UnableToCancel extends Error {
    constructor({ userId, meetupId, timeslotId }: { userId: string; meetupId: string; timeslotId: string }) {
        super(
            JSON.stringify({
                type: `UnableToCancel`,
                payload: {
                    userId,
                    meetupId,
                    timeslotId,
                },
            }),
        )
    }
}
