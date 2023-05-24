// ESTE MIDD ES PARA LAS RUTAS QUE NO TIENE QUE VER UN USUARIO LOGUEADO

function guestMiddleware (req, res, next){
    if (req.session.userLogged){
        return res.redirect("/users/profile");        
    }
    next();
} 

module.exports = guestMiddleware;