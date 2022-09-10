const Filter = require('../model/Filter.js')
const FilterTask = require('../model/FilterTask.js')
const Group = require('../model/Group.js')
const Task = require('../model/Task.js')
const User = require('../model/User.js')
const UserFilter = require('../model/UserFilter.js')
const UserGroup = require('../model/UserGroup.js')
const UserTask = require('../model/UserTask.js')

const express = require('express')
const GroupRouter = express.Router()

const bcrypt = require('bcrypt')

const userAuth = require('../middlewares/signin.js')

const { Op } = require("sequelize");
const { NONE } = require('sequelize')

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
            Task.findAll({
                where: {
                    GroupId: group.id
                },
                order: [
                    ['id', 'DESC'],
                ]
            }).then(tasks=>{
                let tasks_undo = []
                let counter = 0

                tasks.forEach(task => {
                    UserTask.findAll({
                        where: {
                            TaskId: task.id,
                            UserId: req.session.userLogged.id
                        }
                    }).then(result => {
                        space = encodeURIComponent(' ')
                        encode_title = encodeURIComponent(task.title)
                        .replaceAll(space, '-')
            
                        
                        if(result.length == 0)
                        {
                            tasks_undo.push({
                                id: task.id,
                                title: task.title,
                                title_uri: encode_title,
                            })
                        }
    
                        counter += 1
                        if(counter >= tasks.length)
                        {
                            if(group != null)
                            {
                                let canEdit = false
                                if(req.session.userLogged.id == group.UserId)
                                    canEdit = true
                                res.render('pages/group', {
                                    canEdit: canEdit,
                                    canJoin: canJoin,
                                    title: group.title,
                                    id: group.id,
                                    tasks_todo: tasks_undo
                                })
                                return
                            }
                            else
                            {
                                res.redirect('/')
                                return
                            }
                        }
                    }).catch(error => {
                        console.log('[ERROR] User Tasks Error')
                        console.log(error)
                        return
                    })
                })

                if(tasks.length == 0)
                {
                    res.render('pages/group', {
                        canEdit: req.session.userLogged.id == group.UserId,
                        canJoin: canJoin,
                        title: group.title,
                        id: group.id,
                        tasks_todo: []
                    })
                    return
                }
            }).catch(error=>{
                console.log('[ERROR] Task Route Error.')
                console.log(error)
                return
            })
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
                },
                order: [
                    ['id', 'DESC'],
                ]
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

GroupRouter.get('/new-filter/:title', userAuth.signinAuthLogged, (req, res) => {
    const newFilterError = req.session.newFilterError != undefined ? req.session.newFilterError : ''
    const filterData = req.session.filterData != undefined ? req.session.filterData : ''

    delete req.session.newFilterError
    delete req.session.filterData

    const uri_title = req.params.title
    const title = decodeURIComponent(uri_title).replaceAll('-', ' ')

    Group.findOne({
        where: {
            title: title
        },
    }).then(result=>{
        if(result == null)
        {
            res.redirect('/')
            return
        }

        res.render('pages/new-filter', {
            group: result.id,
            group_uri: uri_title,
            filter_error: newFilterError,
            filterData: filterData
        })
        return
    }).catch(error=>{
        console.log('[ERROR] Filter Access')
        console.log(error)
        return
    })
})

GroupRouter.get('/new-task/:title', userAuth.signinAuthLogged,(req, res) => {
    const uri_title = req.params.title
    const title = decodeURIComponent(uri_title).replaceAll('-', ' ')
    const newTaskError = req.session.newTaskError != undefined ? req.session.newTaskError : ''

    delete req.session.newTaskError

    Group.findOne({
        where: {
            title: title
        }
    }).then(result => {
        Filter.findAll({
            where: {
                GroupId: result.id
            }
        }).then((result_filter)=>{
            res.render('pages/new-task',
            {
                filters: result_filter,
                back_uri_title: uri_title,
                group_id: result.id,
                taskError: newTaskError
            })
        }).catch(error=>{
            console.log('[ERROR] New Task Find Filters Error')
            console.log(error)
            return
        })
    }).catch(error => {
        console.log('[ERROR] New Task Find Group Error')
        console.log(error)
        res.redirect('/')
    })
})

GroupRouter.get('/statistics/:title', userAuth.signinAuthLogged, (req, res) => {
    // https://stackoverflow.com/questions/1484506/random-color-generator
    function rainbow(numOfSteps, step) {
        // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
        // Adam Cole, 2011-Sept-14
        // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
        var r, g, b;
        var h = step / numOfSteps;
        var i = ~~(h * 6);
        var f = h * 6 - i;
        var q = 1 - f;
        switch(i % 6){
            case 0: r = 1; g = f; b = 0; break;
            case 1: r = q; g = 1; b = 0; break;
            case 2: r = 0; g = 1; b = f; break;
            case 3: r = 0; g = q; b = 1; break;
            case 4: r = f; g = 0; b = 1; break;
            case 5: r = 1; g = 0; b = q; break;
        }
        var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
        return (c);
    }

    const uri_title = req.params.title
    const title = decodeURIComponent(uri_title).replaceAll('-', ' ')

    const task_level = req.session.task_level != undefined ? req.session.task_level : 'not_selected'
    delete req.session.task_level

    if(task_level == 'not_selected')
    {
        delete req.session.task_id
        delete req.session.filter_id
    }

    Group.findOne({
        where: {
            title: title
        },
    }).then(result=>{
        if(task_level == 'not_selected')
        {
            req.session.current_group_id = result.id
            req.session.current_title = uri_title

            Task.findAll({
                where:{
                    GroupId: result.id
                },
            }).then(task_result=>{
                res.render(
                    'pages/statistics',
                {
                    tasks: task_result,
                    task_level: task_level
                })
                return
            }).catch(error=>{
                console.log('[ERROR] Task Statistics Error')
                console.log(error)
                return
            })
        }
        else if(task_level == 'filters')
        {
            FilterTask.findAll({
                where: {
                    TaskId: req.session.task_id
                },
            }).then(results=>{
                counter = 0
                filter_info = []
                results.forEach(result=>{
                    Filter.findOne({
                        where: {
                            id: result.FilterId
                        }
                    }).then(filter_result=>{
                        filter_info.push(filter_result)
                        counter += 1
                        if(counter >= results.length)
                        {
                            res.render(
                                'pages/statistics',
                            {
                                task_level: task_level,
                                filters: filter_info
                            })
                        }
                    }).catch(error=>{
                        console.log('[ERROR] Filter Error')
                        console.log(error)
                        return
                    })
                })
            }).catch(error=>{
                console.log('[ERROR] Statistics Filter.')
                console.log(error)
                return
            })
        }
        else if(task_level == 'data')
        {
            UserFilter.findAll({
                where:{
                    FilterId: req.session.filter_id,
                    TaskId: req.session.task_id
                }
            }).then(answers=>{
                delete req.session.task_id
                delete req.session.filter_id
                
                type = answers[0].type

                answers_data = {}
                answers_color = {}
                counter = 0
                answers.forEach(answer=>{
                    if(!(answer.answer in answers_data))
                    {
                        counter += 1
                        answers_data[answer.answer] = 1
                        answers_color[answer.answer] = rainbow(answers.length, counter)
                    }
                    else
                    {
                        answers_data[answer.answer] += 1
                    }
                })

                values = Object.values(answers_data)
                if(typeof values != 'object')
                    values = [values]

                keys = Object.keys(answers_data)
                if(typeof values != 'object')
                    keys = [keys]

                colors = Object.values(answers_color)
                if(typeof values != 'object')
                    colors = [colors]

                res.render(
                    'pages/statistics',
                {
                    task_level: task_level,
                    answers_values: values,
                    answers_keys: keys,
                    answers_color: colors,
                    type: type
                })
            }).catch(error=>{
                console.log('[ERROR] Get Filter Answers')
                console.log(error)
                return
            })
        }
    }).catch(error=>{
        console.log('[ERROR] Group Search Error')
        console.log(error)
        return
    })
})

GroupRouter.get('/task/:title/:task_id', userAuth.signinAuthLogged, (req, res) => {
    const uri_title = req.params.title
    const title = decodeURIComponent(uri_title).replaceAll('-', ' ')

    const task_id = parseInt(req.params.task_id)-42
    const taskError = req.session.taskError != undefined ? req.session.taskError : ''

    delete req.session.taskError

    Group.findOne({
        where: {
            title: title
        },
    }).then(result=>{
        counter = 0
        FilterTask.findAll({
            where:{
                TaskId: task_id
            },
        }).then((founded_tasks)=>{
            filters = []
            founded_tasks.forEach(filter_task=>{
                Filter.findOne({
                    where: {
                        id: filter_task.FilterId
                    }
                }).then(result=>{
                    filters.push({
                        id: result.id,
                        type: result.type,
                        settings: result.settings,
                        question: result.question,
                        group_id: result.GroupId
                    })

                    counter += 1

                    if(counter >= founded_tasks.length)
                    {
                        Task.findOne({
                            where:{
                                id: task_id
                            }
                        }).then((task_result)=>{
                            res.render('pages/task', {
                                filters: filters,
                                title: task_result.title,
                                uri_title: uri_title,
                                uri_id: req.params.task_id,
                                error: taskError
                            })
                            return
                        }).catch(error=>{
                            console.log('[ERRO] Task Search Error')
                            console.log(error)
                            return
                        })
                    }
                }).catch(error=>{
                    console.log('[ERROR] Filter Task Search Error')
                    console.log(error)
                    return
                })
            })
        }).catch(error => {
            console.log("[ERROR] Couldn't find task")
            console.log(error)
            return
        })
    }).catch(error=>{
        console.log('[ERROR] Group not Found')
        console.log(error)
        return
    })
})

//===================
//      POST
//===================

GroupRouter.post('/new-group-create', userAuth.signinAuthLogged, (req, res) => {
    // All steps bellow can be abstracted with external functions

    const title = req.body.title.trim()
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
                space = encodeURIComponent(' ')
                encode_title = encodeURIComponent(title)
                .replaceAll(space, '-')
                res.redirect('/group/'+encode_title)
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

GroupRouter.post('/create-filter', userAuth.signinAuthLogged, (req, res) => {
    const groupId = req.body.group
    const groupURI = req.body.group_uri
    const title = req.body.title.trim()
    const question = req.body.question.trim()
    const type = req.body.type.trim()
    let setting = req.body.setting.trim()

    const filter_data = {
        group: groupId,
        group_uri: groupURI,
        title: title,
        question: question,
        type: type,
        settings: setting
    }

    if(title.length < 5)
    {
        req.session.newFilterError = "Title must have at least 5 characters."
        req.session.filterData = filter_data
        res.redirect('/new-filter/'+groupURI)
        return
    }

    if(question.length < 10)
    {
        req.session.newFilterError = "Question must have at least 10 characters."
        req.session.filterData = filter_data
        res.redirect('/new-filter/'+groupURI)
        return
    }

    // REGEX
    const titleRE = new RegExp('[^a-zA-Z 0-9a-zA-ZãçáàóíéêÃÇÁÀÓÍÉÊ]')
    const questionRE = new RegExp('[^a-z A-Z0-9ãçáàóíéêÃÇÁÀÓÍÉÊ,.?]')
    const typeRE = new RegExp('[^a-zA-Z]')
    const settingRE = new RegExp('[^a-zA-ZãçáàóíéêÃÇÁÀÓÍÉÊ,0-9-]')

    if( titleRE.exec(title) != null
    || questionRE.exec(question) != null
    || typeRE.exec(type) != null)
    {
        req.session.newFilterError = "Some fields are wrong."
        req.session.filterData = filter_data
        res.redirect('/new-filter/'+groupURI)
        return
    }

    if((type == "list" || type == "range") && setting.length == 0)
    {
        req.session.newFilterError = "Setting Cannot Be Empty"
        req.session.filterData = filter_data
        res.redirect('/new-filter/'+groupURI)
        return
    }

    if(settingRE.exec(setting) != null)
    {
        req.session.newFilterError = "Setting Cannot Wit Wrong Values"
        req.session.filterData = filter_data
        res.redirect('/new-filter/'+groupURI)
        return
    }

    setting = setting.replace(' ', '_').split(',').join(",")

    Filter.create({
        title:title,
        question:question,
        type:type,
        settings: setting,
        GroupId: groupId
    }).then(()=>{
        res.redirect('/group/'+groupURI)
        return
    }).catch((error)=>{
        console.log('[ERROR] Filter Creation')
        console.log(error)
        req.session.filterData = filter_data
        res.redirect('/new-filter/'+groupURI)
        return
    })
})

GroupRouter.post('/new-task-create', userAuth.signinAuthLogged, (req, res) => {
    const title = req.body.title.trim()
    const filters = req.body.filters
    const groupId = req.body.group_id
    const groupTitle = req.body.group_title

    if(title.length < 5)
    {
        req.session.newTaskError = "Task Name must have at least 5 characters."
        res.redirect('/new-task/'+groupTitle)
        return
    }

    if(filters == undefined)
    {
        req.session.newTaskError = "You must create filters."
        res.redirect('/new-task/'+groupTitle)
        return
    }

    if(filters.length == 0)
    {
        req.session.newTaskError = "Select One Filter"
        res.redirect('/new-task/'+groupTitle)
        return
    }

    // REGEX
    const titleRE = new RegExp('[^a-zA-Z 0-9a-zA-ZãçáàóíéêÃÇÁÀÓÍÉÊ]')
    if(titleRE.exec(title) != null)
    {
        req.session.newTaskError = "Wrong Task Name"
        res.redirect('/new-task/'+groupTitle)
    }

    counter = 0
    Task.create({
        title:title,
        GroupId: groupId
    }).then((result)=>{
        let filters_cast = filters
        if(typeof filters == "string")
            filters_cast = [filters]
            
        filters_cast.forEach(filter => {
            FilterTask.create({
                FilterId: parseInt(filter),
                TaskId: parseInt(result.id)
            }).then(()=>{
                console.log('[SUCCES] Task Filter Creation Completed!')
                counter += 1
                if(counter >= filters_cast.length)
                {
                    res.redirect('/group/'+groupTitle)
                    return
                }
            }).catch(error=>{
                console.log('[ERROR] Task Filter Creation')
                console.log(error)
                return
            })
        })
    }).catch((error)=>{
        console.log('[ERROR] Task Creation')
        console.log(error)
        res.redirect('/new-task/'+groupTitle)
        return
    })
})

GroupRouter.post('/create-task', userAuth.signinAuthLogged, (req, res) => {
    let answered_fields = Object.keys(req.body)
    const uri_title = req.body.uri_title
    const uri_id = req.body.uri_id

    let type_id = {}

    answered_fields.forEach(answer=>{
        if(req.body[answer] == undefined || req.body[answer] == '')
        {
            req.session.taskError = "All fields must be filled."
            res.redirect('/task/'+uri_title+'/'+uri_id);
            return
        }

        let types = ["bool", "numeric", "list", "range", "string"]
        types.forEach(type => {
            if(answer.indexOf(String(type)) > -1)
            {
                type_id[answer] = [type, answer.split(type)[1]]
            }
        })
    })

    counter = 0
    Object.values(type_id).forEach(data => {
        UserFilter.create({
            type: data[0],
            answer: req.body[data[0]+String(data[1])],
            FilterId: parseInt(data[1]),
            UserId: parseInt(req.session.userLogged.id),
            TaskId: parseInt(parseInt(uri_id)-42)
        }).then(result=>{
            counter += 1
            if(counter >= answered_fields.length - 2)
            {
                UserTask.create({
                    UserId: parseInt(req.session.userLogged.id),
                    TaskId: parseInt(uri_id)-42
                }).then(task_result=>{
                    res.redirect('/group/'+uri_title);
                    return
                }).catch(error=>{
                    console.log('[ERROR] User Task Answer not registered.')
                    console.log(error)
                    return
                })
            }
        }).catch(error=>{
            console.log('[ERROR] Task Answer not registered')
            console.log(error)
            return
        })
    })
})

GroupRouter.post('/get-task', userAuth.signinAuthLogged, (req, res) => {
    req.session.task_level = req.body.process
    if(req.session.task_level == 'not_selected')
    {
        req.session.task_level = "filters"
        req.session.task_id = parseInt(req.body.task)
        res.redirect('/statistics/'+req.session.current_title)
        return
    }
    else if(req.session.task_level == 'filters')
    {
        req.session.task_level = 'data'
        req.session.filter_id = parseInt(req.body.filter)
        res.redirect('/statistics/'+req.session.current_title)
        return
    }
})

module.exports = GroupRouter