const { default: AddressComponent } = require("../../prototype/addressComponent")


class Carts extends AddressComponent {
  constructor() {
    super()

    this.checkout = this.checkout.bind(this)
  }

  async checkout (req, res, next) {
    console.log(1111)
    console.dir(req.session,'req')
    res.send(123)
    
  }
}

export default new Carts()