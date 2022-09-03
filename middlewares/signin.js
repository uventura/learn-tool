function signinAuthNotLogged(req, res, next){
    if(req.session.userLogged == undefined){
        next()
    }else{
        res.redirect('/groups')
        return
    }
}

function signinAuthLogged(req, res, next){
    if(req.session.userLogged){
        next()
    }else{
        res.redirect('/')
    }
}

module.exports = {signinAuthNotLogged, signinAuthLogged}