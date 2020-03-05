const client = require('../lib/client');
const dmcData = require('./dmc-data');

run();

async function run() {

    try {
        // await client.connect();

        await client.query(`
            INSERT INTO users (email, display_name, hash)
            VALUES ($1, $2, $3);
            `,
        ['person@mydomain.com', 'User Name', 'fewgw89']);

        await Promise.all(
            dmcData.map(color => {
                return client.query(`
                    INSERT INTO dmc_colors (id, description, red, green, blue, hex)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
                [color.id, color.description, color.red, color.green, color.blue, color.hex]);
            })
        );

        console.log('seed data load complete');
    }
    catch (err) {
        console.log(err);
    }
    finally {
        client.end();
    }
    
}