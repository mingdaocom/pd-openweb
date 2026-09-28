# 日程模块结构

## 页面入口

- `index.jsx`：日程主页面，负责左侧筛选、待确认日程、详情弹层和视图状态编排。
- `pageConfig.js`：从 URL 和本地存储生成页面初始配置。
- `calendarFormatters.js`：分类颜色和待确认日程时间的展示格式。
- `detail/`：独立日程详情页面入口。
- `share/`：公开分享页面入口。

## 主视图

`modules/calendar/` 负责日、周、月和列表四种视图：

- `index.jsx`：FullCalendar 视图编排、选区创建、拖拽更新和权限保护。
- `CalendarToolbar.jsx`：日期导航、视图切换和新建日程入口。
- `CalendarEventContent.jsx`：日历事件内容渲染。
- `CalendarList.jsx`：列表查询、增量加载和表格交互。
- `viewConfig.js`：视图名称、国际化配置和标题格式。
- `eventData.js`：接口事件标准化、分类颜色及拖拽时间差计算。
- `calendar.less`：主视图样式。

## 其他模块

- `modules/toolbar/`：左侧分类筛选、分类编辑、待确认日程、同事列表和同步日历界面；
  `index.js` 是该目录的统一出口。
- `modules/calendarDetail/`：日程详情弹层及编辑逻辑。
- `modules/comm/`：待确认日程等历史命令式业务操作。
- `modules/css/`、`modules/images/`：主页面历史样式和图片资源。

## 修改指引

- 调整日、周、月视图行为：从 `modules/calendar/index.jsx` 开始。
- 调整列表数据或列展示：修改 `modules/calendar/CalendarList.jsx`。
- 调整接口事件字段兼容：修改 `modules/calendar/eventData.js`。
- 调整左侧筛选或待确认日程：从 `index.jsx` 和 `modules/toolbar/` 开始。
- 调整详情内容或编辑权限：从 `modules/calendarDetail/` 开始。
