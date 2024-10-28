import Joi from "joi"
import { timeslot } from "@/modules/MeetupManaging/presentation/validators/Timeslot"

export const name = Joi.string().required().max(30).messages({
    "any.required": `必須填寫標題`,
    "string.empty": `必須填寫標題`,
    "string.max": `標題最多 {#limit} 個字`,
})
export const description = Joi.string().required().allow("").max(500).messages({
    "any.required": `必須填寫說明`,
    "string.empty": `必須填寫說明`,
    "string.max": `說明最多 {#limit} 個字`,
})
export const venueId = Joi.string().required().messages({
    "any.required": `必須選擇場地`,
    "string.empty": `必須選擇場地`,
})
export const shuttleId = Joi.string().messages({
    "any.required": `必須選擇用球`,
    "string.empty": `必須選擇用球`,
})
export const shuttleIds = Joi.array().items(shuttleId).min(1).messages({
    "any.required": `必須選擇用球`,
    "array.min": `必須選擇用球`,
})
export const playlistId = Joi.string().allow(null).default(null)
export const timeslots = Joi.array().required().items(timeslot).min(1).messages({
    "any.required": `必須填寫場次資訊`,
    "array.min": `請至少新增一個場次`,
})
