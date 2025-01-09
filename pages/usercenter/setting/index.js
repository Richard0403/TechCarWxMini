// pages/usercenter/setting/index.js

const menuData = [
  [{
    title: '隐私政策',
    tit: '',
    url: 'https://static-web.xxxx.cn/user_privicy.html',
    type: 'user_secret',
  }, {
    title: '用户协议',
    tit: '',
    url: 'https://static-web.xxxxx.cn/user_agreement.html',
    type: 'user_agreement',
  }],
  [{
      title: '关于我们',
      tit: '',
      url: 'https://static-web.xxxxxx.cn/about_us.html',
      type: 'about_us',
    },

  ],
];

const getDefaultData = () => ({
  menuData: menuData,
  versionNo: '',
});
Page({

  /**
   * 页面的初始数据
   */
  data: getDefaultData(),

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },


  onClickCell({
    currentTarget
  }) {
    const {
      type,
      url,
      title
    } = currentTarget.dataset;
    switch (type) {
      case 'user_agreement': {
        wx.navigateTo({
          url: `/pages/usercenter/web_page/index?url=${url}&title=${title}`,
        });
        break;
      }
      case 'user_secret': {
        wx.navigateTo({
          url: `/pages/usercenter/web_page/index?url=${url}&title=${title}`,
        });
        break;
      }
      case 'about_us': {
        wx.navigateTo({
          url: `/pages/usercenter/web_page/index?url=${url}&title=${title}`,
        });
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

  exitUser() {
    wx.setStorageSync('token', '')
    wx.setStorageSync('user', null)
    wx.restartMiniProgram({
      path: '/pages/home/home'
    })
  }

})