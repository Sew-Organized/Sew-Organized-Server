require('dotenv').config();
const pg = require('pg');
const Client = pg.Client;

const DATABASE_URL = process.env.DATABASE_URL;
const client = new Client(DATABASE_URL);

module.exports = client;