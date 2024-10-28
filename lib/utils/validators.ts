import Joi, { type CustomHelpers } from "joi"
import { DateTime } from "luxon"
import { DatetimeFormats } from "@/constants"

export const date = Joi.string()
    .required()
    .custom((value: string, helper: CustomHelpers) => {
        if (DateTime.fromFormat(value, DatetimeFormats.ISO8601DATE).toFormat(DatetimeFormats.ISO8601DATE) === value)
            return value
        return helper.message({
            custom: "日期不符合格式",
        })
    })
    .messages({
        "any.required": `必須填寫日期`,
        "string.empty": `必須填寫日期`,
    })
export const time = Joi.string()
    .required()
    .custom((value: string, helper: CustomHelpers) => {
        const datetime = DateTime.fromFormat(
            `${DateTime.now().toFormat(DatetimeFormats.ISO8601DATE)} ${value}:00`,
            DatetimeFormats.ISO8601,
        )
        if (datetime.toFormat(`HH:mm`) === value) return value
        return helper.message({
            custom: "時間不符合格式",
        })
    })
    .messages({
        "any.required": `必須填寫時間`,
        "string.empty": `必須填寫時間`,
    })
export const color = Joi.string()
    .required()
    .custom((value: string, helper: CustomHelpers) => {
        const matched = /^#[0-9A-Fa-f]{3,6}$/.test(value)
        if (matched) return value
        return helper.message({
            custom: "請填寫正確的顏色代碼",
        })
    })
    .messages({
        "any.required": `必須填寫顏色代碼`,
        "string.empty": `必須填寫顏色代碼`,
    })
export const page = Joi.number().required().integer().positive().default(1)
export const index = Joi.number().required().integer().min(0).messages({
    "any.required": `必須填寫索引值`,
    "number.integer": `索引值只能是整數`,
    "number.min": `索引值只能是自然數`,
})
export const search = Joi.string().allow(null, "").empty([null, ""]).max(30).default("")
