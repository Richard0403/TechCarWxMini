import {
  fetchHome
} from '../../services/home/home';
import dayjs from 'dayjs';
import Toast from 'tdesign-miniprogram/toast/index';
import {
  netConfig
} from '../../config/net_config';
import request from '../../utils/request';
import cacheKey from '../../config/constant';
import {
  parseScene
} from '../../utils/util'

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
    hideDutyTip: true,
    buyCount: 1,
    buyProduct: null,
    user: {
      hide_user_info: true,
      phone: '',
      rest_minute: ''
    },

    device_id: null,
    using_car_record: null,
    agreementState: false
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

  onLoad(query) {

    if (query && query.scene) {
      let scene = parseScene(decodeURIComponent(query.scene))
      if (scene.device_id) {
        this.setData({
          device_id: scene.device_id
        })
      }
    }
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
      this.getCurrentUseRecord()
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

    if (!this.data.device_id) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请先扫描小车上二维码',
      });
      return
    }

    // this.subscribeMessage()

    const {
      index
    } = e.detail;

    this.setData({
      buyCount: 1,
      buyProduct: this.data.goodsList[index],
      hideDutyTip: false
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
            if (res.code == 200) {
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
          phone: userInfo.userPhone,
          rest_minute: userInfo.rest_minute
        }
      })
    }
  },

  subscribeMessage() {
    let that = this
    Toast({
      context: this,
      selector: '#t-toast',
      message: '请订阅消息，接收车辆通知',
    });
    wx.requestSubscribeMessage({
      tmplIds: ['84tFNzfEAh-5sMJRcOncjH_iWZgCFGamZ4M21isOQc4'],
      success(res) {
        that.confirmBuyNum()
      },
      fail(error) {
        console.log(error)
        that.confirmBuyNum()
      }
    })
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
      hideDutyTip: true
    });
    wx.showLoading({
      title: '请稍等...',
    })
    let that = this
    request.post(netConfig.API_CREATE_ORDER, {
      product_id: this.data.buyProduct.id,
      product_num: this.data.buyCount,
      device_id: this.data.device_id
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
          signType: prePayData.signType,
          success(res) {
            let tradeNo = prePayData.tradeNo
            that.queryPayResult(tradeNo)
          },
          fail(res) {
            Toast({
              context: this,
              selector: '#t-toast',
              message: '支付失败',
            });
          }
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
  // onBuyChange(e) {
  //   let amount = e.detail.value
  //   this.setData({
  //     buyCount: amount
  //   })
  // },

  queryPayResult(tradeNo) {
    wx.showLoading({
      title: '正在查询支付结果...',
    })
    let that = this
    setTimeout(function () {
      request.get(netConfig.API_ORDER_USE_RECORD, {
        trade_no: tradeNo
      }).then(res => {
        wx.hideLoading()
        console.log(res)
        let useRecord = res.data
        if (useRecord) {
          if (useRecord.status == 1) {
            Toast({
              context: that,
              selector: '#t-toast',
              message: '支付成功，车辆已通电',
            });
            //刷新数据
            that.init()
            let usage_url = 'https://static-web.xxxxxx.cn/usage.html'
            wx.navigateTo({
              url: `/pages/usercenter/web_page/index?url=${usage_url}&title=使用方式`,
            });
          } else {
            Toast({
              context: that,
              selector: '#t-toast',
              message: '支付成功，但启动车辆失败， 请联系客服退款',
            });
          }
        } else {
          Toast({
            context: that,
            selector: '#t-toast',
            message: '获取订单失败，请刷新页面'
          });
        }
      }).catch(e => {
        console.log(e)
        wx.hideLoading()
      })
    }, 2 * 1000);
  },

  getUserInfo() {
    request.get(netConfig.API_USER_INFO, {}).then(res => {
      console.log(res)
      this.saveUserInfo(null, res.data)
    }).catch(e => {
      console.log(e)
    })
  },

  scan_code() {
    let that = this
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        console.log(res)
        try {
          let scene = res.path.split('scene=')[1]
          let param = parseScene(decodeURIComponent(scene))
          if (param.device_id) {
            that.setData({
              device_id: param.device_id
            })
            Toast({
              context: that,
              selector: '#t-toast',
              message: '扫描成功\n请支付开启车辆',
            });
          } else {
            Toast({
              context: that,
              selector: '#t-toast',
              message: '二维码异常\n请联系客服',
            });
          }
        } catch (error) {
          Toast({
            context: that,
            selector: '#t-toast',
            message: '二维码异常\n请联系客服',
          });
        }
      }
    })
  },

  getCurrentUseRecord() {
    let that = this
    request.get(netConfig.API_GET_CURENT_USE_RECORD, {}).then(res => {
      console.log(res)
      if (res.code == 0 && res.data) {
        if (res.data.begin_time) {
          let past_minute = dayjs().diff(res.data.begin_time, 'minute')
          let rest_minute = res.data.minute - past_minute
          res.data.rest_minute = rest_minute < 0 ? 0 : rest_minute
        }
        res.data.begin_time = dayjs(res.data.begin_time).format('MM-DD HH:mm:ss')
        res.data.end_time = dayjs(res.data.end_time).format('MM-DD HH:mm:ss')
        that.setData({
          using_car_record: res.data
        })
      } else {
        that.setData({
          using_car_record: null
        })
      }
    }).catch(e => {
      console.log(e)
    })
  },

  onReturnTap(e) {
    wx.showLoading({
      title: '请稍等...',
    })
    let that = this
    request.post(netConfig.API_RETURN_CAR, {
      use_record_id: that.data.using_car_record.id
    }).then(res => {
      wx.hideLoading()
      Toast({
        context: this,
        selector: '#t-toast',
        message: res.message,
      });
      if (res.code == 0) {
        that.init()
      }
    }).catch(e => {
      wx.hideLoading()
    })
  },

  //查看跳转： 
  checkAgreement(e) {
    let temp_data = e.currentTarget.dataset.service;
    let service_url = 'https://static-web.xxxxx.cn/user_agreement.html'
    let privicy_url = 'https://static-web.xxxxx.cn/user_privicy.html'
    let target_url = temp_data == 'service' ? service_url : privicy_url;
    let target_title = temp_data == 'service' ? '用户服务协议' : '隐私政策';
    wx.navigateTo({
      url: `/pages/usercenter/web_page/index?url=${target_url}&title=${target_title}`,
    });
  },
  handleAgree() {
    if (!this.data.agreementState) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请阅读并同意平台服务协议及隐私协议',
      });
      return false
    }
  },
  checkAgreeChange(e) {
    console.log(e)
    let checked = e.detail.value.includes('cb')
    this.setData({
      agreementState: checked
    })
    console.log(checked)
  },

  confirmDuty() {
    this.setData({
      hideDutyTip: true
    })
    this.subscribeMessage()
  },
  cancleDuty() {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '儿童必须在成人的监督下使用本车辆！',
    });
    this.setData({
      hideDutyTip: true
    })
  },

});