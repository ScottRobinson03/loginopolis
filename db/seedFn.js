const bcrypt = require("bcryptjs");
const { sequelize } = require("./db");
const { User } = require("./");
const users = require("./seedData");

const seed = async () => {
    await sequelize.sync({ force: true }); // recreate db

    const data = await Promise.allSettled(
        users.map(async user => {
            const salt_length = Math.max(2, Math.floor(Math.random() * 10)); // randint 2-10 inclusive
            return {
                ...user,
                password: await bcrypt.hash(user.password, salt_length),
            };
        })
    );

    await User.bulkCreate(
        data
            .filter(promiseResult => promiseResult.status === "fulfilled") // only store if getting the hash succeeded
            .map(promiseResult => promiseResult.value) // get the value of the promise, which is our {username, password} object
    );
};

module.exports = seed;
