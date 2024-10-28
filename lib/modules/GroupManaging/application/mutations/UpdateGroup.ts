import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { GroupDao } from "@/adapters/firestore/GroupDao"
import { GroupRepository } from "@/adapters/firestore/GroupRepository"
import { GroupConflict } from "@/modules/GroupManaging/errors/GroupConflict"
import { PermissionDao } from "@/adapters/firestore/PermissionDao"
import { type Group } from "@/modules/GroupManaging/dtos/Group"
import { PermissionRepository } from "@/adapters/firestore/PermissionRepository"
import { filePathFor, putObject } from "@/utils/storage"
import { MustBeImage } from "@/modules/GroupManaging/errors/MustBeImage"
import { GroupNotFound } from "@/modules/GroupManaging/errors/GroupNotFound"
import { PermissionDenied } from "@/modules/IdentityAndAccessManaging/errors/PermissionDenied"

export type UpdatingGroup = {
    name: string
    photo: string
    contactUs: string
}

export class UpdateGroup extends CallableInstance<[string, string, UpdatingGroup], Promise<{ groupId: string }>> {
    protected logger: ConsolaInstance
    protected groupDao: GroupDao
    protected groupRepository: GroupRepository
    protected permissionDao: PermissionDao
    protected permissionRepository: PermissionRepository
    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`UpdateGroup`)
        this.groupDao = new GroupDao({ db })
        this.groupRepository = new GroupRepository({ db, transaction })
        this.permissionDao = new PermissionDao({ db })
        this.permissionRepository = new PermissionRepository({ db, transaction })
    }
    async execute(userId: string, groupId: string, { name, photo, contactUs }: UpdatingGroup) {
        const anotherGroupId = await this.groupDao.findOne({ name })
        if (anotherGroupId && anotherGroupId !== groupId) throw new GroupConflict({ name })
        const groupExists = await this.groupRepository.get(groupId)
        if (!groupExists) throw new GroupNotFound({ groupId })
        const permissionId = PermissionRepository.nextId({ groupId, userId })
        const permissionExists = await this.permissionRepository.get(permissionId)
        if (!permissionExists) throw new PermissionDenied()
        const buffer = Buffer.from(photo, "base64")
        const photoPath = await filePathFor(buffer)
        const [type] = photoPath.split("/")
        if (!(type === "jpg" || type === "png")) throw new MustBeImage({ expected: ["jpg", "png"], actual: type })
        await putObject(buffer)
        const group: Group = {
            ...groupExists,
            name,
            photoPath,
            contactUs,
        }
        await this.groupRepository.set(groupId, group)
        return groupId
    }
}
