const bcrypt = require("bcryptjs");
const express = require("express");
const app = express();
const { User } = require("./db");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res, next) => {
    try {
        res.send(
            "<h1>Welcome to Loginopolis!</h1><p>Log in via POST /login or register via POST /register</p>"
        );
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// POST /register
// TODO - takes req.body of {username, password} and creates a new user with the hashed password
app.post("/register", async (req, resp) => {
    const { username, password } = req.body;

    if (!(username && password)) resp.status(400).send("missing username and/or password");

    const salt_length = Math.max(2, Math.floor(Math.random() * 10)); // randint 2-10 inclusive
    const hash = await bcrypt.hash(password, salt_length);
    try {
        await User.create({ username, password: hash });
        resp.send(`successfully created user ${username}`);
    } catch (exc) {
        console.error(exc);
        resp.status(500).send(exc.toString());
    }
});

// POST /login
// TODO - takes req.body of {username, password}, finds user by username, and compares the password with the hashed version from the DB
app.post("/login", async (req, resp) => {
    const { username, password } = req.body;

    if (!(username && password)) resp.status(400).send("missing username and/or password");

    const retrievedUser = await User.findOne({ where: { username } });
    const storedHash = retrievedUser?.password;

    const isSame = await bcrypt.compare(password, storedHash ?? "a-fake-hash");
    if (storedHash === undefined) {
        // Username wasn't found. Note that we still compare hashes to prevent timing attacks
        resp.status(401).send("incorrect username or password");
    } else if (isSame) {
        // Password is correct
        resp.send(`successfully logged in user ${username}`);
    } else {
        // Password is wrong
        resp.status(401).send("incorrect username or password");
    }
});

// we export the app, not listening in here, so that we can run tests
module.exports = app;
