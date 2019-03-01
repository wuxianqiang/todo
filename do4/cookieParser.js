const crypto = require('crypto');
let querystring = require('querystring');
let sign = (value, secret)=>{
  return require('crypto').createHmac('sha256',secret).update(value.toString()).digest('base64').replace(/[+/]/g,'');
}

module.exports = function (secret) {
  return function (req, res, next) {
    req.secret = secret
    let cookies = querystring.parse(req.headers.cookie,'; ') || {}
    req.cookies = cookies
    let content = []
    res.cookie = function (key, value, options = {}) {
      let arr = []
      if (options.maxAge) {
        arr.push(`Max-Age=${options.maxAge}`)
      }
      if (options.httpOnly) {
        arr.push(`httpOnly=${options.httpOnly}`)
      }
      if (options.path) {
        arr.push(`path=${options.path}`);
      }
      if (options.signed) {
        value = value + '.' + sign(value, secret)
      }
      content.push(`${key}=${value};` + arr.join('; '))
      res.setHeader('Set-Cookie', content)
    }
    next()
  }
}
