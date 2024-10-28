export class UnableToMarkAsPaid extends Error {
    constructor({ userId, meetupId, timeslotId }: { userId: string; meetupId: string; timeslotId: string }) {
        super(
            JSON.stringify({
                type: `UnableToMarkAsPaid`,
                payload: {
                    userId,
                    meetupId,
                    timeslotId,
                },
            }),
        )
    }
}
