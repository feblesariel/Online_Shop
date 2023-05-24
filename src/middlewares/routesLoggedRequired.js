// ESTE MIDD ES PARA LAS RUTAS QUE REQUIERE ESTAR LOGUEADO

function authMiddleware (req, res, next){
    if (!req.session.userLogged){
        return res.redirect("/users/login");        
    }
    next();
} 

module.exports = authMiddleware;