let querystring = require('querystring');

module.exports = {
  json () {
    return (req, res, next) => {
      if (req.headers['content-type'] === 'application/json') {
        let arr = []
        req.on('data', chunk => {
          arr.push(chunk)
        })
        req.on('end', () => {
          req.body = JSON.parse(Buffer.concat(arr).toString())
          next()
        })
      }else {
        next()
      }
    }
  },
  urlencoded() {
    return (req, res, next) => {
      if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
        let arr = []
        req.on('data', chunk => {
          arr.push(chunk)
        })
        req.on('end', () => {
          let str = Buffer.concat(arr).toString()
          req.body = querystring.parse(str);
          next()
        })
      }else {
        next()
      }
    }
  }
}
