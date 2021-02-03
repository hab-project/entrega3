const db = require('../db/mysql')
const utils = require('../utils/utils')

const { transferValidator } = require('../validators/transfer')

const createTransaction = async (req, res) => {
    const { id } = req.params;
    const decodedToken = req.auth

    try {
        const book = await db.getBook(id)

        // Verificamos que el usuario que realiza la 
        // transaccion no es el propio vendedor
        if (decodedToken.id === book.id_user) {
            res.status(401).send()
            return
        }
        if (!book.available) {
            res.status(401).send()
            return
        }
        // obtenemos los datos del vendedor
        const seller = await db.getUserById(book.id_user)

        // creamos la transacción (donde: se completa 
        // la transacción actual y se cancelan las demás
        // asociadas al libro si las hubiese, y se pasa
        // el estado del libro a 'no disponible')
        if (seller.active) {
            await db.createTransaction(id, decodedToken.id)
        } else {
            res.status(401).send()
            return
        }

        // enviamos un email informativo a vendedor
        // y comprador
        utils.sendBookingMail(seller.email, decodedToken.email, book.title, book.course, `http://${process.env.PUBLIC_DOMAIN}/user/login`)

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

const confirmTransaction = async (req, res) => {
    const { id } = req.params;
    const { place, date } = req.body
    const decodedToken = req.auth

    try {
        // antes de actualizar con lugar y fecha de entrega se valida que éstos vayan en el formato correcto
        // con un validator
        await transferValidator.validateAsync(req.body)

        const transaction = await db.getTransaction(id)
        const book = await db.getBook(transaction.id_book)
        let buyer = await db.getUserById(transaction.id_buyer)
        console.log(transaction)
        // Verificamos que el usuario que confirma
        // la transaccion es el propio vendedor
        if (decodedToken.id !== book.id_user) {
            res.status(400).send()
            return
        }
        if (!buyer.active) {
            res.status(400).send()
            return
        }

        // se completa la transacción actual y 
        // se cancelan las demás asociadas al
        // libro si las hubiese, enviando emails
        // informativos, y se pasa el estado 
        // del libro a 'no disponible'

        await db.completeTransaction(id, place, date)
        utils.sendCompletedTransactionMail(decodedToken.email, buyer.email, book.title, book.course, place, date, `http://${process.env.PUBLIC_DOMAIN}/user/login`)
        await db.deleteBook(transaction.id_book)

        let cancelled = await db.getTransactionsToCancel(book.id)

        if (cancelled) {
            for (let item of cancelled) {
                buyer = await db.getUserById(item.id_buyer)
                await db.cancelTransaction(item.id)
                utils.sendCanceledTransactionMail(decodedToken.email, buyer.email, book.title, book.course, id, `http://${process.env.PUBLIC_DOMAIN}/user/login`)
            }
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

    res.send()
}

const cancelTransaction = async (req, res) => {
    const { id } = req.params;
    const decodedToken = req.auth

    try {
        const transaction = await db.getTransaction(id)
        const book = await db.getBook(transaction.id_book)
        const buyer = await db.getUserById(transaction.id_buyer)

        if (transaction.status !== 'en proceso') {
            res.status(400).send()
            return
        }
        // Verificamos que el usuario que cancela
        // la transaccion es el vendedor o el comprador
        if (decodedToken.id !== book.id_user && decodedToken.id !== transaction.id_buyer) {
            res.status(400).send()
            return
        }
        await db.cancelTransaction(id)
        utils.sendCanceledTransactionMail(decodedToken.email, buyer.email, book.title, book.course, id, `http://${process.env.PUBLIC_DOMAIN}/user/login`)
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

const getListOfTransactions = async (req, res) => {
    const decodedToken = req.auth

    try {
        const transactions = await db.getListOfTransactionsOfUser(decodedToken.id)
        res.send(transactions)
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

const getListOfPurchases = async (req, res) => {
    const decodedToken = req.auth
    try {
        const transactions = await db.getListOfTransactionsOfUser(decodedToken.id)
        let purchases = []

        if (transactions) {
            purchases = transactions.filter(transaction => transaction.id_buyer === decodedToken.id)
            res.send(purchases)
            return
        } else {
            res.send('Aún no has realizado ninguna compra')
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

const getListOfSales = async (req, res) => {
    const decodedToken = req.auth
    try {
        const transactions = await db.getListOfTransactionsOfUser(decodedToken.id)

        if (transactions) {
            const sales = transactions.filter(transaction => transaction.id_buyer !== decodedToken.id)
            res.send(sales)
        } else {
            res.send('Aún no tienes transacciones de venta')
            return
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

const getUserReviews = async (req, res) => {
    const decodedToken = req.auth
    try {
        const transactions = await db.getListOfTransactionsOfUser(decodedToken.id)

        if (transactions) {
            const reviews = transactions
                .filter((transaction) => (transaction.id_buyer !== decodedToken.id) && (transaction.status === 'completado'))
                .map(transaction => {
                    let review = {
                        id: transaction.id,
                        id_book: transaction.id_book,
                        id_buyer: transaction.id_buyer,
                        review: transaction.review
                    }
                    return review
                })

            res.send(reviews)
            return
        } else {
            res.send('Aún no tienes transacciones de venta')
            return
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

const putReviewToSeller = async (req, res) => {
    const { id } = req.params;
    const { review } = req.body
    const decodedToken = req.auth
    const now = new Date();
    console.log(now)
    try {
        const transaction = await db.getTransaction(id)

        if (transaction.id_buyer !== decodedToken.id) {
            res.status(400).send()
            return
        }

        if (transaction.transfer_date > now) {
            res.send('No es posible realizar la valoración antes de realizar la entrega')
            return
        }
        await db.updateTransactionWithReview(id, review)
        res.send()
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


module.exports = {
    cancelTransaction,
    confirmTransaction,
    createTransaction,
    getListOfPurchases,
    getListOfSales,
    getListOfTransactions,
    getUserReviews,
    putReviewToSeller
}