"use strict";
const database = require("better-sqlite3")
const db = new database("log.db")

const stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='accesslog';`);

let row = stmt.get();

if (row === undefined) {
    const sqlInit = `CREATE TABLE accesslog (
        id INTEGER PRIMARY KEY, 
        remoteaddr VARCHAR, 
        remoteuser VARCHAR, 
        time VARCHAR, 
        method VARCHAR, 
        url VARCHAR, 
        protocol VARCHAR,
        httpversion NUMERIC, 
        status INTEGER, 
        referer VARCHAR,
        useragent VARCHAR
    );`;
    db.exec(sqlInit)
} else {
    console.log("Database exists");
}

module.exports = db