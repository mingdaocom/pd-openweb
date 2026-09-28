# 日历请求回归验证

在仓库根目录执行：

```sh
node src/pages/Mobile/RecordList/redux/calendarRequests.test.js
node src/pages/Mobile/RecordList/View/CalendarView/util.test.js
```

测试加载真实 actions 和 reducers，替换请求等外部依赖。覆盖列表与数量并发、筛选器不影响未排期查询与在途状态、视图切换后返回、关闭弹层、请求失败重试，以及旧请求不能释放新请求的 loading。

维护位置：同目录 `calendarRequests.test.js`。目前手动执行，未接入 CI。

日期验证覆盖查询范围前后扩展一天、筛选刷新不累积扩展，以及周视图选中当天的事件过滤（个人/应用时区、跨日、全天和零点结束）。日期工具用例维护于 `../View/CalendarView/util.test.js`。
