const connection = require('../config/database.js')
const {Sequelize, DataTypes} = require('sequelize')

const User = connection.define('Users', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

reset = require('../model/Base.js')

User.sync({force: reset})
    .then(()=>{
        console.log('[SUCCESS] User Table Stablished.')
    })
    .catch((error)=>{
        console.log('[ERROR] User Table Not Stablished')
        throw error
    })

module.exports = User 