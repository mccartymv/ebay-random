module.exports = function() {
    var client = './src/client/';
    var clientApp = client + 'app/';
    var temp = './.tmp/';
    var server = './src/server/';
    var config = {
        alljs: [
          './src/**/*.js',
          './*.js',
          '!./modifyDocsServer.js'
        ],
        bower: {
            json: require('./bower.json'),
            directory: './bower_components',
            ignorePath: '../..'
        },
        browserReloadDelay: 1000,
        build: './build/',
        client: client,
        css: temp + 'style.css',
        defaultPort: 8686,
        index: client + 'index.html',
        js: [
          clientApp + '**/*.module.js',
          clientApp + '**/*.js'
        ],
        less: client + 'styles/style.less',
        nodeServer: server + 'app.js',
        server: server,
        temp: temp
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
