

class CityHandle {

  constructor() {
    this.getCity = this.getCity.bind(this)
  }

  async getCity(req, res) {
    res.send('123');
  }
}


export default new CityHandle()