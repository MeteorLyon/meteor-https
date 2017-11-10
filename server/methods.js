import { socks, socksSsl} from 'meteor/rebolon:socks5'

const torHost = '127.0.0.1'
const torPort = 9150

const cheerio = Npm.require('cheerio')

/**
 * Take care, some uri are protected with tools like cloudfare, so if the ip used with Tor is blacklisted from those
 * tools, you will have a 403 with a body that contain a form with a captcha.
 */
Meteor.methods({
  /**
   * start your TOR proxy and then call this methods
   */
  callByTOROnHttps: function() {
    const Agent = new socksSsl.Agent({
        socksHost: torHost,
        socksPort: torPort
      }),
      uri = 'https://localise-moi.com/'

    let response, $, ip

    try {
      response = HTTP.get(uri, {
        "npmRequestOptions": {
          "strictSSL": true,
          "agentClass": Agent.getClass,
          "agentOptions": {
            "socksHost": Agent.socksHost,
            "socksPort": Agent.socksPort
          }
        }
      })
      $ = cheerio.load(response.content)
      ip = $('.location-value.lead').eq(2).text()

      console.info('your ip is:', ip)
    } catch (e) {
      console.error('woups...', e)
    }

    return ip
  },

  /**
   * start your TOR proxy and then call this methods
   */
  callByTOR: function() {
    const Agent = new socks.Agent({
        socksHost: torHost,
        socksPort: torPort
      }),
      uri = 'http://monip.fr/mon-ip'

    let response, $, ip

    try {
      response = HTTP.get(uri, {
        "npmRequestOptions": {
          "agentClass": Agent.getClass,
          "agentOptions": {
            "socksHost": Agent.socksHost,
            "socksPort": Agent.socksPort
          }
        }
      })
      $ = cheerio.load(response.content)
      ip = $('.big.ipinfo tr td').first().text()

      console.info('your ip is:', ip)
    } catch (e) {
      console.error('woups...', e)
    }

    return ip
  },

  callWOTOR: function() {
    let response, $, ip

    try {
      response = HTTP.get('http://monip.fr/mon-ip')
      $ = cheerio.load(response.content)
      ip = $('.big.ipinfo tr td').first().text()

      console.info('your ip is:', ip)
    } catch (e) {
      console.error('woups...', e)
    }

    return ip
  }
})

/*
Meteor.call('callWOTOR');
Meteor.call('callByTOR');
Meteor.call('callByTOROnHttps');
Meteor.call('callWithEncoding');*/
