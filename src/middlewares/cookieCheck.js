
module.exports = (req,res,next) => {
    if(req.cookies.mercadoLibre15){
        req.session.userLogin = req.cookies.mercadoLibre15
    }
    next()
}