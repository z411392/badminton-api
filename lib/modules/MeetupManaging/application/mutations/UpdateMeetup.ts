import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { MeetupRepository } from "@/adapters/firestore/MeetupRepository"
import { type Meetup } from "@/modules/MeetupManaging/dtos/Meetup"
import { VenueDao } from "@/adapters/firestore/VenueDao"
import { ShuttleDao } from "@/adapters/firestore/ShuttleDao"
import { VenueNotFound } from "@/modules/VenueManaging/errors/VenueNotFound"
import { ShuttleNotFound } from "@/modules/ShuttleManaging/errors/ShuttleNotFound"
import { MeetupNotFound } from "@/modules/MeetupManaging/errors/MeetupNotFound"
import { type TimeslotInput, type Timeslot, fromInput } from "@/modules/MeetupManaging/dtos/Timeslot"
import { TimeslotRepository } from "@/adapters/firestore/TimeslotRepository"
import { TimeslotDao } from "@/adapters/firestore/TimeslotDao"

export type UpdatingMeetup = {
    name: string
    date: string
    venueId: string
    shuttleIds: string[]
    playlistId?: string
    timeslots: TimeslotInput[]
    description: string
}
export class UpdateMeetup extends CallableInstance<
    [string, string, string, UpdatingMeetup],
    Promise<{ meetupId: string }>
> {
    protected logger: ConsolaInstance
    protected meetupRepository: MeetupRepository
    protected venueDao: VenueDao
    protected shuttleDao: ShuttleDao
    protected timeslotRepository: TimeslotRepository
    protected timeslotDao: TimeslotDao

    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`UpdateMeetup`)
        this.meetupRepository = new MeetupRepository({ db, transaction })
        this.venueDao = new VenueDao({ db })
        this.shuttleDao = new ShuttleDao({ db })
        this.timeslotRepository = new TimeslotRepository({ db, transaction })
        this.timeslotDao = new TimeslotDao({ db })
    }
    async execute(
        userId: string,
        groupId: string,
        meetupId: string,
        { name, date, venueId, shuttleIds, timeslots, description, playlistId }: UpdatingMeetup,
    ) {
        const meetupExists = await this.meetupRepository.get(groupId, meetupId)
        if (!meetupExists) throw new MeetupNotFound({ meetupId })
        const venue = await this.venueDao.byId(venueId)
        if (!venue) throw new VenueNotFound({ venueId })
        const uniqueShuttleIds = new Set(shuttleIds)
        const shuttles = this.shuttleDao.inIds(...uniqueShuttleIds)
        for await (const shuttle of shuttles) uniqueShuttleIds.delete(shuttle.id)
        for (const shuttleId of uniqueShuttleIds) throw new ShuttleNotFound({ shuttleId })
        const promises: Promise<unknown>[] = []
        const meetup: Meetup = {
            ...meetupExists,
            name,
            date,
            venueId,
            shuttleIds,
            description,
            playlistId,
        }
        promises.push(this.meetupRepository.set(groupId, meetupId, meetup))
        const timeslotIds = await this.timeslotDao.underMeetup(meetupId)
        const timeslotIdsMap = timeslots.reduce((timeslotIdsMap: { [timestamp: string]: string }, { timestamp }) => {
            timeslotIdsMap[String(timestamp)] = TimeslotRepository.nextId({ meetupId, timestamp })
            return timeslotIdsMap
        }, {})
        const toBeRemoved = timeslotIds.filter((timeslotId) => !Object.values(timeslotIdsMap).includes(timeslotId))
        for (const timeslotInput of timeslots) {
            const timeslotId = timeslotIdsMap[String(timeslotInput.timestamp)]
            const timeslot: Timeslot = {
                ...fromInput(timeslotInput, date),
                id: timeslotId,
            }
            promises.push(this.timeslotRepository.set(groupId, meetupId, timeslotId, timeslot))
        }
        for (const timeslotId of toBeRemoved)
            promises.push(this.timeslotRepository.remove(groupId, meetupId, timeslotId))
        await Promise.all(promises)
        return meetupId
    }
}
