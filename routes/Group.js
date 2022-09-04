const Group = require('../model/Group.js')
const User = require('../model/User.js')
const UserGroup = require('../model/UserGroup.js')

const express = require('express')
const GroupRouter = express.Router()

const bcrypt = require('bcrypt')

const userAuth = require('../middlewares/signin.js')

//===================
//      GET
//===================

GroupRouter.get('/group/:title', userAuth.signinAuthLogged, (req, res) => {
    const uri_title = req.params.title
    const title = decodeURIComponent(uri_title).replaceAll('-', ' ')

    UserGroup.findOne({
        where: {
            UserId: req.session.userLogged.id
        }
    }).then(result => {
        let canJoin = true
        if(result != null)
            canJoin = false

        Group.findOne({
            where: {
                title: title
            },
            raw:true,
            attributes:['id', 'UserId','title'],
        }).then(group => {
            if(group != null)
            {
                let canEdit = false
                if(req.session.userLogged.id == group.UserId)
                    canEdit = true
                res.render('pages/group', {
                    canEdit: canEdit,
                    canJoin: canJoin,
                    title: group.title,
                    id: group.id
                })
            }
            else
            {
                res.redirect('/')
                return
            }
        }).catch(error=>{
            console.log('[ERROR] Group Route Failed.')
            console.log(error)
            res.redirect('/')
            return
        })
    }).catch(error => {
        console.log('[ERROR] Group Error')
        console.log(error)
        res.redirect('/')
        return
    })
})
  
GroupRouter.get('/groups', userAuth.signinAuthLogged, (req, res) => {
    Group.findAll({
        include : [
            {
                model: User,
                required: true,
                where: {
                    id: req.session.userLogged['id']
                }
            }
        ]
    }).then(result => {
        res.render('pages/groups', {
            groups: result
        })
        return
    }).catch(error => {
        console.log('[ERROR] Group Select Error')
        console.log(error)
        return
    })
})

GroupRouter.get('/new-group', userAuth.signinAuthLogged, (req, res) => {
    const newGroupError = req.session.newGroupError != undefined ? req.session.newGroupError : ''
    const groupDataError = req.session.createGroupDataError != undefined ? req.session.createGroupDataError : false
    
    delete req.session.newGroupError
    delete req.session.createGroupDataError

    let newGroupData={
        title:'',
        description:'',
        passwordOne:'',
        passwordTwo:'',
    }

    if(groupDataError)
        groupData = groupDataError
    
    res.render('pages/new-group', 
    {
        newGroupError: newGroupError,
        groupData: newGroupData
    })
})

GroupRouter.get('/new-filter', userAuth.signinAuthLogged, (req, res) => {
    res.render('pages/new-filter')
})

GroupRouter.get('/new-task', userAuth.signinAuthLogged,(req, res) => {
    res.render('pages/new-task')
})

GroupRouter.get('/statistics', userAuth.signinAuthLogged, (req, res) => {
    res.render('pages/statistics')
})

//===================
//      POST
//===================

GroupRouter.post('/new-group-create', userAuth.signinAuthLogged, (req, res) => {
    // All steps bellow can be abstracted with external functions

    const title = req.body.title
    const description = req.body.description
    const password1 = req.body.passwordOne
    const password2 = req.body.passwordTwo

    const creator_id = req.session.userLogged['id']

    const groupData = {
        title: title,
        description: description,
        creator_id: creator_id,
        passwordOne: password1,
        passwordTwo: password2
    }

    req.session.createGroupDataError = groupData

    // NOT EMPTY FIELDS
    if( title.length < 5)
    {
        req.session.newGroupError = "Title Must Have 5 Characters"
        res.redirect('/new-group')
        return
    }

    // GROUP ERROR
    const titleRE = new RegExp('[^a-zA-Z 0-9]')
    const descriptionRE = new RegExp('[^a-zA-Z 0-9]')
    const passwordRE = new RegExp('[^a-zA-Z0-9]')

    if( titleRE.exec(title)!=null
    || descriptionRE.exec(description)!=null
    || passwordRE.exec(password1)!=null
    || passwordRE.exec(password2)!=null)
    {
        req.session.newGroupError = "Some of the fields has an incorrect symbol."
        res.redirect('/new-group')
        return
    }

    if((password1.length != 0
    || password2.length != 0)
    && (password1 != password2
    || password1.length < 5))
    {
        req.session.newGroupError = "Incorrect Password"
        res.redirect('/new-group')
        return
    }

    Group.findOne({
        where:{
            title:title
        }
    }).then(user=>{
        if(user.email == email){
            req.session.newGroupError = "Group Already Exists"
            res.redirect('/new-group')
            return
        }
    }).catch(error=>{
        console.log('[INFO] Error in find similary Group.')

        // GROUP IS VALID
        delete req.session.createGroupDataError

        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(password1,salt)

        Group.create({
            title:title,
            description:description,
            password:hash,
            UserId: creator_id
        }).then((group_result)=>{
            UserGroup.create({
                UserId: creator_id,
                GroupId: group_result.dataValues.id
            }).then(()=>{
                res.redirect('/group')
                return
            }).catch((error)=>{
                console.log('[ERROR] User Group Creation')
                console.log(error)
                res.redirect('/new-group')
                return
            })
        }).catch((error)=>{
            console.log('[ERROR] User Creation')
            console.log(error)
            res.redirect('/new-group')
            return
        })
    })
})

GroupRouter.post('/join', userAuth.signinAuthLogged, (req, res) => {
    const groupId = req.body.id
    const title = req.body.title

    UserGroup.findOne({
        where: {
            UserId: req.session.userLogged.id
        }
    }).then(groupRelation => {
        if(groupRelation != null)
        {
            console.log("[ERROR] Join Isn't possible, relation already exists.")
            res.redirect('/')
            return
        }
        
        UserGroup.create({
            UserId: req.session.userLogged.id,
            GroupId: groupId
        }).then(()=>{
            res.redirect('/group/'+title)
            return
        }).catch(error => {
            console.log('[ERROR] Join Action Error')
            console.log(error)
            res.redirect('/')
            return
        })
    }).catch(error => {
        console.log('[ERROR] Join Action Error')
        console.log(error)
        res.redirect('/')
        return
    })
})

module.exports = GroupRouter