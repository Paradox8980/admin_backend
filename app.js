require('dotenv').config();
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
var cors = require('cors');
const client = require('./db');

const app = express();
// Middleware
// app.use(cors({ origin: 'https://unixel-infotech.vercel.app' }));
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static('static'));
app.use(express.static('public'));

// const port = process.env.PORT;
// client.connect();

app.get('/', (req, res) => {
    res.json({ message: 'Hello from Node.js backend!' });
});

process.env.TZ = 'Asia/Kolkata';
// Available Routes
app.use('/api/v1/user', require('./routes/user'));
app.use('/api/v1/general', require('./routes/general'));
app.use('/api/v1/adx', require('./routes/adx'));
app.use('/api/v1/playstore', require('./routes/playstore'));
app.use('/api/v1/apps', require('./routes/apps'));

// Cron
app.use('/holiday-cron', require('./cron/holiday'));
app.use('/timer-cron', require('./cron/timer'));

//START SERVER
//app.listen(3000, ()=>{
//    console.log(`Server running on port 3000`);
//})
module.exports = app;
