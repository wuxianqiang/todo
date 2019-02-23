let b1 = Buffer.from('hello');
let b2 = Buffer.from('world');



Buffer.concat = function concat(list, totalLength = list.reduce((a, b) => a + b.length, 0)) {
  let buf = Buffer.alloc(totalLength) // 创建一个内存空间
  let pos = 0;
  list.forEach(item => {
    item.copy(buf, pos)
    pos += item.length
  })
  return buf
}

Promise.prototype.finally = function (callback) {
  return this.then(data => {
    callback()
    return data
  }, err => {
    callback()
    return err
  })
}

let res = Buffer.concat([b1, b2])
console.log(res.toString())
