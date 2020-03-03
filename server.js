// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const client = require('./lib/client');
const request = require('superagent');

// Application Setup
const app = express();
const PORT = process.env.PORT;
app.use(morgan('dev'));
app.use(cors());
app.use(express.static('public'));

// API Routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// *** AUTH ***
const createAuthRoutes = require('./lib/auth/create-auth-routes');

const authRoutes = createAuthRoutes({
    selectUser(email) {
        return client.query(`
        SELECT id, hash, display_name as "displayName"
        FROM users
        WHERE email = $1;`,
        [email]
        ).then(result => result.rows[0]);
    },
    insertUser(user, hash) {
        return client.query(`
        INSERT into users (email, hash, display_name)
        VALUES ($1, $2, $3)
        RETURNING id, email, display_name;
        `,
        [user.email, hash, user.display_name]
        ).then(result => result.rows[0]);
    }
});

app.use('/api/auth', authRoutes);

const ensureAuth = require('./lib/auth/ensure-auth');

//keep /username for now to direct ensure Auth doesn't mess with development. Come back to update. 
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

//get user stash
//'username is placeholder'
app.get('/api/username/stash', async(req, res) => {
    try {
        const myQuery = `
            SELECT stash.*
            FROM stash
            WHERE user_id = $1 
            JOIN dmc_colors
            ON stash.dmc_id = dmc_colors.id
        `;
        
        const stash = await client.query(myQuery, [req.userId]);
        res.json(stash.rows);
    }
    catch (err) {
        console.error(err);
    }
});

//get route from Color API schemes 

//get route for palettes
//post route for palettes
//delete route to delete palattes


//post route for stash
//put route to update stash (quantity, partial)
//delete route to delete stash items 

