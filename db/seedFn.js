const {sequelize} = require('./db');
const {User} = require('./');
const users = require('./seedData');

const seed = async () => {
  await sequelize.sync({ force: true }); // recreate db
  await User.bulkCreate(users);
};

module.exports = seed;
