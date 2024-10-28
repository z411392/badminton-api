export class PlaylistNotSpecified extends Error {
    constructor({ meetupId }: { meetupId: string }) {
        super(
            JSON.stringify({
                type: `PlaylistNotSpecified`,
                payload: {
                    meetupId,
                },
            }),
        )
    }
}
