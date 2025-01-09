// pages/usercenter/use_record/use_record.js
import {
  netConfig
} from '../../../config/net_config';
import request from '../../../utils/request';
import dayjs from 'dayjs';
import Toast from 'tdesign-miniprogram/toast/index';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    emptyImg: 'https://cdn-we-retail.ym.tencent.com/miniapp/order/empty-order-list.png',
    pullDownRefreshing: false,
    listLoading: 0,
    record_list: [],
  },

  page: {
    size: 10,
    num: 1,
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.pullDownRefresh = this.selectComponent('#pull-down-refresh');
    this.init()
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    console.log('触发onReachBottom1')
  },
  onScrollToBottom() {
    console.log('触发onScrollToBottom')
    if (this.data.listLoading === 0) {
      this.getUseRecordList();
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  onPageScroll(e) {
    this.pullDownRefresh && this.pullDownRefresh.onPageScroll(e);
  },

  onPullDownRefresh_() {
    this.setData({
      pullDownRefreshing: true
    });
    this.page = {
      size: 10,
      num: 1,
    };
    this.getUseRecordList(true)
  },
  onReTryLoad() {

  },

  init() {
    this.getUseRecordList(true)
  },

  getUseRecordList(reset = false) {
    let that = this

    request.get(netConfig.API_USER_USE_RECORD, {
      page_size: this.page.size,
      page: this.page.num
    }).then(res => {
      wx.hideLoading()
      console.log(res)
      if (res.code == 0) {
        let record = res.data
        record.forEach(e => {
          e.create_time = dayjs(e.create_time).format('YYYY-MM-DD HH:mm:ss');
          e.update_time = dayjs(e.update_time).format('YYYY-MM-DD HH:mm:ss');
          e.begin_time = dayjs(e.begin_time).format('YYYY-MM-DD HH:mm:ss');
        })
        let targetData = reset ? record : that.data.record_list.concat(record)
        if (record.length > 0) {
          that.page.num += 1
        }
        console.log('获取数据成功')
        that.setData({
          record_list: targetData,
          listLoading: record.length > 0 ? 0 : 2,
          pullDownRefreshing: false,
        });
      }
    }).catch(e => {
      console.log(e)
      wx.hideLoading()
      this.setData({
        pullDownRefreshing: false,
      });
    })

  },

  onReturnTap(e) {
    console.log(e)
    const {
      item
    } = e.currentTarget.dataset;
    wx.showLoading({
      title: '请稍等...',
    })
    let that = this
    request.post(netConfig.API_RETURN_CAR, {
      use_record_id: item.id
    }).then(res => {
      wx.hideLoading()
      console.log(res)
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
})