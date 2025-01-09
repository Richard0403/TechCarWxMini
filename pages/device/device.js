import {
  fetchHome
} from '../../services/home/home';
import Toast from 'tdesign-miniprogram/toast/index';
import {
  netConfig
} from '../../config/net_config';
import request from '../../utils/request';
import cacheKey from '../../config/constant';


Page({
  data: {
    imgSrcs: [],
    tabList: [],
    goodsList: [],
    goodsListLoadStatus: 0,
    pageLoading: false,
    current: 1,
    autoplay: true,
    duration: '500',
    interval: 5000,
    navigation: {
      type: 'dots'
    },
    swiperImageProps: {
      mode: 'scaleToFill'
    },
    hideGetPhoneDialog: true,
    hideLoginBtn: false,
    hideBuyNumDialog: true,
    buyCount: 1,
    buyProduct: null,
    user: {
      hide_user_info: true,
      phone: '',
      rest_minute: ''
    }
  },

  goodListPagination: {
    index: 0,
    num: 20,
  },

  privateData: {
    tabIndex: 0,
  },

  onShow() {
    this.getTabBar().init();
  },

  onLoad() {
    this.init();
  },

  onReachBottom() {

  },

  onPullDownRefresh() {
    this.init();
  },

  init() {

    let token = wx.getStorageSync('token')
    if (!token) {
      this.loginCode()
    } else {
      this.getUserInfo()
      this.setData({
        hideLoginBtn: true,
      })
    }
    this.loadHomePage();
  },

  loadHomePage() {
    wx.stopPullDownRefresh();

    this.setData({
      pageLoading: true,
    });
    this.loadGoodsList(true);

  },



  onReTry() {
    this.loadGoodsList();
  },

  async loadGoodsList(fresh = false) {
    if (fresh) {
      wx.pageScrollTo({
        scrollTop: 0,
      });
    }
    let that = this
    this.setData({
      goodsListLoadStatus: 1
    });
    request.get(netConfig.API_PRODUCT_LIST, {

    }).then(res => {
      console.log(res)
      that.setData({
        goodsList: res.data,
        goodsListLoadStatus: 2,
        pageLoading: false,
      });
    }).catch(e => {
      console.log(e)
    })

  },

  goodClickHandle(e) {

    let token = wx.getStorageSync('token')
    if (!token) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请先登录',
      });
      return
    }
    const {
      index
    } = e.detail;

    this.setData({
      buyCount: 1,
      buyProduct: this.data.goodsList[index],
      hideBuyNumDialog: false
    })
    console.log(this.data.buyProduct)
  },

  loginCode() {
    let that = this
    wx.showLoading({
      title: '加载中...',
    })
    wx.login({
      success(res) {
        if (res.code) {
          request.post(netConfig.API_LOGIN_CODE, {
            login_code: res.code
          }).then(res => {
            wx.hideLoading()
            console.log(res)
            if (res.code == 0) {
              that.saveUserInfo(res.data.token, res.data.user)
            } else {
              //登录失败，手机号验证注册
              that.setData({
                hideGetPhoneDialog: false
              });
            }
          }).catch(e => {
            console.log(e)
            wx.hideLoading()
          })
        } else {
          console.log('获取登录Code失败！' + res.errMsg)
          wx.hideLoading()
        }
      },
      fail(e) {
        console.log(e)
      }
    })
  },

  saveUserInfo(token, userInfo) {
    if (token) {
      wx.setStorageSync('token', token)
      //重新登录之后，刷新页面
      this.init()
    }
    if (userInfo) {
      wx.setStorageSync('user', userInfo)
      this.setData({
        user: {
          hide_user_info: false,
          phone: userInfo.user_phone,
          rest_minute: userInfo.rest_minute
        }
      })
    }
  },

  getPhoneNumber(e) {
    console.log(e);
    wx.showLoading({
      title: '登录中...',
    })
    let that = this
    if (e.detail.code) {
      this.setData({
        pageLoading: true,
      });
      wx.login({
        success(res) {
          wx.hideLoading()
          if (res.code) {
            request.post(netConfig.API_REGISTER, {
              login_code: res.code,
              phone_num_code: e.detail.code
            }).then(res => {
              console.log(res)
              that.saveUserInfo(res.data.token, res.data.user)
            }).catch(e => {
              console.log(e)
            })
          } else {
            console.log('获取登录Code失败！' + res.errMsg)
          }
        }
      })
    } else {
      wx.hideLoading()
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请允许获取手机号，作为唯一登录信息',
      });
    }
  },

  close_login() {
    this.setData({
      hideGetPhoneDialog: true
    });
  },

  cancleBuyNum() {
    this.setData({
      hideBuyNumDialog: true
    });
  },
  confirmBuyNum() {
    if (this.data.buyProduct.buy_limit < this.data.buyCount) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '超过该产品的最大购买数量:' + this.data.buyProduct.buy_limit,
      });
      return
    }
    this.setData({
      hideBuyNumDialog: true
    });
    wx.showLoading({
      title: '请稍等...',
    })
    request.post(netConfig.API_CREATE_ORDER, {
      product_id: this.data.buyProduct.id,
      product_num: this.data.buyCount
    }).then(res => {
      wx.hideLoading()
      console.log(res)
      if (res.code == 0) {
        //发起支付
        let prePayData = res.data
        wx.requestPayment({
          nonceStr: prePayData.nonceStr,
          package: prePayData.package,
          paySign: prePayData.paySign,
          timeStamp: prePayData.timeStamp,
          signType: prePayData.signType
        })
      } else {
        Toast({
          context: this,
          selector: '#t-toast',
          message: res.message,
        });
      }

    }).catch(e => {
      wx.hideLoading()
      console.log(e)
    })
  },
  onBuyChange(e) {
    let amount = e.detail.value
    this.setData({
      buyCount: amount
    })
  },

  getUserInfo() {
    request.get(netConfig.API_USER_INFO, {}).then(res => {
      console.log(res)
      this.saveUserInfo(null, res.data)
    }).catch(e => {
      console.log(e)
    })
  }

});