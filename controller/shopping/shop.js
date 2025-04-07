import AddressComponent from "../../prototype/addressComponent"
import CategoryHandle from './category'
import ShopModel from '../../models/shopping/shop'
class Shop extends AddressComponent {
  constructor() {
    super()
    this.getRestaurants = this.getRestaurants.bind(this)
  }

  /**
   * 获取餐馆列表
   * order_by:  
   *  1：起送价、
   *  2：配送速度、
   *  3：评分、
   *  4：智能排序(默认)、
   *  5：距离最近、
   *  6：销量最高
   */
	async getRestaurants(req, res, next){
		const {
			latitude,
			longitude,
			offset = 0,
			limit = 20,
			keyword,
			restaurant_category_id,
			order_by,
			extras,
			delivery_mode = [],
			support_ids = [],
			restaurant_category_ids = [],
		} = req.query;

		try{
			if (!latitude) {
				throw new Error('latitude参数错误')
			}else if(!longitude){
				throw new Error('longitude参数错误');
			}
		}catch(err){
			console.log('latitude,longitude参数错误');
			res.send({
				status: 0,
				type: 'ERROR_PARAMS',
				message: err.message
			})
			return
		}
		let filter = {};
		//获取对应食品种类
		if (restaurant_category_ids.length && Number(restaurant_category_ids[0])) {
			const category =  await CategoryHandle.findById(restaurant_category_ids[0]);
			Object.assign(filter, {category})
		}
		//按照距离，评分，销量等排序
		let sortBy = {};
		if (Number(order_by)) {
			switch(Number(order_by)){
				case 1:
					Object.assign(sortBy, {float_minimum_order_amount: 1});
					break;
				case 2:
					Object.assign(filter, {location: {$near: [longitude, latitude]}});
					break;
				case 3:
					Object.assign(sortBy, {rating: -1});
					break;
				case 5:
					Object.assign(filter, {location: {$near: [longitude, latitude]}});
					break;
				case 6:
					Object.assign(sortBy, {recent_order_num: -1});
					break;
			}
		}
		//查找配送方式
		if (delivery_mode.length) {
			delivery_mode.forEach(item => {
				if (Number(item)) {
					Object.assign(filter, {'delivery_mode.id': Number(item)})
				}
			})
		}
		//查找活动支持方式
		if (support_ids.length) {
			const filterArr = []; 
			support_ids.forEach(item => {
				if (Number(item) && (Number(item) !== 8)) {
					filterArr.push(Number(item))
				}else if(Number(item) == 8){ //品牌保证特殊处理
					Object.assign(filter, {is_premium: true})
				}
			})
			if (filterArr.length) {
				//匹配同时拥有多种活动的数据
				Object.assign(filter, {'supports.id': {$all: filterArr}})
			}
		}

		const restaurants = await ShopModel.find(filter, '-_id').sort(sortBy).limit(Number(limit)).skip(Number(offset))
		const from = latitude + ',' + longitude;
		let to = '';
		//获取百度地图测局所需经度纬度
		restaurants.forEach((item, index) => {
			const slpitStr = (index == restaurants.length -1) ? '' : '|';
			to += item.latitude + ',' + item.longitude + slpitStr;
		})
		try{
			if (restaurants.length) {
				//获取距离信息，并合并到数据中
				const distance_duration = await this.getDistance(from, to)
				restaurants.map((item, index) => {
					return Object.assign(item, distance_duration[index])
				})
			}
		}catch(err){
			// 百度地图达到上限后会导致加车失败，需优化
			console.log('从addressComoponent获取测距数据失败', err);
			restaurants.map((item, index) => {
				return Object.assign(item, {distance: '10公里', order_lead_time: '40分钟'})
			})
		}
		try{
			res.send(restaurants)
		}catch(err){
			res.send({
				status: 0,
				type: 'ERROR_GET_SHOP_LIST',
				message: '获取店铺列表数据失败'
			})
		}
	}
}


export default new Shop()