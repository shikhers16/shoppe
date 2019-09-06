//Core Modules
const path = require('path');

//3rd Party Modules
const express = require('express');
const bodyParser = require('body-parser');

// Self Modules
//Routes
const adminRoutes = require('./routes/admin');
const shopRoute = require('./routes/shop');
//Controllers
const utilsController = require('./controllers/utils');

// Create Express App
const app = express();

//express config
//app.set('view engine', 'pug');
app.set('view engine', 'ejs');
//app.set('views', 'views');

// Parsers
app.use(bodyParser.urlencoded({
    extended: true
}));

// Routes

app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);

app.use(shopRoute);

// 404 Error : Not Found Page
app.use(utilsController.get404)

// Start Server
app.listen(3000);