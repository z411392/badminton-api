import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type DocumentSnapshot } from "firebase-admin/firestore"
import { createElapsedTimeProfiler } from "@/utils/development"
import { readFile } from "fs/promises"
import { CreateGroup } from "@/modules/GroupManaging/application/mutations/CreateGroup"
import { CreateLevel } from "@/modules/LevelManaging/application/mutations/CreateLevel"
import { CreateVenue } from "@/modules/VenueManaging/application/mutations/CreateVenue"
import { CreateShuttle } from "@/modules/ShuttleManaging/application/mutations/CreateShuttle"
import { JoinGroup } from "@/modules/IdentityAndAccessManaging/application/mutations/JoinGroup"
import { ReviewGroupJoining } from "@/modules/IdentityAndAccessManaging/application/mutations/ReviewGroupJoining"
import { PermissionStatuses } from "@/modules/IdentityAndAccessManaging/dtos/PermissionStatuses"
import { DateTime } from "luxon"
import { DatetimeFormats } from "@/constants"
import { CreateMeetup } from "@/modules/MeetupManaging/application/mutations/CreateMeetup"
import { Register } from "@/modules/SignUpManaging/application/mutations/Register"
import { Cancel } from "@/modules/SignUpManaging/application/mutations/Cancel"
import { Accept } from "@/modules/SignUpManaging/application/mutations/Accept"
import { Revoke } from "@/modules/SignUpManaging/application/mutations/Revoke"
import { MarkAsPaid } from "@/modules/SignUpManaging/application/mutations/MarkAsPaid"
import { MarkAsRefunded } from "@/modules/SignUpManaging/application/mutations/MarkAsRefunded"
import { SignUpStatuses } from "@/modules/SignUpManaging/dtos/SignUpStatuses"
import { SignUpRepository } from "@/adapters/firestore/SignUpRepository"
import { TrackRepository } from "@/adapters/firestore/TrackRepository"
import { type Track } from "@/modules/TrackManaging/dtos/Track"
import { PlaylistRepository } from "@/adapters/firestore/PlaylistRepository"
import { type Playlist } from "@/modules/PlaylistManaging/dtos/Playlist"
import { SaveProfile } from "@/modules/ProfileManaging/application/mutations/SaveProfile"
import { TimeslotRepository } from "@/adapters/firestore/TimeslotRepository"
import { searchClient, type SearchClient } from "@algolia/client-search"
import { Indexes } from "@/constants"
export class Migration20241122 extends CallableInstance<[string, string, string], Promise<any>> {
    protected logger: ConsolaInstance
    protected db: Firestore
    protected searchClient: SearchClient
    constructor({ db }: { db: Firestore }) {
        super("execute")
        this.logger = createConsola().withTag(`Migration20241122`)
        this.db = db
        this.searchClient = searchClient(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_APP_KEY!)
    }
    protected async groupData() {
        const { "夏洛利牧場.jpeg": photo } = JSON.parse(await readFile("data/photos.json", { encoding: "utf-8" }))
        return {
            name: "夏洛利牧場",
            contactUs: "https://line.me/ti/p/3BEaEsE2cn",
            photo,
        }
    }

    protected async migrateGroup(userId: string) {
        const measureElapsedTime = createElapsedTimeProfiler()
        try {
            await this.db.runTransaction(async (transaction) => {
                const createGroup = new CreateGroup({ db: this.db, transaction })
                const mutation = await this.groupData()
                await createGroup(userId, mutation)
            })
            this.logger.info(`createGroup 花費了 ${measureElapsedTime()} ms`)
        } catch {}
    }

    protected *levelsData() {
        yield {
            name: "初階",
            order: 1,
            color: "#4CAF50",
            description: ["1. 懂規則", "2. 會發球", "3. 會長球"].join(""),
        }
        yield {
            name: "初上～中下",
            order: 2,
            color: "#2196F3",
            description: ["1. 會長切殺", "2. 會輪轉", "3. 非受迫時大多不會打肉包球"].join(""),
        }
        yield {
            name: "#FFEB3B",
            order: 3,
            color: "#FFEB3B",
            description: ["1. 有戰略懂打點", "2. 定點或移動中長、切、殺球皆能穩定擊球"].join(""),
        }
        yield {
            name: "中高階以上",
            order: 4,
            color: "#F44336",
            description: ["1. 步法靈敏跑位快", "2. 進攻及防守都極具威脅", "3. 反拍穩定且具變化"].join(""),
        }
    }

    protected async migrateLevels(userId: string, groupId: string) {
        try {
            const levels = this.levelsData()
            for (const mutation of levels) {
                const measureElapsedTime = createElapsedTimeProfiler()
                await this.db.runTransaction(async (transaction) => {
                    const createLevel = new CreateLevel({ db: this.db, transaction })
                    await createLevel(userId, groupId, mutation)
                })
                this.logger.info(`createLevel 花費了 ${measureElapsedTime()} ms`)
            }
        } catch {}
    }

    protected *venuesData() {
        yield {
            name: "紅館（臺北體育館）",
            address: "臺北市松山區南京東路四段 10 號",
            building: "",
            floor: 7,
            latitude: 25.05138023,
            longitude: 121.55206087,
        }
        yield {
            name: "敦化國小",
            address: "臺北市松山區敦化北路 2 號",
            building: "活動中心",
            floor: 3,
            latitude: 25.0495,
            longitude: 121.547574,
        }
        yield {
            name: "成功高中",
            address: "臺北市中正區濟南路 1 段 71 號",
            building: "運動中心",
            floor: 8,
            latitude: 25.0433652,
            longitude: 121.5224089,
        }
        yield {
            name: "興雅國小",
            address: "臺北市信義區基隆路一段 83 巷 9 號",
            building: "活動中心",
            floor: 4,
            latitude: 25.0466834,
            longitude: 121.5700295,
        }
    }

    protected async migrateVenues(userId: string) {
        try {
            const venues = this.venuesData()
            for (const mutation of venues) {
                const measureElapsedTime = createElapsedTimeProfiler()
                await this.db.runTransaction(async (transaction) => {
                    const createVenue = new CreateVenue({ db: this.db, transaction })
                    await createVenue(userId, mutation)
                })
                this.logger.info(`createVenue 花費了 ${measureElapsedTime()} ms`)
            }
        } catch {}
    }

    protected *shuttlesData() {
        yield {
            brand: "勝利",
            name: "MASTER ACE",
        }
    }

    protected async migrateShuttles(userId: string) {
        try {
            const shuttles = this.shuttlesData()
            for (const mutation of shuttles) {
                const measureElapsedTime = createElapsedTimeProfiler()
                await this.db.runTransaction(async (transaction) => {
                    const createShuttle = new CreateShuttle({ db: this.db, transaction })
                    await createShuttle(userId, mutation)
                })
                this.logger.info(`createShuttle 花費了 ${measureElapsedTime()} ms`)
            }
        } catch {}
    }
    protected newLevelIdsMap: { [oldLevelId: string]: string } = {
        "a885f292-8421-567b-8f2e-f1d7c9741ade": "9f4b1e0e-f5f2-57c9-a67d-42d69b34707c", // 綠
        "4a8a3fca-7e57-5163-bbc9-005b5cef5101": "f3bc180b-03e5-5474-b69f-c25c3158fa6e", // 藍
        "7f20cb97-0128-5f0f-8c0d-1edb8e267980": "28e69ec2-50c1-546b-bd2f-441cf196ff06", // 黃
        "bc32738d-e7af-5ed3-a511-669feca729d5": "52ddd8c0-00c6-517e-98e2-c7f47045a987", // 紅
    }

    protected newVenueIdsMap: { [oldVenueId: string]: string } = {
        "487b7a5a-4099-5d3f-a6ae-ba6b18f5b9bd": "2d19e3fa-6b56-5626-88d5-8c20a49bd054", // 紅館
        "66b54abe-a297-5027-9641-943b49f85c79": "c75b5ba8-213f-5c30-abd3-5a9f55024089", // 敦化國小
        "a44430fd-b93e-5d24-8138-3457533a23da": "d17f3f5b-d449-5be6-8551-008129e1b0e5", // 成功高中
        "fbc091d7-2b8b-5931-8734-09e2a48bbb46": "c2671abf-f1e1-5ac2-b41c-e0efd74e7611", // 興雅國小
    }

    protected newShuttleIdsMap: { [oldShuttleId: string]: string } = {
        "8ab11613-e9c4-505c-87b8-150d7919d863": "8c572df6-fb68-5788-93d3-2f6c08374618", // 勝利 Master Ace
    }
    protected async migrateProfiles(administratorId: string, oldGroupId: string, newGroupId: string) {
        const stream = this.db.collection(`groups/${oldGroupId}/profiles`).stream() as unknown as ReadableStream<
            DocumentSnapshot<{
                userId: string
                name: string
                line: string
                levelId: string
            }>
        >
        for await (const documentSnapshot of stream) {
            const measureElapsedTime = createElapsedTimeProfiler()
            const { userId, name, line, levelId: oldLevelId } = documentSnapshot.data()!
            const levelId = this.newLevelIdsMap[oldLevelId] || "f3bc180b-03e5-5474-b69f-c25c3158fa6e"
            await this.db.runTransaction(async (transaction) => {
                const saveProfile = new SaveProfile({ db: this.db, transaction })
                await saveProfile(userId, newGroupId, {
                    name,
                    line,
                    levelId,
                })
            })
            this.logger.info(`saveProfile 花費了 ${measureElapsedTime()} ms`)
        }
    }
    protected *administratorsData() {
        yield {
            userId: "wT9yf3fvduNaALoB5PKPDMQVrNZ2", // 小菜
        }
        yield {
            userId: "0Ofr0ayLkgc81lNwkqmX0yEX7Jh2", // 阿元
        }
    }
    protected async specifyAdministrators(administratorId: string, groupId: string) {
        try {
            const administrators = this.administratorsData()
            for (const { userId } of administrators) {
                const measureElapsedTime = createElapsedTimeProfiler()
                const permissionId = await this.db.runTransaction(async (transaction) => {
                    const joinGroup = new JoinGroup({ db: this.db, transaction })
                    return await joinGroup(userId, groupId)
                })
                this.logger.info(`joinGroup 花費了 ${measureElapsedTime()} ms`)
                await this.db.runTransaction(async (transaction) => {
                    const reviewGroupJoining = new ReviewGroupJoining({ db: this.db, transaction })
                    await reviewGroupJoining(administratorId, groupId, {
                        permissionId,
                        status: PermissionStatuses.Approved,
                    })
                })
                this.logger.info(`reviewGroupJoining 花費了 ${measureElapsedTime()} ms`)
            }
        } catch {}
    }

    protected async migrateMeetups(userId: string, oldGroupId: string, newGroupId: string) {
        try {
            const stream = this.db.collection(`groups/${oldGroupId}/meetups`).stream() as unknown as ReadableStream<
                DocumentSnapshot<{
                    date: number
                    description: string
                    name: string
                    shuttleIds: string[]
                    venueId: string
                    plans: Array<{
                        capacity: number
                        courts: number
                        fee: number
                        reserved: number
                        timeslot: {
                            startTime: number
                            endTime: number
                        }
                    }>
                }>
            >
            for await (const documentSnapshot of stream) {
                const {
                    date: oldDate,
                    description,
                    name,
                    shuttleIds: oldShuttleIds,
                    venueId: oldVenueId,
                    plans: oldTimeslots,
                } = documentSnapshot.data()!
                const measureElapsedTime = createElapsedTimeProfiler()
                await this.db.runTransaction(async (transaction) => {
                    const date = DateTime.fromMillis(oldDate).toFormat(DatetimeFormats.ISO8601DATE)
                    const shuttleIds = oldShuttleIds.map((oldShuttleId) => this.newShuttleIdsMap[oldShuttleId])
                    const venueId = this.newVenueIdsMap[oldVenueId]
                    const timeslots = oldTimeslots.map(
                        ({ capacity, courts, fee, reserved, timeslot: { startTime, endTime } }, index) => {
                            return {
                                capacity,
                                courts,
                                fee,
                                reserved,
                                startTime: DateTime.fromMillis(startTime).toFormat(`HH:mm`),
                                endTime: DateTime.fromMillis(endTime).toFormat(`HH:mm`),
                                timestamp: index,
                            }
                        },
                    )
                    const mutation = {
                        name,
                        date,
                        venueId,
                        shuttleIds,
                        playlistId: null as unknown as undefined,
                        timeslots,
                        description,
                    }
                    const createMeetup = new CreateMeetup({ db: this.db, transaction })
                    await createMeetup(userId, newGroupId, mutation)
                })
                this.logger.info(`createMeetup 花費了 ${measureElapsedTime()} ms`)
            }
        } catch {}
    }

    protected meetupIdsToBeSkippedFromMigration: string[] = [
        // "ba7b935c-3eb1-5391-bf18-88d49c3e5884", // 敦小第05次球敘
        // "45f88fae-788f-5893-b783-91a63c931be2", // 第 097 次球敘
        // "bb89a40d-3728-5ac9-ae38-d3ef5e35f8e3", // 敦小第06次球敘
    ]

    protected newStatusesMap: { [oldStatus: string]: SignUpStatuses } = {
        "-3": SignUpStatuses.Refunded,
        "-2": SignUpStatuses.Revoked,
        "-1": SignUpStatuses.Cancelled,
        "1": SignUpStatuses.Pending,
        "2": SignUpStatuses.Accepted,
        "3": SignUpStatuses.Paid,
    }

    protected async migrateSignUpsUnder(
        from: { groupId: string; meetupId: string },
        to: { groupId: string; meetupId: string },
    ) {
        for await (const documentSnapshot of this.db
            .collection(`groups/${to.groupId}/meetups/${to.meetupId}/timeslots`)
            .select()
            .stream() as unknown as ReadableStream<DocumentSnapshot<{}>>) {
            const timeslotId = documentSnapshot.id
            const signUpsClearing = this.db.batch()
            for await (const documentSnapshot of this.db
                .collection(`groups/${to.groupId}/meetups/${to.meetupId}/timeslots/${timeslotId}/signUps`)
                .select()
                .stream() as unknown as ReadableStream<DocumentSnapshot<{}>>)
                signUpsClearing.delete(documentSnapshot.ref)
            await signUpsClearing.commit()
        }

        const eventsClearing = this.db.batch()
        for await (const documentSnapshot of this.db
            .collection(`groups/${to.groupId}/meetups/${to.meetupId}/events`)
            .select()
            .stream() as unknown as ReadableStream<DocumentSnapshot<{}>>)
            eventsClearing.delete(documentSnapshot.ref)
        await eventsClearing.commit()

        const stream = this.db
            .collection(`groups/${from.groupId}/meetups/${from.meetupId}/events`)
            .orderBy("timestamp", "asc")
            .stream() as unknown as ReadableStream<
            DocumentSnapshot<{
                plans: number[]
                status: number
                timestamp: number
                userId: string
                administratorId?: string
            }>
        >
        for await (const documentSnapshot of stream) {
            const { plans: indexes, status: oldStatus, userId, administratorId, timestamp } = documentSnapshot.data()!
            const status = this.newStatusesMap[String(oldStatus)]
            if (!status) continue
            for (const index of indexes) {
                const timeslotId = TimeslotRepository.nextId({ meetupId: to.meetupId, timestamp: index })
                try {
                    if (status === SignUpStatuses.Pending) {
                        const measureElapsedTime = createElapsedTimeProfiler()
                        await this.db.runTransaction(async (transaction) => {
                            const register = new Register({ db: this.db, transaction })
                            await register(userId, to.groupId, to.meetupId, timeslotId, timestamp)
                        })
                        this.logger.info(`register 花費了 ${measureElapsedTime()} ms`)
                        continue
                    }
                    if (status === SignUpStatuses.Cancelled) {
                        const measureElapsedTime = createElapsedTimeProfiler()
                        await this.db.runTransaction(async (transaction) => {
                            const cancel = new Cancel({ db: this.db, transaction })
                            await cancel(userId, to.groupId, to.meetupId, timeslotId, timestamp)
                        })
                        this.logger.info(`cancel 花費了 ${measureElapsedTime()} ms`)
                        continue
                    }
                    if (!administratorId) continue
                    const signUpId = SignUpRepository.nextId({ timeslotId, userId })
                    if (status === SignUpStatuses.Accepted) {
                        const measureElapsedTime = createElapsedTimeProfiler()
                        await this.db.runTransaction(async (transaction) => {
                            const accept = new Accept({ db: this.db, transaction })
                            return await accept(
                                administratorId!,
                                to.groupId,
                                to.meetupId,
                                timeslotId,
                                signUpId,
                                timestamp,
                            )
                        })
                        this.logger.info(`accept 花費了 ${measureElapsedTime()} ms`)
                        continue
                    }
                    if (status === SignUpStatuses.Revoked) {
                        const measureElapsedTime = createElapsedTimeProfiler()
                        await this.db.runTransaction(async (transaction) => {
                            const revoke = new Revoke({ db: this.db, transaction })
                            return await revoke(
                                administratorId!,
                                to.groupId,
                                to.meetupId,
                                timeslotId,
                                signUpId,
                                timestamp,
                            )
                        })
                        this.logger.info(`revoke 花費了 ${measureElapsedTime()} ms`)
                        continue
                    }
                    if (status === SignUpStatuses.Paid) {
                        const measureElapsedTime = createElapsedTimeProfiler()
                        await this.db.runTransaction(async (transaction) => {
                            const markAsPaid = new MarkAsPaid({ db: this.db, transaction })
                            return await markAsPaid(
                                administratorId!,
                                to.groupId,
                                to.meetupId,
                                timeslotId,
                                signUpId,
                                timestamp,
                            )
                        })
                        this.logger.info(`markAsPaid 花費了 ${measureElapsedTime()} ms`)
                        continue
                    }
                    if (status === SignUpStatuses.Refunded) {
                        const measureElapsedTime = createElapsedTimeProfiler()
                        await this.db.runTransaction(async (transaction) => {
                            const markAsRefunded = new MarkAsRefunded({ db: this.db, transaction })
                            return await markAsRefunded(
                                administratorId!,
                                to.groupId,
                                to.meetupId,
                                timeslotId,
                                signUpId,
                                timestamp,
                            )
                        })
                        this.logger.info(`markAsRefunded 花費了 ${measureElapsedTime()} ms`)
                        continue
                    }
                } catch (error) {
                    if (error instanceof Error) this.logger.error(error.message)
                }
            }
        }
    }

    protected async toNewMeeupId(oldGroupId: string, oldMeetupId: string, newGroupId: string) {
        const documentSnapshot = await this.db.doc(`groups/${oldGroupId}/meetups/${oldMeetupId}`).get()
        const { name } = documentSnapshot.data() as { name: string }
        const stream = this.db
            .collection(`groups/${newGroupId}/meetups`)
            .where(`name`, `==`, name)
            .select()
            .limit(1)
            .stream() as unknown as ReadableStream<DocumentSnapshot<{}>>
        for await (const documentSnapshot of stream) return documentSnapshot.id
        return undefined
    }

    protected async *meetupIdsToBeMigrated(groupId: string) {
        const stream = this.db
            .collection(`groups/${groupId}/meetups`)
            .orderBy("createdAt", "desc")
            .select()
            .stream() as unknown as ReadableStream<DocumentSnapshot<{}>>
        for await (const documentSnapshot of stream) {
            if (this.meetupIdsToBeSkippedFromMigration.includes(documentSnapshot.id)) continue
            yield documentSnapshot.id
        }
    }

    protected async migrateSignUps(oldGroupId: string, newGroupId: string) {
        const oldMeetupIds = this.meetupIdsToBeMigrated(oldGroupId)
        for await (const oldMeetupId of oldMeetupIds) {
            const newMeetupId = await this.toNewMeeupId(oldGroupId, oldMeetupId, newGroupId)
            if (!newMeetupId) continue
            await this.migrateSignUpsUnder(
                { groupId: oldGroupId, meetupId: oldMeetupId },
                { groupId: newGroupId, meetupId: newMeetupId },
            )
        }
    }

    protected async migratePlaylists(oldGroupId: string, newGroupId: string) {
        const stream = this.db
            .collection(`groups/${oldGroupId}/playlists`)
            .orderBy("createdAt", "asc")
            .select("spotifyId", "name")
            .stream() as unknown as ReadableStream<DocumentSnapshot<{ spotifyId: string; name: string }>>
        for await (const documentSnapshot of stream) {
            const playlistId = PlaylistRepository.nextId({ groupId: newGroupId })
            const { spotifyId, name } = documentSnapshot.data()!
            let tracksCount = 0
            let tracksDuration = 0
            const stream = this.db
                .collection(`groups/${oldGroupId}/playlists/${documentSnapshot.id}/items`)
                .orderBy("createdAt", "asc")
                .select("relationshipId", "duration", "userId")
                .stream() as unknown as ReadableStream<
                DocumentSnapshot<{ relationshipId: string; duration: number; userId: string }>
            >
            for await (const documentSnapshot of stream) {
                const measureElapsedTime = createElapsedTimeProfiler()
                const { relationshipId, duration, userId } = documentSnapshot.data()!
                const trackId = TrackRepository.nextId({ playlistId })
                const track: Track = {
                    id: trackId,
                    userId,
                    spotifyId: relationshipId,
                    snapshotId: "",
                }
                await this.db.runTransaction(async (transaction) => {
                    const trackRepository = new TrackRepository({ db: this.db, transaction })
                    await trackRepository.set(newGroupId, playlistId, trackId, track)
                })
                tracksCount += 1
                tracksDuration += duration
                this.logger.info(`addTrack 花費了 ${measureElapsedTime()} ms`)
            }
            const measureElapsedTime = createElapsedTimeProfiler()
            const playlist: Playlist = {
                id: playlistId,
                name,
                spotifyId,
                tracksCount,
                tracksDuration,
            }
            await this.db.runTransaction(async (transaction) => {
                const playlistRepository = new PlaylistRepository({ db: this.db, transaction })
                await playlistRepository.set(newGroupId, playlistId, playlist)
            })
            this.logger.info(`createPlaylist 花費了 ${measureElapsedTime()} ms`)
        }
    }

    protected async toNewPlaylistId(oldGroupId: string, oldPlaylistId: string, newGroupId: string) {
        const documentSnapshot = await this.db.doc(`groups/${oldGroupId}/playlists/${oldPlaylistId}`).get()
        const data = documentSnapshot.data()
        if (!data) return undefined
        const { name } = data as { name: string }
        const stream = this.db
            .collection(`groups/${newGroupId}/playlists`)
            .where(`name`, `==`, name)
            .select()
            .limit(1)
            .stream() as unknown as ReadableStream<DocumentSnapshot<{}>>
        for await (const documentSnapshot of stream) return documentSnapshot.id
        return undefined
    }

    protected async setupPlaylists(oldGroupId: string, newGroupId: string) {
        const stream = this.db
            .collection(`groups/${oldGroupId}/meetups`)
            .select("playlistId")
            .orderBy("createdAt", "asc")
            .stream() as unknown as ReadableStream<DocumentSnapshot<{ playlistId?: string | null }>>
        for await (const documentSnapshot of stream) {
            const measureElapsedTime = createElapsedTimeProfiler()
            const oldMeetupId = documentSnapshot.id
            const newMeetupId = await this.toNewMeeupId(oldGroupId, oldMeetupId, newGroupId)
            if (!newMeetupId) continue
            const data = documentSnapshot.data()
            if (!data) continue
            const { playlistId: oldPlaylistId } = data as { playlistId?: string | null }
            if (!oldPlaylistId) continue
            const playlistId = await this.toNewPlaylistId(oldGroupId, oldPlaylistId, newGroupId)
            if (!playlistId) continue
            await this.db.doc(`groups/${newGroupId}/meetups/${newMeetupId}`).update({ playlistId })
            await this.searchClient.partialUpdateObject({
                indexName: Indexes.Meetups,
                objectID: newMeetupId,
                attributesToUpdate: { playlistId },
            })
            this.logger.info(`setupPlaylist 花費了 ${measureElapsedTime()} ms`)
        }
    }

    async execute(userId: string, oldGroupId: string, newGroupId: string) {
        if (false) await this.migrateGroup(userId)
        if (false) await this.migrateLevels(userId, newGroupId)
        if (false) await this.migrateVenues(userId)
        if (false) await this.migrateShuttles(userId)
        if (false) await this.migrateProfiles(userId, oldGroupId, newGroupId)
        if (false) await this.specifyAdministrators(userId, newGroupId)
        if (false) await this.migrateMeetups(userId, oldGroupId, newGroupId)
        if (false) await this.migratePlaylists(oldGroupId, newGroupId)
        if (false) await this.setupPlaylists(oldGroupId, newGroupId)
        if (false) await this.migrateSignUps(oldGroupId, newGroupId)
    }
}
