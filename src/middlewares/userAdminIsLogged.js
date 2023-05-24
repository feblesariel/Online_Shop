// ESTE MIDD ES PARA INDICAR QUE HAY UN USUARIO ADMINISTRADOR LOGUEADO

function userAdmin (req, res, next){

    res.locals.isAdmin = false;

    if (req.session.userLogged){        
        let user = req.session.userLogged
        if (user.role === "admin") {            
            res.locals.isAdmin = true;
        }        
    }
    next();
} 

module.exports = userAdmin;