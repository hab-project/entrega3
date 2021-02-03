const db = require('../db/mysql')
const utils = require('../utils/utils')

const uuid = require('uuid');
const randomstring = require("randomstring");

const fsPromises = require('fs').promises

const { bookValidator } = require('../validators/book')

const uploadBook = async (req, res) => {
    const { isbn, title, course, editorial, editionYear, price, detail } = req.body
    const decodedToken = req.auth

    try {
        await bookValidator.validateAsync(req.body)

        const activationCode = randomstring.generate(40);

        await db.uploadBook(isbn, title, course, editorial, editionYear, price, detail, activationCode, decodedToken.id)

        utils.sendReqAuthorizationMail(isbn, title, course, editorial, editionYear, price, detail, `http://${process.env.PUBLIC_DOMAIN}/upload/activate/${activationCode}`)

    } catch (e) {
        let statusCode = 400;
        // averiguar el tipo de error para enviar un código u otro
        if (e.message === 'database-error') {
            statusCode = 500
        }

        res.status(statusCode).send(e.message)
        return
    }

    res.send()
}

const goToActivateBook = async (req, res) => {
    // http://ip:puerto/upload/activate/lkj414j234lkj23142134lk2j34lñk2j42334
    const { code } = req.params;

    try {
        const book = await db.checkBookActivationCode(code)
        if (book) {
            await db.activateBook(book.id)
            const user = await db.getUserById(book.id_user)
            utils.sendConfirmationUploadedMail(user.email, book.isbn, book.title, `http://${process.env.PUBLIC_DOMAIN}/user/login`)
        } else {
            res.status(400).send()
            return
        }
        // comprobamos posibles peticiones de usuarios de ese isbn
        const requests = await db.checkRequests(book.isbn)

        if (requests.length > 0) {
            const actives = requests.filter(user => user.active)
            for (let user of actives) {
                utils.sendPetitionRequiredMail(email, isbn, title, `http://${process.env.PUBLIC_DOMAIN}/user/login`)
            }
        }

        res.send('Validado correctamente')
    } catch (e) {
        res.status(401).send('Usuario no validado')
    }
}

const updateBook = async (req, res) => {
    const { id } = req.params
    const { isbn, title, course, editorial, editionYear, price, detail } = req.body
    const decodedToken = req.auth

    try {
        await bookValidator.validateAsync(req.body)

        const book = await db.getBook(id)

        if (decodedToken.id !== book.id_user) {
            res.status(400).send()
            return
        }

        if (!book.available) {
            res.status(400).send()
            return
        }



        await db.updateBook(isbn, title, course, editorial, editionYear, price, detail, id)
        
        if (req.files) {
            // si hiciese falta comprobar la extensión del fichero
            // podríamos hacerlo aquí a partir de la información de req.files
            // y enviar un error si no es el tipo que nos interesa (res.status(400).send())

            await fsPromises.mkdir(`${process.env.TARGET_FOLDER}/books`, { recursive: true })


            const fileID = uuid.v4()
            const outputFileName = `${process.env.TARGET_FOLDER}/books/${fileID}.jpg`

            await fsPromises.writeFile(outputFileName, req.files.image.data)

            // guardar una referencia a este UUID En la base de datos, de forma que
            // cuando nos pidan la lista de nuestros recursos (productos, conciertos, etc) o 
            // el detalle de uno de ellos, accedemos a la BBDD para leer los UUID, y después el
            // front llamará al GET con el UUID correspondiente
            await db.uploadImage(outputFileName, id)
        }

    } catch (e) {
        let statusCode = 400;
        // averiguar el tipo de error para enviar un código u otro
        if (e.message === 'database-error') {
            statusCode = 500
        }

        res.status(statusCode).send(e.message)
        return
    }

    res.send('Datos actualizados correctamente')
}

const addImageBook = async (req, res) => {
    const { id } = req.params
    const decodedToken = req.auth

    try {
        const book = await db.getBook(id)

        if (decodedToken.id !== book.id_user) {
            res.status(400).send()
            return
        }

        if (!book.available) {
            res.status(400).send()
            return
        }

        if (req.files) {
            // si hiciese falta comprobar la extensión del fichero
            // podríamos hacerlo aquí a partir de la información de req.files
            // y enviar un error si no es el tipo que nos interesa (res.status(400).send())

            await fsPromises.mkdir(`${process.env.TARGET_FOLDER}/books`, { recursive: true })


            const fileID = uuid.v4()
            const outputFileName = `${process.env.TARGET_FOLDER}/books/${fileID}.jpg`

            await fsPromises.writeFile(outputFileName, req.files.image.data)

            // guardar una referencia a este UUID En la base de datos, de forma que
            // cuando nos pidan la lista de nuestros recursos (productos, conciertos, etc) o 
            // el detalle de uno de ellos, accedemos a la BBDD para leer los UUID, y después el
            // front llamará al GET con el UUID correspondiente
            await db.uploadImage(outputFileName, id)
        }

    } catch (e) {
        let statusCode = 400;
        // averiguar el tipo de error para enviar un código u otro
        if (e.message === 'database-error') {
            statusCode = 500
        }

        res.status(statusCode).send(e.message)
        return
    }

    res.send('Datos actualizados correctamente')
}

const deleteImageBook = async (req, res) => {
    const { id } = req.params
    const decodedToken = req.auth

    try {
        const image = await db.getImage(id)
        let book = {}
        if (image) {
            book = await db.getBook(image.id_book)
        } else {
            res.status(400).send()
            return
        }
        
        if (decodedToken.id !== book.id_user) {
            res.status(400).send()
            return
        }

        if (!book.available) {
            res.status(400).send()
            return
        }

        await db.deleteImageBook(id)

    } catch (e) {
        let statusCode = 400;
        // averiguar el tipo de error para enviar un código u otro
        if (e.message === 'database-error') {
            statusCode = 500
        }

        res.status(statusCode).send(e.message)
        return
    }

    res.send('Datos actualizados correctamente')
}

const getPetitions = async (req, res) => {
    const decodedToken = req.auth

    try {
        const petitions = await db.getPetitionsOfUser(decodedToken.id)
        if (petitions.length !== 0) {
            res.send(petitions)
            return
        } else {
            res.send('No tienes peticiones')
        }

    } catch (e) {
        let statusCode = 400;
        // averiguar el tipo de error para enviar un código u otro
        if (e.message === 'database-error') {
            statusCode = 500
        }

        res.status(statusCode).send(e.message)
        return
    }
}

const setPetition = async (req, res) => {
    const decodedToken = req.auth
    const { isbn, petIndex } = req.body

    try {
        await db.setPetitionOfUser(decodedToken.id, isbn, petIndex)

    } catch (e) {
        let statusCode = 400;
        // averiguar el tipo de error para enviar un código u otro
        if (e.message === 'database-error') {
            statusCode = 500
        }

        res.status(statusCode).send(e.message)
        return
    }
    res.send()
    return
}

module.exports = {
    addImageBook,
    deleteImageBook,
    getPetitions,
    goToActivateBook,
    setPetition,
    updateBook,
    uploadBook,
}