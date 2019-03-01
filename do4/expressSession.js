const crypto = require('crypto');
let querystring = require('querystring');
let sign = (value, secret)=>{
  return require('crypto').createHmac('sha256',secret).update(value.toString()).digest('base64').replace(/[+/]/g,'');
}

module.exports = function (options = {}) {
  return function (req, res, next) {
    req.session = {}
    let {secret, cookie} = options
    for (const key in req.session) {
      let value = req.session[key]
      let arr = []
      let content = []
      if (cookie.maxAge) {
        arr.push(`Max-Age=${cookie.maxAge}`)
      }
      if (cookie.httpOnly) {
        arr.push(`httpOnly=${cookie.httpOnly}`)
      }
      if (cookie.path) {
        arr.push(`path=${cookie.path}`);
      }
      if (secret) {
        value = value + '.' + sign(value, secret)
      }
      content.push(`${key}=${value};` + arr.join('; '))
      res.setHeader('Set-Cookie', content)
    }
    next()
  }
}
