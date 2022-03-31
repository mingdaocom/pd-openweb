```json
WIDGETS_TO_API_TYPE_ENUM.TEXT, // 文本 type 2
WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE, // 手机 type 4
WIDGETS_TO_API_TYPE_ENUM.EMAIL, // 邮箱 type 5
WIDGETS_TO_API_TYPE_ENUM.CRED, // 证件 type 7
{ controlId, type, value: "..." }

WIDGETS_TO_API_TYPE_ENUM.NUMBER, // 数值 type 6
WIDGETS_TO_API_TYPE_ENUM.MONEY, // 金额 type 8
{ controlId, type, value: 1 }

WIDGETS_TO_API_TYPE_ENUM.DATE, // 日期 type 15
{ controlId, type, value: 'YYYY-MM-DD' }

WIDGETS_TO_API_TYPE_ENUM.DATE_TIME, // 日期 type 16
{ controlId, type, value: 'YYYY-MM-DD HH:mm:ss' }


WIDGETS_TO_API_TYPE_ENUM.SWITCH, // 检查框 type 36
{ controlId, type, value: '1' } // 是
{ controlId, type, value: '0' } // 否


WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU, // 单选 type 9
WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, // 多选 type 10
WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN, // 下拉 type 11
{ controlId, type, value: '["1000"]', options: [{"key":"1000","value":"当天修复"}] }


WIDGETS_TO_API_TYPE_ENUM.USER_PICKER, // 成员 type 26
{ controlId, type, value: '["成员名", "成员名"]' }

WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT, // 部门 type 27
{ controlId, type, value: '["部门名", "部门名"]' }


WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE, // 省 type 19
WIDGETS_TO_API_TYPE_ENUM.AREA_CITY, // 省市 type 23
WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY, // 省市县 type 24
{ controlId, type, value: '{"code":"110000","name":"北京市"}' }

WIDGETS_TO_API_TYPE_ENUM.LOCATION, // 定位 type 40
{ controlId, type, value: '{"title": "上海漕河泾开发区智汇园", "address": "上海市徐汇区虹梅路街道上海漕河泾开发区智汇园", "x": 121.39999,"y": 31.17701}' }
```
