const Joi = require('joi');

const authValidator = Joi.object({
    name: Joi.string()
        .required(),

    surnames: Joi.string()
        .required(),

    address: Joi.string()
        .required(),

    location: Joi.string()
        .required(),

    phone: Joi.string()
        .required(),

    email: Joi.string()
        .email()
        .required()
        .error(
            new Error('email should be a standard email')
        ),

    password: Joi.string()
        .required()
        .pattern(new RegExp('^[a-zA-Z0-9]{8,12}$'))

})

module.exports = {
    authValidator
}