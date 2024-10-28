import Joi from "joi"

export const name = Joi.string().required().max(30).messages({
    "any.required": `必須填寫球團名稱`,
    "string.empty": `必須填寫球團名稱`,
    "string.max": `球團名稱最多 {#limit} 個字`,
})
export const photo = Joi.string().required().messages({
    "any.required": `必須上傳球團大頭照`,
    "string.empty": `必須上傳球團大頭照`,
})
export const contactUs = Joi.string().required().max(50).messages({
    "any.required": `必須填寫聯絡方式（LINE）`,
    "string.empty": `必須填寫聯絡方式（LINE）`,
    "string.max": `聯絡方式（LINE）最多 {#limit} 個字`,
})
