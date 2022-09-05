const connection = require('../config/database.js')
const {Sequelize, DataTypes} = require('sequelize')

const Task = require('../model/Task.js')
const Filter = require('../model/Filter.js')

FilterTask = connection.define('FilterTask');

Task.belongsToMany(Filter, { through: FilterTask });
Filter.belongsToMany(Task, { through: FilterTask });

FilterTask.sync({force: false})
    .then(()=>{
        console.log('[SUCCESS] Filter Task Relation Table Stablished.')
    })
    .catch((error)=>{
        console.log('[ERROR] Filter Task Relation Table Not Stablished')
        throw error
    })

module.exports = FilterTask