import Cities from '../../models/v1/cities'
import AddressComponent from '../../prototype/addressComponent'
import pinyin from "pinyin"


class CityHandle extends AddressComponent {

  constructor() {
    super()
    this.getCity = this.getCity.bind(this)
    this.pois = this.pois.bind(this)
  }


  async getCity (req, res) {
    const type = req.query.type
    let cityInfo
    try {
      switch (type) {
        case 'guess':
          // 获取到了城市名字 例如： shanghai
          const city = await this.getCityName(req)
          cityInfo = await Cities.cityGuess(city)
          break
      }
      res.send(cityInfo)
    } catch (error) {
      res.send({
        name: 'ERROR_DATA',
        message: '获取数据失败',
      })
    }

    // res.send('123')
  }

  /**
   * 获取所选城市信息
   * GET /v1/cities/{id}
   */
  async getCityById (req, res, next) {
    const cityid = req.params.id
    if (isNaN(cityid)) {
      res.json({
        name: 'ERROR_PARAM_TYPE',
        message: '参数错误'
      })
      return
    }

    try {
      const cityInfo = await Cities.getCityById(cityid)
      res.send(cityInfo)
    } catch (error) {

    }
  }

  // 获取城市名称
  async getCityName (req) {
    try {
      const cityInfo = await this.guessPosition(req)
      /**
       * 汉字转换为拼音
       */
      const pinyinArr = pinyin(cityInfo.city, {
        style: pinyin.STYLE_NORMAL
      })
      let cityName = ''
      console.log(pinyinArr, '这是pinyinArr')
      pinyinArr.forEach(item => {
        cityName += item[0]
      })
      return cityName
    } catch (error) {
      return '北京'
    }
  }

  /**
   * 根据经纬度详细定位
   * GET /v2/pois/:geohash
   */
  async pois (req, res, next) {
    try {
      const geohash = req.params.geohash || ''
      if (geohash.indexOf(',') == -1) {
        res.send({
          status: 0,
          type: 'ERROR_PARAMS',
          message: '参数错误',
        })
        return
      }
      const poisArr = geohash.split(',')
      const { result } = await this.getpois(poisArr[0], poisArr[1])
      const address = {
        address: result.address,
        city: result.address_component.province,
        geohash,
        latitude: poisArr[0],
        longitude: poisArr[1],
        name: result.formatted_addresses.recommend,
      }
      res.send(address)
    } catch (error) {
      console.log('getpois返回信息失败', error)
      res.send({
        status: 0,
        type: 'ERROR_DATA',
        message: '获取数据失败',
      })
    }
  }


}


export default new CityHandle()


