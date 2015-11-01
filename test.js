#!/usr/bin/env node

const fs = require('fs'),
    child = require('child_process'),
    should = require('should'),
    sqlite = require('sqlite3'),
    rimraf = require('rimraf').sync,
    mkdirp = require('mkdirp').sync;

const SJ = require('./');

const data = [
  { name: 'Washington', id: 1 },
  { name: 'Adams', id: 2 },
  { name: 'Jefferson', id: 3 },
  { name: 'Madison', id: 4 },
  { name: 'Monroe', id: 5 },
  { name: 'Adams', id: 6 },
];

describe('sqliteToJson', function () {

    before(function (done) {
        rimraf('./tmp');
        mkdirp('./tmp');

        const db = new sqlite.Database('./tmp/tmp.db');
        this.sqlitejson = SJ(db);

        db.serialize(function(e) {
            db.run("CREATE TABLE presidents (name TEXT, id INT)");
            var stmt = db.prepare("INSERT INTO presidents VALUES (?, ?)");

            data.forEach(function(row) {
                stmt.run(row.name, row.id);
            });

            stmt.finalize();

            done(e);
        });

        desired = data.reduce(function(o, v) { o[v.name] = v; return o; }, {});

        this.command = 'node ./bin/sqlite-json.js';
    });

    it('accepts a filename', function() {
        var sj = SJ('tmp/foo.db');
        sj.should.be.an.instanceOf(SJ);
    });

    it('calls back with all tables in the specified database', function (done) {
        this.sqlitejson.tables(function(e, result) {
            result.should.have.length(1);
            result.should.be.containDeep(['presidents']);
            done(e);
        });
    });

    it('exports a table to JSON', function (done) {
        this.sqlitejson.json({table: 'presidents'}, function (err, json) {
            if (!err) should.deepEqual(JSON.parse(json), data);
            done(err);
        });
    });

    it('saves a table in a database to a file', function (done) {
        var dest = 'tmp/bar';
        this.sqlitejson.save({table: 'presidents'}, dest, function (err, data) {

            if (!err) 
                should.deepEqual(
                    JSON.parse(data),
                    JSON.parse(fs.readFileSync(dest)),
                    'data should match file'
                );
            done(err);
        });
    });

    it('accepts a key option', function (done) {
        const desired = data.reduce(function(o, v) { o[v.name] = v; return o; }, {});
        this.sqlitejson.json({table: 'presidents', key: "name"}, function (err, json) {
            if (!err) should.deepEqual(JSON.parse(json), desired);
            done(err);
        });
    });

    it('attaches a key to the output', function (done) {
        const desired = data.reduce(function(o, v) { o[v.name] = v; return o; }, {});
        this.sqlitejson.json({table: 'presidents', key: "name", columns: ["id"]}, function (err, json) {
            if (!err) should.deepEqual(JSON.parse(json), desired);
            done(err);
        });
    });

    it('filters with a where option', function (done) {
        const desired = data.filter(function(i) { return i.name == 'Adams'; }, {});
        this.sqlitejson.json({table: 'presidents', where: "name = 'Adams'"}, function (err, json) {
            if (!err) should.deepEqual(json, JSON.stringify(desired));
            done(err);
        });
    });

    it('filters with a columns option', function (done) {
        const desired = data.map(function(i) { return {"name": i.name}; }, {});
        this.sqlitejson.json({table: 'presidents', columns: ["name"]}, function (err, json) {
            if (!err) should.deepEqual(JSON.parse(json), desired);
            done(err);
        });
    });

    it('accepts SQL with a callback', function (done) {
        const desired = data.map(function(i) { return {"name": i.name}; }, {});
        this.sqlitejson.json("select name from presidents", function (err, json) {
            if (!err) should.deepEqual(JSON.parse(json), desired);
            done(err);
        });
    });

    it('accepts where, key, columns simultaneously', function (done) {
        const opts = {
            table: 'presidents',
            columns: ["name"],
            key: "name",
            where: "id == 1"
        },
            desired = {"Washington": {"name": "Washington"}};

        this.sqlitejson.json(opts, function (err, json) {
            if (!err) should.deepEqual(JSON.parse(json), desired);
            done(err);
        });
    });

    it('cli works with options', function (done) {
        args = [
                "./tmp/tmp.db",
                '--table',
                'presidents'
            ];

        fixture = JSON.stringify();

        child.exec(this.command +" "+ args.join(' '), function(e, result, err) {
            if (e) throw e;
            if (err) {
                console.error("");
                console.error(err);
            }
            should.deepEqual(JSON.parse(result),
                data,
                'Command line matches'
            );
            done();
        });
    });

    it('cli works with SQL', function (done) {

        nodeargs = [
                "./tmp/tmp.db",
                '"SELECT * FROM presidents;"'
            ];

        fixture = JSON.stringify();

        child.exec(this.command +" "+ nodeargs.join(' '), function(e, result, err) {
            if (e) throw e;
            if (err) {
                console.error("");
                console.error(err);
            }

            should.deepEqual(JSON.parse(result),
                data,
                'Command line matches'
            );
            done();
        });
    });

    it('cli SQL overrides options', function (done) {

        nodeargs = [
                "./tmp/tmp.db",
                '"SELECT * FROM presidents;"',
                "--where",
                "id==1"
            ];

        fixture = JSON.stringify();

        child.exec(this.command +" "+ nodeargs.join(' '), function(e, result, err) {
            if (e) throw e;
            if (err) {
                console.error("");
                console.error(err);
            }

            should.deepEqual(JSON.parse(result),
                data,
                'Command line matches'
            );
            done();
        });
    });

    after(function(){
        rimraf('./tmp');
    });
});
