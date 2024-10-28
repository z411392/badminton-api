import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore } from "firebase-admin/firestore"
import { MeetupDao } from "@/adapters/firestore/MeetupDao"
import { type MeetupWithTimeslots } from "@/modules/MeetupManaging/dtos/Meetup"
import { TimeslotDao } from "@/adapters/firestore/TimeslotDao"
import { toInput } from "@/modules/MeetupManaging/dtos/Timeslot"

export class ResolveMeetup extends CallableInstance<
    [string, string, string],
    Promise<MeetupWithTimeslots | undefined>
> {
    protected logger: ConsolaInstance
    protected meetupDao: MeetupDao
    protected timeslotDao: TimeslotDao

    constructor({ db }: { db: Firestore }) {
        super("execute")
        this.logger = createConsola().withTag(`ResolveMeetup`)
        this.meetupDao = new MeetupDao({ db })
        this.timeslotDao = new TimeslotDao({ db })
    }
    async execute(userId: string, groupId: string, meetupId: string) {
        const meetup = await this.meetupDao.byId(groupId, meetupId)
        if (!meetup) return undefined
        const timeslotIds = await this.timeslotDao.underMeetup(meetup.id)
        const timeslots = []
        for await (const timeslot of this.timeslotDao.inIds(groupId, meetup.id, ...timeslotIds))
            timeslots.push(toInput(timeslot))
        return { ...meetup, timeslots }
    }
}
