
import ExplainModel from '../../models/v3/explain'

class Explain {
  constructor() {

  }

  /**  
   * 服务中心
   * GET /v3/profile/explain
   */
  async getExplain (req, res, next) {
    try {
      const explain = await ExplainModel.findOne()
      res.send(explain.data)
    } catch (err) {
      console.log('获取服务中心数据失败', err)
      res.send({
        status: 0,
        type: 'ERROR_GET_SERVER_DATA',
        message: '获取服务中心数据失败'
      })
    }
  }
}

export default new Explain()