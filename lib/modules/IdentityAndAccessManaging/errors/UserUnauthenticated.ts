export class UserUnauthenticated extends Error {
    constructor({}: {} = {}) {
        super(
            JSON.stringify({
                type: `UserUnauthenticated`,
                payload: {},
            }),
        )
    }
}
