import Joi from "joi"

export const name = Joi.string().required().min(2).max(30).messages({
    "any.required": `必須填寫地點`,
    "string.empty": `必須填寫地點`,
    "string.min": `地點至少 {#limit} 個字`,
    "string.max": `地點最多 {#limit} 個字`,
})
export const address = Joi.string().required().min(5).max(100).messages({
    "any.required": `必須填寫地址`,
    "string.empty": `必須填寫地址`,
    "string.min": `地址至少 {#limit} 個字`,
    "string.max": `地址最多 {#limit} 個字`,
})
export const building = Joi.string().required().max(15).allow("").messages({
    "any.required": `必須填寫樓館名稱`,
    "string.empty": `必須填寫樓館名稱`,
    "string.max": `樓館名稱最多 {#limit} 個字`,
})
export const floor = Joi.number().required().integer().messages({
    "any.required": `必須填寫樓層`,
    "number.base": "樓層只能是數字",
    "number.integer": `樓層只能是整數`,
})
export const latitude = Joi.number().required().messages({
    "any.required": `必須填寫緯度`,
    "number.base": "緯度只能是數字",
})
export const longitude = Joi.number().required().messages({
    "any.required": `必須填寫經度`,
    "number.base": "經度只能是數字",
})
