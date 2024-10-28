import { type Request, type Response } from "express"
import { withCredentials } from "@/utils/sessions"
import { SystemService } from "@/adapters/system/SystemService"
import { Version } from "@/constants"
import { type SystemInfo } from "@/modules/SystemMaintaining/dtos/SystemInfo"

export const onRetrievingSystemInfo = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = withCredentials(response)
        const systemService = new SystemService()
        const os = await systemService.getOperatingSystem()
        const [uuid, mac, exp] = await Promise.all([
            process.env.PROJECT_UUID ? Promise.resolve(process.env.PROJECT_UUID) : systemService.getProductUUID(os),
            systemService.getMacAddress(os),
            Promise.resolve(credentials ? credentials.exp : undefined),
        ])
        const systemInfo: SystemInfo = {
            version: Version,
            uuid: uuid!,
            mac,
            exp,
        }
        const payload = { systemInfo }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
