import BaseComponent from "../../prototype/baseComponent"
import formidable from "formidable"
import { Food as FoodModel, Menu as MenuModel } from '../../models/shopping/food'
class Food extends BaseComponent {
  constructor() {
    super()
    this.defaultData = [{
      name: '热销榜',
      description: '大家喜欢吃，才叫真好吃。',
      icon_url: "5da3872d782f707b4c82ce4607c73d1ajpeg",
      is_selected: true,
      type: 1,
      foods: [],
    }, {
      name: '优惠',
      description: '美味又实惠, 大家快来抢!',
      icon_url: "4735c4342691749b8e1a531149a46117jpeg",
      type: 1,
      foods: [],
    }]

    this.initData = this.initData.bind(this)
    this.addFood = this.addFood.bind(this);
    this.addCategory = this.addCategory.bind(this)
  }

  async initData (restaurant_id) {
    for (let i = 0; i < this.defaultData.length; i++) {
      let category_id
      try {
        category_id = await this.getId('category_id')
      } catch (err) {
        console.log('获取category_id失败')
        throw new Error(err)
      }

      const defaultData = this.defaultData[i]
      const Category = { ...defaultData, id: category_id, restaurant_id }
      const newFood = new MenuModel(Category)

      try {
        await newFood.save()
        console.log('初始化食品数据成功')
      } catch (err) {
        console.log('初始化食品数据失败')
        throw new Error(err)
      }
    }
  }

  async addFood (req, res, next) {
    const form = formidable({})
    form.parse(req, async (err, fields, files) => {
      try {
        if (!fields.name[0]) {
          throw new Error('必须填写食品名称')
        } else if (!fields.image_path[0]) {
          throw new Error('必须上传食品图片')
        } else if (!fields.specs.length) {
          throw new Error('照烧填写一种规格')
        } else if (!fields.category_id[0]) {
          throw new Error('食品类型ID错误')
        } else if (!fields.restaurant_id[0]) {
          throw new Error('餐馆ID错误')
        }
      } catch (err) {
        console.log('前台参数错误', err.message)
        res.send({
          status: 0,
          type: 'ERROR_PARAMS',
          message: err.message
        })
        return
      }
      let category
      let restaurant
      try {
        category = await MenuModel.findOne({ id: fields.category_id })
        restaurant = await ShopModel.findOne({ id: fields.restaurant_id })
      } catch (err) {
        console.log('获取食品类型和餐馆信息失败')
        res.send({
          status: 0,
          type: 'ERROR_DATA',
          message: '添加食品失败'
        })
        return
      }

      let item_id
      try {
        item_id = await this.getId('item_id')
      } catch (err) {
        console.log('获取item_id失败')
        res.send({
          status: 0,
          type: 'ERROR_DATA',
          message: '添加食品失败'
        })
        return
      }

      const rating_count = Math.ceil(Math.random() * 1000)
      const month_sales = Math.ceil(Math.random() * 1000)
      const tips = rating_count + '评价 月售' + month_sales + '份'
      const newFood = {
        name: fields.name[0],
        description: fields.description[0],
        image_path: fields.image_path[0],
        activity: null,
        attributes: [],
        restaurant_id: fields.restaurant_id[0],
        category_id: fields.category_id[0],
        satisfy_rate: Math.ceil(Math.random() * 100),
        satisfy_count: Math.ceil(Math.random() * 1000),
        item_id,
        rating: (4 + Math.random()).toFixed(1),
        rating_count,
        month_sales,
        tips,
        specfoods: [],
        specifications: [],
      }

      if (fields.activity && fields.activity.length) {
        newFood.activity = {
          image_text_color: 'f1884f',
          icon_color: 'f07373',
          image_text: fields.activity,
        }
      }

      if (fields.attributes && fields.attributes.length) {
        fields.attributes.forEach(item => {
          let attr
          switch (item) {
            case '新':
              attr = {
                icon_color: '5ec452',
                icon_name: '新'
              }
              break
            case '招牌':
              attr = {
                icon_color: 'f07373',
                icon_name: '招牌'
              }
              break
          }
          newFood.attributes.push(attr)
        })
      }

      try {
        const [specfoods, specifications] = await this.getSpecfoods(fields, item_id)
        newFood.specfoods = specfoods
        newFood.specifications = specifications
      } catch (err) {
        console.log('添加specs失败', err)
        res.send({
          status: 0,
          type: 'ERROR_DATA',
          message: '添加食品失败'
        })
        return
      }

      try{
				const foodEntity = await FoodModel.create(newFood);
				category.foods.push(foodEntity);
				category.markModified('foods');
				await category.save();
				res.send({
					status: 1,
					success: '添加食品成功',
				});
			}catch(err){
				console.log('保存食品到数据库失败', err);
				res.send({
					status: 0,
					type: 'ERROR_DATA',
					message: '添加食品失败'
				})
			}
    })
  }



  /** 
   * 添加食品种类
   * POST /shopping/addcategory
   */

  async addCategory (req, res, next) {
    console.log(req, '我看看req')
    // 这里解析参数
    const { name, restaurant_id, description } = req.body
    // 对食品类型名称做处理
    try {
      if (!name) {
        throw new Error('必须填写食品类型名称')
      } else if (!restaurant_id) {
        throw new Error('餐馆ID错误')
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
    let category_id

    try {
      category_id = await this.getId('category_id')
    } catch (err) {
      console.log('获取category_id 失败')
      res.send({
        type: 'ERROR_DATA',
        message: '获取数据失败'
      })
      return
    }

    const foodObj = {
      name,
      description,
      restaurant_id,
      id: category_id,
      food: [],
    }
    // 保存菜单类型
    const newFood = new MenuModel(foodObj)
    try {
      await newFood.save()
      res.send({
        status: 1,
        success: '添加食品种类成功'
      })
    } catch (err) {
      console.log('保存数据失败')
      res.send({
        status: 0,
        type: 'ERROR_IN_SAVE_DATA',
        message: '保存数据失败',
      })
    }
  }




  /** 
   * 获取食品列表
   * /shopping/v2/menu
   */

  // async getMenu (req, res, next) {
  //   const restaurant_id = req.query.restaurant_id
  //   const allMenu = req.query.allMenu
  //   if (!restaurant_id || !Number(restaurant_id)) {
  //     console.log('获取餐馆参数ID错误')
  //     res.send({
  //       status: 0,
  //       type: 'ERROR_PARAMS',
  //       message: '餐馆ID参数错误',
  //     })
  //     return
  //   }
  //   let filter
  //   if (allMenu) {
  //     filter = { restaurant_id }
  //   } else {
  //     filter = { restaurant_id, $where: function () { return this.foods.length } }
  //   }
  //   try {
  //     const menu = await MenuModel.find(filter, '-_id')
  //     res.send(menu)
  //   } catch (err) {
  //     console.log('获取食品数据失败', err)
  //     res.send({
  //       status: 0,
  //       type: 'GET_DATA_ERROR',
  //       message: '获取食品数据失败'
  //     })
  //   }
  // }


  async getSpecfoods (fields, item_id) {
    let specfoods = [], specifications = []
    if (fields.specs.length < 2) {
      let food_id, sku_id
      try {
        sku_id = await this.getId('sku_id')
        food_id = await this.getId('food_id')
      } catch (err) {
        throw new Error('获取sku_id、food_id 失败')
      }

      specfoods.push({
        packing_fee: fields.specs[0].packing_fee,
        price: fields.specs[0].price,
        specs: [],
        specs_name: fields.specs[0].specs,
        name: fields.name[0],
        item_id,
        sku_id,
        food_id,
        restaurant_id: fields.restaurant_id[0],
        recent_rating: (Math.random() * 5).toFixed(1),
        recent_popularity: Math.ceil(Math.random() * 1000),
      })
    } else {
      specifications.push({
        values: [],
        name: "规格"
      })

      for (let i = 0; i < fields.specs.length; i++) {
        let food_id, sku_id
        try {
          sku_id = await this.getId('sku_id')
          food_id = await this.getId('food_id')
        } catch (err) {
          throw new Error('获取sku_id、food_id失败')
        }
        specfoods.push({
          packing_fee: fields.specs[i].packing_fee,
          price: fields.specs[i].price,
          specs: [{
            name: "规格",
            value: fields.specs[i].specs
          }],
          specs_name: fields.specs[i].specs,
          name: fields.name[0],
          item_id,
          sku_id,
          food_id,
          restaurant_id: fields.restaurant_id[0],
          recent_rating: (Math.random() * 5).toFixed(1),
          recent_popularity: Math.ceil(Math.random() * 1000),
        })
        specifications[0].values.push(fields.specs[i].specs)
      }
    }
    return [specfoods, specifications]
  }


}

export default new Food()