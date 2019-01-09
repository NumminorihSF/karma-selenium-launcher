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
  let browserRunning = false;

  baseBrowserDecorator(this);

  this.name = 'selenium for ' + args.browserName;

  this._closeSleniumBrowser = (done = () => {}) => {
    log.info('Closing browser');
    this.browser
      .end()
      .then(() => {
        log.info('Browser closed');
        this._done();
        done();
      })
      .catch(error => {
        log.error('Browser closed with error:\n' + error.message + '\n' + error.stack);
        this._done(error);
        done();
      });
  };

  this._start = (url) => {
    log.info('Selenium browser started at http://' + options.host+ ':' + options.port + options.path);
    this.browser = webdriverio
      .remote(options)
      .init()
      .url(url)
      .then(() => {
        browserRunning = true;
      })
      .catch(error => {
        log.error('Browser error');
        log.error(error);
        this._closeSleniumBrowser();
      });
  };

  this.on('kill', (done) => {
    if(!browserRunning){
      process.nextTick(done);

      return;
    }

    this._closeSleniumBrowser(done);
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
