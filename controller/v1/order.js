
import BaseComponent from "../../prototype/baseComponent"
import CartModel from '../../models/v1/cart'
import OrderModel from '../../models/bos/order'
import dtime from 'time-formater'
class Order extends BaseComponent {
  constructor() {
    super()
    this.postOrder = this.postOrder.bind(this)
  }

  /**
   * 下单
   * POST /v1/users/:user_id/carts/:cart_id/orders
   */
  async postOrder (req, res, next) {
    console.log(req.body)
    const { user_id, cart_id } = req.params
    const { address_id, entities } = req.body
    try {
      if (!(entities instanceof Array) || !entities.length) {
        throw new Error('entities 参数有误')
      } else if (!(entities[0] instanceof Array) || !entities[0].length) {
        throw new Error('entities 参数错误')
      } else if (!address_id) {
        throw new Error('address_id 参数错误')
      } else if (!user_id || !Number(user_id)) {
        throw new Error('user_id 参数错误')
      } else if (!cart_id || !Number(cart_id)) {
        throw new Error('cart_id 参数错误')
      } else if (!user_id) {
        throw new Error('未登陆')
      }
    } catch (err) {
      console.log(err.message, err)
      res.send({
        status: 0,
        type: 'ERROR_PARAMS',
        message: err.message
      })
      return
    }

    let cartDetail
    let order_id
    try {
      cartDetail = await CartModel.findOne({ id: cart_id })
      order_id = await this.getId('order_id')
    } catch (err) {
      console.log('获取数据失败', err)
      res.send({
        status: 0,
        type: 'ERROR_GET_DATA',
        message: '获取订单失败',
      })
      return
    }

    const deliver_fee = { price: cartDetail.cart.deliver_amount }
    const orderObj = {
      basket: {
        group: entities,
        packing_fee: {
          name: cartDetail.cart.extra[0].name,
          price: cartDetail.cart.extra[0].price,
          quantity: cartDetail.cart.extra[0].quantity,
        },
        deliver_fee
      },
      restaurant_id: cartDetail.cart.restaurant_id,
      restaurant_image_url: cartDetail.cart.restaurant_info.image_path,
      restaurant_name: cartDetail.cart.restaurant_info.name,
      formatted_created_at: dtime().format('YYYY-MM-DD HH:mm'),
      order_time: new Date().getTime(),
      time_pass: 900,
      status_bar: {
        color: 'f60',
        image_type: '',
        sub_title: '15分钟内支付',
        title: '',
      },
      total_amount: cartDetail.cart.total,
      total_quantity: entities[0].length,
      unique_id: order_id,
      id: order_id,
      user_id,
      address_id,
    }

    try {
      await OrderModel.create(orderObj)
      res.send({
        status: 1,
        success: '下单成功，请及时付款',
        need_validation: false,
      })
    } catch (err) {
      console.log('保存订单数据失败')
      res.send({
        status: 0,
        type: 'ERROR_SAVE_ORDER',
        message: '保存订单失败'
      })
    }

  }

  /**
   * 获取订单列表
   * GET /bos/v2/users/:user_id/orders
   */

  async getOrders (req, res, next) {
    const user_id = req.params.user_id
    const { limit = 0, offset = 0 } = req.query

    try {
      if (!user_id || !Number(user_id)) {
        throw new Error('user_id参数错误')
      } else if (!Number(limit)) {
        throw new Error('limit参数错误')
      } else if (typeof Number(offset) !== 'number') {
        throw new Error('offset参数错误')
      }
    } catch (err) {
      console.log(err.message, err)
      res.send({
        status: 0,
        type: 'ERROR_PARAMS',
        message: err.message
      })
      return
    }

    try {
      const orders = await OrderModel.find({ user_id }).sort({ id: -1 }).limit(Number(limit)).skip(Number(offset))
      const timeNow = new Date().getTime()
      orders.map(item => {
        if (timeNow - item.order_time < 900000) {
          item.status_bar.title = '等待支付'
        } else {
          item.status_bar.title = '支付超时'
        }
        item.time_pass = Math.ceil((timeNow - item.order_time) / 1000)
        item.save()
        return item
      })
      res.send(orders)
    } catch (err) {
      console.log('获取订单列表失败', err)
      res.send({
        status: 0,
        type: 'ERROR_GET_ORDER_LIST',
        message: '获取订单列表失败'
      })
    }

  }
}

export default new Order()