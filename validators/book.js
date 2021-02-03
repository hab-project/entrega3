const Joi = require('joi');

const bookValidator = Joi.object({
    isbn: Joi.string()
        .required(),

    title: Joi.string()
        .required(),

    course: Joi.string()
        .required(),

    editorial: Joi.string(),
    
    editionYear: Joi.number()
        .integer(),

    price: Joi.number()
        .precision(2)
        .required(),

    detail: Joi.string()
        .max(200)

})

module.exports = {
    bookValidator
}