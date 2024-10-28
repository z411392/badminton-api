export class UnableToMarkAsRefunded extends Error {
    constructor({ userId, meetupId, timeslotId }: { userId: string; meetupId: string; timeslotId: string }) {
        super(
            JSON.stringify({
                type: `UnableToMarkAsRefunded`,
                payload: {
                    userId,
                    meetupId,
                    timeslotId,
                },
            }),
        )
    }
}
