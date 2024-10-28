export class SignedUpAlready extends Error {
    constructor({ userId, meetupId, timeslotId }: { userId: string; meetupId: string; timeslotId: string }) {
        super(
            JSON.stringify({
                type: `SignedUpAlready`,
                payload: {
                    userId,
                    meetupId,
                    timeslotId,
                },
            }),
        )
    }
}
