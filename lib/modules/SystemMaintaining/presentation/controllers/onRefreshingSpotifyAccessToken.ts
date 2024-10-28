import { RefreshSpotifyAccessToken } from "@/modules/SystemMaintaining/application/mutations/RefreshSpotifyAccessToken"

export const onRefreshingSpotifyAccessToken = async (timestamp: number) => {
    const refreshAccessToken = new RefreshSpotifyAccessToken({
        refreshToken: process.env.SPOTIFY_REFRESH_TOKEN!,
        clientId: process.env.SPOTIFY_CLIENT_ID!,
        secret: process.env.SPOTIFY_CLIENT_SECRET!,
    })
    await refreshAccessToken(timestamp)
}
