import cron from "node-cron"
import { Settings } from "luxon"

export type Task = (timestamp: number) => any | Promise<any>
export type Scheduler = { cronExpression: string; task: Task; runOnInit?: boolean }
export const createScheduler = (cronExpression: string, task: Task, runOnInit: boolean = false) => {
    const timezone = Settings.defaultZone.name
    const scheduler = cron.schedule(
        cronExpression,
        (now: Date | "manual" | "init") => {
            const timestamp = now instanceof Date ? now.valueOf() : Date.now()
            return task(timestamp)
        },
        { timezone, runOnInit },
    )
    process.on("exit", () => scheduler.stop())
    return scheduler
}
