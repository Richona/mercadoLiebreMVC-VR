const { hashSync, compareSync } = require("bcryptjs");
const db = require("../database/models");
const { sendSequelizeError, createError } = require("../helpers"); /* Funciones creadas por uno */
const { Op } = require('sequelize');
const { sign } = require("jsonwebtoken"); /* metodo para crear Token */

module.exports = {
    signUp: async (req, res) => {
        try {
            const {
                name,
                surname,
                email,
                password,
                street,
                city,
                province,
                birthday,
                genderId
            } = req.body;

            const { id, rolId } = await db.User.create({
                name: name && name.trim(),
                surname: surname && surname.trim(),
                email: email && email.trim(),
                password: password && password.trim(),
                birthday: birthday && birthday,
                avatar: req.file && req.file.filename,
                genderId,
                rolId: 2,
            });

            await db.Address.create({
                street: street ? street.trim() : null,
                city: city ? city.trim() : null,
                province: province ? province.trim() : null,
                userId: id,
            });

            const token = sign( /* Crea Token */
                { /* Lo que llevara dentro */
                    id,
                    rolId,
                },
                process.env.SECRET_KEY_JWT, /* Clave ubicada en .env para obtener token */
                {
                    expiresIn: "1h", /* Tiempo de duracion */
                }
            )

            return res.status(201).json({
                ok: true,
                status: 201,
                data: token,
            });
        } catch (error) {
            let errors = sendSequelizeError(error);
            return res.status(error.status || 500).json({
                ok: false,
                errors,
            });
        }
    },
    signIn: async (req, res) => {
        try {
            const { email, password } = req.body;

            if(!email || !password) {
                throw createError(404, 'Se require email y password'); /* Funcion ubicada en helpers/ creada para retornar error  */
            }

            let user = await db.User.findOne({
                where: {
                    [Op.or]: [
                      { email },
                      { name: email }
                    ]
                  }
            });

          /*   if(!user){
                throw createError(401, 'El usuario no se encuentra registrado');
            }

            if(!compareSync(password, user.password)){
                throw createError(401, 'La contraseña es incorrecta');
            } */

            if(!user || !compareSync(password, user.password)){
                throw createError(401, 'Credenciales inválidas');
            }
            
            const token = sign( /* Crea token */
                {
                    id : user.id,
                    rolId : user.rolId,
                },
                process.env.SECRET_KEY_JWT,
                {
                    expiresIn: "1h",
                }
            );
            
            return res.status(200).json({
                ok: true,
                status: 200,
                data: token,
            });


        } catch (error) {
            let errors = sendSequelizeError(error);
            return res.status(error.status || 500).json({
                ok: false,
                errors,
            });
        }
    }
}