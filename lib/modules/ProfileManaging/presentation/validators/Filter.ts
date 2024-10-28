import Joi from "joi"

export const levelIds = Joi.array().items(Joi.string()).messages({
    "any.required": `必須指定要顯示的分級`,
})
