import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import axios from "axios"
import { CacheKeys } from "@/constants"
import cache from "memory-cache"

export class RefreshSpotifyAccessToken extends CallableInstance<[number], Promise<void>> {
    protected logger: ConsolaInstance
    protected refreshToken: string
    protected clientId: string
    protected secret: string

    constructor({ refreshToken, clientId, secret }: { refreshToken: string; clientId: string; secret: string }) {
        super("execute")
        this.logger = createConsola().withTag(`RefreshAccessToken`)
        this.refreshToken = refreshToken
        this.clientId = clientId
        this.secret = secret
    }
    async execute(timestamp: number) {
        const basicAuth = Buffer.from(`${this.clientId}:${this.secret}`).toString("base64")
        const {
            data: { access_token: accessToken, expires_in: expiresIn },
        } = await axios.post<{
            access_token: string
            expires_in: number
        }>(
            `https://accounts.spotify.com/api/token`,
            new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: this.refreshToken,
            }),
            {
                headers: {
                    authorization: `Basic ${basicAuth}`,
                },
            },
        )
        cache.put(CacheKeys.SpotifyAccessToken, accessToken, expiresIn * 1000)
    }
}
