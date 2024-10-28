import { default as axiosFactory, type AxiosInstance, AxiosError, type AxiosResponse } from "axios"

export class LINEMessagingService {
    protected axios: AxiosInstance
    constructor({ accessToken }: { accessToken: string }) {
        this.axios = axiosFactory.create({
            baseURL: "https://api.line.me/v2",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        })
    }
    async pushMessage(text: string, to: string) {
        const uri = `/bot/message/push`
        await new Promise<void>((resolve) => process.nextTick(resolve))
        const maxLength = 5000
        const messages: Array<{ type: "text"; text: string }> = []
        for (let index = 0; index < text.length; index += maxLength)
            messages.push({
                type: "text",
                text: text.slice(index, index + maxLength),
            })

        try {
            await this.axios.post(uri, { to, messages })
        } catch (error) {
            if (!(error instanceof Error)) throw new Error(String(error))
            if (!(error instanceof AxiosError)) throw error
            const {
                data: { message },
            } = error.response as AxiosResponse<{ message?: string }>
            throw new Error(message ? message : error.message)
        }
    }
}
