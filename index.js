const webdriverio = require('webdriverio');

const buildOptions = function(args){
  const options = args.config;

  for(const attr in args){
    if(!options[attr]){
    options[attr] = args[attr];
    }
  }
  delete options['config'];
  delete options['base'];

  return options;
};

const SeleniumBrowser = function (baseBrowserDecorator, args, logger) {
  const options = buildOptions(args);
  const log = logger.create('webdriverio');
  const self = this;
  let browserRunning = false;

  baseBrowserDecorator(this);

  this.name = 'selenium for ' + args.browserName;

  this._start = function (url) {
    log.info('Selenium browser started at http://' + options.host+ ':' + options.port + options.path);
    self.browser = webdriverio
      .remote(options)
      .init()
      .url(url)
      .then(function(){
        browserRunning = true;
      });
  };

  this.on('kill', function(done){
    if(!browserRunning){
      process.nextTick(done);
    }

    self.browser
      .end()
      .then(function(){
        log.info('Browser closed');
        self._done();
        done();
      })
      .catch(error => {
        log.error('Browser closed with error:\n' + error.message + '\n' + error.stack);
        self._done(error);
        done();
      });
  });
};

SeleniumBrowser.prototype = {
  name: 'Selenium',
  DEFAULT_CMD: {
    linux: require('webdriverio').path,
    darwin: require('webdriverio').path,
    win32: require('webdriverio').path
  }
};

SeleniumBrowser.$inject = ['baseBrowserDecorator', 'args', 'logger'];

module.exports = {
  'launcher:Selenium': ['type', SeleniumBrowser]
};
