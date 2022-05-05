"use strict";


const database = require("better-sqlite3")


const db = new database("log.db")

const stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='accesslog';`);

let vec = stmt.get();

if (vec === undefined) {
    const sqlInit = `CREATE TABLE accesslog (
        referer VARCHAR,
        useragent VARCHAR,
        id INTEGER PRIMARY KEY, 
        remoteaddr VARCHAR, 
        protocol VARCHAR,
        httpversion NUMERIC, 
        status INTEGER, 
        remoteuser VARCHAR, 
        time VARCHAR, 
        method VARCHAR, 
        url VARCHAR
    );`;
    db.exec(sqlInit)
} else {
    console.log("exists already");
}

module.exports = db;