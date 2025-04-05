

import fetch from 'node-fetch';
export default class BaseComponent {
  constructor() {

  }

  // fetch方法 
  async fetch (url = '', data = {}, type = 'GET', resType = 'JSON') {
    type = type.toUpperCase()
    resType = resType.toUpperCase()
    if (type === 'GET') {
      let dataStr = '' // 数据拼接字符串
      Object.keys(data).forEach(key => {
        dataStr += key + '=' + data[key] + '&'
      })

      if (dataStr !== '') {
        dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'))
        url = url + '?' + dataStr
      }
    }

    let requestConfig = {
      method: type,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    }

    let responseJson

    if (type == 'POST') {
      Object.defineProperty(requestConfig, 'body', {
        value: JSON.stringify(data)
      })
    }
    try {
      const response = await fetch(url, requestConfig)
      if (resType === 'TEXT') {
        responseJson = await response.text()
      } else {
        responseJson = await response.json()
      }
    } catch (err) {
      console.log('获取http数据失败', err)
      throw new Error(err)
    }
    return responseJson
  }
}