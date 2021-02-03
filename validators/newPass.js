const Joi = require('joi');

const newPassValidator = Joi.object({
    newPassword: Joi.string()
        .required()
        .pattern(new RegExp('^[a-zA-Z0-9]{8,12}$')),

    repeatNewPassword: Joi.ref('newPassword')
})

module.exports = {
    newPassValidator
}