const fs = require('fs');

const should = require('should');
const sqlite = require('sqlite3');
const rimraf = require('rimraf').sync;
const mkdirp = require('mkdirp').sync;

const SJ = require('./');

const db = new sqlite.Database(':memory:');

const data = [
  { name: 'one' },
  { name: 'two' },
  { name: 'three' },
  { name: 'four' },
  { name: 'five' },
  { name: 'six' },
  { name: 'seven' },
  { name: 'eight' },
  { name: 'nine' },
  { name: 'ten' }
];

const sqlitejson = SJ(db);

describe('sqliteToJson', function () {

    before(function (done) {
        rimraf('./tmp');
        mkdirp('./tmp');

        db.serialize(function(e) {
            db.run("CREATE TABLE numbers (name TEXT)");
            var stmt = db.prepare("INSERT INTO numbers VALUES (?)");

            data.forEach(function(row) {
                stmt.run(row.name);
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
            result.should.be.containDeep(['numbers']);
            done(e);
        });
    });

    it('should export a table to JSON', function (done) {
        
        sqlitejson.json('numbers', function (err, json) {
            should.deepEqual(json,
                JSON.stringify(data),
                'data should match fixture'
            );
            done(err);
        });
    });


    it('should save a table in a database to a file', function (done) {
        var dest = 'tmp/bar';
        sqlitejson.save('numbers', dest, function (err, data) {
            should.deepEqual(JSON.parse(data),
                JSON.parse(fs.readFileSync(dest)),
                'data should match file'
            );
            done(err);
        });
    });


    it('should accept a key option', function (done) {
        const desired = data.reduce(function(o, v) { o[v.name] = v; return o; }, {});
        sqlitejson.json('numbers', {key: "name"}, function (err, json) {
            should.deepEqual(json,
                JSON.stringify(desired),
                'data should match keyed'
            );
            done(err);
        });
    });

    it('should filter with a where option', function (done) {
        const desired = data.filter(function(i) { return i.name.substr(0, 1) == 't' }, {});
        sqlitejson.json('numbers', {where: "name LIKE 't%'"}, function (err, json) {
            should.deepEqual(json,
                JSON.stringify(desired),
                'data should match filtered'
            );
            done(err);
        });

    });


    after(function(){
        rimraf('./tmp');
    });
});
