import formidable from "formidable"
import BaseComponent from "../../prototype/baseComponent"
import AddressModel from '../../models/v1/address'


class Address extends BaseComponent {
  constructor() {
    super()
    this.addAddress = this.addAddress.bind(this)
  }


  /**
   * 添加收货地址
   * POST /v1/users/{user_id}/addresses
   */
  async addAddress (req, res, next) {
    const { user_id } = req.params
    const { address, address_detail, geohash, name, phone, phone_bk, sex, tag, tag_type } = req.body
    try {
      if (!user_id || !Number(user_id)) {
        throw new Error('用户ID参数错误')
      } else if (!address) {
        throw new Error('地址信息错误')
      } else if (!address_detail) {
        throw new Error('详细地址信息错误')
      } else if (!geohash) {
        throw new Error('geohash参数错误')
      } else if (!name) {
        throw new Error('收货人姓名错误')
      } else if (!phone) {
        throw new Error('收获手机号错误')
      } else if (!sex) {
        throw new Error('性别错误')
      } else if (!tag) {
        throw new Error('标签错误')
      } else if (!tag_type) {
        throw new Error('标签类型错误')
      }
    } catch (err) {
      console.log(err.message)
      res.send({
        status: 0,
        type: 'GET_WRONG_PARAM',
        message: err.message
      })
      return
    }

    try {
      const address_id = await this.getId('address_id')
      const newAddress = {
        id: address_id,
        address,
        phone,
        phone_bk: phone_bk && phone_bk,
        name,
        st_geohash: geohash,
        address_detail,
        sex,
        tag,
        tag_type,
        user_id,
      }
      await AddressModel.create(newAddress)
      res.send({
        status: 1,
        success: '添加地址成功'
      })
    } catch (err) {
      console.log('添加地址失败', err)
      res.send({
        status: 0,
        type: 'ERROR_ADD_ADDRESS',
        message: '添加地址失败'
      })
    }
  }

  /** 
   * 删除收获地址
   * POST /v1/users/:user_id/addresses/:address_id
   */
  async deleteAddress (req, res, next) {
    const { user_id, address_id } = req.params
    if (!user_id || !Number(user_id) || !address_id || !Number(address_id)) {
      res.send({
        type: 'ERROR_PARAMS',
        message: '参数错误',
      })
      return
    }
    try {
      await AddressModel.findOneAndRemove({ id: address_id })
      res.send({
        status: 1,
        success: '删除地址成功',
      })
    } catch (err) {
      console.log('删除收获地址失败', err)
      res.send({
        type: 'ERROR_DELETE_ADDRESS',
        message: '删除收获地址失败'
      })
    }
  }

}

export default new Address()