export class MustBeImage extends Error {
    constructor({ expected, actual }: { expected: string[]; actual: string }) {
        super(
            JSON.stringify({
                type: `MustBeImage`,
                payload: {
                    expected,
                    actual,
                },
            }),
        )
    }
}
