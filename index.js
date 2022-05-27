const Database = require('better-sqlite3'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    JSONbig = require('json-bigint');

module.exports = sqliteJSON;

function sqliteJSON(database) {
    if (!(this instanceof sqliteJSON))
        return new sqliteJSON(database);
    const opts = {readonly: true, fileMustExist: true};
    this.client = (database instanceof Database) ? database : new Database(database, opts);
    this.client.defaultSafeIntegers();
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
            where = (options.where) ? `WHERE ${options.where}` : '';

        sql = `SELECT ${columns} FROM ${options.table} ${where}`;
    }

    var data = this.client.prepare(sql).all();

    if (options.key)
        data = data.reduce(function(obj, item) { obj[item[options.key]] = item; return obj; }, {});

    cb(null, JSONbig.stringify(data));

    return this;
};

sqliteJSON.prototype.save = function(table, filename, cb) {
    this.json(table, function(err, data) {
        if (err) cb(err);

        mkdirp.sync(path.dirname(filename));

        fs.writeFile(filename, data, function(err) {
            if (err) cb(err);
            else cb(null, data);
        });
    });

    return this;
};

sqliteJSON.prototype.tables = function(cb) {
    const tables = this.client.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    cb(null, tables.map(function (t) { return t.name; }));
    return this;
};
