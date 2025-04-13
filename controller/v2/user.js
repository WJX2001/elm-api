import AddressComponent from "../../prototype/addressComponent"
import UserModel from '../../models/v2/user'
import dtime from 'time-formater'
import UserInfoModel from '../../models/v2/userInfo'
import crypto from 'crypto'
import formidable from "formidable"
class User extends AddressComponent {
  constructor() {
    super()
    this.login = this.login.bind(this)
    this.changePassword = this.changePassword.bind(this)
  }

  /**
   * 登陆接口
   * POST /v2/login
   * @params {string} username 用户名
   * @params {string} password 密码
   * @params {string} captcha_code 验证码
   * @return {object} user
   */
  async login (req, res, next) {
    const cap = req.cookies.cap
    console.log(cap, 'cap')
    if (!cap) {
      console.log('验证码失效')
      res.send({
        status: 0,
        type: 'ERROR_CAPTCHA',
        message: '验证码失效'
      })
      return
    }

    const { username, password, captcha_code } = req.body
    try {
      if (!username) {
        throw new Error('用户名参数错误')
      } else if (!password) {
        throw new Error('密码参数错误')
      } else if (!captcha_code) {
        throw new Error('验证码参数错误')
      }
    } catch (err) {
      console.log('登陆参数错误', err)
      res.send({
        status: 0,
        type: 'ERROR_QUERY',
        message: err.message,
      })
      return
    }

    if (cap.toString() !== captcha_code.toString()) {
      res.send({
        status: 0,
        type: 'ERROR_CAPTCHA',
        message: '验证码不正确',
      })
      return
    }

    const newpassword = this.encryption(password)
    try {
      const user = await UserModel.findOne({ username })
      //创建一个新的用户
      if (!user) {
        const user_id = await this.getId('user_id')
        const cityInfo = await this.guessPosition(req)
        const registe_time = dtime().format('YYYY-MM-DD HH:mm')
        const newUser = { username, password: newpassword, user_id }
        const newUserInfo = { username, user_id, id: user_id, city: cityInfo.city, registe_time, }
        UserModel.create(newUser)
        const createUser = new UserInfoModel(newUserInfo)
        const userinfo = await createUser.save()
        req.session.user_id = user_id
        res.send(userinfo)
      } else if (user.password.toString() !== newpassword.toString()) {
        console.log('用户登录密码错误')
        res.send({
          status: 0,
          type: 'ERROR_PASSWORD',
          message: '密码错误',
        })
        return
      } else {
        req.session.user_id = user.user_id
        const userinfo = await UserInfoModel.findOne({ user_id: user.user_id }, '-_id')
        res.send(userinfo)
      }
    } catch (err) {
      console.log('用户登陆失败', err)
      res.send({
        status: 0,
        type: 'SAVE_USER_FAILED',
        message: '登陆失败',
      })
    }
  }

  /**
   * 退出接口
   * GET /v2/signout
   */
  async signout (req, res, next) {
    delete req.session.user_idF
    res.send({
      status: 1,
      message: '退出成功'
    })
  }

  /**
   * 修改密码
   * /v2/changepassword
   * @param {string} username 用户名
   * @param {string} oldpassWord 旧密码
   * @param {string} newpassword 新密码
   * @param {string} confirmpassword 确认密码
   * @param {string} captcha_code  验证码
   * @returns 
   */
  async changePassword(req, res, next){
		const cap = req.cookies.cap;
		if (!cap) {
			console.log('验证码失效')
			res.send({
				status: 0,
				type: 'ERROR_CAPTCHA',
				message: '验证码失效',
			})
			return
		}
		const form = new formidable.IncomingForm();
		form.parse(req, async (err, fields, files) => {
			const {username, oldpassWord, newpassword, confirmpassword, captcha_code} = fields;
			try{
				if (!username) {
					throw new Error('用户名参数错误');
				}else if(!oldpassWord){
					throw new Error('必须添加旧密码');
				}else if(!newpassword){
					throw new Error('必须填写新密码');
				}else if(!confirmpassword){
					throw new Error('必须填写确认密码');
				}else if(newpassword !== confirmpassword){
					throw new Error('两次密码不一致');
				}else if(!captcha_code){
					throw new Error('请填写验证码');
				}
			}catch(err){
				console.log('修改密码参数错误', err);
				res.send({
					status: 0,
					type: 'ERROR_QUERY',
					message: err.message,
				})
				return
			}
			if (cap.toString() !== captcha_code.toString()) {
				res.send({
					status: 0,
					type: 'ERROR_CAPTCHA',
					message: '验证码不正确',
				})
				return
			}
			const md5password = this.encryption(oldpassWord);
			try{
				const user = await UserModel.findOne({username});
				if (!user) {
					res.send({
						status: 0,
						type: 'USER_NOT_FOUND',
						message: '未找到当前用户',
					})
				}else if(user.password.toString() !== md5password.toString()){
					res.send({
						status: 0,
						type: 'ERROR_PASSWORD',
						message: '密码不正确',
					})
				}else{
					user.password = this.encryption(newpassword);
					user.save();
					res.send({
						status: 1,
						success: '密码修改成功',
					})
				}
			}catch(err){
				console.log('修改密码失败', err);
				res.send({
					status: 0,
					type: 'ERROR_CHANGE_PASSWORD',
					message: '修改密码失败',
				})
			}
		})
	}




  encryption(password){
		const newpassword = this.Md5(this.Md5(password).substr(2, 7) + this.Md5(password));
		return newpassword
	}
	Md5(password){
		const md5 = crypto.createHash('md5');
		return md5.update(password).digest('base64');
	}
}

export default new User()