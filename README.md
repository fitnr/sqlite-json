# sqlite-json
> Convert Sqlite3 tables to JSON

## Command line Interface

```
  Usage: sqlite-json [options] <database> [sql]

  Export a SQLite table to JSON

  Options:

    -h, --help            output usage information
    -V, --version         output the version number
    -k, --key <key>       Key output to column
    -t, --table <table>   table to query
    -c, --columns <list>  Comma-delimited list of columns to output (Default: all)
    -w, --where <clause>  WHERE clause to add to table query
    -o, --output <file>   Save result to file
```

One can either pass SQL directly to SQLite or use the `table`, `columns` and/or `where` options to contrust a query.

By default, sqlite-json returns lists of JSON objects. Use the `key` option to return an object with rows keyed to a value from your table.

By default, the cli outputs to stdout. Use the `--output` option to specify a destination file.

### Examples

```bash
 sqlite-json data.db --key ID "SELECT ID, name FROM myTable"
 sqlite-json data.db --table myTable --key ID -o output.json
 sqlite-json data.db -t myTable | other_program > output.json
```

Note that currently only a single query is supported. Attaching databases or doing multiple queries will produce an error.

## API

### constructor(database)

Create an instance of sqlite-json.

Example:
```js
const sqliteJson = require('sqlite-json');
const exporter = sqliteJson('example.db');
```

#### database

The path to an SQLite database or a [sqlite3](https://github.com/mapbox/node-sqlite3) client instance.

Type: `sqlite3.Database` or string

Example:

```js
const sqliteJson = require('sqlite-json');
const sqlite3 = require('sqlite3');
var db = new sqlite3.Database('./mydb.sqlite3');
exporter = sqliteJson(db);
```

### json(sql, options, callback)

Export JSON from a specified table, and use it in the given callback.

Example:
```js
exporter.json('select * FROM myTable', function (err, json) {
  // handle error or do something with the JSON
  // "[{"foo": 1}, {"foo": 2}, {"foo": 3}]"
});
```

#### options.columns

An optional list of columns to output.

Type: Array

Example:
```js
exporter.json({table: 'myTable' columns: ['foo']}, function (err, json) {
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

#### options.table

A table to address with the `columns`, and `where` options.

Type: string

#### options.where

A where clause to add to the query.

Type: string

Example:
```js
exporter.json({table: 'myTable', where: 'foo > 1'}, function (err, json) {
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
