const connection = require('../config/database.js')
const {Sequelize, DataTypes} = require('sequelize')

const FilterTask = require('../model/FilterTask')
const User = require('../model/User.js');
const Task = require('./Task.js');

UserTask = connection.define('UserTask', {
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    answer: {
        type: DataTypes.STRING,
        allowNull: false
    },
});

User.belongsToMany(Task, { through: UserTask })
Task.belongsToMany(User, { through: UserTask })

reset = require('../model/Base.js')

UserTask.sync({force: reset})
    .then(()=>{
        console.log('[SUCCESS] User Task Relation Table Stablished.')
    })
    .catch((error)=>{
        console.log('[ERROR] User Task Relation Table Not Stablished')
        throw error
    })

module.exports = UserTask