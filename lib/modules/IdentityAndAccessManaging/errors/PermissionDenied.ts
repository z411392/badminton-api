export class PermissionDenied extends Error {
    constructor({}: {} = {}) {
        super(
            JSON.stringify({
                type: `PermissionDenied`,
                payload: {},
            }),
        )
    }
}
