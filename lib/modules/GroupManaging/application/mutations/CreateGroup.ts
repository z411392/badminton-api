import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { GroupDao } from "@/adapters/firestore/GroupDao"
import { GroupRepository } from "@/adapters/firestore/GroupRepository"
import { GroupConflict } from "@/modules/GroupManaging/errors/GroupConflict"
import { PermissionDao } from "@/adapters/firestore/PermissionDao"
import { GroupCreatingInProgress } from "@/modules/GroupManaging/errors/GroupCreatingInProgress"
import { type Group } from "@/modules/GroupManaging/dtos/Group"
import { PermissionRepository } from "@/adapters/firestore/PermissionRepository"
import { type Permission } from "@/modules/IdentityAndAccessManaging/dtos/Permission"
import { PermissionStatuses } from "@/modules/IdentityAndAccessManaging/dtos/PermissionStatuses"
import { Roles } from "@/modules/IdentityAndAccessManaging/dtos/Roles"
import { filePathFor, putObject } from "@/utils/storage"
import { MustBeImage } from "@/modules/GroupManaging/errors/MustBeImage"

export type CreatingGroup = {
    name: string
    photo: string
    contactUs: string
}

export class CreateGroup extends CallableInstance<[string, CreatingGroup], Promise<{ groupId: string }>> {
    protected logger: ConsolaInstance
    protected groupDao: GroupDao
    protected groupRepository: GroupRepository
    protected permissionDao: PermissionDao
    protected permissionRepository: PermissionRepository
    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`CreateGroup`)
        this.groupDao = new GroupDao({ db })
        this.groupRepository = new GroupRepository({ db, transaction })
        this.permissionDao = new PermissionDao({ db })
        this.permissionRepository = new PermissionRepository({ db, transaction })
    }
    async execute(userId: string, { name, photo, contactUs }: CreatingGroup) {
        const anotherGroupId = await this.groupDao.findOne({ name })
        if (anotherGroupId) throw new GroupConflict({ name })
        const buffer = Buffer.from(photo, "base64")
        const photoPath = await filePathFor(buffer)
        const [type] = photoPath.split("/")
        if (!(type === "jpg" || type === "png")) throw new MustBeImage({ expected: ["jpg", "png"], actual: type })
        const groupId = GroupRepository.nextId()
        console.log(groupId)
        const isWaitingForGroupCreation = await this.permissionDao.isWaitingForGroupCreation(userId)
        if (isWaitingForGroupCreation) throw new GroupCreatingInProgress({ userId })
        await putObject(buffer)
        const group: Group = {
            name,
            id: groupId,
            photoPath,
            contactUs,
        }
        const permissionId = PermissionRepository.nextId({ groupId, userId })
        const permission: Permission = {
            groupId,
            userId,
            id: permissionId,
            status: PermissionStatuses.Pending,
            role: Roles.Member,
        }
        await this.groupRepository.set(groupId, group)
        await this.permissionRepository.set(permissionId, permission)
        return groupId
    }
}
