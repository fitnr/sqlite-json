const fs = require('fs');

const should = require('should');
const sqlite = require('sqlite3');
const rimraf = require('rimraf').sync;
const mkdirp = require('mkdirp').sync;

const SJ = require('./');

const db = new sqlite.Database(':memory:');

const data = [
  { name: 'Washington', id: 1 },
  { name: 'Adams', id: 2 },
  { name: 'Jefferson', id: 3 },
  { name: 'Madison', id: 4 },
  { name: 'Monroe', id: 5 },
  { name: 'Adams', id: 6 },
];

const sqlitejson = SJ(db);

describe('sqliteToJson', function () {

    before(function (done) {
        rimraf('./tmp');
        mkdirp('./tmp');

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
        sqlitejson.tables(function(e, result) {
            result.should.have.length(1);
            result.should.be.containDeep(['presidents']);
            done(e);
        });
    });

    it('should export a table to JSON', function (done) {
        sqlitejson.json('presidents', function (err, json) {
            should.deepEqual(json,
                JSON.stringify(data),
                'data should match fixture'
            );
            done(err);
        });
    });


    it('should save a table in a database to a file', function (done) {
        var dest = 'tmp/bar';
        sqlitejson.save('presidents', dest, function (err, data) {

            should.deepEqual(JSON.parse(data),
                JSON.parse(fs.readFileSync(dest)),
                'data should match file'
            );
            done(err);
        });
    });


    it('should accept a key option', function (done) {
        const desired = data.reduce(function(o, v) { o[v.name] = v; return o; }, {});
        sqlitejson.json('presidents', {key: "name"}, function (err, json) {
            should.deepEqual(json,
                JSON.stringify(desired),
                'data should match keyed'
            );
            done(err);
        });
    });

    it('should filter with a where option', function (done) {
        const desired = data.filter(function(i) { return i.name == 'Adams'; }, {});
        sqlitejson.json('presidents', {where: "name = 'Adams'"}, function (err, json) {
            should.deepEqual(json,
                JSON.stringify(desired),
                'data should match filtered'
            );
            done(err);
        });
    });

    });


    after(function(){
        rimraf('./tmp');
    });
});
