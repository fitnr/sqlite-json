#!/usr/bin/env node

const program = require('commander'),
    sj = require('..');

function list(val) { return val.split(','); }

program
    .version('1.0.0')
    .usage('[options] <database> [sql]')
    .description('Export a SQLite table to JSON')
    .option('-k, --key <key>', 'Key output to column', String)
    .option('-t, --table <table>', 'table to query', String)
    .option('-c, --columns <list>', 'Comma-delimited list of columns to output (Default: all)', list)
    .option('-w, --where <clause>', 'WHERE clause to add to table query', String)
    .option('-o, --output <file>', 'Save result to file', String)
    .action(function(database, sql, options) {
        if (typeof(sql) == 'object' && typeof(options) === 'undefined') {
            options = sql;
            sql = null;
        }

        const output = options.output;

        options = {
            table: options.table || null,
            query: options.query || null,
            key: options.key || null,
            where: options.where || null,
            columns: options.columns || null
        };

        sj(database).json(sql, options, function(err, json) {

            if (err) {
                if (String(err).indexOf('no such table') > -1)
                    console.error('error: table not found');
                else
                    console.error(err.message);

                process.exit(1);

            } else if (output) {
                require('fs').writeFile(output, json, function(err) {
                    if (err) {
                        process.stderr.write(err.message);
                        process.exit(1);
                    }
                    else process.stdout.write(program.output + '\n');
                });

            } else {
                process.stdout.on('error', function(err) {
                    console.error(err.message);
                    process.exit(1);
                });
                process.stdout.write(json + '\n');
            }
        });
    });

program.parse(process.argv);
