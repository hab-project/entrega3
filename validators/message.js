const Joi = require('joi');

const messageValidator = Joi.object({
    content: Joi.string()
        .min(4)
        .max(120)
        .error(
            new Error('invalid message')
        ),
})

module.exports = {
    messageValidator
}