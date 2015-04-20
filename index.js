const sqlite = require('sqlite3');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

module.exports = sqliteJSON;

function sqliteJSON(database) {
    if (!(this instanceof sqliteJSON))
        return new sqliteJSON(database);

    this.client = (database instanceof sqlite.Database) ? database : new sqlite.Database(database);

    return this;
}

sqliteJSON.prototype.json = function(table, options, cb) {
    if (options instanceof(Function)) {
        cb = options;
        options = {};
    }

    const query = 'SELECT * FROM ' + table + ((options.where) ? ' WHERE ' + options.where : '');

    this.client.all(query, function(err, data) {
        if (err) cb(String(err));
        
        if (options.key)
            data = data.reduce(function(obj, item) { obj[item[options.key]] = item; return obj; }, {});

        cb(null, JSON.stringify(data));
    });

    return this;
};

sqliteJSON.prototype.save = function(table, filename, cb) {
    this.json(table, function(err, data) {
        if (err) cb(err);

        mkdirp(path.dirname(filename), function(err) {
            if (err) cb(err);

            fs.writeFile(filename, data, function(err) {
                if (err) cb(err);
                else cb(null, data);
            });
        });
    });

    return this;
};

sqliteJSON.prototype.tables = function(cb) {
    const query = "SELECT name FROM sqlite_master WHERE type='table'";

    this.client.all(query, function (err, tables) {
        if (err)
            cb(err);
        cb(null, tables.map(function (t) { return t.name; }));
    });

    return this;
};
