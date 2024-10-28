import { isTokenValid } from "@/utils/messaging"
import { getMessaging } from "firebase-admin/messaging"

describe.skip(`跟 FCM 相關的整合測試`, () => {
    test(`要能夠測試訊息是否可發送`, async () => {
        const token = process.env.FCM_TOKEN!
        await expect(isTokenValid(token)).resolves.not.toThrow()
    })
    test(`要能夠發送訊息`, async () => {
        const messaging = getMessaging()
        const token = process.env.FCM_TOKEN!
        const link = `http://localhost:3000/groups/74da881a-6df5-5c84-bef5-9abf1cf4f0f6/meetups/3c86cc6e-a381-5db9-97da-5e87bc82c32d?customToken=${process.env.CUSTOM_TOKEN!}`
        await messaging.send({
            token,
            notification: {
                title: "hello",
                body: "hello",
            },
            webpush: {
                fcmOptions: {
                    link,
                },
            },
        })
    })
})
