export class PlaylistNotFound extends Error {
    constructor({ playlistId }: { playlistId: string }) {
        super(
            JSON.stringify({
                type: `PlaylistNotFound`,
                payload: {
                    playlistId,
                },
            }),
        )
    }
}
