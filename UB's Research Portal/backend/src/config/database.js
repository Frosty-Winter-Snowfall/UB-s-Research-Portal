const { DataSource } = require("typeorm")
const { User } = require("../entities/User")
const { Resource } = require("../entities/Resource")
const { Department } = require("../entities/Department")
const { Paper } = require("../entities/Paper")

const Appdata = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "pass",
    database: "postgres",
    synchronize: true,
    logging: false,
    entities: [User, Resource, Department, Paper],
})

module.exports = { Appdata }