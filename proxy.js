const cx = require('compoxure');
const Conflab = require('conflab');
const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');

/**
 * Wire the logger and stats up to your own versions
 */
const eventHandler = {
  logger: function(level, message) {
    console.log('LOG ' + level + ': ' + message);
  },
  stats: function(type, key, value) {
    console.log('STAT ' + type + ' for ' + key + ' | ' + value);
  }
}

/**
 * Functions can be used to select routes
 */
const functions = {
	'selectGoogle': function(req, variables) {
		if(variables['query:google']) { return true; }
	},
  'handleUnauthorised': function(req, res, variables, data, options, err) {
    // You could catch any 403 and redirect automatically
    // In this context data is the data section of the handler config
    console.log('here', data);
    res.redirect(data.url);
  },
}

const conflab = new Conflab();
conflab.load((err, config) => {
  const app = express();

  app.use(cookieParser());
  app.use(compression());
  app.use(morgan('combined'));
  app.disable('x-powered-by');

  config.functions = functions;
  const compoxureMiddleware = cx(config, eventHandler);
  app.use(compoxureMiddleware);

  app.listen(config.server.port, config.server.host, function (err) {
    if (err) console.log('Error starting service : %s on %s:%s', err.message, config.server.host, config.server.port);
    console.log('Started proxy service on http://%s:%s', config.server.host, config.server.port);
  });
});


