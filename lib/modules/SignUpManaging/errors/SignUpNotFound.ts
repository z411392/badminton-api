export class SignUpNotFound extends Error {
    constructor({ signUpId }: { signUpId: string }) {
        super(
            JSON.stringify({
                type: `SignUpNotFound`,
                payload: {
                    signUpId,
                },
            }),
        )
    }
}
