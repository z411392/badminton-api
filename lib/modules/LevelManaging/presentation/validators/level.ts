import Joi from "joi"

export const name = Joi.string().required().min(2).max(10).messages({
    "any.required": `必須填寫級別名稱`,
    "string.empty": `必須填寫級別名稱`,
    "string.min": `級別名稱至少 {#limit} 個字`,
    "string.max": `級別名稱最多 {#limit} 個字`,
})
export const order = Joi.number().required().integer().min(0).messages({
    "any.required": `必須填寫級別`,
    "number.base": "級別只能是數字",
    "number.integer": `級別只能是整數`,
    "number.min": `級別只能是自然數`,
})
export const description = Joi.string().required().allow("").max(100).messages({
    "any.required": `必須填寫分級說明`,
    "string.empty": `必須填寫分級說明`,
    "string.max": `分級說明最多 {#limit} 個字`,
})
