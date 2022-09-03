const User = require('../model/User.js')

const express = require('express')
const UserRouter = express.Router()

const bcrypt = require('bcrypt')

UserRouter.post('/user/auth',(req, res)=>{
    const email = req.body.email
    const password = req.body.password

    User.findOne({
        where:{
            email:email
        }
    }).then((user)=>{
        if(user != undefined){
            const passwordIsEqual = bcrypt.compareSync(password, user.password)
            console.log(passwordIsEqual)

            if(passwordIsEqual){
                req.session.userLogged = {
                    id: user.id,
                    name: user.name,
                    email: email
                }

                res.redirect('/')
            }else{
                res.redirect('/signin')
            }
        }
        else
        {
            res.redirect('/signin')
        }
    }).catch((error)=>{
        console.log('[ERROR] User Authentication Failed.')
        res.redirect('/signin')
    })
})

UserRouter.get('/signup', (req, res) => {
    const signupError = req.session.signupError != undefined ? req.session.signupError : false
    const singupData = req.session.createUserDataError != undefined ? req.session.createUserDataError : false
    
    delete req.session.signupError
    delete req.session.createUserDataError

    let newUserData={
        name:'',
        username:'',
        email:'',
        passwordOne:'',
        passwordTwo:''
    }

    if(singupData)
        newUserData = singupData

    res.render('pages/signup', {signupError: signupError, newUserData:newUserData})
})

UserRouter.post('/signup-creation',(req,res)=>{
    // All steps bellow can be abstracted with external functions

    const name = req.body.name
    const email = req.body.email
    const password1 = req.body.passwordOne
    const password2 = req.body.passwordTwo

    const userData = {
        name:name,
        email:email,
        passwordOne:password1,
        passwordTwo:password2
    }

    req.session.createUserDataError = userData

    // SIGN UP ERROR
    const nameRE = new RegExp('[^a-zA-Z ]')
    const passwordRE = new RegExp('[^a-zA-Z0-9]')

    if( nameRE.exec(name)!=null
    || passwordRE.exec(password1)!=null
    || passwordRE.exec(password2)!=null)
    {
        req.session.signupError = "Some of the fields has an incorrect symbol."
        res.redirect('/signup')
        return
    }

    if(password1 != password2 || password1.length < 8)
    {
        req.session.signupError = "Incorrect Password"
        res.redirect('/signup')
        return
    }

    User.findOne({
        where:{
            email:email
        }
    }).then(user=>{
        if(user.email == email){
            req.session.signupError = "Email Already Exists"
            res.redirect('/signup')
            return
        }
    }).catch(error=>{
        console.log('[INFO] Error in find similary user.')

        // SIGN UP IS VALID
        delete req.session.createUserDataError

        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(password1,salt)

        User.create({
            name:name,
            email:email,
            password:hash
        }).then(()=>{
            req.session.userLogged = {
                name: name,
                email: email
            }
            res.redirect('/')
        }).catch((error)=>{
            console.log('[ERROR] User Creation')
            res.redirect('/signup')
            return
        })
    })
})

module.exports = UserRouter