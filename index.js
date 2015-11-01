const sqlite = require('sqlite3'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp');

module.exports = sqliteJSON;

function sqliteJSON(database) {
    if (!(this instanceof sqliteJSON))
        return new sqliteJSON(database);

    this.client = (database instanceof sqlite.Database) ? database : new sqlite.Database(database);

    return this;
}

sqliteJSON.prototype.json = function(sql, options, cb) {

    if (options instanceof(Function))
        cb = options;

    if (sql instanceof(Object)) {
        options = sql;
        sql = null;
    }

    if (!sql) {
        // make sure the key is in the output
        if (options.key && options.columns && options.columns.indexOf(options.key) < 0)
            options.columns.push(options.key);

        const columns = (options.columns) ? options.columns.join(', ') : '*',
            where = (options.where) ? ' WHERE ' + options.where : '';

        sql = 'SELECT ' + columns + ' FROM ' + options.table + where + ';';
    }

    this.client.all(sql, function(err, data) {
        if (err) {
            cb(err);
            return;
        }

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
