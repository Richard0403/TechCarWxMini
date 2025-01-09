const {
  Base
} = require("../config/net_config")

class Request {
  constructor(parms) {
    this.withBaseURL = parms.withBaseURL
    this.baseURL = parms.baseURL
  }
  get(url, data) {
    return this.request('GET', url, data)
  }
  post(url, data) {
    return this.request('POST', url, data)
  }
  put(url, data) {
    return this.request('PUT', url, data)
  }
  request(method, url, data) {
    const vm = this
    let token = wx.getStorageSync('token')
    console.log('开始请求' + token)
    return new Promise((resolve, reject) => {
      wx.request({
        url: vm.withBaseURL ? vm.baseURL + url : url,
        data,
        method,
        header: {
          "Authorization": "Bearer " + token
        },
        success(res) {
          resolve(res.data)
        },
        fail() {
          reject({
            msg: '请求失败',
            url: vm.withBaseURL ? vm.baseURL + url : url,
            method,
            data
          })
        }
      })
    })
  }
}

const request = new Request({
  withBaseURL: true,
  baseURL: Base.baseUrl
})

module.exports = request