import { type Scheduler } from "@/utils/cron"
import { onRefreshingSpotifyAccessToken } from "@/modules/SystemMaintaining/presentation/controllers/onRefreshingSpotifyAccessToken"

export const schedulers: Scheduler[] = [
    {
        cronExpression: "* */30 * * * *",
        task: onRefreshingSpotifyAccessToken,
        runOnInit: true,
    },
]
