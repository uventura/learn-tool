const connection = require('../config/database.js')
const {Sequelize, DataTypes} = require('sequelize')

const Group = require('../model/Group.js')

const Filter = connection.define('Filter', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    question: {
        type: DataTypes.STRING,
        allowNull: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    settings: {
        type: DataTypes.STRING,
        allowNull: true
    },
});

Group.hasMany(Filter);

reset = require('../model/Base.js')

Filter.sync({force: reset})
    .then(()=>{
        console.log('[SUCCESS] Filter Table Stablished.')
    })
    .catch((error)=>{
        console.log('[ERROR] Filter Table Not Stablished')
        throw error
    })

module.exports = Filter