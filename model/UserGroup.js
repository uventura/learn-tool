const connection = require('../config/database.js')
const {Sequelize, DataTypes} = require('sequelize')

const User = require('../model/User.js')
const Group = require('../model/Group.js')

UserGroup = connection.define('UserGroup');

User.belongsToMany(Group, { through: UserGroup });
Group.belongsToMany(User, { through: UserGroup });

UserGroup.sync({force: false})
    .then(()=>{
        console.log('[SUCCESS] User Group Relation Table Stablished.')
    })
    .catch((error)=>{
        console.log('[ERROR] User Group Relation Table Not Stablished')
        throw error
    })

module.exports = UserGroup