import AddressComponent from "../../prototype/addressComponent"
import CategoryHandle from './category'
import ShopModel from '../../models/shopping/shop'
import formidable from "formidable"
import Rating from "../ugc/rating"
import Food from './food'
class Shop extends AddressComponent {
	constructor() {
		super()
		this.addShop = this.addShop.bind(this)
		this.getRestaurants = this.getRestaurants.bind(this)
	}


	/**  
	 * 添加餐馆
	 * POST /shopping/addshop
	 */

	async addShop (req, res, next) {
		let restaurant_id
		try {
			restaurant_id = await this.getId('restaurant_id')
		} catch (err) {
			console.log('获取商店id失败')
			res.send({
				type: 'ERROR_DATA',
				message: '获取数据失败'
			})
			return
		}

		const form = formidable({multiples: true})
		// await new Promise((resolve, reject) => {
		// 	form.parse(req, (err, fields,files) => {
		// 		console.log('11111')
		// 	})
		// })
		form.parse(req, async (err, fields, files) => {
			// const a = { fields }
			console.log(fields, '111')
			try {
				if (!fields.name[0]) {
					throw new Error('必须填写商店名称')
				} else if (!fields.address) {
					throw new Error('必须填写商店地址')
				} else if (!fields.phone) {
					throw new Error('必须填写联系电话')
				} else if (!fields.latitude || !fields.longitude) {
					throw new Error('商店位置信息错误')
				} else if (!fields.category) {
					throw new Error('必须上传食品种类')
				}
			} catch (err) {
				console.log('前台参数出错', err.message)
				res.send({
					status: 0,
					type: 'ERROR_PARAMS',
					message: err.message
				})
				return
			}

			const exists = await ShopModel.findOne({ name: fields.name })
			if (exists) {
				res.send({
					status: 0,
					type: 'RESTURANT_EXISTS',
					message: '店铺已存在，请尝试其他店铺名称'
				})
				return
			}

			// 营业时间
			const opening_hours = fields.startTime && fields.endTime ? fields.startTime + '/' + fields.endTime : "8:30/20:30"
			const newShop = {
				name: fields.name,
				address: fields.address,
				description: fields.description || '',
				float_delivery_fee: fields.float_delivery_fee || 0,
				float_minimum_order_amount: fields.float_minimum_order_amount || 0,
				id: restaurant_id,
				is_premium: fields.is_premium || false,
				is_new: fields.new || false,
				latitude: fields.latitude,
				longitude: fields.longitude,
				location: [fields.longitude, fields.latitude],
				opening_hours: [opening_hours],
				phone: fields.phone,
				promotion_info: fields.promotion_info || "欢迎光临，用餐高峰请提前下单，谢谢",
				rating: (4 + Math.random()).toFixed(1),
				rating_count: Math.ceil(Math.random() * 1000),
				recent_order_num: Math.ceil(Math.random() * 1000),
				status: Math.round(Math.random()),
				image_path: fields.image_path,
				category: fields.category,
				piecewise_agent_fee: {
					tips: "配送费约¥" + (fields.float_delivery_fee || 0),
				},
				activities: [],
				supports: [],
				license: {
					business_license_image: fields.business_license_image || '',
					catering_service_license_image: fields.catering_service_license_image || '',
				},
				identification: {
					company_name: "",
					identificate_agency: "",
					identificate_date: "",
					legal_person: "",
					licenses_date: "",
					licenses_number: "",
					licenses_scope: "",
					operation_period: "",
					registered_address: "",
					registered_number: "",
				},
			}

			//配送方式
			if (fields.delivery_mode) {
				Object.assign(newShop, {
					delivery_mode: {
						color: "57A9FF",
						id: 1,
						is_solid: true,
						text: "蜂鸟专送"
					}
				})
			}

			// TODO: 临时处理
			if (fields.activities) {
				// console.log(fields.activities.name,'123')
				const tmp = JSON.parse(fields.activities)

				console.log(tmp[0], '456')
				// 商店支持的活动
				tmp.forEach((item, index) => {
					switch (item.icon_name) {
						case '减':
							item.icon_color = 'f07373'
							item.id = index + 1
							break
						case '特':
							item.icon_color = 'EDC123'
							item.id = index + 1
							break
						case '新':
							item.icon_color = '70bc46'
							item.id = index + 1
							break
						case '领':
							item.icon_color = 'E3EE0D'
							item.id = index + 1
							break
					}
					newShop.activities.push(item)
				})
			}
			// fields.activities.forEach((item, index) => {
			// 	switch (item.icon_name) {
			// 		case '减':
			// 			item.icon_color = 'f07373'
			// 			item.id = index + 1
			// 			break
			// 		case '特':
			// 			item.icon_color = 'EDC123'
			// 			item.id = index + 1
			// 			break
			// 		case '新':
			// 			item.icon_color = '70bc46'
			// 			item.id = index + 1
			// 			break
			// 		case '领':
			// 			item.icon_color = 'E3EE0D'
			// 			item.id = index + 1
			// 			break
			// 	}
			// 	newShop.activities.push(item)
			// })


			if (fields.bao) {
				newShop.supports.push({
					description: "已加入“外卖保”计划，食品安全有保障",
					icon_color: "999999",
					icon_name: "保",
					id: 7,
					name: "外卖保"
				})
			}

			if (fields.zhun) {
				newShop.supports.push({
					description: "准时必达，超时秒赔",
					icon_color: "57A9FF",
					icon_name: "准",
					id: 9,
					name: "准时达"
				})
			}
			if (fields.piao) {
				newShop.supports.push({
					description: "该商家支持开发票，请在下单时填写好发票抬头",
					icon_color: "999999",
					icon_name: "票",
					id: 4,
					name: "开发票"
				})
			}

			try {
				// 保存数据，并增加对应食品种类的数量
				const shop = new ShopModel(newShop)
				await shop.save()
				CategoryHandle.addCategory(fields.category)
				Rating.initData(restaurant_id)
				Food.initData(restaurant_id)
				res.send({
					status: 1,
					success: '添加餐馆成功',
					shopDetail: newShop
				})
			} catch (err) {
				console.log('商铺写入数据库失败')
				res.send({
					status: 0,
					type: 'ERROR_SERVER',
					message: '添加商铺失败',
				})
			}
		})
	}


	// 搜索餐馆
	async searchResaturant (req, res, next) {
		const { geohash, keyword } = req.query
		try {
			if (!geohash || geohash.indexOf(',') == -1) {
				throw new Error('经纬度参数错误')
			} else if (!keyword) {
				throw new Error('关键词参数错误')
			}
		} catch (err) {
			console.log('搜索商铺参数错误')
			res.send({
				status: 0,
				type: 'ERROR_PARAMS',
				message: err.message,
			})
			return
		}

		try {
			const reg = new RegExp(keyword, 'gi')
			const restaurants = await ShopModel.find({ name: reg }, '-_id').limit(50)
			if (restaurants.length) {
				const [latitude, longitude] = geohash.split(',')
				const from = latitude + ',' + longitude
				let to = ''
				//获取百度地图测局所需经度纬度
				restaurants.forEach((item, index) => {
					const slpitStr = (index == restaurants.length - 1) ? '' : '|'
					to += item.latitude + ',' + item.longitude + slpitStr
				})
				//获取距离信息，并合并到数据中
				const distance_duration = await this.getDistance(from, to)
				restaurants.map((item, index) => {
					return Object.assign(item, distance_duration[index])
				})
			}
			res.send(restaurants)
		} catch (err) {
			console.log('搜索餐馆数据失败', err)
			res.send({
				status: 0,
				type: 'ERROR_DATA',
				message: '搜索餐馆数据失败'
			})
		}
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
	async getRestaurants (req, res, next) {
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
		} = req.query

		try {
			if (!latitude) {
				throw new Error('latitude参数错误')
			} else if (!longitude) {
				throw new Error('longitude参数错误')
			}
		} catch (err) {
			console.log('latitude,longitude参数错误')
			res.send({
				status: 0,
				type: 'ERROR_PARAMS',
				message: err.message
			})
			return
		}
		let filter = {}
		//获取对应食品种类
		if (restaurant_category_ids.length && Number(restaurant_category_ids[0])) {
			const category = await CategoryHandle.findById(restaurant_category_ids[0])
			Object.assign(filter, { category })
		}
		//按照距离，评分，销量等排序
		let sortBy = {}
		if (Number(order_by)) {
			switch (Number(order_by)) {
				case 1:
					Object.assign(sortBy, { float_minimum_order_amount: 1 })
					break
				case 2:
					Object.assign(filter, { location: { $near: [longitude, latitude] } })
					break
				case 3:
					Object.assign(sortBy, { rating: -1 })
					break
				case 5:
					Object.assign(filter, { location: { $near: [longitude, latitude] } })
					break
				case 6:
					Object.assign(sortBy, { recent_order_num: -1 })
					break
			}
		}
		//查找配送方式
		if (delivery_mode.length) {
			delivery_mode.forEach(item => {
				if (Number(item)) {
					Object.assign(filter, { 'delivery_mode.id': Number(item) })
				}
			})
		}
		//查找活动支持方式
		if (support_ids.length) {
			const filterArr = []
			support_ids.forEach(item => {
				if (Number(item) && (Number(item) !== 8)) {
					filterArr.push(Number(item))
				} else if (Number(item) == 8) { //品牌保证特殊处理
					Object.assign(filter, { is_premium: true })
				}
			})
			if (filterArr.length) {
				//匹配同时拥有多种活动的数据
				Object.assign(filter, { 'supports.id': { $all: filterArr } })
			}
		}

		const restaurants = await ShopModel.find(filter, '-_id').sort(sortBy).limit(Number(limit)).skip(Number(offset))
		const from = latitude + ',' + longitude
		let to = ''
		//获取百度地图测局所需经度纬度
		restaurants.forEach((item, index) => {
			const slpitStr = (index == restaurants.length - 1) ? '' : '|'
			to += item.latitude + ',' + item.longitude + slpitStr
		})
		try {
			if (restaurants.length) {
				//获取距离信息，并合并到数据中
				const distance_duration = await this.getDistance(from, to)
				restaurants.map((item, index) => {
					return Object.assign(item, distance_duration[index])
				})
			}
		} catch (err) {
			// 百度地图达到上限后会导致加车失败，需优化
			console.log('从addressComoponent获取测距数据失败', err)
			restaurants.map((item, index) => {
				return Object.assign(item, { distance: '10公里', order_lead_time: '40分钟' })
			})
		}
		try {
			res.send(restaurants)
		} catch (err) {
			res.send({
				status: 0,
				type: 'ERROR_GET_SHOP_LIST',
				message: '获取店铺列表数据失败'
			})
		}
	}

	/** 
	 * 获取餐馆详情
	 * GET /shopping/restaurant/:shopid
	 */

	async getRestaurantDetail (req, res, next) {
		const restaurant_id = req.params.restaurant_id
		if (!restaurant_id || !Number(restaurant_id)) {
			console.log('获取餐馆详情参数ID错误')
			res.send({
				status: 0,
				type: 'ERROR_PARAMS',
				message: '餐馆ID参数错误',
			})
			return
		}

		try {
			const restaurant = await ShopModel.findOne({ id: restaurant_id }, '-_id')
			res.send(restaurant)
		} catch (err) {
			console.log('获取餐馆详情失败', err)
			res.send({
				status: 0,
				type: 'GET_DATA_ERROR',
				message: '获取餐馆详情失败'
			})
		}
	}
}


export default new Shop()