const Joi = require('joi');

const transferValidator = Joi.object({
    place: Joi.string()
        .min(3)
        .max(50)
        .required(),

    date: Joi.date()
        .iso('YYYY-MM-DDThh:mm:ss.sssZ')
        .required()

})

module.exports = {
    transferValidator
}