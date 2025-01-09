export const Base = {
  baseUrl: "http://127.0.0.1:9099/api/",
  // baseUrl: "https://xxxx.xxxx.cn/api/",
};

export const netConfig = {
  API_LOGIN_CODE: "v1/wechat/auth/login",
  API_REGISTER: "v1/wechat/auth/register",
  API_PRODUCT_LIST: "v1/product/get/product",
  API_CREATE_ORDER: "v1/wepay/pay_mini_program",
  API_USER_INFO: "v1/wechat/user/info",
  API_USER_ORDRE: "v1/order/get/user_order",
  API_GET_CURENT_USE_RECORD: "v1/tech_car/get/user_current_record",
  API_RETURN_CAR: "v1/tech_car/return_car",
  API_USER_USE_RECORD: "v1/tech_car/use_records",
  API_ORDER_USE_RECORD: "v1/tech_car/get/use_record_by_trade_no",
  API_USER_CHARGE_GROUP: "v1/tech_car/get/user_charge_group",
  API_GROUP_CARS: "v1/tech_car/get/group_cars",
  API_CHANGE_BATTERY: "v1/tech_car/change_battery",
};