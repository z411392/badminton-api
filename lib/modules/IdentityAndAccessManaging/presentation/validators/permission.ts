import Joi from "joi"
import { PermissionStatuses } from "@/modules/IdentityAndAccessManaging/dtos/PermissionStatuses"

export const permissionId = Joi.string().required().messages({
    "any.required": `未指定 permissionId`,
    "string.empty": `未指定 permissionId`,
})
export const status = Joi.string()
    .required()
    .valid(...Object.values(PermissionStatuses))
    .messages({
        "any.required": `未指定 status`,
        "string.empty": `未指定 status`,
        "any.invalid": `狀態只能是 ${Object.values(PermissionStatuses).join("|")}`,
    })
