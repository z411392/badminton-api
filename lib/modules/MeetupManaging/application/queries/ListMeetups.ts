import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore } from "firebase-admin/firestore"
import { type Meetup } from "@/modules/MeetupManaging/dtos/Meetup"
import { MeetupDao } from "@/adapters/firestore/MeetupDao"
import { type CountingMeetups } from "@/modules/MeetupManaging/application/queries/CountMeetups"
import { TimeslotDao } from "@/adapters/firestore/TimeslotDao"
import { toInput } from "@/modules/MeetupManaging/dtos/Timeslot"

export type ListingMeetups = CountingMeetups & {
    page: number
}

export class ListMeetups extends CallableInstance<[string, string, ListingMeetups], AsyncIterable<Meetup>> {
    protected logger: ConsolaInstance
    protected meetupDao: MeetupDao
    protected timeslotDao: TimeslotDao

    constructor({ db }: { db: Firestore }) {
        super("execute")
        this.logger = createConsola().withTag(`ListMeetups`)
        this.meetupDao = new MeetupDao({ db })
        this.timeslotDao = new TimeslotDao({ db })
    }
    async *execute(userId: string, groupId: string, { page, search }: ListingMeetups) {
        const meetupIds = await this.meetupDao.search({ groupId, search }, page)
        if (meetupIds.length === 0) return
        for await (const meetup of this.meetupDao.inIds(groupId, ...meetupIds)) {
            const timeslotIds = await this.timeslotDao.underMeetup(meetup.id)
            const timeslotInputs = []
            for await (const timeslot of this.timeslotDao.inIds(groupId, meetup.id, ...timeslotIds)) {
                const { id, ...timeslotInput } = toInput(timeslot)
                timeslotInputs.push(timeslotInput)
            }
            yield { ...meetup, timeslots: timeslotInputs }
        }
    }
}
