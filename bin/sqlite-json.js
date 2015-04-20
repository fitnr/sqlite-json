#!/usr/bin/env node

const program = require('commander'),
    sj = require('..');

function list(val) { return val.split(','); }

program
    .version('0.1.7')
    .usage('[options] <database> <table>')
    .description('Export a SQLite table to JSON')
    .option('-c, --columns <list>', 'Comma-delimited list of columns to output (Default: all)', list)
    .option('-o, --output <file>', 'Save result to file', String)
    .option('-k, --key <key>', 'Key output to column', String)
    .option('-w, --where <clause>', 'WHERE clause to add to table query', String)
    .action(function(database, table, options) {

        options = (options) || {};

        const output = options.output;

        options = {
            key: options.key || null,
            where: options.where || null,
            columns: options.columns || null
        };

        sj(database).json(table, options, function(err, json) {

            if (err) {
                console.error(err);
                return;

            } else if (output) {
                require('fs').writeFile(output, json, function(err) {
                    if (err) process.stderr.write(err);
                    else process.stdout.write(program.output + '\n');
                });

            } else {
                process.stdout.on('error', function(err) { console.error(err); });
                process.stdout.write(json);
            }
        });
    });

program.parse(process.argv);
