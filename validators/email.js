const Joi = require('joi');

const emailValidator = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .error(
            new Error('email should be a standard email')
        ),
})

module.exports = {
    emailValidator
}