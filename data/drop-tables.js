const client = require('../lib/client');

run();

async function run() {

    try {
        await client.connect();
    
        await client.query(`
        DROP TABLE IF EXISTS palettes;
        DROP TABLE IF EXISTS stash;
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS dmc_colors;
        `
        );

        console.log('drop tables complete');
    }
    catch (err) {
        console.log(err);
    }
    finally {
        client.end();
    }
    
}