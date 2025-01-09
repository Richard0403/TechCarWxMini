// pages/manager/car-list/index.js
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

    group_list: [],
    group_keys: {
      label: 'location',
      value: 'id'
    },
    group_select_value: 1,
    longitude: 104.48060937499996,
    latitude: 36.30556423523153,
    car_list: [],
    markers: [],
    includePoints: [],
    select_mark: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
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

  onGroupChange(e) {
    let select_group = this.data.group_list.find(item => item.id === e.detail.value)
    if (select_group) {
      this.setData({
        group_select_value: select_group.id,
        latitude: select_group.latitude,
        longitude: select_group.longitude,
        group_select_value: select_group.id,
      })
      this.getGroupCarList(select_group.id)
    }
  },

  init() {
    this.getUserGroupList()
  },

  getUserGroupList() {
    let that = this
    request.get(netConfig.API_USER_CHARGE_GROUP, {}).then(res => {
      if (res.code == 0) {
        that.setData({
          group_list: res.data
        })
        if (that.data.group_list.length > 0) {
          let first_group = res.data[0]
          that.setData({
            group_select_value: first_group.id,
            latitude: first_group.latitude,
            longitude: first_group.longitude
          })
          that.getGroupCarList(first_group.id)
        }
      }
    })
  },

  getGroupCarList(group_id) {
    let that = this
    request.get(netConfig.API_GROUP_CARS, {
      group_id: group_id
    }).then(res => {
      console.log(res)
      if (res.code == 0) {
        that.setData({
          car_list: res.data
        })
        let markers = []
        let points = []
        that.data.car_list.forEach(e => {
          if (e.last_location != null) {
            markers.push({
              id: e.id,
              latitude: e.last_location.latitude,
              longitude: e.last_location.longitude,
              title: e.battery_electric,
              iconPath: '/images/ic_car.png', // 自定义图标
              width: 30,
              height: 30,
              customCallout: {
                anchorX: 0,
                anchorY: 0,
                battery_electric: e.battery_electric,
                wage: '',
                color: '#333333',
                fontSize: 14,
                borderRadius: 52,
                borderColor: '#000000',
                bgColor: '#fff',
                display: 'ALWAYS',
              },
            })
            points.push({
              latitude: e.last_location.latitude,
              longitude: e.last_location.longitude,
            })
          }
        })
        that.setData({
          markers: markers,
          includePoints: points
        })
        that.refresh_map_points()
        that.select_first_car(0)
      }
    })
  },

  callouttap(e) {
    let id = e.detail.markerId;
    let tapIndex = this.data.markers.findIndex(item => item.id == id)
    this.select_first_car(tapIndex)
  },

  refresh_map_points() {
    let mapCtx = wx.createMapContext('map');
    mapCtx.includePoints({
      padding: [90, 90, 90, 90],
      points: this.data.includePoints,
    });
  },

  select_first_car(index) {
    if (this.data.car_list.length > index) {
      let first_car = this.data.car_list[index]
      this.setData({
        select_mark: first_car
      })
    }
  },
  onNavigationTap(e) {
    wx.openLocation({
      latitude: this.data.select_mark.last_location.latitude, // 纬度，范围为-90~90，负数表示南纬
      longitude: this.data.select_mark.last_location.longitude, // 经度，范围为-180~180，负数表示西经
      scale: 24, // 缩放比例
      name: this.data.select_mark.device_id,
      address: this.data.select_mark.group.location
    })
  },
  onChangeBatteryTap(e) {
    wx.showLoading({
      title: '请稍等...',
    })
    let that = this
    request.post(netConfig.API_CHANGE_BATTERY, {
      device_id: that.data.select_mark.device_id
    }).then(res => {
      wx.hideLoading()
      Toast({
        context: that,
        selector: '#t-toast',
        message: '换电成功',
      });
    }).catch(e => {
      console.log(e)
      wx.hideLoading()
    })
  }
})