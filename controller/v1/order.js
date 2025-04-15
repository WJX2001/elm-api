
import BaseComponent from "../../prototype/baseComponent"

class Order extends BaseComponent {


  constructor() {
    super()
    this.postOrder = this.postOrder.bind(this)
  }

  /**
   * 下单接口
   * POST /v1/users/:user_id/carts/:cart_id/orders
   */
  async postOrder (req, res, next) {
    console.log(req.body)
  }
}

export default new Order()