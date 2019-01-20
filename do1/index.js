class Promise2 {
  constructor (executor) {
    this.status = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []
    const resolve = value => {
      if (this.status === 'pending') {
        this.status = 'fulfilled'
        this.value = value
        this.onFulfilledCallbacks.forEach(fn => fn())
      }
    }
    const reject = reason => {
      if (this.status === 'pending') {
        this.status = 'rejected'
        this.reason = reason
        this.onRejectedCallbacks.forEach(fn => fn())
      }
    }
    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }
  then (onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : data => data
    onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err }
    let promise2 = new Promise2((resolve, reject) => {
      if (this.status === 'fulfilled') {
        setTimeout(() => {
          // 代码异步执行，上面的try、catch就没有用了
          try {
            const x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0);
      }
      if (this.status === 'rejected') {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0);
      }
      if (this.status === 'pending') {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0);
        })
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0);
        })
      }
    })
    return promise2
  }
  catch (callback) {
    return this.then(null, callback)
  }
  finally (callback) {
    return this.then(
      data => {
        return Promise2.resolve(callback()).then(() => data)
      },
      err => {
        return Promise2.reject(callback()).then(() => {
          throw err
        })
      }
    )
  }
  static resolve (data) {
    return new Promise2((resolve, reject) => {
      resolve(data)
    })
  }
  static reject (err) {
    return new Promise2((resolve, reject) => {
      reject(err)
    })
  }
  static all (promises) {
    return new Promise2((resolve, reject) => {
      const arr = []
      let currentIndex = 0
      const processData = (index, data) => {
        arr[index] = data
        currentIndex++
        if (currentIndex === promises.length) {
          resolve(arr)
        }
      }
      promises.forEach((fn, index) => {
        fn.then(data => {
          processData(index, data)
        }, err => {
          reject(err)
        })
      })
    })
  }
  static race (promises) {
    return new Promise2((resolve, reject) => {
      promises.forEach(fn => {
        fn.then(resolve, reject)
      })
    })
  }
}
function resolvePromise (promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError('类型错误'))
  }
  let called = false;
  if (x !== null && (typeof x === 'function' || typeof x === 'object')) {
    try {
      let then = x.then
      if (typeof then === 'function') {
        then.call(
          x,
          y => {
            if (!called) { called = true } else { return }
            // resolve 里面也可以写 promise，递归直到解析为常量
            resolvePromise(promise2, y, resolve, reject)
          },
          r => {
            if (!called) { called = true } else { return }
            reject(r)
          }
        )
      } else {
        if (!called) { called = true } else { return }
        resolve(x)
      }
    } catch (error) {
      reject(error)
    }
  } else {
    resolve(x)
  }
}
