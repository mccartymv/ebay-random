module.exports = function() {
    var client = './src/client/';
    var clientApp = client + 'app/';
    var temp = './.tmp/';
    var server = './src/server/';
    var config = {
        index: client + 'index.html',
        client: client,
        temp: temp,
        server: server,
        alljs: [
          './src/**/*.js',
          './*.js',
          '!./modifyDocsServer.js'
        ],
        js: [
          clientApp + '**/*.module.js',
          clientApp + '**/*.js'
        ],
        less: client + 'styles/style.less',
        css: temp + 'style.css',
        bower: {
            json: require('./bower.json'),
            directory: './bower_components',
            ignorePath: '../..'
        },
        nodeServer: server + 'app.js',
        defaultPort: 8686,
        browserReloadDelay: 1000
    };
    config.getWiredepOptions = function() {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        };
    };

    return config;
};
