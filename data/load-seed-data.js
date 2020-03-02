const client = require('../lib/client');
// import our seed data:
const dmc_colors = require('./dmc-colors');

run();

async function run() {

    try {
        await client.connect();

        await client.query(`
            INSERT INTO users (email, display_name, hash)
            VALUES ($1, $2, $3);
            `,
        ['me@mydomain.com', 'User Name', 'gh289t894ht']);

        await Promise.all(
            dmc_colors.map(color => {
                return client.query(`
                    INSERT INTO dmc_colors (id, description, red, green, blue, hex, user_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7);
                `,
                [color.id, color.description, color.red, color.green, color.blue, color.hex, color.user_id]);
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