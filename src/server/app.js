'use strict';

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var request = require('request');
var cheerio = require('cheerio');
var bodyParser = require('body-parser');
var logger = require('morgan');
var port = process.env.PORT || 7575;
var routes;

var environment = process.env.NODE_ENV;

var dbUrl = environment === 'build' ? 'mongodb://public:dare@ds063892.mongolab.com:63892/scrape' : 'mongodb://localhost/scrape';

mongoose.connect(dbUrl, {
    useMongoClient: true
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('connected to mongo...');
    var ebaySchema = mongoose.Schema({
        shop : String,
        category : String,
        url : String,
        checked : Boolean
    }, {collection : 'ebay'});
    var Ebay = mongoose.model('Ebay', ebaySchema);

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(logger('dev'));

    var api = '/api';
    app.get(api + '/categories', getCats);
    app.post('/api/scrape', scrape);

    function getCats(req, res, next) {
        Ebay.find({}).sort({shop: 1}).exec(function(err, docs) {
            res.json({docs: docs});
        });
    }

    function scrape(req, res) {
        request(req.body.url, function(err, response, html) {
            //console.log(req.body.url);
            if (err) { throw err; }
            var $ = cheerio.load(html);

            // conditional to check for the 2 different CSS selectors we have beem seeing lately
            if ($('body').find('li.sresult.lvresult.clearfix').first().find('h3.lvtitle').text().replace(/\s\s+/g, ' ').length == 0) {
                var listingCssSelector = "li.s-item";

                var titleCssSelector = "h3.s-item__title";
                var priceCssSelector = ".s-item__price";
                var hrefCssSelector = "a.s-item__link";
            } else {
                var listingCssSelector = "li.sresult.lvresult.clearfix";

                var titleCssSelector = "h3.lvtitle";
                var priceCssSelector = ".lvprice.prc";
                var hrefCssSelector = "'a.vip'";
            }

            req.body.listTitle = $('body').find(listingCssSelector).first().find(titleCssSelector).text().replace(/\s\s+/g, ' ');
            req.body.listPrice = $('body').find(listingCssSelector).first().find(priceCssSelector).text().replace(/\s\s+/g, ' ');
            req.body.listHref = $('body').find(listingCssSelector).first().find(hrefCssSelector).attr('href');

            //console.log(req.body.listTitle);

            res.json(req.body);
        });
    }

    console.log('About to crank up node');
    console.log('PORT=' + port);
    console.log('NODE_ENV=' + environment);

    switch (environment) {
        case 'build':
            console.log('** BUILD **');
            app.use(express.static('./build/'));
            app.use('/*', express.static('./build/index.html'));
            break;
        default:
            console.log('** DEV **');
            app.use(express.static('./src/client/'));
            app.use(express.static('./'));
            app.use(express.static('./tmp'));
            app.use('/*', express.static('./src/client/index.html'));
            break;
    }
});

app.listen(port, function() {
    console.log('Express server listening on port ' + port);
    console.log('env = ' + app.get('env') +
                '\n__dirname = ' + __dirname +
                '\nprocess.cwd = ' + process.cwd());
});
