// Load Environment Variables from the .env file
require('dotenv').config();
// Application Dependencies
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const request = require('superagent');
// Database Client
const client = require('./lib/client');
// Services
// Auth
const ensureAuth = require('./lib/auth/ensure-auth');
const createAuthRoutes = require('./lib/auth/create-auth-routes');
const authRoutes = createAuthRoutes({
    async selectUser(email) {
        const result = await client.query(`
            SELECT id, email, hash, display_name AS "displayName" 
            FROM users
            WHERE email = $1;
        `, [email]);
        return result.rows[0];
    },
    async insertUser(user, hash) {
        console.log(user);
        const result = await client.query(`
            INSERT into users (email, hash, display_name)
            VALUES ($1, $2, $3)
            RETURNING id, email, display_name AS "displayName"
        `, [user.email, hash, user.displayName]);
        return result.rows[0];
    }
});
// Application Setup
const app = express();
const PORT = process.env.PORT;
app.use(morgan('dev')); // http logging
app.use(cors()); // enable CORS request
app.use(express.static('public')); // server files from /public folder
app.use(express.json()); // enable reading incoming json data
app.use(express.urlencoded({ extended: true }));
// setup authentication routes
app.use('/api/auth', authRoutes);
// everything that starts with "/api" below here requires an auth token!
app.use('/api/username', ensureAuth);

//** ENDPOINTS **// 

//get dmc colors from database
app.get('/api/colors', async(req, res) => {
    try {
        const myQuery = `
            SELECT * 
            FROM dmc_colors  
        `;

        const colors = await client.query(myQuery);
        res.json(colors.rows);
    }
    catch (err) {
        console.error(err);
    }
});

//get a single dmc color from database by id (from params)
app.get('/api/detail/:id', async(req, res) => {
    console.log(req.params);
    try {
        console.log(req.params.id);
        const myQuery = `
            SELECT * 
            FROM dmc_colors
            WHERE id = $1
            `;

        const colors = await client.query(myQuery, [req.params.id]);
        res.json(colors.rows);
        console.log('colors:', colors);
    }
    catch (err) {
        console.error(err);
    }
});

//get user stash
//'username is placeholder'
app.get('/api/username/stash', async(req, res) => {
    try {
        const myQuery = `
            SELECT stash.*, dmc_colors.description, dmc_colors.hex
            FROM stash
            JOIN dmc_colors
            ON stash.dmc_id = dmc_colors.id
            WHERE user_id = $1 
        `;
        
        const stash = await client.query(myQuery, [req.userId]);
        res.json(stash.rows);
    }
    catch (err) {
        console.error(err);
    }
});

//post route for stash
app.post('/api/username/stash', async(req, res) => {
    try {
        const {
            dmcId,
            quantity, 
        } = req.body;

        const newStash = await client.query(`
            INSERT INTO stash (dmc_id, quantity, user_id)
            VALUES ($1, $2, $3)
            RETURNING *
        `,
        [dmcId, quantity, req.userId]);
        res.json(newStash.rows[0]);
    }
    catch (err) {
        console.error(err);
    } 
});

//put route to update stash (quantity)
app.put('/api/username/stash/:id', async(req, res) => {
    try {
        const {
            quantity,
        } = req.body;

        const result = await client.query(`
            UPDATE stash 
            SET quantity = $1
            WHERE id = ${req.params.id}
                AND user_id = $2
            RETURNING *
        `,
        [quantity, req.userId]);
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
    }
});

//delete route to delete stash items 
app.delete('/api/username/stash/:id', async(req, res) => {
    try {
        const result = await client.query(`
            DELETE from stash 
            WHERE id = ${req.params.id}
                AND user_id = $1
            RETURNING *
        `,
        [req.userId]);
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
    }
});



const getSchemeColors = async() => {
    const randomHex = Math.floor(Math.random() * 16777215).toString(16);
    const URL = `https://www.thecolorapi.com/scheme?hex=${randomHex}&mode=analogic-complement&count=5&format=json`;

    const colorSchemeData = await request.get(URL);

    return colorSchemeData.body.colors.map(color => {
        return color.rgb;
    });
};

//get route from Color API schemes for RANDOM scheme
app.get('/api/scheme', async(req, res) => {
    try {
        const data = await getSchemeColors();
        
        res.json(data);
        console.log(data);
    }
    catch (err) {
        console.error(err);
    }
});

const getClosestColors = async(req) => {
    const hex = await client.query(`
    SELECT hex FROM dmc_colors
    WHERE id = $1
    `,
    [req.params.id]);

    const URL = `https://www.thecolorapi.com/scheme?hex=${hex.rows[0].hex}&mode=monochrome&count=5&format=json`;

    const colorSchemeData = await request.get(URL);

    return colorSchemeData.body.colors.map(color => {
        return color.rgb;
    });
};

//get route from Color API schemes for SPECIFIC scheme based on current color
app.get('/api/scheme/:id', async(req, res) => {
    try {
        const data = await getClosestColors(req);
        
        res.json(data);
        console.log(data);
    }
    catch (err) {
        console.error(err);
    }
});


//get route for palettes
app.get('/api/username/palettes', async(req, res) => {
    try {
        const myQuery = `
            SELECT *
            FROM palettes
            WHERE user_id = $1 
        `;
        
        const stash = await client.query(myQuery, [req.userId]);
        res.json(stash.rows);
    }
    catch (err) {
        console.error(err);
    }
});


//post route for palettes
app.post('/api/username/palettes', async(req, res) => {
    try {
        const {
            paletteName,
            dmcOne,
            dmcTwo,
            dmcThree,
            dmcFour,
            dmcFive
        } = req.body;

        const newPalette = await client.query(`
            INSERT INTO palettes (palette_name, dmc_one, dmc_two, dmc_three, dmc_four, dmc_five, user_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `,
        [paletteName, dmcOne, dmcTwo, dmcThree, dmcFour, dmcFive, req.userId]);
        res.json(newPalette.rows[0]);
    }
    catch (err) {
        console.error(err);
    } 
});

//delete route to delete palettes
app.delete('/api/username/palettes/:id', async(req, res) => {
    try {
        const result = await client.query(`
            DELETE from palettes 
            WHERE id = ${req.params.id}
                AND user_id = $1
            RETURNING *
        `,
        [req.userId]);
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
    }
});


app.listen(PORT, () => {
    console.log('server running on PORT', PORT);
});