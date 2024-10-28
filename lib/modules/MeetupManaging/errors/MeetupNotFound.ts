export class MeetupNotFound extends Error {
    constructor({ meetupId }: { meetupId: string }) {
        super(
            JSON.stringify({
                type: `MeetupNotFound`,
                payload: {
                    meetupId,
                },
            }),
        )
    }
}
