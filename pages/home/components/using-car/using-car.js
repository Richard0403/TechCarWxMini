// pages/home/components/using-car/using-car.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    usingRecord: {
      type: Object, // 传递的数据类型
      value: null // 默认值
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentTab: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {

    onReturnTap() {
      this.triggerEvent('returntap');
    },

    onUsageTap() {
      let usage_url = 'https://static-web.xxxxx.cn/usage.html'
      wx.navigateTo({
        url: `/pages/usercenter/web_page/index?url=${usage_url}&title=使用方式`,
      });
    }
  }
})