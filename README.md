# sqlite-json
> Convert Sqlite3 tables to JSON

## Command line Interface

```
  Usage: sqlite-json [options] <database> <table>

  Export a SQLite table to JSON

  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -o, --output <file>  Save result to file
    -c, --columns <list> Comma-delimited list of columns to output (Default: all)
    -k, --key <key>      Key output to column
    -w, --where <clause> WHERE clause to add to table query
```

By default, the cli outputs to stdout.

### Examples:

```bash
$ sqlite-json data.db table --key ID -o output.json
$ sqlite-json data.db table | other_program > output.json
```

## API

### constructor(database)

Create an instance of sqlite-json.

Example:
```js
const sqliteJSON = require('sqlite-json');
const exporter = sqliteJson('example.db');
```

#### database

The path to an SQLite database or a [sqlite3](https://github.com/mapbox/node-sqlite3) client instance.

Type: `sqlite3.Database` or string

Example:

```js
const sqlite3 = require('sqlite3');
var db = new sqlite3.Database('./mydb.sqlite3');
exporter = sqliteJson(db);
```

### json(table, options, callback)

Export JSON from a specified table, and use it in the given callback.

Example:
```js
exporter.json('myTable', function (err, json) {
  // handle error or do something with the JSON
  // "[{"foo": 1}, {"foo": 2}, {"foo": 3}]"
});
```

#### options.columns

An optional list of columns to output.

Type: Array

Example:
```js
exporter.json('myTable', {columns: ['foo']}, function (err, json) {
  // "[{"foo": 1}, {"foo": 2}, {"foo": 3}]"
});
```

#### options.key

An optional column name.

By default, the result is an JSON array of objects. If `key` is given, a JSON object is returned, each row keyed to the given column value.

Type: string

Example:
```js
exporter.json('myTable', {key: 'foo'}, function (err, json) {
  // "{"1": {"foo": 1}, "2": {"foo": 2}, "3": {"foo": 3}}"
});
```

#### options.where

A where clause to add to the query.

Type: string

Example:
```js
exporter.json('myTable', {where: 'foo > 1'}, function (err, json) {
  // "[{"foo": 2}, {"foo": 3}]"
});
```

### tables(cb)

List all tables in the current database.

Example:
```js
exporter.tables(function (err, tables) {
  // tables === ['foo', 'bar', 'baz']
});
```

### save(table, filename, cb)

Save the contents of a table to the specified output file.

Example:
```js
exporter.save('table_name', 'data/table_name.json', function (err, data) {
    // Optionally do something else with the JSON.
});
```
