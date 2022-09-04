const connection = require('../config/database.js')
const {Sequelize, DataTypes} = require('sequelize')

const User = connection.define('User', {
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

User.sync({force: false})
    .then(()=>{
        console.log('[SUCCESS] User Table Stablished.')
    })
    .catch((error)=>{
        console.log('[ERROR] User Table Not Stablished')
        throw error
    })

module.exports = User 