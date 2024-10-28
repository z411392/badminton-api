import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore } from "firebase-admin/firestore"
import { MeetupDao } from "@/adapters/firestore/MeetupDao"

export type CountingMeetups = {
    search: string
}

export class CountMeetups extends CallableInstance<[string, string, CountingMeetups], Promise<number>> {
    protected logger: ConsolaInstance
    protected meetupDao: MeetupDao

    constructor({ db }: { db: Firestore }) {
        super("execute")
        this.logger = createConsola().withTag(`CountMeetups`)
        this.meetupDao = new MeetupDao({ db })
    }
    async execute(userId: string, groupId: string, { search }: CountingMeetups) {
        const count = await this.meetupDao.count({ groupId, search })
        return count
    }
}
