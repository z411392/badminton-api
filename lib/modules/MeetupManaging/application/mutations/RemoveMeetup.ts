import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { MeetupRepository } from "@/adapters/firestore/MeetupRepository"
import { MeetupNotFound } from "@/modules/MeetupManaging/errors/MeetupNotFound"
import { TimeslotRepository } from "@/adapters/firestore/TimeslotRepository"
import { TimeslotDao } from "@/adapters/firestore/TimeslotDao"

export class RemoveMeetup extends CallableInstance<[string, string, string], Promise<{ meetupId: string }>> {
    protected logger: ConsolaInstance
    protected meetupRepository: MeetupRepository
    protected timeslotRepository: TimeslotRepository
    protected timeslotDao: TimeslotDao

    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`RemoveMeetup`)
        this.meetupRepository = new MeetupRepository({ db, transaction })
        this.timeslotRepository = new TimeslotRepository({ db, transaction })
        this.timeslotDao = new TimeslotDao({ db })
    }
    async execute(userId: string, groupId: string, meetupId: string) {
        const meetupExists = await this.meetupRepository.get(groupId, meetupId)
        if (!meetupExists) throw new MeetupNotFound({ meetupId })
        const toBeRemoved = await this.timeslotDao.underMeetup(meetupId)
        const promises: Promise<unknown>[] = []
        promises.push(this.meetupRepository.remove(groupId, meetupId))
        for (const timeslotId of toBeRemoved)
            promises.push(this.timeslotRepository.remove(groupId, meetupId, timeslotId))
        await Promise.all(promises)
        return meetupId
    }
}
