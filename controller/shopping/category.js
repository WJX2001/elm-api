import BaseComponent from "../../prototype/baseComponent"
import CategoryModel from '../../models/shopping/category'


class Category extends BaseComponent {
  constructor() {
    super()
  }


  async findById(id){
		try{
			const CateEntity = await CategoryModel.findOne({'sub_categories.id': id});
			let categoName = CateEntity.name;
			CateEntity.sub_categories.forEach(item => {
				if (item.id == id) {
					categoName += '/' + item.name;
				}
			})
			return categoName
		}catch(err){
			console.log('通过category id获取数据失败')
			throw new Error(err)
		}
	}
}

export default new Category()