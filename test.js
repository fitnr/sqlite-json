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
    });

    it('should accept a filename', function() {
        var sj = SJ('tmp/foo.db');
        sj.should.be.an.instanceOf(SJ);
    });

    it('should callback with all tables in the specified database', function (done) {
        this.sqlitejson.tables(function(e, result) {
            result.should.have.length(1);
            result.should.be.containDeep(['presidents']);
            done(e);
        });
    });

    it('should export a table to JSON', function (done) {
        this.sqlitejson.json('presidents', function (err, json) {
            should.deepEqual(json,
                JSON.stringify(data),
                'data should match fixture'
            );
            done(err);
        });
    });


    it('should save a table in a database to a file', function (done) {
        var dest = 'tmp/bar';
        this.sqlitejson.save('presidents', dest, function (err, data) {

            should.deepEqual(JSON.parse(data),
                JSON.parse(fs.readFileSync(dest)),
                'data should match file'
            );
            done(err);
        });
    });


    it('should accept a key option', function (done) {
        const desired = data.reduce(function(o, v) { o[v.name] = v; return o; }, {});
        this.sqlitejson.json('presidents', {key: "name"}, function (err, json) {
            should.deepEqual(json,
                JSON.stringify(desired),
                'data should match keyed'
            );
            done(err);
        });
    });

    it('should filter with a where option', function (done) {
        const desired = data.filter(function(i) { return i.name == 'Adams'; }, {});
        this.sqlitejson.json('presidents', {where: "name = 'Adams'"}, function (err, json) {
            should.deepEqual(json,
                JSON.stringify(desired),
                'data should match filtered'
            );
            done(err);
        });
    });

    it('should filter with a columns option', function (done) {
        const desired = data.map(function(i) { return {"name": i.name}; }, {});
        this.sqlitejson.json('presidents', {columns: ["name"]}, function (err, json) {
            should.deepEqual(json,
                JSON.stringify(desired),
                'data should match filtered'
            );
            done(err);
        });
    });

    it('should accept where, key, columns simulataneously', function (done) {
        const opts = {
            columns: ["name"],
            key: "name",
            where: "id == 1"
        },
            desired = {"Washington": {"name": "Washington"}};

        this.sqlitejson.json('presidents', opts, function (err, json) {
            should.deepEqual(json,
                JSON.stringify(desired),
                'data should match filtered'
            );
            done(err);
        });
    });


    it('cli should work', function (done) {
        this.command = 'node ./bin/sqlite-json.js';
        this.nodeargs = [
                "./tmp/tmp.db",
                'presidents'
            ];

        fixture = JSON.stringify();

        child.exec(this.command +" "+ this.nodeargs.join(' '), function(e, result, err) {
            if (e) throw e;

            console.error("");
            console.error(err);

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
