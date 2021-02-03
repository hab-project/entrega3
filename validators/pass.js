const Joi = require('joi');

const passValidator = Joi.object({
    password: Joi.string()
        .required()
        .pattern(new RegExp('^[a-zA-Z0-9]{8,12}$')),

    newPassword: Joi.string()
        .required()
        .pattern(new RegExp('^[a-zA-Z0-9]{8,12}$')),

    repeatNewPassword: Joi.ref('newPassword')
})

module.exports = {
    passValidator
}