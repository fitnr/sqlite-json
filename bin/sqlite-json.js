var program = require('commander'),
    sj = require('..');

program
    .version('0.1.4')
    .usage('[options] <database> <table>')
    .description('Export a SQLite table to JSON')
    .option('-o, --output <file>', 'Save result to file', String)
    .option('-k, --key <key>', 'Key output to column', String)
    .option('-w, --where <clause>', 'WHERE clause to add to table query', String)
    .action(function(database, table, options) {

        options = {
            key: options && options.key || null,
            where: options && options.where || null
        };

        sj(database).json(table, options, function(err, json) {

            if (err) {
                console.error(err);
                return;
            }

            if (options && options.output)
                require('fs').writeFile(options.output, json, function(err) {
                    if (err) process.stderr.write(err);
                    else process.stdout.write(program.output + '\n');
                });

            else {
                process.stdout.on('error', function(err) { console.error(err); });
                process.stdout.write(json);
            }
        });
    });

program.parse(process.argv);
