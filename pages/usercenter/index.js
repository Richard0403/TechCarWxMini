import {
  fetchUserCenter
} from '../../services/usercenter/fetchUsercenter';
import Toast from 'tdesign-miniprogram/toast/index';

const menuData = [
  [{
    title: '使用记录',
    tit: '',
    url: '',
    type: 'use_record',
  }],
  [{
      title: '客服热线',
      tit: '',
      url: '',
      type: 'service',
      icon: 'service',
    },
    {
      title: '车辆管理',
      tit: '',
      url: '',
      type: 'car_manager',
    },
    {
      title: '设置',
      tit: '',
      url: '',
      type: 'setting',
    },
  ],
];

const orderTagInfos = [{
    title: '已付款',
    iconName: 'wallet',
    orderNum: 0,
    tabType: 1,
    status: 1,
  },
  {
    title: '退款/售后',
    iconName: 'exchang',
    orderNum: 0,
    tabType: 2,
    status: 2,
  },
];

const getDefaultData = () => ({
  showMakePhone: false,
  userInfo: {
    avatarUrl: '',
    nickName: '正在登录...',
    phoneNumber: '',
  },
  menuData,
  orderTagInfos,
  customerServiceInfo: {},
  currAuthStep: 1,
  showKefu: true,
  showPhoneKefu: false,
  versionNo: '',
});

Page({
  data: getDefaultData(),

  onLoad() {
    this.getVersionInfo();
  },

  onShow() {
    this.getTabBar().init();
    this.init();
  },
  onPullDownRefresh() {
    this.init();
  },

  init() {
    this.fetUseriInfoHandle();
  },

  fetUseriInfoHandle() {
    let user = wx.getStorageSync('user')
    if (user) {
      this.setData({
        userInfo: user,
        currAuthStep: 3
      })
    }
  },

  onClickCell({
    currentTarget
  }) {
    const {
      type
    } = currentTarget.dataset;

    switch (type) {
      case 'address': {
        wx.navigateTo({
          url: '/pages/usercenter/address/list/index'
        });
        break;
      }
      case 'service': {
        this.openMakePhone();
        break;
      }
      case 'setting': {
        wx.navigateTo({
          url: '/pages/usercenter/setting/index'
        });
        break;
      }
      case 'use_record': {
        wx.navigateTo({
          url: '/pages/usercenter/use_record/use_record'
        });
        break;
      }
      case 'car_manager': {
        if (this.data.userInfo.user_type) {
          wx.navigateTo({
            url: '/pages/manager/car-list/index'
          });
        } else {
          Toast({
            context: this,
            selector: '#t-toast',
            message: '该功能仅管理员可用',
          });
        }

        break;
      }
      default: {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '未知跳转',
          icon: '',
          duration: 1000,
        });
        break;
      }
    }
  },

  jumpNav(e) {
    const status = e.detail.tabType;
    wx.navigateTo({
      url: `/pages/order/order-list/index?status=${status}`
    });
  },

  jumpAllOrder() {
    wx.navigateTo({
      url: '/pages/order/order-list/index'
    });
  },

  openMakePhone() {
    this.setData({
      showMakePhone: true
    });
  },

  closeMakePhone() {
    this.setData({
      showMakePhone: false
    });
  },

  call() {
    wx.makePhoneCall({
      phoneNumber: this.data.customerServiceInfo.servicePhone,
    });
  },

  gotoUserEditPage() {
    const {
      currAuthStep
    } = this.data;
    if (currAuthStep === 1) {
      //去登录
      wx.switchTab({
        url: '/pages/home/home'
      });
    }
  },

  getVersionInfo() {
    const versionInfo = wx.getAccountInfoSync();
    const {
      version,
      envVersion = __wxConfig
    } = versionInfo.miniProgram;
    this.setData({
      versionNo: envVersion === 'release' ? version : envVersion,
    });
  },
});