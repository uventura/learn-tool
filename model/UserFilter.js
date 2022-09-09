const connection = require('../config/database.js')
const {Sequelize, DataTypes} = require('sequelize')

const User = require('../model/User.js');
const Filter = require('../model/Filter.js');
const Task = require('../model/Task.js');

UserFilter = connection.define('UserFilter', {
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    answer: {
        type: DataTypes.STRING,
        allowNull: false
    },
});

User.hasMany(UserFilter)
Filter.hasMany(UserFilter)
Task.hasMany(UserFilter)

reset = require('../model/Base.js')

UserFilter.sync({force: reset})
    .then(()=>{
        console.log('[SUCCESS] User Task Relation Table Stablished.')
    })
    .catch((error)=>{
        console.log('[ERROR] User Task Relation Table Not Stablished')
        throw error
    })

module.exports = UserFilter