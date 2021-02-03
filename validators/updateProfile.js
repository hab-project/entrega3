const Joi = require('joi');

const updateProfileValidator = Joi.object({
    name: Joi.string()
        .required(),

    surnames: Joi.string()
        .required(),

    address: Joi.string()
        .required(),

    location: Joi.string()
        .required(),

    phone: Joi.string()
        .required()

})

module.exports = {
    updateProfileValidator
}