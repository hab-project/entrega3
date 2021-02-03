require('dotenv').config()

const bodyParser = require('body-parser')
const express = require('express')
const fileUpload = require("express-fileupload");
const cors = require('cors')

const {
    login,
    logout,
    goToUpdatePassword,
    recoverPassword,
    register,
    updateRecoveredPassword,
    updateUserPassword,
    updateProfile,
    validateRegister
} = require('./controllers/authentication')

const {
    addImageBook,
    deleteImageBook,
    getPetitions,
    goToActivateBook,
    setPetition,
    updateBook,
    uploadBook,
} = require('./controllers/books')

const {
    deleteChat,
    deleteMessage,
    getChatMessages,
    getListOfChats,
    sendInitialMessage,
    sendReplyMessage
} = require('./controllers/messages')

const {
    cancelTransaction,
    confirmTransaction,
    createTransaction,
    getListOfPurchases,
    getListOfSales,
    getListOfTransactions,
    getUserReviews,
    putReviewToSeller
} = require('./controllers/transactions')

const search = require('./db/queryConstructor')

const {
    isAuthenticated
} = require('./middlewares/auth')

const app = express()

app.use(cors())


/**
 * Los siguientes middlewares son necesarios para 
 * acceder fácilmente a los campos pasados en las peticiones POST/PUT
 * donde la información viene en el body
 */
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
// peticiones de tipo form-data, necesarias para enviar ficheros
app.use(fileUpload());

const DEFAULT_PORT = 3333

const currentPort = process.env.PORT || DEFAULT_PORT

/**
 * Crear un nuevo usuario
 */
app.post('/user', register)


/**
 * Validar el registro de un usuario
 */
app.get('/user/validate/:code', validateRegister)


/**
 * Autenticar usuario
 */
app.post('/user/login', login)


/**
 * Desautenticar usuario
 */
app.post('/user/logout', logout)


/**
 * Actualizar la password
 */
app.put('/update-password', isAuthenticated, updateUserPassword)


/**
 * Petición de nueva password. Endpoint encargado
 * de enviar un correo con el código de actualización 
 * para recuperar la password 
 */
app.post('/user/recover-password', recoverPassword)
/**
 * Endpoint encargado de verificar el codigo de
 * recuperación de password enviado al email y
 * de redirigir al endpoint donde actualizaremos
 * con la nueva password 
 */
app.get('/user/password/reset/:code', goToUpdatePassword)
/**
 * Actualizar la password (recuperación de password)
 */
app.put('/update-reset-password/:id', updateRecoveredPassword)


/**
 * Actualizar perfil del usuario
 */
app.put('/user/profile/:id', isAuthenticated, updateProfile)    


/**
 * Subir un libro
 */
app.post('/upload', isAuthenticated, uploadBook)
/**
 * Endpoint encargado de verificar el codigo de
 * activación del libro enviado al email del 
 * administrador para su revision previa 
 */
app.get('/upload/activate/:code', goToActivateBook)


/**
 * Reservar/solicitar compra de libro
 */
app.post('/booking/:id', isAuthenticated, createTransaction)


/**
 * Aceptar venta de libro
 * cuando el vendedor pulsa en "confirmar",
 * el sistema le indica que introduzca el 
 * lugar y la fecha de entrega del libro,
 * una vez introducidos éstos, al confirmar
 * vamos al siguiente endpoint:
 */
app.put('/confirm-transaction/:id', isAuthenticated, confirmTransaction)


/**
 * Cancelar reserva/solicitud de libro
 */
app.put('/booking-cancel/:id', isAuthenticated, cancelTransaction)


/**
 * Actualizar datos de un libro
 */
app.put('/update-book/:id', isAuthenticated, updateBook)


/**
 * Añadir foto de un libro
 */
app.put('/update-book/images/:id', isAuthenticated, addImageBook)


/**
 * Borrar foto de un libro
 */
app.delete('/update-book/images/delete/:id', isAuthenticated, deleteImageBook)


/**
 * Ver historial de transacciones
 */
app.get('/user/transactions', isAuthenticated, getListOfTransactions)


/**
 * Ver historial de compras
 */
app.get('/user/transactions-purchases', isAuthenticated, getListOfPurchases)


/**
 * Ver historial de ventas
 */
app.get('/user/transactions-sales', isAuthenticated, getListOfSales)


/**
 * Enviar valoración al vendedor
 */
app.put('/transaction-review/:id', isAuthenticated, putReviewToSeller)


/**
 * Ver valoraciones
 */
app.get('/user/transactions/reviews', isAuthenticated, getUserReviews)


/**
 * Enviar mensaje inicial
 * (potencial comprador a vendedor)
 */
app.post('/messages-init/:id', isAuthenticated, sendInitialMessage)


/**
 * Ver panel de chats
 * (agrupados por libro)
 */
app.get('/messages-chats', isAuthenticated, getListOfChats)


/**
 * Ver mensajes de un chat
 */
app.get('/messages-chat/:id', isAuthenticated, getChatMessages)


/**
 * Responder mensaje en chat
 */
app.post('/messages-chat/send/:id', isAuthenticated, sendReplyMessage)


/**
 * Borrar mensaje en chat
 */
app.put('/messages-chat/deletemsg/:id', isAuthenticated, deleteMessage)


/**
 * Borrar chat
 */
app.put('/messages-chat/deletechat/:id', isAuthenticated, deleteChat)


/**
 * Realizar/modificar petición
 */
app.post('/user/requests/new', isAuthenticated, setPetition)


/**
 * Ver peticiones realizadas
 */
app.get('/user/requests', isAuthenticated, getPetitions)


/**
 * Búsquedas de libro por filtros
 */
app.get('/books', search)



console.log(`Running on port ${currentPort}`)
app.listen(currentPort)