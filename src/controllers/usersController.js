const {validationResult} = require('express-validator');
const {loadUsers, storeUsers} = require('../data/dbModule');
const {hashSync} =require('bcryptjs');
const db = require('../database/models');

module.exports = {
    profile : (req,res) => {
        
        let user = db.User.findByPk(req.session.userLogin.id)
        let interests = db.Interest.findAll()

        Promise.all([user,interests])
            .then(([user,interests]) => {
                return res.render('userProfile',{
                    user,
                    interests
                })
            })
            .catch(error => console.log(error))

   
    },
    update : (req,res) => {

        let {name, surname, password, intereses} = req.body;

        db.User.findByPk(req.session.userLogin.id)
            .then(user => {
                db.User.update(
                    {
                        name,
                        surname,
                        password : password ? hashSync(password,10) : user.password,
                        avatar : req.file ? req.file.filename : user.avatar,
                    },
                    {
                        where : {
                            id : req.session.userLogin.id
                        }
                    }
                ).then( () => {
                        db.InterestUser.destroy({
                            where : {
                                userId : user.id
                            }
                        }).then( () => {
                            if(intereses){

                            intereses = typeof intereses === "string" ? [intereses] : intereses;

                            intereses.forEach( async (interes) => {
                                await db.InterestUser.create({
                                    userId : user.id,
                                    interestId : interes
                                })
                            });
                        }
                        })
                    return res.redirect('/users/profile')
                })
        
            }).catch(error => console.log(error))

      
    },
    remove : (req,res) =>{

    }
}