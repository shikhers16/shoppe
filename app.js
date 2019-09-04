//Core Modules
const path = require('path');
//3rd Party Modules
const express = require('express');
const bodyParser = require('body-parser');

// Self Modules
const adminData = require('./routes/admin');
const shopRoute = require('./routes/shop');

// Create Express App
const app = express();

// Parsers
app.use(bodyParser.urlencoded({
    extended: true
}));

// Routes
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminData.router);

app.use(shopRoute);

// 404 Error : Not Found Page
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
})

app.listen(3000);