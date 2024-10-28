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
import { SignUpStatuses } from "@/modules/SignUpManaging/dtos/SignUpStatuses"
import { VenueDao } from "@/adapters/firestore/VenueDao"
import { type Venue } from "@/modules/VenueManaging/dtos/Venue"
import { VenueNotFound } from "@/modules/VenueManaging/errors/VenueNotFound"
import { PermissionDao } from "@/adapters/firestore/PermissionDao"
import { TimeslotDao } from "@/adapters/firestore/TimeslotDao"
import { SubscriptionDao } from "@/adapters/firestore/SubscriptionDao"
import { type Messaging } from "firebase-admin/messaging"
import { getAuth, type Auth } from "firebase-admin/auth"
import { UnableToSendMessage } from "@/modules//Notifying/errors/UnableToSendMessage"

export type PushingMessage = {
    timeslotId: string
    status: SignUpStatuses
}

export class PushMessage extends CallableInstance<[string, string, string, PushingMessage], Promise<any>> {
    protected logger: ConsolaInstance
    protected userDao: UserDao
    protected groupDao: GroupDao
    protected meetupDao: MeetupDao
    protected venueDao: VenueDao
    protected permissionDao: PermissionDao
    protected timeslotDao: TimeslotDao
    protected messaging: Messaging
    protected subscriptionDao: SubscriptionDao
    protected auth: Auth

    constructor({ db, messaging }: { db: Firestore; messaging: Messaging }) {
        super("execute")
        this.logger = createConsola().withTag(`PushMesssage`)
        this.userDao = new UserDao()
        this.groupDao = new GroupDao({ db })
        this.meetupDao = new MeetupDao({ db })
        this.venueDao = new VenueDao({ db })
        this.permissionDao = new PermissionDao({ db })
        this.timeslotDao = new TimeslotDao({ db })
        this.messaging = messaging
        this.subscriptionDao = new SubscriptionDao({ db })
        this.auth = getAuth()
    }
    protected createNotifcationBody(
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
    protected createNotificationBodyForAdministrator(
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
    protected async pushMessageToUser(
        user: User,
        group: Group,
        meetup: Meetup,
        venue: Venue,
        timeslot: Timeslot,
        status: SignUpStatuses,
    ) {
        const body = this.createNotifcationBody(user, group, meetup, venue, timeslot, status)
        if (!body) return
        const subscription = await this.subscriptionDao.byId(user.id)
        if (!subscription) return
        let customToken: string | undefined = undefined
        try {
            customToken = await this.auth.createCustomToken(user.id)
        } catch {}
        if (!customToken) return
        const query = new URLSearchParams({ customToken })
        const link = `${process.env.WWW_URL!}/groups/${group.id}/meetups/${meetup.id}?${query}`
        try {
            await this.messaging.send({
                token: subscription.token,
                notification: {
                    body,
                },
                webpush: {
                    fcmOptions: {
                        link,
                    },
                },
            })
        } catch (error) {
            const reason = (error as Error).message
            throw new UnableToSendMessage({ reason })
        }
    }

    protected async pushMessageToAdministrator(
        user: User,
        group: Group,
        meetup: Meetup,
        venue: Venue,
        timeslot: Timeslot,
        status: SignUpStatuses,
    ) {
        const body = this.createNotificationBodyForAdministrator(user, group, meetup, venue, timeslot, status)
        if (!body) return
        const userIds = Object.keys(await this.permissionDao.underGroup(group.id))
        for (const userId of userIds) {
            const subscription = await this.subscriptionDao.byId(userId)
            if (!subscription) continue
            let customToken: string | undefined = undefined
            try {
                customToken = await this.auth.createCustomToken(userId)
            } catch {}
            if (!customToken) continue
            const query = new URLSearchParams({ customToken })
            const link = `${process.env.CMS_URL!}/groups/${group.id}/meetups/${meetup.id}/signUps?${query}`
            try {
                await this.messaging.send({
                    token: subscription.token,
                    notification: {
                        body,
                    },
                    webpush: {
                        fcmOptions: {
                            link,
                        },
                    },
                })
            } catch (error) {
                const reason = (error as Error).message
                throw new UnableToSendMessage({ reason })
            }
        }
    }
    async execute(userId: string, groupId: string, meetupId: string, { timeslotId, status }: PushingMessage) {
        try {
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
            await this.pushMessageToUser(user, group, meetup, venue, timeslot, status)
            if ([SignUpStatuses.Pending, SignUpStatuses.Cancelled].includes(status))
                await this.pushMessageToAdministrator(user, group, meetup, venue, timeslot, status)
        } catch (error) {
            this.logger.error((error as Error).message)
        }
    }
}
