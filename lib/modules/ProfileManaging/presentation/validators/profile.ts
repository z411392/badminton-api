import Joi from "joi"

export const levelId = Joi.string().required().messages({
    "any.required": "必須選擇分級",
    "string.empty": `必須選擇分級`,
})
export const name = Joi.string().required().max(30).messages({
    "any.required": "必須填寫稱呼",
    "string.empty": `必須填寫稱呼`,
    "string.max": `稱呼最多 {#limit} 個字`,
})
export const line = Joi.string().required().max(30).messages({
    "any.required": "必須填寫 LINE ID",
    "string.empty": `必須填寫 LINE ID`,
    "string.max": `LINE ID 最多 {#limit} 個字`,
})
