export class TokenInvalid extends Error {
    constructor({ token }: { token: string }) {
        super(
            JSON.stringify({
                type: `TokenInvalid`,
                payload: {
                    token,
                },
            }),
        )
    }
}
