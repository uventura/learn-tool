const connection = require('../config/database.js')
const {Sequelize, DataTypes} = require('sequelize')

const User = require('../model/User.js')

const Group = connection.define('Group', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

User.hasMany(Group);

Group.sync({force: false})
    .then(()=>{
        console.log('[SUCCESS] Group Table Stablished.')
    })
    .catch((error)=>{
        console.log('[ERROR] Group Table Not Stablished')
        throw error
    })

module.exports = Group 