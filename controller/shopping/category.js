import BaseComponent from "../../prototype/baseComponent"
import CategoryModel from '../../models/shopping/category'
import DeliveryModel from '../../models/shopping/delivery'

class Category extends BaseComponent {
	constructor() {
		super()
	}

	/**
	 * 获取所有餐馆分类和数量
	 * GET /shopping/v2/restaurant/category
	 */
	async getCategories (req, res, next) {
		try {
			const categories = await CategoryModel.find({}, '-_id')
			res.send(categories)
		} catch (err) {
			console.log('获取categories失败')
			res.send({
				status: 0,
				type: 'ERROR_DATA',
				message: '获取categories失败'
			})
		}
	}


	/**
	 * 获取配送方式
	 * GET /shopping/v1/restaurants/delivery_modes
	 */
	async getDelivery (req, res, next) {
		try {
			const deliveries = await DeliveryModel.find({}, '-_id')
			res.send(deliveries)
		} catch (err) {
			console.log('获取配送方式数据失败')
			res.send({
				status: 0,
				type: 'ERROR_DATA',
				message: '获取配送方式数据失败'
			})
		}
	}


	async findById (id) {
		try {
			const CateEntity = await CategoryModel.findOne({ 'sub_categories.id': id })
			let categoName = CateEntity.name
			CateEntity.sub_categories.forEach(item => {
				if (item.id == id) {
					categoName += '/' + item.name
				}
			})
			return categoName
		} catch (err) {
			console.log('通过category id获取数据失败')
			throw new Error(err)
		}
	}
}

export default new Category()