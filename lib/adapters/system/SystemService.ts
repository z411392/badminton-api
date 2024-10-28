import { exec } from "child_process"
import { OperationSystems } from "@/modules/SystemMaintaining/dtos/OperatingSystems"

export class SystemService {
    protected runShellCommand(command: string) {
        return new Promise<string>((resolve, reject) => {
            exec(command, (thrown, stdout, stderr) => {
                if (thrown) return reject(thrown)
                if (stderr) return reject(new Error(stderr))
                return resolve(stdout.trim())
            })
        })
    }
    async getOperatingSystem() {
        const uname = await this.runShellCommand("uname -s")
        if (uname.indexOf("Darwin") > -1) return OperationSystems.MacOS
        if (uname.indexOf("Linux") > -1) return OperationSystems.Linux
        if (uname.indexOf("MINGW32_NT") > -1) return OperationSystems.Windows32
        if (uname.indexOf("MINGW64_NT") > -1) return OperationSystems.Windows64
        return undefined
    }
    async getProductUUID(operatingSystem?: OperationSystems) {
        if (operatingSystem === OperationSystems.MacOS)
            return await this.runShellCommand(
                `ioreg -d2 -c IOPlatformExpertDevice | awk -F\\" '/IOPlatformUUID/{print $(NF-1)}'`,
            )
        if (operatingSystem === OperationSystems.Linux)
            return await this.runShellCommand(`cat /sys/class/dmi/id/product_uuid`)
        if (operatingSystem === OperationSystems.Windows32 || operatingSystem == OperationSystems.Windows64)
            return await this.runShellCommand(`wmic csproduct get UUID`)
        return undefined
    }
    async getMacAddress(operatingSystem?: OperationSystems) {
        if (operatingSystem === OperationSystems.MacOS)
            return await this.runShellCommand(`ifconfig en1 | awk '/ether/{print $2}'`)
        if (operatingSystem === OperationSystems.Linux)
            return await this.runShellCommand(`ip addr | grep link/ether | awk -F " " '{print $2}'|head -n 1`)
        return undefined
    }
}
