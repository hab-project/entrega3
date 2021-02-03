const moment = require('moment')

const { getConnection } = require("./db");

const performQuery = async (query, params) => {
    let connection;
    
    try {
        connection = await getConnection();

        const [result] = await connection.query(query, params)
        // console.log(result)
        
        return result;
    } catch (e) {
        throw new Error('database-error')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

const activateBook = async (id) => {
    const query = `update books SET available = true where id=?`
    const params = [id]

    await performQuery(query, params)
}

const cancelTransaction = async (id) => {
    const query = `update transactions set status = 'cancelado' where id=?`
    const params = [id]

    await performQuery(query, params)
}

const checkBookActivationCode = async (code) => {
    // comprobar si existe un libro que esté pendiente de activación
    const query = `select * from books where activationCode = ?`
    const params = [code]

    const [result] = await performQuery(query, params)
    return result;
    
   }

const checkChat = async (id_book, id_buyer) => {
    // comprobamos si ya existe un chat previo entre 
    // vendedor y comprador asociado al libro en cuestión
    const query = `select id_chat from messages where id_book=? and id_buyer=?`
    const params = [id_book, id_buyer]

    const [result] = await performQuery(query, params)
    return result;
}

const checkRequests = async (isbn) => {
    const query = `select email, active from users where petition_book_1=? or petition_book_2=? or petition_book_3=?`
    const params = [isbn, isbn, isbn]

    const result = await performQuery(query, params)
    return result;
}
    
const checkValidationCode = async (code) => {
    // comprobar si existe un usuario que esté pendiente de validación
    // y que el código de validación no haya caducado
    const query = `select * from users where validationCode = ? and expirationCodeDate>now()`
    const params = [code]

    const [result] = await performQuery(query, params)
    // si existe un usuario con ese código de validación
    // lo marcamos como activo y devolvemos el email
    // para enviar correo informativo
    if (result) {
        const query = `update users set active = true ,validationCode = '' where id=?`
        const id = result.id
        await performQuery(query, id)
        return result.email;
    } else {
        throw new Error('validation-error')
    }
}

const checkValidationCodeForPassword = async (code) => {
    // comprobar si existe un usuario que esté pendiente de validación
    // y que el código de validación no haya caducado
    const query = `select * from users where validationCode = ? and expirationCodeDate>now()`
    const params = [code]

    const result = await performQuery(query, params)
    // si existe un usuario con ese código de validación
    // reseteamos el código y devolvemos el usuario
    // para modificar la contraseña
    if (result) {
        const query = `update users set validationCode = '' where id=?`
        const id = result.id
        await performQuery(query, id)
        return result;
    } else {
        throw new Error('El código de recuperación de contraseña es erróneo o ha caducado')
    }
}

const completeTransaction = async (id, place, date) => {
    const query = `update transactions SET transfer_place = ?, transfer_date = ?, status = 'completado' where id=?`
    const params = [place, date, id]

    await performQuery(query, params)
}

const createTransaction = async (id_book, id_buyer) => {
    const query = `insert into transactions(id_book, id_buyer)
    VALUES(?, ?)`
    const params = [id_book, id_buyer]

    await performQuery(query, params)
}

const deleteBook = async (id) => {
    const query = `update books set available = false where id=?`
    const params = [id]

    await performQuery(query, params)
}

const deleteChatAsBuyer = async (id, id_user) => {
    const query = `update messages set visibleForBuyer = false where id_chat=? and id_buyer=?`
    const params = [id, id_user]

    await performQuery(query, params)
}

const deleteChatAsSeller = async (id, id_user) => {
    const query = `update messages set visibleForSeller = false where id_chat=? and id_seller=?`
    const params = [id, id_user]

    await performQuery(query, params)
}

const deleteImageBook = async (id) => {
    const query = `update images set visible = false where id=?`
    const params = [id]

    await performQuery(query, params)
}

const deleteMessageAsBuyer = async (id) => {
    const query = `update messages set visibleForBuyer = false where id=?`
    const params = [id]

    await performQuery(query, params)
}

const deleteMessageAsSeller = async (id) => {
    const query = `update messages set visibleForSeller = false where id=?`
    const params = [id]

    await performQuery(query, params)
}

const getAllMessagesOfUser = async (id) => {
    const query = `select * from messages where id_seller = ? or id_buyer = ? order by creation_date`
    const params = [id, id]

    const result = await performQuery(query, params)
    return result
}

const getBook = async (id) => {
    const query = `select * from books where id = ?`
    const params = [id]

    const [result] = await performQuery(query, params)
    return result
}

const getImage = async (id) => {
    const query = `select * from images where id = ?`
    const params = [id]

    const [result] = await performQuery(query, params)
    return result
}

const getListOfTransactionsOfUser = async (id) => {
    const query = `select * from transactions where id_book in (select id from books where id_user=?) or transactions.id_buyer=? 
        having transactions.status != 'cancelado'`
    const params = [id, id]

    const result = await performQuery(query, params)
    return result
}

const getMessageById = async (id) => {
    const query = `select * from messages where id = ?`
    const params = [id]

    const [result] = await performQuery(query, params)
    return result
}

const getMessagesOfChat = async (id_chat) => {
    const query = `select * from messages where id_chat = ?`
    const params = [id_chat]

    const result = await performQuery(query, params)
    return result
}

const getPetitionsOfUser = async (id) => {
    const query = `select petition_book_1, petition_book_2, petition_book_3 from users where id = ?`
    const params = [id]
    
    const result = await performQuery(query, params)
    return result
}

const getSellerByIdBook = async (id) => {
    const query = `select * from users where id = (select id_user from books where id=?)`
    const params = [id]

    const [result] = await performQuery(query, params)
    return result
}

const getSellerAndBuyerOfChat = async (id_chat) => {
    const query = `select id_seller, id_buyer from messages where id_chat=?`
    const params = [id_chat]

    const [result] = await performQuery(query, params)
    return result
}

const getTransaction = async (id) => {
    const query = `select * from transactions where id = ?`
    const params = [id]

    const [result] = await performQuery(query, params)
    return result
}

const getTransactionsToCancel = async (id_book) => {
    const query = `select * from transactions where id_book=? and status='en proceso'`
    const params = [id_book]

    const result = await performQuery(query, params)
    console.log(result)
    
    return result
}

const getUser = async (email) => {
    const query = `select * from users where email = ?`
    const params = [email]

    const [result] = await performQuery(query, params)
    return result
}

const getUserById = async (id) => {
    const query = `select * from users where id = ?`
    const params = [id]

    const [result] = await performQuery(query, params)
    return result
}

const register = async(name, surnames, address, location, phone, email, password, validationCode, preCreated) => {
    let query 
    let params
    if (preCreated) {

        query = `update users SET name = ?,
            surnames = ?,
            address = ?,
            location = ?,
            phone = ?,
            password = ?,
            validationCode = ?
            expirationCodeDate = addtime(now(), '0 2:0:0'),
            where email = ?`
        params = [name, surnames, address, location, phone, password, validationCode, email]        
    } else {
        query = `insert into users (name, surnames, address, location, phone, email, password, validationCode, expirationCodeDate) values (?,?,?,?,?,?,?,?,addtime(now(), '0 2:0:0'))`
        params = [name, surnames, address, location, phone, email, password, validationCode]        
    }
        
    await performQuery(query, params)
}

const sendMessage = async (id_chat, id_book, id_seller, id_buyer, id_destination, content) => {
    const query = `insert into messages(id_chat, id_book, id_seller, id_buyer, id_destination, content)
    VALUES(?, ?, ?, ?, ?, ?)`
    const params = [id_chat, id_book, id_seller, id_buyer, id_destination, content]

    await performQuery(query, params)
}

const setMessagesToViewed = async (id_chat, idUser) => {
    const query = `update messages SET viewed = true where id_chat = ? and id_destination = ?`
    const params = [id_chat, idUser]

    await performQuery(query, params)
}

const setPetitionOfUser = async (id, isbn, index) => {
    const query = `update users SET petition_book_${index} = ? where id = ?`
    const params = [isbn, id]
    
    await performQuery(query, params)
}

const updateBook = async (isbn, title, course, editorial, editionYear, price, detail, id) => {
    const query = `update books SET isbn = ?,
            title = ?,
            course = ?,
            editorial = ?,
            editionYear = ?,
            price = ?,
            detail = ?
            where id = ?`
    const params = [isbn, title, course, editorial, editionYear, price, detail, id]

    await performQuery(query, params)
}

const updatePassword = async (idUser, password) => {
    const query = `update users set password = ?, validationCode = '' where id=?`
    const params = [password, idUser]

    await performQuery(query, params)
}

const updateProfile = async(name, surnames, address, location, phone, id) => {
    const query = `update users SET name = ?,
            surnames = ?,
            address = ?,
            location = ?,
            phone = ?
            where id = ?`
    const params = [name, surnames, address, location, phone, id]        
    
        
    await performQuery(query, params)
}

const updateTransactionWithReview = async (id, review) => {
    const query = `update transactions SET review = ? where id=?`
    const params = [review, id]

    await performQuery(query, params)
}

const updateValidationCode = async (email, validationCode) => {
    const query = `update users SET validationCode = ?, expirationCodeDate = addtime(now(), '0 2:0:0') where email=?`
    const params = [validationCode, email]

    await performQuery(query, params)
}

const uploadBook = async (isbn, title, course, editorial, editionYear, price, detail, activationCode, idUser) => {
    const query = `INSERT INTO books(id_user, isbn, title, course, editorial, editionYear, price, detail, activationCode)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`
    const params = [idUser, isbn, title, course, editorial, editionYear, price, detail, activationCode]

    await performQuery(query, params)
}

const uploadImage = async (uuid, id_book) => {
    const query = `INSERT INTO images(uuid, id_book)
    VALUES(?, ?)`
    const params = [uuid, id_book]

    await performQuery(query, params)
}

const uploadProfilePhoto = async (filename, id) => {
    const query = `UPDATE users SET photo=? where id=?`
    const params = [filename, id]

    await performQuery(query, params)
}

module.exports = {
    activateBook,
    cancelTransaction,
    checkBookActivationCode,
    checkChat,
    checkRequests,
    checkValidationCode,
    checkValidationCodeForPassword,
    completeTransaction,
    createTransaction,
    deleteBook,
    deleteChatAsBuyer,
    deleteChatAsSeller,
    deleteImageBook,
    deleteMessageAsBuyer,
    deleteMessageAsSeller,
    getAllMessagesOfUser,
    getBook,
    getImage,
    getListOfTransactionsOfUser,
    getMessageById,
    getMessagesOfChat,
    getPetitionsOfUser,
    getSellerByIdBook,
    getSellerAndBuyerOfChat,
    getTransaction,
    getTransactionsToCancel,
    getUser,
    getUserById,
    register,
    sendMessage,
    setMessagesToViewed,
    setPetitionOfUser,
    updateBook,
    updatePassword,
    updateProfile,
    updateTransactionWithReview,
    updateValidationCode,
    uploadBook,
    uploadImage,
    uploadProfilePhoto
}