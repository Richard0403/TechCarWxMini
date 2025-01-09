import {
  OrderStatus
} from '../config';
import {
  fetchOrders,
  fetchOrdersCount,
} from '../../../services/order/orderList';
import {
  cosThumb
} from '../../../utils/util';
import {
  netConfig
} from '../../../config/net_config';
import request from '../../../utils/request';
import dayjs from 'dayjs';
Page({
  page: {
    size: 10,
    num: 1,
  },

  data: {
    tabs: [{
        key: -1,
        text: '全部'
      },
      {
        key: OrderStatus.PENDING_PAIED,
        text: '已付款',
        info: ''
      },
      {
        key: OrderStatus.PENDING_AFTER_SALE,
        text: '售后',
        info: ''
      },
    ],
    curTab: -1,
    orderList: [],
    listLoading: 0,
    pullDownRefreshing: false,
    emptyImg: 'https://cdn-we-retail.ym.tencent.com/miniapp/order/empty-order-list.png',
    backRefresh: false,
    status: -1,
  },

  onLoad(query) {
    let status = parseInt(query.status);
    status = this.data.tabs.map((t) => t.key).includes(status) ? status : -1;
    this.init(status);
    this.pullDownRefresh = this.selectComponent('#wr-pull-down-refresh');
  },

  onShow() {
    if (!this.data.backRefresh) return;
    this.onRefresh();
    this.setData({
      backRefresh: false
    });
  },

  onReachBottom() {
    console.log('order_触发——onReachBottom')
    if (this.data.listLoading === 0) {
      this.getOrderList(this.data.curTab);
    }
  },

  onPageScroll(e) {
    this.pullDownRefresh && this.pullDownRefresh.onPageScroll(e);
  },

  onPullDownRefresh_(e) {
    // const {
    //   callback
    // } = e.detail;
    this.setData({
      pullDownRefreshing: true
    });
    this.refreshList(this.data.curTab)
      .then(() => {
        this.setData({
          pullDownRefreshing: false
        });
        // callback && callback();
      })
      .catch((err) => {
        this.setData({
          pullDownRefreshing: false
        });
        Promise.reject(err);
      });
  },

  init(status) {
    status = status !== undefined ? status : this.data.curTab;
    this.setData({
      status,
    });
    this.refreshList(status);
  },

  getOrderList(statusCode = -1, reset = false) {
    console.log('获取订单的类型' + statusCode)
    let that = this
    request.get(netConfig.API_USER_ORDRE, {
      page: this.page.num,
      page_size: this.page.size,
      order_status: statusCode
    }).then(res => {
      wx.hideLoading()
      console.log(res)
      if (res.code == 0) {
        let tempOrderList = res.data
        tempOrderList.forEach(e => {
          e.create_time = dayjs(e.create_time).format('YYYY-MM-DD HH:mm:ss');
        })
        let targetData = reset ? tempOrderList : this.data.orderList.concat(tempOrderList)
        if (tempOrderList.length > 0) {
          this.page.num += 1
        }
        this.setData({
          orderList: targetData,
          listLoading: tempOrderList.length > 0 ? 0 : 2,
        });
      } else {

      }
    }).catch(e => {
      console.log(e)
      wx.hideLoading()
    })

  },

  onReTryLoad() {
    this.getOrderList(this.data.curTab);
  },

  onTabChange(e) {
    const {
      value
    } = e.detail;
    this.setData({
      status: value,
    });
    this.refreshList(value);
  },

  getOrdersCount() {
    return fetchOrdersCount().then((res) => {
      const tabsCount = res.data || [];
      const {
        tabs
      } = this.data;
      tabs.forEach((tab) => {
        const tabCount = tabsCount.find((c) => c.tabType === tab.key);
        if (tabCount) {
          tab.info = tabCount.orderNum;
        }
      });
      this.setData({
        tabs
      });
    });
  },

  refreshList(status = -1) {
    this.page = {
      size: 10,
      num: 1,
    };
    this.setData({
      curTab: status,
      orderList: []
    });

    return Promise.all([
      this.getOrderList(status, true),
      this.getOrdersCount(),
    ]);
  },

  onRefresh() {
    this.refreshList(this.data.curTab);
  },

  onOrderCardTap(e) {
    const {
      order
    } = e.currentTarget.dataset;
  },


  onOrderRetrunTap(e) {
    const {
      order
    } = e.currentTarget.dataset;
  },


});