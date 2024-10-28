export class ProfileNotFound extends Error {
    constructor({ profileId }: { profileId: string }) {
        super(
            JSON.stringify({
                type: `ProfileNotFound`,
                payload: {
                    profileId,
                },
            }),
        )
    }
}
