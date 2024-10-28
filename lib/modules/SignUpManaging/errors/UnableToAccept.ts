export class UnableToAccept extends Error {
    constructor({ userId, meetupId, timeslotId }: { userId: string; meetupId: string; timeslotId: string }) {
        super(
            JSON.stringify({
                type: `UnableToAccept`,
                payload: {
                    userId,
                    meetupId,
                    timeslotId,
                },
            }),
        )
    }
}
