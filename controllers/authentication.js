const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const randomstring = require("randomstring");
const uuid = require('uuid');
const fsPromises = require('fs').promises


const db = require('../db/mysql')
const utils = require('../utils/utils')

const { authValidator } = require('../validators/auth')
const { emailValidator } = require('../validators/email')
const { logValidator } = require('../validators/log')
const { newPassValidator } = require('../validators/newPass')
const { passValidator } = require('../validators/pass')
const { updateProfileValidator } = require('../validators/updateProfile')


const register = async (req, res) => {
        
    try {
        await authValidator.validateAsync(req.body)
                        
        const { name, surnames, address, location, phone, email, password } = req.body

        const passwordBcrypt = await bcrypt.hash(password, 10);

        const validationCode = randomstring.generate(40);

        const user = await db.getUser(email)
        
        if (user && user.active) {
            res.status(401).send()
            return
        }

        let preCreated = false

        if (user && !user.active) {
            preCreated = true
        }        

        await db.register(name, surnames, address, location, phone, email, passwordBcrypt, validationCode, preCreated)
        
        utils.sendConfirmationMail(email, `http://${process.env.PUBLIC_DOMAIN}/user/validate/${validationCode}`)

    } catch (e) {
        res.status(400).send()
        return
    }

    res.send()
}

const validateRegister = async (req, res) => {
    const { code } = req.params;

    try {
        const email = await db.checkValidationCode(code)
        
        if (email) {
            utils.sendVerificationMail(email, `http://${process.env.PUBLIC_DOMAIN}/user/login`)
        }
        res.send('Validado correctamente')
    } catch(e) {
        res.status(401).send('Usuario no validado')
    }
}

const login = async (req, res) => {
    
    const { email, password} = req.body

    try {
        await logValidator.validateAsync(req.body)
    } catch(e) {
        res.status(401).send('Usuario y/o contraseña incorrectos')
        return
    }
    
    const user = await db.getUser(email)
    
    if (!user) {
        res.status(401).send()
        return
    }

    if (!user.active) {
        res.status(401).send()
        return
    }

    const passwordIsvalid = await bcrypt.compare(password, user.password);

    if (!passwordIsvalid) {
        res.status(401).send()
        return
    }

    const tokenPayload = {
        id: user.id,
        name: user.name,
        surnames: user.surnames,
        email: user.email
    }

    const token = jwt.sign(tokenPayload, process.env.SECRET, {
        expiresIn: "1d"
    });

    res.json({
        token
    })
}

const updateUserPassword = async (req, res) => {
     
    const { password, newPassword, repeatNewPassword} = req.body
    
    const decodedToken = req.auth
    
    if (newPassword !== repeatNewPassword) {
        res.status(400).send('Los datos introducidos son incorrectos')
        return
    }

    try {
        await passValidator.validateAsync(req.body)
    } catch(e) {
        res.status(400).send('Validacion erronea')
        return
    }

    const user = await db.getUser(decodedToken.email)
    const passwordIsvalid = await bcrypt.compare(password, user.password);

    if (!passwordIsvalid) {
        res.status(401).send()
        return
    }

    const passwordBcrypt = await bcrypt.hash(newPassword, 10);

    await db.updatePassword(user.id, passwordBcrypt)

    res.send()
}

const recoverPassword = async (req, res) => {
    
    const { email } = req.body
    
    try {
        await emailValidator.validateAsync(req.body)
    } catch(e) {
        res.status(400).send('Email incorrecto')
        return
    }
    
    const user = await db.getUser(email)
         
    if (user && user.active) {
        const validationCode = randomstring.generate(40);
        await db.updateValidationCode(email, validationCode)
        utils.sendRecoverPasswordMail(email, `http://${process.env.PUBLIC_DOMAIN}/user/password/reset/${validationCode}`)
    } else {
        res.status(400).send('Email incorrecto')
        return
    }

    res.send('Se ha enviado un correo al email indicado para recuperar la contraseña')
}

const goToUpdatePassword = async (req, res) => {
    
    const { code } = req.params;

    try {
        const user = await db.checkValidationCodeForPassword(code)
        
        if (user && user.active) {
            // go to redireccion a otro endpoint con el user.id en 
            // req.params, donde se introducirá la contraseña dos veces
        }
        res.send()
    } catch(e) {
        res.status(401).send('Usuario no validado')
    }
}

const updateRecoveredPassword = async (req, res) => {
    const { id } = req.params
    const { newPassword, repeatNewPassword } = req.body
        
    try {
        await newPassValidator.validateAsync(req.body)
    } catch(e) {
        res.status(400).send('Los datos introducidos son incorrectos')
        return
    }

    const user = await db.getUserById(id)
    
    const passwordBcrypt = await bcrypt.hash(newPassword, 10);
    
    await db.updatePassword(id, passwordBcrypt)
    utils.sendRecoveredPasswordMail(user.email, `http://${process.env.PUBLIC_DOMAIN}/user/login`)

    res.send('Contraseña actualizada correctamente')
}

const updateProfile = async (req, res) => {
    const { id } = req.params
    const decodedToken = req.auth
    const { name, surnames, address, location, phone } = req.body
       
    try {
        
        await updateProfileValidator.validateAsync(req.body)
        const user = await db.getUserById(id)
           
        if (decodedToken.id !== user.id) {
            res.status(400).send()
            return
        }

        await db.updateProfile(name, surnames, address, location, phone, id)

        if (req.files) {
            // si hiciese falta comprobar la extensión del fichero
            // podríamos hacerlo aquí a partir de la información de req.files
            // y enviar un error si no es el tipo que nos interesa (res.status(400).send())

            await fsPromises.mkdir(`${process.env.TARGET_FOLDER}/profiles`, { recursive: true })


            const fileID = uuid.v4()
            const outputFileName = `${process.env.TARGET_FOLDER}/profiles/${fileID}.jpg`

            await fsPromises.writeFile(outputFileName, req.files.image.data)

            await db.uploadProfilePhoto(outputFileName, decodedToken.id)
        }
    
    } catch (e) {
        res.status(400).send()
        return
    }

    res.send()
}

const logout = async (req, res, next) => {
        
    try {
        const decodedToken = {}

        req.auth = decodedToken;
    } catch (e) {
        res.status(401).send()
        return
    }

    res.send(req.auth)
}



module.exports = {
    goToUpdatePassword,
    login,
    logout,
    recoverPassword,
    register,
    updateProfile,
    updateRecoveredPassword,
    updateUserPassword,
    validateRegister   
}