import Joi from "joi"
import { SignUpStatuses } from "@/modules/SignUpManaging/dtos/SignUpStatuses"

export const status = Joi.string()
    .required()
    .allow(...Object.values(SignUpStatuses))
    .required()
    .messages({
        "any.required": `必須指定 status`,
        "string.empty": `必須指定 status`,
        "any.invalid": `status 只能是 ${Object.values(SignUpStatuses).join("|")}`,
    })
