// ESTE MIDD ES PARA LAS RUTAS QUE SE REQUIERE SER ADMIN

function userAdminMiddleware (req, res, next){
    if (!res.locals.isAdmin){
        return res.redirect("/");        
    }
    next();
} 

module.exports = userAdminMiddleware;