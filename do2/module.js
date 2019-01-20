const path = require('path')
const fs = require('fs')
const vm = require('vm')

function Module (id) {
  this.id = id;
  this.exports = {};
}

Module._cache = {}
Module.wrapper = ['(function(exports,require,module){', '})']
Module._extensions = {
  '.js' (module) {
    let content = fs.readFileSync(module.id, 'utf8')
    content = Module.wrapper[0] + content + Module.wrapper[1]
    let fn = vm.runInThisContext(content)
    fn.call(module.exports, exports, req, module)
  },
  '.json' (module) {
    module.exports = JSON.parse(fs.readFileSync(module.id, 'utf8'))
  }
}
Module._resolveFilename = function (filename) {
  let absPath = path.resolve(filename)
  let ext = path.extname(absPath)
  if (!ext) {
    let typeList = Object.keys(Module._extensions)
    for (let i = 0; i < typeList.length; i++) {
      let name = `${absPath}.${typeList[i]}`
      try {
        fs.accessSync(name)
        return name
      } catch (error) {
        console.log(error)
      }
    }
  } else {
    return absPath
  }
}

function req (id) {
  let absPath = Module._resolveFilename(id)
  if (Module_cache[absPath]) {
    return Module._cache[absPath].exports
  }
  let module = new Module(absPath)
  Module._cache[absPath] = module
  tryModuleLoad(module)
  return module.exports
}


function tryModuleLoad (module) {
  let extension = path.extname(module.id) || '.js'
  Module._extensions[extension](module)
}

const str = require('./a')
console.log(str)
