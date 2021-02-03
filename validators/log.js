const Joi = require('joi');

const logValidator = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .error(
            new Error('email should be a standard email')
        ),

    password: Joi.string()
        .required()
        .pattern(new RegExp('^[a-zA-Z0-9]{8,12}$')),

})

module.exports = {
    logValidator
}