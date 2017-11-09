import { socks, socksSsl} from 'meteor/rebolon:socks5'

Meteor.methods({
  /**
   * if the url return a string that is not natively UTF8 or ascii, then you won't be able to read special chars
   * so when you want to parse it or save it into file, it won't work as expected
   */
  call: function() {
    var response = HTTP.get('http://www.leboncoin.fr/annonces/offres/rhone_alpes/');

    // even if you specify , {"encoding": "ascii"} in writeFileSync options, it won't be able to save correctly your data
    // because it is already in UTF8 (done by request npm package)
    Npm.require('fs').writeFileSync(Meteor.settings.config.savepath + 'http-call-content.html', response.content);

    return response.content;
  },

  /**
   * now that we can use npmRequestOptions with HTTP api, we can specify an encoding to null so we will retrieve BUFFER
   * instead of an UTF8 string
   * You will just have to specify encoding null to fs api like in the following code
   */
  callWithEncoding: function() {
    var response = HTTP.get('http://www.leboncoin.fr/annonces/offres/rhone_alpes/', {"npmRequestOptions": {"encoding": null}}),
      cheerio = Npm.require('cheerio'),
      buffer = Npm.require('buffer'),
      $ = cheerio.load(new Buffer(response.content, 'binary')),
      body = new Buffer(response.content),
      iconv = Meteor.npmRequire('iconv-lite');

    //console.log('body', body.toString('utf8', 1145, 1156));
    var dept = iconv.decode(body.slice(1145, 1156), 'iso-8859-15');
    console.log('body', dept);
    //var myCol = new Meteor.Collection('callWithEncoding');
    //myCol.insert({html: response.content, title: $('title').text()});
    //console.info('headers', response.headers);
    //console.info('title', $('title').text());
    //var body = response.content.toString('utf8');
    Npm.require('fs').writeFileSync(Meteor.settings.config.savepath + 'http-callWithEncoding-content.html', response.content, {"encoding": null});
    Npm.require('fs').writeFileSync(Meteor.settings.config.savepath + 'NEW-TEST-WITHAUTOCONVERT.html', body.toString(), {"encoding": 'ascii'});

    return response.content;
  },

  /**
   * start your TOR proxy and then call this methods
   */
  callByTOROnHttps: function() {
    var cheerio = Npm.require('cheerio'),
      Agent = new socksSsl.Agent({
        socksHost: 'localhost',
        socksPort: 9150
      }),
      response = HTTP.get('https://www.whatismyip.com/', {"npmRequestOptions": {
        "strictSSL": true,
        "agentClass": Agent.getClass,
        "agentOptions": {
          "socksHost": Agent.socksHost,
          "socksPort": Agent.socksPort
        }}}),
      $ = cheerio.load(response.content),
      ip = $('#ip-box .ip div').text();

    console.info('your ip is:', ip);

    return ip;
  },

  /**
   * start your TOR proxy and then call this methods
   */
  callByTOR: function() {
    var cheerio = Npm.require('cheerio'),
      Agent = new socks.Agent({
        socksHost: 'localhost',
        socksPort: 9150
      }),
      response = HTTP.get('http://www.mon-ip.com/', {"npmRequestOptions": {
        "agentClass": Agent.getClass,
        "agentOptions": {
          "socksHost": Agent.socksHost,
          "socksPort": Agent.socksPort
        }}}),
      $ = cheerio.load(response.content),
      ip = $('.clip').first().text();

    console.info('your ip is:', ip);

    return ip;
  },

  callWOTOR: function() {
    var cheerio = Npm.require('cheerio'),
      response = HTTP.get('http://www.mon-ip.com/'),
      $ = cheerio.load(response.content),
      ip = $('.clip').first().text();

    console.info('your ip is:', ip);

    return ip;
  }
});
/*
Meteor.call('callWOTOR');
Meteor.call('callByTOR');
Meteor.call('callByTOROnHttps');
Meteor.call('callWithEncoding');*/