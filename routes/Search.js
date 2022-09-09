const Group = require('../model/Group.js')

const express = require('express')
const SearchRouter = express.Router()

const connection = require('../config/database.js')
const {Sequelize, DataTypes, Op} = require('sequelize')

const { QueryTypes } = require('sequelize')

const userAuth = require('../middlewares/signin.js')

SearchRouter.get('/search', userAuth.signinAuthLogged, (req, res) => {
    search = req.query.subject

    if(search == undefined || search == '')
    {
        res.render('pages/search')
        return
    }

    searchSubject = search.split(' ')

    let query = 'SELECT title FROM "Groups" WHERE '

    let wordCounter = 1
    searchSubject.forEach(word=>{
        query += "title LIKE '%"+word+"%' "
        query += "OR title LIKE '%"+word.toLowerCase()+"%' "
        query += "OR title LIKE '%"+word.charAt(0).toUpperCase()+word.slice(1)+"%' "

        console.log(query)
        if(wordCounter < searchSubject.length)
            query += 'OR '
        wordCounter+=1
    })

    console.log(query)

    connection.query(query, {raw:true, type:QueryTypes.SELECT}).then(result=>{
        console.log(result)
        res.render('pages/search')
    }).catch(error=>{
        console.log('[ERROR] Search Error.')
        console.log(error)
    })
})

module.exports = SearchRouter