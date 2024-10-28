import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore } from "firebase-admin/firestore"
import { UserDao } from "@/adapters/auth/UserDao"
import { type User } from "@/modules/IdentityAndAccessManaging/dtos/User"
import { UserNotFound } from "@/modules/IdentityAndAccessManaging/errors/UserNotFound"
import { GroupDao } from "@/adapters/firestore/GroupDao"
import { type Group } from "@/modules/GroupManaging/dtos/Group"
import { GroupNotFound } from "@/modules/GroupManaging/errors/GroupNotFound"
import { MeetupDao } from "@/adapters/firestore/MeetupDao"
import { type Meetup } from "@/modules/MeetupManaging/dtos/Meetup"
import { MeetupNotFound } from "@/modules/MeetupManaging/errors/MeetupNotFound"
import { type Timeslot } from "@/modules/MeetupManaging/dtos/Timeslot"
import { TimeslotNotFound } from "@/modules/SignUpManaging/errors/TimeslotNotFound"
import { LINEMessagingService } from "@/adapters/http/LINEMessagingService"
import { SignUpStatuses } from "@/modules/SignUpManaging/dtos/SignUpStatuses"
import { VenueDao } from "@/adapters/firestore/VenueDao"
import { type Venue } from "@/modules/VenueManaging/dtos/Venue"
import { VenueNotFound } from "@/modules/VenueManaging/errors/VenueNotFound"
import { PermissionDao } from "@/adapters/firestore/PermissionDao"
import { Providers } from "@/modules/IdentityAndAccessManaging/dtos/Providers"
import { createElapsedTimeProfiler } from "@/utils/development"
import PQueue from "p-queue"
import { TimeslotDao } from "@/adapters/firestore/TimeslotDao"

const queue = new PQueue({ concurrency: 8, interval: 1000, intervalCap: 1000 })

export type SendingLINEPushMessage = {
    timeslotId: string
    status: SignUpStatuses
}

export class SendLINEPushMessage extends CallableInstance<
    [string, string, string, SendingLINEPushMessage],
    Promise<any>
> {
    protected logger: ConsolaInstance
    protected userDao: UserDao
    protected groupDao: GroupDao
    protected meetupDao: MeetupDao
    protected venueDao: VenueDao
    protected permissionDao: PermissionDao
    protected lineMessagingService: LINEMessagingService
    protected timeslotDao: TimeslotDao

    constructor({ db }: { db: Firestore }) {
        super("execute")
        this.logger = createConsola().withTag(`SendLINEPushMessage`)
        this.userDao = new UserDao()
        this.groupDao = new GroupDao({ db })
        this.meetupDao = new MeetupDao({ db })
        this.venueDao = new VenueDao({ db })
        this.permissionDao = new PermissionDao({ db })
        this.lineMessagingService = new LINEMessagingService({ accessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN! })
        this.timeslotDao = new TimeslotDao({ db })
    }
    protected createNotifcationContent(
        user: User,
        group: Group,
        meetup: Meetup,
        venue: Venue,
        timeslot: Timeslot,
        status: SignUpStatuses,
    ) {
        if (status === SignUpStatuses.Pending)
            return [
                `親愛的 ${user.displayName}，您於 ${group.name} ${meetup.name} 的報名資料已送出，目前正在等待審核。`,
                ``,
                `本次預約資訊如下：`,
                `- 日期：${meetup.date}`,
                `- 地點：${venue.name}`,
                `- 時段：${timeslot.startTime} - ${timeslot.endTime}`,
            ].join("\n")
        if (status === SignUpStatuses.Cancelled)
            return [
                `親愛的 ${user.displayName}，您於 ${group.name} ${meetup.name} 的零打已經取消了。`,
                ``,
                `- 日期：${meetup.date}`,
                `- 地點：${venue.name}`,
                `- 時段：${timeslot.startTime} - ${timeslot.endTime}`,
            ].join("\n")
        if (status === SignUpStatuses.Accepted)
            return [
                `親愛的 ${user.displayName}，您於 ${group.name} ${meetup.name} 的零打已被錄取。`,
                ``,
                `- 日期：${meetup.date}`,
                `- 地點：${venue.name}`,
                `- 時段：${timeslot.startTime} - ${timeslot.endTime}`,
            ].join("\n")
        if (status === SignUpStatuses.Revoked)
            return [
                `親愛的 ${user.displayName}，您於 ${group.name} ${meetup.name} 的零打已被取消。`,
                ``,
                `- 日期：${meetup.date}`,
                `- 地點：${venue.name}`,
                `- 時段：${timeslot.startTime} - ${timeslot.endTime}`,
            ].join("\n")
        if (status === SignUpStatuses.Paid)
            return [
                `親愛的 ${user.displayName}，您於 ${group.name} ${meetup.name} 的零打已被被註記為已繳費。`,
                ``,
                `- 日期：${meetup.date}`,
                `- 地點：${venue.name}`,
                `- 時段：${timeslot.startTime} - ${timeslot.endTime}`,
            ].join("\n")
        if (status === SignUpStatuses.Refunded)
            return [
                `親愛的 ${user.displayName}，您於 ${group.name} ${meetup.name} 的零打被註記為已退費。`,
                ``,
                `- 日期：${meetup.date}`,
                `- 地點：${venue.name}`,
                `- 時段：${timeslot.startTime} - ${timeslot.endTime}`,
            ].join("\n")
        return undefined
    }
    protected createNotificationForAdministrator(
        user: User,
        group: Group,
        meetup: Meetup,
        venue: Venue,
        timeslot: Timeslot,
        status: SignUpStatuses,
    ) {
        if (status === SignUpStatuses.Pending)
            return [`${user.displayName} 報名了 ${group.name} ${meetup.name} 的零打。`].join("\n")
        if (status === SignUpStatuses.Cancelled)
            return [`${user.displayName} 取消了 ${group.name} ${meetup.name} 的零打。`].join("\n")
        return undefined
    }
    async execute(userId: string, groupId: string, meetupId: string, { timeslotId, status }: SendingLINEPushMessage) {
        try {
            const measureElapsedTime = createElapsedTimeProfiler()
            const user = await this.userDao.byId(userId)
            if (!user) throw new UserNotFound({ userId })
            const group = await this.groupDao.byId(groupId)
            if (!group) throw new GroupNotFound({ groupId })
            const meetup = await this.meetupDao.byId(groupId, meetupId)
            if (!meetup) throw new MeetupNotFound({ meetupId })
            const venue = await this.venueDao.byId(meetup.venueId)
            if (!venue) throw new VenueNotFound({ venueId: meetup.venueId })
            const timeslot = await this.timeslotDao.byId(groupId, meetupId, timeslotId)
            if (!timeslot) throw new TimeslotNotFound({ timeslotId })
            const text = this.createNotifcationContent(user, group, meetup, venue, timeslot, status)
            if (!text) return
            this.logger.debug(`產生 text 花費了 ${measureElapsedTime()}ms`)
            const uid = user.providers[Providers.LINE]!
            queue.add(() => this.lineMessagingService.pushMessage(text, uid))
            this.logger.debug(`發送訊息花費了 ${measureElapsedTime()}ms`)
            if ([SignUpStatuses.Pending, SignUpStatuses.Cancelled].includes(status)) {
                const text = this.createNotificationForAdministrator(user, group, meetup, venue, timeslot, status)
                if (!text) return
                const userIds = Object.keys(await this.permissionDao.underGroup(groupId))
                const users = this.userDao.inIds(...userIds)
                for await (const user of users) {
                    const uid = user.providers[Providers.LINE]!
                    queue.add(() => this.lineMessagingService.pushMessage(text, uid))
                }
            }
            this.logger.debug(`通知管理員花費了 ${measureElapsedTime()}ms`)
        } catch (error) {
            this.logger.error((error as Error).message)
        }
    }
}
