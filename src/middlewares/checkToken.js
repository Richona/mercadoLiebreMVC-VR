const { sendSequelizeError, createError } = require("../helpers");
const {verify} = require('jsonwebtoken') 

const checkToken = (req,res,next) => {

    try {

        const token = req.header('Authorization'); /* Sacamos el token del header */

        if(!token){/* sino viene el token */
            throw createError(401, 'El Token es requerido')
        }

        verify(token, process.env.SECRET_KEY_JWT,  function(err, decoded) { /* metodo para verificar si el token es valido, comparando el token ingresado con la clave guardada en .env */
            if(err){

                throw createError(403, "Token inválido")
            }

                req.userToken = decoded /* decoded viene con todos los datos del usuario */
          });


        next()

    } catch (error) {
        let errors = sendSequelizeError(error);
        return res.status(error.status || 500).json({
            ok: false,
            errors,
        });
    }

}

module.exports = checkToken