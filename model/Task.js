const connection = require('../config/database.js')
const {Sequelize, DataTypes} = require('sequelize')

const Group = require('../model/Group.js')

const Task = connection.define('Task', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
});

Group.hasMany(Task);

Task.sync({force: false})
    .then(()=>{
        console.log('[SUCCESS] Task Table Stablished.')
    })
    .catch((error)=>{
        console.log('[ERROR] Task Table Not Stablished')
        throw error
    })

module.exports = Task