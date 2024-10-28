import { LINEMessagingService } from "@/adapters/http/LINEMessagingService"

describe(`跟 LINE Messaging 相關的整合測試`, () => {
    test.skip(`要能夠發送訊息`, async () => {
        const lineMessagingService = new LINEMessagingService({ accessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN! })
        await expect(
            lineMessagingService.pushMessage("hello", "Udaf9f248b0de5e9354197da08a293541"),
        ).resolves.not.toThrow()
    })
})
