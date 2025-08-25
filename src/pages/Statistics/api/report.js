import base, { controllerName } from './base';

/**
 * report
 */
var report = {
  /**
   * 导出图表
   * @param {Object} args 请求参数
   * @param {获取图表数据} {appId:工作表id(string),contrastType:对比周期(integer),customRangeValue:同比自定义时间范围(string),dynamicFilter:动态筛选(ref),exportType:导出类型 0 ：原始值导出，1：显示值导出(integer),filterCode:范围 :空 代表全中国(string),filterControls:筛选条件(array),filterRangeId:筛选范围字段ID(string),filters:筛选条件(array),isPersonal:查看原始数据： ture，其他:false(boolean),match:点击的数值条件：{"caid":"user-workflow","ownerid":"user-undefined"}(object),pageId:自定义页面id(string),particleSizeType:粒度 1:日 2:周 3:月  /  行政区域图 1： 全国，2：省，3：市(integer),rangeType:筛选范围: 1:今天，2：昨天，3：明天，4：本周，5：上周，6：下周，8：本月，9：上月，10：下月，11：本季度，12：上季度，13：下季度，15：本年，16：上一年，17：下一年，18：今天之前的...天，19：今天之后的..天,20:自定义(integer),rangeValue:范围的值：7:7天，14：14天，30：30天,90：90天，180：180天，365：365天(string),reload:是否刷新(boolean),reportId:图表ID(string),requestParams:链接参数(object),sorts:自定义排序的数组(array),today:至今天(boolean),version:版本(string),}*exportReportRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  export: function (args, options) {
    base.ajaxOptions.url = base.server() + '/report/export';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'reportexport', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 导出图表
   * @param {Object} args 请求参数
   * @param {string} [args.pageId] 页面id
   * @param {string} [args.reportId] 图表id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  exportReport: function (args, options) {
    base.ajaxOptions.url = base.server() + '/report/exportReport';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'reportexportReport', args, $.extend(base, options));
  },
  /**
   * 获取图表的数据（结果toString过的）
   * @param {Object} args 请求参数
   * @param {string} [args.XAxis] null
   * @param {integer} [args.XAxisSortType] null
   * @param {string} [args.YAxisList[0].YDot] null
   * @param {string} [args.YAxisList[0].controlId] 控件ID
   * @param {string} [args.YAxisList[0].dotFormat] 1:省去末尾的0
   * @param {integer} [args.YAxisList[0].emptyShowType] 为0时或空值显示类型
   * @param {integer} [args.YAxisList[0].fixType] 0 后缀  ，1:前缀
   * @param {integer} [args.YAxisList[0].magnitude] 数值数量级 0:自动,1：无 ，2:千 3：万 4：百万 5： 亿
   * @param {integer} [args.YAxisList[0].normType] 1：求和，2：最大值，3：最小值，4：平均值
   * @param {string} [args.YAxisList[0].percent.dot] 保留位数
   * @param {string} [args.YAxisList[0].percent.dotFormat] 1:省去末尾的0
   * @param {boolean} [args.YAxisList[0].percent.enable] 是否开启
   * @param {integer} [args.YAxisList[0].percent.roundType] 四舍五入配置：0: 向下舍入，1:向上舍入，2:四舍五入
   * @param {integer} [args.YAxisList[0].percent.type] 计算方式：1: 小计 2：总计
   * @param {string} [args.YAxisList[0].rename] 重命名
   * @param {integer} [args.YAxisList[0].roundType] 四舍五入配置：0: 向下舍入，1:向上舍入，2:四舍五入
   * @param {boolean} [args.YAxisList[0].showNumber] 显示数值
   * @param {integer} [args.YAxisList[0].sortType] 排序 0 :默认 1:升序 2:降序
   * @param {string} [args.YAxisList[0].suffix] 后缀
   * @param {boolean} [args.YAxisList[0].thousandth] 是否显示千分位
   * @param {string} [args.YAxisList[0].value] 固定值
   * @param {integer} [args.YReportType] null
   * @param {string} [args.appId] 工作表ID
   * @param {integer} [args.appType] 统计应用类型 1:工作表
   * @param {integer} [args.auth] 自定义页面图表权限
   * @param {object} [args.config] null
   * @param {string} [args.createdBy] 创建人id
   * @param {string} [args.createdDate] 创建日期  默认当前日期
   * @param {boolean} [args.deleted] 是否删除  默认false
   * @param {string} [args.desc] 图表说明
   * @param {boolean} [args.displaySetup.XAxisEmpty] null
   * @param {number} [args.displaySetup.XDisplay.maxValue] 最大值
   * @param {number} [args.displaySetup.XDisplay.minValue] 最小值
   * @param {boolean} [args.displaySetup.XDisplay.showDial] 显示刻度标签
   * @param {boolean} [args.displaySetup.XDisplay.showTitle] 显示标题
   * @param {string} [args.displaySetup.XDisplay.title] 标题名称
   * @param {integer} [args.displaySetup.YDisplay.lineStyle] 线条样式：1：实线 2：虚线 3：点线
   * @param {number} [args.displaySetup.YDisplay.maxValue] 最大值
   * @param {number} [args.displaySetup.YDisplay.minValue] 最小值
   * @param {boolean} [args.displaySetup.YDisplay.showDial] 显示刻度标签
   * @param {boolean} [args.displaySetup.YDisplay.showTitle] 显示标题
   * @param {string} [args.displaySetup.YDisplay.title] 标题名称
   * @param {string} [args.displaySetup.auxiliaryLines[0].color] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].controlId] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].id] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].location] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].name] null
   * @param {integer} [args.displaySetup.auxiliaryLines[0].percent] null
   * @param {boolean} [args.displaySetup.auxiliaryLines[0].showName] null
   * @param {boolean} [args.displaySetup.auxiliaryLines[0].showValue] null
   * @param {integer} [args.displaySetup.auxiliaryLines[0].style] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].type] null
   * @param {number} [args.displaySetup.auxiliaryLines[0].value] null
   * @param {object} [args.displaySetup.colorRules[0].bgColorRule] null
   * @param {string} [args.displaySetup.colorRules[0].controlId] null
   * @param {object} [args.displaySetup.colorRules[0].dataBarRule] null
   * @param {object} [args.displaySetup.colorRules[0].textColorRule] null
   * @param {boolean} [args.displaySetup.contrast] 数值图同比
   * @param {integer} [args.displaySetup.contrastType] 对比：0 ：没有比较，1：与上一周期 2：与上一年
   * @param {integer} [args.displaySetup.fontStyle] 文字倾斜 默认 0横向 1倾斜
   * @param {boolean} [args.displaySetup.hideOverlapText] 隐藏重叠文本
   * @param {boolean} [args.displaySetup.isAccumulate] 周期累计
   * @param {boolean} [args.displaySetup.isLifecycle] 周期目标
   * @param {boolean} [args.displaySetup.isPerPile] 百分比
   * @param {boolean} [args.displaySetup.isPile] 堆叠
   * @param {boolean} [args.displaySetup.isToday] 今天
   * @param {integer} [args.displaySetup.legendType] 图例类型1:左上角，2:左居中，3：底部居中，4：右居中
   * @param {number} [args.displaySetup.lifecycleValue] 周期目标值
   * @param {boolean} [args.displaySetup.mergeCell] 合并单元格
   * @param {string} [args.displaySetup.percent.dot] 保留位数
   * @param {string} [args.displaySetup.percent.dotFormat] 1:省去末尾的0
   * @param {boolean} [args.displaySetup.percent.enable] 是否开启
   * @param {integer} [args.displaySetup.percent.roundType] 四舍五入配置：0: 向下舍入，1:向上舍入，2:四舍五入
   * @param {integer} [args.displaySetup.percent.type] 计算方式：1: 小计 2：总计
   * @param {integer} [args.displaySetup.showChartType] 柱图 锥子图 代表方向  1 竖向 2 横向 折线图代表的是 1：折线  2 : 面积   行政区域图1:区域  2：气泡
   * @param {array} [args.displaySetup.showControlIds] 显示的行数据字段ids
   * @param {boolean} [args.displaySetup.showDimension] 显示维度标签
   * @param {boolean} [args.displaySetup.showLegend] 显示图例
   * @param {boolean} [args.displaySetup.showNumber] 显示数值
   * @param {array} [args.displaySetup.showOptionIds] 漏斗图 下拉选项配置显示的选项
   * @param {boolean} [args.displaySetup.showPercent] 显示百分比
   * @param {boolean} [args.displaySetup.showPileTotal] 显示堆叠总数
   * @param {boolean} [args.displaySetup.showRowList] 是否可以查看行数据明细
   * @param {boolean} [args.displaySetup.showTitle] 是否显示标题
   * @param {boolean} [args.displaySetup.showTotal] 显示统计
   * @param {integer} [args.displaySetup.showXAxisCount] x轴前 几项
   * @param {string} [args.filter.customRangeValue] 同比自定义时间范围
   * @param {integer} [args.filter.dynamicFilter.endCount] null
   * @param {integer} [args.filter.dynamicFilter.endType] null
   * @param {integer} [args.filter.dynamicFilter.endUnit] null
   * @param {integer} [args.filter.dynamicFilter.startCount] null
   * @param {integer} [args.filter.dynamicFilter.startType] null
   * @param {integer} [args.filter.dynamicFilter.startUnit] null
   * @param {string} [args.filter.filterCode] 地区图表配置
   * @param {boolean} [args.filter.filterControls[0].asc] null
   * @param {string} [args.filter.filterControls[0].controlId] null
   * @param {integer} [args.filter.filterControls[0].dataType] null
   * @param {integer} [args.filter.filterControls[0].dataType] null
   * @param {integer} [args.filter.filterControls[0].dateRange] null
   * @param {integer} [args.filter.filterControls[0].dateRange] null
   * @param {integer} [args.filter.filterControls[0].dateRangeType] null
   * @param {integer} [args.filter.filterControls[0].dateRangeType] null
   * @param {string} [args.filter.filterControls[0].dynamicSource[0].cid] null
   * @param {string} [args.filter.filterControls[0].dynamicSource[0].rcid] null
   * @param {string} [args.filter.filterControls[0].dynamicSource[0].staticValue] null
   * @param {integer} [args.filter.filterControls[0].filterType] null
   * @param {integer} [args.filter.filterControls[0].filterType] null
   * @param {boolean} [args.filter.filterControls[0].isAsc] null
   * @param {boolean} [args.filter.filterControls[0].isGroup] null
   * @param {string} [args.filter.filterControls[0].maxValue] null
   * @param {string} [args.filter.filterControls[0].maxValue] null
   * @param {string} [args.filter.filterControls[0].minValue] null
   * @param {string} [args.filter.filterControls[0].minValue] null
   * @param {integer} [args.filter.filterControls[0].spliceType] null
   * @param {integer} [args.filter.filterControls[0].spliceType] null
   * @param {string} [args.filter.filterControls[0].value] null
   * @param {string} [args.filter.filterControls[0].value] null
   * @param {array} [args.filter.filterControls[0].values] null
   * @param {array} [args.filter.filterControls[0].values] null
   * @param {string} [args.filter.filterId] 筛选ID
   * @param {string} [args.filter.filterRangeId] 筛选范围字段ID
   * @param {boolean} [args.filter.ignoreToday] 对比时忽略至今天
   * @param {integer} [args.filter.rangeType] 筛选范围: 1:今天，2：昨天，3：明天，4：本周，5：上周，6：下周，8：本月，9：上月，10：下月，11：本季度，12：上季度，13：下季度，15：本年，16：上一年，17：下一年，18：今天之前的...天，19：今天之后的..天,20:自定义,21自定义动态时间范围
   * @param {string} [args.filter.rangeValue] 范围的值：7:7天，14：14天，30：30天,90：90天，180：180天，365：365天,财年: 第一位是 上一财年-1, 本财年 0，下一财年-2，第二位是月份 例如0:3，本财年3月份
   * @param {object} [args.filter.requestParams] requestParams
   * @param {boolean} [args.filter.today] 至今天
   * @param {string} [args.filter.viewId] 视图ID
   * @param {integer} [args.filter.viewType] 视图类型
   * @param {string} [args.formulas[0].advancedSetting.alldownload] null
   * @param {string} [args.formulas[0].advancedSetting.allowdelete] null
   * @param {string} [args.formulas[0].advancedSetting.allowdownload] null
   * @param {string} [args.formulas[0].advancedSetting.allowupload] null
   * @param {string} [args.formulas[0].advancedSetting.chooserange] 地区指定国家：空代表国际，null代表中国（老数据）  有值代表指定了国家
   * @param {string} [args.formulas[0].advancedSetting.datamask] null
   * @param {string} [args.formulas[0].advancedSetting.dotformat] 数值 空/0:显示完整的位数 1:自动
   * @param {string} [args.formulas[0].advancedSetting.isdecrypt] null
   * @param {string} [args.formulas[0].advancedSetting.itemnames] null
   * @param {string} [args.formulas[0].advancedSetting.maskbegin] null
   * @param {string} [args.formulas[0].advancedSetting.maskend] null
   * @param {string} [args.formulas[0].advancedSetting.masklen] null
   * @param {string} [args.formulas[0].advancedSetting.maskmid] null
   * @param {string} [args.formulas[0].advancedSetting.masktype] null
   * @param {string} [args.formulas[0].advancedSetting.max] null
   * @param {string} [args.formulas[0].advancedSetting.mdchar] null
   * @param {string} [args.formulas[0].advancedSetting.mechar] null
   * @param {string} [args.formulas[0].advancedSetting.numshow] null
   * @param {string} [args.formulas[0].advancedSetting.prefix] null
   * @param {string} [args.formulas[0].advancedSetting.showformat] null
   * @param {string} [args.formulas[0].advancedSetting.showtype] null
   * @param {string} [args.formulas[0].advancedSetting.storelayer] null
   * @param {string} [args.formulas[0].advancedSetting.suffix] null
   * @param {integer} [args.formulas[0].attribute] 工作表标题字段属性
   * @param {integer} [args.formulas[0].col] null
   * @param {string} [args.formulas[0].controlId] 控件id
   * @param {string} [args.formulas[0].controlName] 控件名
   * @param {string} [args.formulas[0].dataSource] 控件用到的数据源
   * @param {integer} [args.formulas[0].dot] null
   * @param {string} [args.formulas[0].encryId] 加密规则的id
   * @param {integer} [args.formulas[0].enumDefault] null
   * @param {integer} [args.formulas[0].enumDefault2] null
   * @param {string} [args.formulas[0].fromValue] 逻辑里面 value toString方法使用 不存不输出
   * @param {string} [args.formulas[0].options[0].color] 颜色值
   * @param {integer} [args.formulas[0].options[0].index] null
   * @param {boolean} [args.formulas[0].options[0].isDeleted] 是否删除
   * @param {string} [args.formulas[0].options[0].key] 选项值
   * @param {number} [args.formulas[0].options[0].score] 赋分值
   * @param {string} [args.formulas[0].options[0].value] 选项名称
   * @param {boolean} [args.formulas[0].required] gson随便映射一个字段 以workflow的配置为主
   * @param {integer} [args.formulas[0].row] null
   * @param {array} [args.formulas[0].rowIds] 关联的 rowIds
   * @param {string} [args.formulas[0].sourceControlId] 关联控件ID
   * @param {integer} [args.formulas[0].sourceControlType] 关联他表字段控件的类型
   * @param {string} [args.formulas[0].sourceEntityName] 关联表的entityName
   * @param {string} [args.formulas[0].sourceTitleControlId] 关联他表里面的标题控件ID
   * @param {integer} [args.formulas[0].type] 控件类型
   * @param {string} [args.formulas[0].unit] 日期公式：1:分钟，2：小时，3：天
   * @param {object} [args.formulas[0].value] 控件值
   * @param {string} [args.id] ID
   * @param {string} [args.lastModifiedBy] 最后修改人ID
   * @param {string} [args.lastModifiedDate] 最后修改日期  默认当前日期
   * @param {string} [args.name] 名称
   * @param {string} [args.owner] 拥有者ID
   * @param {integer} [args.particleSizeType] 日期： 粒度 1:日 2:周 3:月  /地区 ： 1: 省 2：市 3：区/县
   * @param {获取图表数据} {appId:工作表id(string),contrastType:对比周期(integer),customRangeValue:同比自定义时间范围(string),dynamicFilter:动态筛选(ref),exportType:导出类型 0 ：原始值导出，1：显示值导出(integer),filterCode:范围 :空 代表全中国(string),filterControls:筛选条件(array),filterRangeId:筛选范围字段ID(string),filters:筛选条件(array),isPersonal:查看原始数据： ture，其他:false(boolean),match:点击的数值条件：{"caid":"user-workflow","ownerid":"user-undefined"}(object),pageId:自定义页面id(string),particleSizeType:粒度 1:日 2:周 3:月  /  行政区域图 1： 全国，2：省，3：市(integer),rangeType:筛选范围: 1:今天，2：昨天，3：明天，4：本周，5：上周，6：下周，8：本月，9：上月，10：下月，11：本季度，12：上季度，13：下季度，15：本年，16：上一年，17：下一年，18：今天之前的...天，19：今天之后的..天,20:自定义(integer),rangeValue:范围的值：7:7天，14：14天，30：30天,90：90天，180：180天，365：365天(string),reload:是否刷新(boolean),reportId:图表ID(string),requestParams:链接参数(object),sorts:自定义排序的数组(array),today:至今天(boolean),version:版本(string),}*reportDataRequest
   * @param {integer} [args.reportType] 类型   1:柱图 2:折线图  3:饼图  4:数值图 5：雷达图 6:漏斗图 7：双轴图 8：透视图 9:行政区划
   * @param {integer} [args.sourceType] 来源 空 代表 来自报表创建，1：page页面创建
   * @param {boolean} [args.split.XAxisEmpty] null
   * @param {integer} [args.split.XAxisEmptyType] null
   * @param {string} [args.split.c_Id] null
   * @param {string} [args.split.controlId] 控件ID
   * @param {integer} [args.split.emptyType] 无数据项目的显示规则 ：  0 ：隐藏; 1：显示为0 ; 2：显示为--(连续)；3：显示--(中断)
   * @param {string} [args.split.fields[0].advancedSetting.alldownload] null
   * @param {string} [args.split.fields[0].advancedSetting.allowdelete] null
   * @param {string} [args.split.fields[0].advancedSetting.allowdownload] null
   * @param {string} [args.split.fields[0].advancedSetting.allowupload] null
   * @param {string} [args.split.fields[0].advancedSetting.chooserange] 地区指定国家：空代表国际，null代表中国（老数据）  有值代表指定了国家
   * @param {string} [args.split.fields[0].advancedSetting.datamask] null
   * @param {string} [args.split.fields[0].advancedSetting.dotformat] 数值 空/0:显示完整的位数 1:自动
   * @param {string} [args.split.fields[0].advancedSetting.isdecrypt] null
   * @param {string} [args.split.fields[0].advancedSetting.itemnames] null
   * @param {string} [args.split.fields[0].advancedSetting.maskbegin] null
   * @param {string} [args.split.fields[0].advancedSetting.maskend] null
   * @param {string} [args.split.fields[0].advancedSetting.masklen] null
   * @param {string} [args.split.fields[0].advancedSetting.maskmid] null
   * @param {string} [args.split.fields[0].advancedSetting.masktype] null
   * @param {string} [args.split.fields[0].advancedSetting.max] null
   * @param {string} [args.split.fields[0].advancedSetting.mdchar] null
   * @param {string} [args.split.fields[0].advancedSetting.mechar] null
   * @param {string} [args.split.fields[0].advancedSetting.numshow] null
   * @param {string} [args.split.fields[0].advancedSetting.prefix] null
   * @param {string} [args.split.fields[0].advancedSetting.showformat] null
   * @param {string} [args.split.fields[0].advancedSetting.showtype] null
   * @param {string} [args.split.fields[0].advancedSetting.storelayer] null
   * @param {string} [args.split.fields[0].advancedSetting.suffix] null
   * @param {string} [args.split.fields[0].controlId] null
   * @param {string} [args.split.fields[0].controlName] null
   * @param {integer} [args.split.fields[0].controlType] null
   * @param {integer} [args.split.fields[0].size] null
   * @param {integer} [args.split.particleSizeType] 粒度 1:日 2:周 3:月
   * @param {string} [args.split.rename] 重命名
   * @param {string} [args.split.showFormat] 显示格式设置
   * @param {integer} [args.split.sortType] 排序 0 :默认 1:升序 2:降序 3:自定义排序
   * @param {boolean} [args.split.subTotal] 是否小计
   * @param {string} [args.split.subTotalName] 小计名称
   * @param {string} [args.splitId] 拆分控件ID
   * @param {object} [args.style] 前端自己定义的样式,后端统计无关的字段
   * @param {boolean} [args.summary.all] 是否勾选全部
   * @param {number} [args.summary.contrastMapSum] 同比汇总值
   * @param {number} [args.summary.contrastSum] 环比汇总值
   * @param {string} [args.summary.controlId] id
   * @param {number} [args.summary.controlList[0].contrastMapSum] 同比汇总值
   * @param {number} [args.summary.controlList[0].contrastSum] 环比汇总值
   * @param {string} [args.summary.controlList[0].controlId] id
   * @param {string} [args.summary.controlList[0].name] 名称
   * @param {boolean} [args.summary.controlList[0].number] 数值
   * @param {boolean} [args.summary.controlList[0].percent] 百分比
   * @param {number} [args.summary.controlList[0].sum] 汇总值
   * @param {integer} [args.summary.controlList[0].type] 方式：1：求和 2：最大值 3：最小值 4：平均值
   * @param {integer} [args.summary.location] 位置：1:上方 2:下方 3:左侧 4:右侧
   * @param {string} [args.summary.name] 名称
   * @param {boolean} [args.summary.number] 数值
   * @param {boolean} [args.summary.percent] 百分比
   * @param {string} [args.summary.rename] 重命名
   * @param {boolean} [args.summary.showTotal] 显示总计
   * @param {number} [args.summary.sum] 汇总值
   * @param {integer} [args.summary.type] 方式：1：求和 2：最大值 3：最小值 4：平均值
   * @param {boolean} [args.xAxes.XAxisEmpty] null
   * @param {integer} [args.xAxes.XAxisEmptyType] null
   * @param {string} [args.xAxes.c_Id] null
   * @param {string} [args.xAxes.controlId] 控件ID
   * @param {integer} [args.xAxes.emptyType] 无数据项目的显示规则 ：  0 ：隐藏; 1：显示为0 ; 2：显示为--(连续)；3：显示--(中断)
   * @param {string} [args.xAxes.fields[0].advancedSetting.alldownload] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.allowdelete] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.allowdownload] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.allowupload] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.chooserange] 地区指定国家：空代表国际，null代表中国（老数据）  有值代表指定了国家
   * @param {string} [args.xAxes.fields[0].advancedSetting.datamask] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.dotformat] 数值 空/0:显示完整的位数 1:自动
   * @param {string} [args.xAxes.fields[0].advancedSetting.isdecrypt] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.itemnames] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.maskbegin] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.maskend] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.masklen] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.maskmid] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.masktype] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.max] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.mdchar] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.mechar] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.numshow] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.prefix] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.showformat] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.showtype] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.storelayer] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.suffix] null
   * @param {string} [args.xAxes.fields[0].controlId] null
   * @param {string} [args.xAxes.fields[0].controlName] null
   * @param {integer} [args.xAxes.fields[0].controlType] null
   * @param {integer} [args.xAxes.fields[0].size] null
   * @param {integer} [args.xAxes.particleSizeType] 粒度 1:日 2:周 3:月
   * @param {string} [args.xAxes.rename] 重命名
   * @param {string} [args.xAxes.showFormat] 显示格式设置
   * @param {integer} [args.xAxes.sortType] 排序 0 :默认 1:升序 2:降序 3:自定义排序
   * @param {boolean} [args.xAxes.subTotal] 是否小计
   * @param {string} [args.xAxes.subTotalName] 小计名称
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getReportData: function (args, options) {
    base.ajaxOptions.url = base.server() + '/report/get';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'reportget', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取图表的数据
   * @param {Object} args 请求参数
   * @param {string} [args.XAxis] null
   * @param {integer} [args.XAxisSortType] null
   * @param {string} [args.YAxisList[0].YDot] null
   * @param {string} [args.YAxisList[0].controlId] 控件ID
   * @param {string} [args.YAxisList[0].dotFormat] 1:省去末尾的0
   * @param {integer} [args.YAxisList[0].emptyShowType] 为0时或空值显示类型
   * @param {integer} [args.YAxisList[0].fixType] 0 后缀  ，1:前缀
   * @param {integer} [args.YAxisList[0].magnitude] 数值数量级 0:自动,1：无 ，2:千 3：万 4：百万 5： 亿
   * @param {integer} [args.YAxisList[0].normType] 1：求和，2：最大值，3：最小值，4：平均值
   * @param {string} [args.YAxisList[0].percent.dot] 保留位数
   * @param {string} [args.YAxisList[0].percent.dotFormat] 1:省去末尾的0
   * @param {boolean} [args.YAxisList[0].percent.enable] 是否开启
   * @param {integer} [args.YAxisList[0].percent.roundType] 四舍五入配置：0: 向下舍入，1:向上舍入，2:四舍五入
   * @param {integer} [args.YAxisList[0].percent.type] 计算方式：1: 小计 2：总计
   * @param {string} [args.YAxisList[0].rename] 重命名
   * @param {integer} [args.YAxisList[0].roundType] 四舍五入配置：0: 向下舍入，1:向上舍入，2:四舍五入
   * @param {boolean} [args.YAxisList[0].showNumber] 显示数值
   * @param {integer} [args.YAxisList[0].sortType] 排序 0 :默认 1:升序 2:降序
   * @param {string} [args.YAxisList[0].suffix] 后缀
   * @param {boolean} [args.YAxisList[0].thousandth] 是否显示千分位
   * @param {string} [args.YAxisList[0].value] 固定值
   * @param {integer} [args.YReportType] null
   * @param {string} [args.appId] 工作表ID
   * @param {integer} [args.appType] 统计应用类型 1:工作表
   * @param {integer} [args.auth] 自定义页面图表权限
   * @param {object} [args.config] null
   * @param {string} [args.createdBy] 创建人id
   * @param {string} [args.createdDate] 创建日期  默认当前日期
   * @param {boolean} [args.deleted] 是否删除  默认false
   * @param {string} [args.desc] 图表说明
   * @param {boolean} [args.displaySetup.XAxisEmpty] null
   * @param {number} [args.displaySetup.XDisplay.maxValue] 最大值
   * @param {number} [args.displaySetup.XDisplay.minValue] 最小值
   * @param {boolean} [args.displaySetup.XDisplay.showDial] 显示刻度标签
   * @param {boolean} [args.displaySetup.XDisplay.showTitle] 显示标题
   * @param {string} [args.displaySetup.XDisplay.title] 标题名称
   * @param {integer} [args.displaySetup.YDisplay.lineStyle] 线条样式：1：实线 2：虚线 3：点线
   * @param {number} [args.displaySetup.YDisplay.maxValue] 最大值
   * @param {number} [args.displaySetup.YDisplay.minValue] 最小值
   * @param {boolean} [args.displaySetup.YDisplay.showDial] 显示刻度标签
   * @param {boolean} [args.displaySetup.YDisplay.showTitle] 显示标题
   * @param {string} [args.displaySetup.YDisplay.title] 标题名称
   * @param {string} [args.displaySetup.auxiliaryLines[0].color] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].controlId] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].id] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].location] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].name] null
   * @param {integer} [args.displaySetup.auxiliaryLines[0].percent] null
   * @param {boolean} [args.displaySetup.auxiliaryLines[0].showName] null
   * @param {boolean} [args.displaySetup.auxiliaryLines[0].showValue] null
   * @param {integer} [args.displaySetup.auxiliaryLines[0].style] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].type] null
   * @param {number} [args.displaySetup.auxiliaryLines[0].value] null
   * @param {object} [args.displaySetup.colorRules[0].bgColorRule] null
   * @param {string} [args.displaySetup.colorRules[0].controlId] null
   * @param {object} [args.displaySetup.colorRules[0].dataBarRule] null
   * @param {object} [args.displaySetup.colorRules[0].textColorRule] null
   * @param {boolean} [args.displaySetup.contrast] 数值图同比
   * @param {integer} [args.displaySetup.contrastType] 对比：0 ：没有比较，1：与上一周期 2：与上一年
   * @param {integer} [args.displaySetup.fontStyle] 文字倾斜 默认 0横向 1倾斜
   * @param {boolean} [args.displaySetup.hideOverlapText] 隐藏重叠文本
   * @param {boolean} [args.displaySetup.isAccumulate] 周期累计
   * @param {boolean} [args.displaySetup.isLifecycle] 周期目标
   * @param {boolean} [args.displaySetup.isPerPile] 百分比
   * @param {boolean} [args.displaySetup.isPile] 堆叠
   * @param {boolean} [args.displaySetup.isToday] 今天
   * @param {integer} [args.displaySetup.legendType] 图例类型1:左上角，2:左居中，3：底部居中，4：右居中
   * @param {number} [args.displaySetup.lifecycleValue] 周期目标值
   * @param {boolean} [args.displaySetup.mergeCell] 合并单元格
   * @param {string} [args.displaySetup.percent.dot] 保留位数
   * @param {string} [args.displaySetup.percent.dotFormat] 1:省去末尾的0
   * @param {boolean} [args.displaySetup.percent.enable] 是否开启
   * @param {integer} [args.displaySetup.percent.roundType] 四舍五入配置：0: 向下舍入，1:向上舍入，2:四舍五入
   * @param {integer} [args.displaySetup.percent.type] 计算方式：1: 小计 2：总计
   * @param {integer} [args.displaySetup.showChartType] 柱图 锥子图 代表方向  1 竖向 2 横向 折线图代表的是 1：折线  2 : 面积   行政区域图1:区域  2：气泡
   * @param {array} [args.displaySetup.showControlIds] 显示的行数据字段ids
   * @param {boolean} [args.displaySetup.showDimension] 显示维度标签
   * @param {boolean} [args.displaySetup.showLegend] 显示图例
   * @param {boolean} [args.displaySetup.showNumber] 显示数值
   * @param {array} [args.displaySetup.showOptionIds] 漏斗图 下拉选项配置显示的选项
   * @param {boolean} [args.displaySetup.showPercent] 显示百分比
   * @param {boolean} [args.displaySetup.showPileTotal] 显示堆叠总数
   * @param {boolean} [args.displaySetup.showRowList] 是否可以查看行数据明细
   * @param {boolean} [args.displaySetup.showTitle] 是否显示标题
   * @param {boolean} [args.displaySetup.showTotal] 显示统计
   * @param {integer} [args.displaySetup.showXAxisCount] x轴前 几项
   * @param {string} [args.filter.customRangeValue] 同比自定义时间范围
   * @param {integer} [args.filter.dynamicFilter.endCount] null
   * @param {integer} [args.filter.dynamicFilter.endType] null
   * @param {integer} [args.filter.dynamicFilter.endUnit] null
   * @param {integer} [args.filter.dynamicFilter.startCount] null
   * @param {integer} [args.filter.dynamicFilter.startType] null
   * @param {integer} [args.filter.dynamicFilter.startUnit] null
   * @param {string} [args.filter.filterCode] 地区图表配置
   * @param {boolean} [args.filter.filterControls[0].asc] null
   * @param {string} [args.filter.filterControls[0].controlId] null
   * @param {integer} [args.filter.filterControls[0].dataType] null
   * @param {integer} [args.filter.filterControls[0].dataType] null
   * @param {integer} [args.filter.filterControls[0].dateRange] null
   * @param {integer} [args.filter.filterControls[0].dateRange] null
   * @param {integer} [args.filter.filterControls[0].dateRangeType] null
   * @param {integer} [args.filter.filterControls[0].dateRangeType] null
   * @param {string} [args.filter.filterControls[0].dynamicSource[0].cid] null
   * @param {string} [args.filter.filterControls[0].dynamicSource[0].rcid] null
   * @param {string} [args.filter.filterControls[0].dynamicSource[0].staticValue] null
   * @param {integer} [args.filter.filterControls[0].filterType] null
   * @param {integer} [args.filter.filterControls[0].filterType] null
   * @param {boolean} [args.filter.filterControls[0].isAsc] null
   * @param {boolean} [args.filter.filterControls[0].isGroup] null
   * @param {string} [args.filter.filterControls[0].maxValue] null
   * @param {string} [args.filter.filterControls[0].maxValue] null
   * @param {string} [args.filter.filterControls[0].minValue] null
   * @param {string} [args.filter.filterControls[0].minValue] null
   * @param {integer} [args.filter.filterControls[0].spliceType] null
   * @param {integer} [args.filter.filterControls[0].spliceType] null
   * @param {string} [args.filter.filterControls[0].value] null
   * @param {string} [args.filter.filterControls[0].value] null
   * @param {array} [args.filter.filterControls[0].values] null
   * @param {array} [args.filter.filterControls[0].values] null
   * @param {string} [args.filter.filterId] 筛选ID
   * @param {string} [args.filter.filterRangeId] 筛选范围字段ID
   * @param {boolean} [args.filter.ignoreToday] 对比时忽略至今天
   * @param {integer} [args.filter.rangeType] 筛选范围: 1:今天，2：昨天，3：明天，4：本周，5：上周，6：下周，8：本月，9：上月，10：下月，11：本季度，12：上季度，13：下季度，15：本年，16：上一年，17：下一年，18：今天之前的...天，19：今天之后的..天,20:自定义,21自定义动态时间范围
   * @param {string} [args.filter.rangeValue] 范围的值：7:7天，14：14天，30：30天,90：90天，180：180天，365：365天,财年: 第一位是 上一财年-1, 本财年 0，下一财年-2，第二位是月份 例如0:3，本财年3月份
   * @param {object} [args.filter.requestParams] requestParams
   * @param {boolean} [args.filter.today] 至今天
   * @param {string} [args.filter.viewId] 视图ID
   * @param {integer} [args.filter.viewType] 视图类型
   * @param {string} [args.formulas[0].advancedSetting.alldownload] null
   * @param {string} [args.formulas[0].advancedSetting.allowdelete] null
   * @param {string} [args.formulas[0].advancedSetting.allowdownload] null
   * @param {string} [args.formulas[0].advancedSetting.allowupload] null
   * @param {string} [args.formulas[0].advancedSetting.chooserange] 地区指定国家：空代表国际，null代表中国（老数据）  有值代表指定了国家
   * @param {string} [args.formulas[0].advancedSetting.datamask] null
   * @param {string} [args.formulas[0].advancedSetting.dotformat] 数值 空/0:显示完整的位数 1:自动
   * @param {string} [args.formulas[0].advancedSetting.isdecrypt] null
   * @param {string} [args.formulas[0].advancedSetting.itemnames] null
   * @param {string} [args.formulas[0].advancedSetting.maskbegin] null
   * @param {string} [args.formulas[0].advancedSetting.maskend] null
   * @param {string} [args.formulas[0].advancedSetting.masklen] null
   * @param {string} [args.formulas[0].advancedSetting.maskmid] null
   * @param {string} [args.formulas[0].advancedSetting.masktype] null
   * @param {string} [args.formulas[0].advancedSetting.max] null
   * @param {string} [args.formulas[0].advancedSetting.mdchar] null
   * @param {string} [args.formulas[0].advancedSetting.mechar] null
   * @param {string} [args.formulas[0].advancedSetting.numshow] null
   * @param {string} [args.formulas[0].advancedSetting.prefix] null
   * @param {string} [args.formulas[0].advancedSetting.showformat] null
   * @param {string} [args.formulas[0].advancedSetting.showtype] null
   * @param {string} [args.formulas[0].advancedSetting.storelayer] null
   * @param {string} [args.formulas[0].advancedSetting.suffix] null
   * @param {integer} [args.formulas[0].attribute] 工作表标题字段属性
   * @param {integer} [args.formulas[0].col] null
   * @param {string} [args.formulas[0].controlId] 控件id
   * @param {string} [args.formulas[0].controlName] 控件名
   * @param {string} [args.formulas[0].dataSource] 控件用到的数据源
   * @param {integer} [args.formulas[0].dot] null
   * @param {string} [args.formulas[0].encryId] 加密规则的id
   * @param {integer} [args.formulas[0].enumDefault] null
   * @param {integer} [args.formulas[0].enumDefault2] null
   * @param {string} [args.formulas[0].fromValue] 逻辑里面 value toString方法使用 不存不输出
   * @param {string} [args.formulas[0].options[0].color] 颜色值
   * @param {integer} [args.formulas[0].options[0].index] null
   * @param {boolean} [args.formulas[0].options[0].isDeleted] 是否删除
   * @param {string} [args.formulas[0].options[0].key] 选项值
   * @param {number} [args.formulas[0].options[0].score] 赋分值
   * @param {string} [args.formulas[0].options[0].value] 选项名称
   * @param {boolean} [args.formulas[0].required] gson随便映射一个字段 以workflow的配置为主
   * @param {integer} [args.formulas[0].row] null
   * @param {array} [args.formulas[0].rowIds] 关联的 rowIds
   * @param {string} [args.formulas[0].sourceControlId] 关联控件ID
   * @param {integer} [args.formulas[0].sourceControlType] 关联他表字段控件的类型
   * @param {string} [args.formulas[0].sourceEntityName] 关联表的entityName
   * @param {string} [args.formulas[0].sourceTitleControlId] 关联他表里面的标题控件ID
   * @param {integer} [args.formulas[0].type] 控件类型
   * @param {string} [args.formulas[0].unit] 日期公式：1:分钟，2：小时，3：天
   * @param {object} [args.formulas[0].value] 控件值
   * @param {string} [args.id] ID
   * @param {string} [args.lastModifiedBy] 最后修改人ID
   * @param {string} [args.lastModifiedDate] 最后修改日期  默认当前日期
   * @param {string} [args.name] 名称
   * @param {string} [args.owner] 拥有者ID
   * @param {integer} [args.particleSizeType] 日期： 粒度 1:日 2:周 3:月  /地区 ： 1: 省 2：市 3：区/县
   * @param {获取图表数据} {appId:工作表id(string),contrastType:对比周期(integer),customRangeValue:同比自定义时间范围(string),dynamicFilter:动态筛选(ref),exportType:导出类型 0 ：原始值导出，1：显示值导出(integer),filterCode:范围 :空 代表全中国(string),filterControls:筛选条件(array),filterRangeId:筛选范围字段ID(string),filters:筛选条件(array),isPersonal:查看原始数据： ture，其他:false(boolean),match:点击的数值条件：{"caid":"user-workflow","ownerid":"user-undefined"}(object),pageId:自定义页面id(string),particleSizeType:粒度 1:日 2:周 3:月  /  行政区域图 1： 全国，2：省，3：市(integer),rangeType:筛选范围: 1:今天，2：昨天，3：明天，4：本周，5：上周，6：下周，8：本月，9：上月，10：下月，11：本季度，12：上季度，13：下季度，15：本年，16：上一年，17：下一年，18：今天之前的...天，19：今天之后的..天,20:自定义(integer),rangeValue:范围的值：7:7天，14：14天，30：30天,90：90天，180：180天，365：365天(string),reload:是否刷新(boolean),reportId:图表ID(string),requestParams:链接参数(object),sorts:自定义排序的数组(array),today:至今天(boolean),version:版本(string),}*reportDataRequest
   * @param {integer} [args.reportType] 类型   1:柱图 2:折线图  3:饼图  4:数值图 5：雷达图 6:漏斗图 7：双轴图 8：透视图 9:行政区划
   * @param {integer} [args.sourceType] 来源 空 代表 来自报表创建，1：page页面创建
   * @param {boolean} [args.split.XAxisEmpty] null
   * @param {integer} [args.split.XAxisEmptyType] null
   * @param {string} [args.split.c_Id] null
   * @param {string} [args.split.controlId] 控件ID
   * @param {integer} [args.split.emptyType] 无数据项目的显示规则 ：  0 ：隐藏; 1：显示为0 ; 2：显示为--(连续)；3：显示--(中断)
   * @param {string} [args.split.fields[0].advancedSetting.alldownload] null
   * @param {string} [args.split.fields[0].advancedSetting.allowdelete] null
   * @param {string} [args.split.fields[0].advancedSetting.allowdownload] null
   * @param {string} [args.split.fields[0].advancedSetting.allowupload] null
   * @param {string} [args.split.fields[0].advancedSetting.chooserange] 地区指定国家：空代表国际，null代表中国（老数据）  有值代表指定了国家
   * @param {string} [args.split.fields[0].advancedSetting.datamask] null
   * @param {string} [args.split.fields[0].advancedSetting.dotformat] 数值 空/0:显示完整的位数 1:自动
   * @param {string} [args.split.fields[0].advancedSetting.isdecrypt] null
   * @param {string} [args.split.fields[0].advancedSetting.itemnames] null
   * @param {string} [args.split.fields[0].advancedSetting.maskbegin] null
   * @param {string} [args.split.fields[0].advancedSetting.maskend] null
   * @param {string} [args.split.fields[0].advancedSetting.masklen] null
   * @param {string} [args.split.fields[0].advancedSetting.maskmid] null
   * @param {string} [args.split.fields[0].advancedSetting.masktype] null
   * @param {string} [args.split.fields[0].advancedSetting.max] null
   * @param {string} [args.split.fields[0].advancedSetting.mdchar] null
   * @param {string} [args.split.fields[0].advancedSetting.mechar] null
   * @param {string} [args.split.fields[0].advancedSetting.numshow] null
   * @param {string} [args.split.fields[0].advancedSetting.prefix] null
   * @param {string} [args.split.fields[0].advancedSetting.showformat] null
   * @param {string} [args.split.fields[0].advancedSetting.showtype] null
   * @param {string} [args.split.fields[0].advancedSetting.storelayer] null
   * @param {string} [args.split.fields[0].advancedSetting.suffix] null
   * @param {string} [args.split.fields[0].controlId] null
   * @param {string} [args.split.fields[0].controlName] null
   * @param {integer} [args.split.fields[0].controlType] null
   * @param {integer} [args.split.fields[0].size] null
   * @param {integer} [args.split.particleSizeType] 粒度 1:日 2:周 3:月
   * @param {string} [args.split.rename] 重命名
   * @param {string} [args.split.showFormat] 显示格式设置
   * @param {integer} [args.split.sortType] 排序 0 :默认 1:升序 2:降序 3:自定义排序
   * @param {boolean} [args.split.subTotal] 是否小计
   * @param {string} [args.split.subTotalName] 小计名称
   * @param {string} [args.splitId] 拆分控件ID
   * @param {object} [args.style] 前端自己定义的样式,后端统计无关的字段
   * @param {boolean} [args.summary.all] 是否勾选全部
   * @param {number} [args.summary.contrastMapSum] 同比汇总值
   * @param {number} [args.summary.contrastSum] 环比汇总值
   * @param {string} [args.summary.controlId] id
   * @param {number} [args.summary.controlList[0].contrastMapSum] 同比汇总值
   * @param {number} [args.summary.controlList[0].contrastSum] 环比汇总值
   * @param {string} [args.summary.controlList[0].controlId] id
   * @param {string} [args.summary.controlList[0].name] 名称
   * @param {boolean} [args.summary.controlList[0].number] 数值
   * @param {boolean} [args.summary.controlList[0].percent] 百分比
   * @param {number} [args.summary.controlList[0].sum] 汇总值
   * @param {integer} [args.summary.controlList[0].type] 方式：1：求和 2：最大值 3：最小值 4：平均值
   * @param {integer} [args.summary.location] 位置：1:上方 2:下方 3:左侧 4:右侧
   * @param {string} [args.summary.name] 名称
   * @param {boolean} [args.summary.number] 数值
   * @param {boolean} [args.summary.percent] 百分比
   * @param {string} [args.summary.rename] 重命名
   * @param {boolean} [args.summary.showTotal] 显示总计
   * @param {number} [args.summary.sum] 汇总值
   * @param {integer} [args.summary.type] 方式：1：求和 2：最大值 3：最小值 4：平均值
   * @param {boolean} [args.xAxes.XAxisEmpty] null
   * @param {integer} [args.xAxes.XAxisEmptyType] null
   * @param {string} [args.xAxes.c_Id] null
   * @param {string} [args.xAxes.controlId] 控件ID
   * @param {integer} [args.xAxes.emptyType] 无数据项目的显示规则 ：  0 ：隐藏; 1：显示为0 ; 2：显示为--(连续)；3：显示--(中断)
   * @param {string} [args.xAxes.fields[0].advancedSetting.alldownload] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.allowdelete] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.allowdownload] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.allowupload] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.chooserange] 地区指定国家：空代表国际，null代表中国（老数据）  有值代表指定了国家
   * @param {string} [args.xAxes.fields[0].advancedSetting.datamask] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.dotformat] 数值 空/0:显示完整的位数 1:自动
   * @param {string} [args.xAxes.fields[0].advancedSetting.isdecrypt] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.itemnames] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.maskbegin] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.maskend] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.masklen] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.maskmid] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.masktype] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.max] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.mdchar] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.mechar] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.numshow] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.prefix] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.showformat] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.showtype] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.storelayer] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.suffix] null
   * @param {string} [args.xAxes.fields[0].controlId] null
   * @param {string} [args.xAxes.fields[0].controlName] null
   * @param {integer} [args.xAxes.fields[0].controlType] null
   * @param {integer} [args.xAxes.fields[0].size] null
   * @param {integer} [args.xAxes.particleSizeType] 粒度 1:日 2:周 3:月
   * @param {string} [args.xAxes.rename] 重命名
   * @param {string} [args.xAxes.showFormat] 显示格式设置
   * @param {integer} [args.xAxes.sortType] 排序 0 :默认 1:升序 2:降序 3:自定义排序
   * @param {boolean} [args.xAxes.subTotal] 是否小计
   * @param {string} [args.xAxes.subTotalName] 小计名称
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getData: function (args, options) {
    base.ajaxOptions.url = base.server() + '/report/getData';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'reportgetData', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 刷新图表数据
   * @param {Object} args 请求参数
   * @param {string} [args.XAxis] null
   * @param {integer} [args.XAxisSortType] null
   * @param {string} [args.YAxisList[0].YDot] null
   * @param {string} [args.YAxisList[0].controlId] 控件ID
   * @param {string} [args.YAxisList[0].dotFormat] 1:省去末尾的0
   * @param {integer} [args.YAxisList[0].emptyShowType] 为0时或空值显示类型
   * @param {integer} [args.YAxisList[0].fixType] 0 后缀  ，1:前缀
   * @param {integer} [args.YAxisList[0].magnitude] 数值数量级 0:自动,1：无 ，2:千 3：万 4：百万 5： 亿
   * @param {integer} [args.YAxisList[0].normType] 1：求和，2：最大值，3：最小值，4：平均值
   * @param {string} [args.YAxisList[0].percent.dot] 保留位数
   * @param {string} [args.YAxisList[0].percent.dotFormat] 1:省去末尾的0
   * @param {boolean} [args.YAxisList[0].percent.enable] 是否开启
   * @param {integer} [args.YAxisList[0].percent.roundType] 四舍五入配置：0: 向下舍入，1:向上舍入，2:四舍五入
   * @param {integer} [args.YAxisList[0].percent.type] 计算方式：1: 小计 2：总计
   * @param {string} [args.YAxisList[0].rename] 重命名
   * @param {integer} [args.YAxisList[0].roundType] 四舍五入配置：0: 向下舍入，1:向上舍入，2:四舍五入
   * @param {boolean} [args.YAxisList[0].showNumber] 显示数值
   * @param {integer} [args.YAxisList[0].sortType] 排序 0 :默认 1:升序 2:降序
   * @param {string} [args.YAxisList[0].suffix] 后缀
   * @param {boolean} [args.YAxisList[0].thousandth] 是否显示千分位
   * @param {string} [args.YAxisList[0].value] 固定值
   * @param {integer} [args.YReportType] null
   * @param {string} [args.appId] 工作表ID
   * @param {integer} [args.appType] 统计应用类型 1:工作表
   * @param {integer} [args.auth] 自定义页面图表权限
   * @param {object} [args.config] null
   * @param {string} [args.createdBy] 创建人id
   * @param {string} [args.createdDate] 创建日期  默认当前日期
   * @param {boolean} [args.deleted] 是否删除  默认false
   * @param {string} [args.desc] 图表说明
   * @param {boolean} [args.displaySetup.XAxisEmpty] null
   * @param {number} [args.displaySetup.XDisplay.maxValue] 最大值
   * @param {number} [args.displaySetup.XDisplay.minValue] 最小值
   * @param {boolean} [args.displaySetup.XDisplay.showDial] 显示刻度标签
   * @param {boolean} [args.displaySetup.XDisplay.showTitle] 显示标题
   * @param {string} [args.displaySetup.XDisplay.title] 标题名称
   * @param {integer} [args.displaySetup.YDisplay.lineStyle] 线条样式：1：实线 2：虚线 3：点线
   * @param {number} [args.displaySetup.YDisplay.maxValue] 最大值
   * @param {number} [args.displaySetup.YDisplay.minValue] 最小值
   * @param {boolean} [args.displaySetup.YDisplay.showDial] 显示刻度标签
   * @param {boolean} [args.displaySetup.YDisplay.showTitle] 显示标题
   * @param {string} [args.displaySetup.YDisplay.title] 标题名称
   * @param {string} [args.displaySetup.auxiliaryLines[0].color] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].controlId] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].id] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].location] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].name] null
   * @param {integer} [args.displaySetup.auxiliaryLines[0].percent] null
   * @param {boolean} [args.displaySetup.auxiliaryLines[0].showName] null
   * @param {boolean} [args.displaySetup.auxiliaryLines[0].showValue] null
   * @param {integer} [args.displaySetup.auxiliaryLines[0].style] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].type] null
   * @param {number} [args.displaySetup.auxiliaryLines[0].value] null
   * @param {object} [args.displaySetup.colorRules[0].bgColorRule] null
   * @param {string} [args.displaySetup.colorRules[0].controlId] null
   * @param {object} [args.displaySetup.colorRules[0].dataBarRule] null
   * @param {object} [args.displaySetup.colorRules[0].textColorRule] null
   * @param {boolean} [args.displaySetup.contrast] 数值图同比
   * @param {integer} [args.displaySetup.contrastType] 对比：0 ：没有比较，1：与上一周期 2：与上一年
   * @param {integer} [args.displaySetup.fontStyle] 文字倾斜 默认 0横向 1倾斜
   * @param {boolean} [args.displaySetup.hideOverlapText] 隐藏重叠文本
   * @param {boolean} [args.displaySetup.isAccumulate] 周期累计
   * @param {boolean} [args.displaySetup.isLifecycle] 周期目标
   * @param {boolean} [args.displaySetup.isPerPile] 百分比
   * @param {boolean} [args.displaySetup.isPile] 堆叠
   * @param {boolean} [args.displaySetup.isToday] 今天
   * @param {integer} [args.displaySetup.legendType] 图例类型1:左上角，2:左居中，3：底部居中，4：右居中
   * @param {number} [args.displaySetup.lifecycleValue] 周期目标值
   * @param {boolean} [args.displaySetup.mergeCell] 合并单元格
   * @param {string} [args.displaySetup.percent.dot] 保留位数
   * @param {string} [args.displaySetup.percent.dotFormat] 1:省去末尾的0
   * @param {boolean} [args.displaySetup.percent.enable] 是否开启
   * @param {integer} [args.displaySetup.percent.roundType] 四舍五入配置：0: 向下舍入，1:向上舍入，2:四舍五入
   * @param {integer} [args.displaySetup.percent.type] 计算方式：1: 小计 2：总计
   * @param {integer} [args.displaySetup.showChartType] 柱图 锥子图 代表方向  1 竖向 2 横向 折线图代表的是 1：折线  2 : 面积   行政区域图1:区域  2：气泡
   * @param {array} [args.displaySetup.showControlIds] 显示的行数据字段ids
   * @param {boolean} [args.displaySetup.showDimension] 显示维度标签
   * @param {boolean} [args.displaySetup.showLegend] 显示图例
   * @param {boolean} [args.displaySetup.showNumber] 显示数值
   * @param {array} [args.displaySetup.showOptionIds] 漏斗图 下拉选项配置显示的选项
   * @param {boolean} [args.displaySetup.showPercent] 显示百分比
   * @param {boolean} [args.displaySetup.showPileTotal] 显示堆叠总数
   * @param {boolean} [args.displaySetup.showRowList] 是否可以查看行数据明细
   * @param {boolean} [args.displaySetup.showTitle] 是否显示标题
   * @param {boolean} [args.displaySetup.showTotal] 显示统计
   * @param {integer} [args.displaySetup.showXAxisCount] x轴前 几项
   * @param {string} [args.filter.customRangeValue] 同比自定义时间范围
   * @param {integer} [args.filter.dynamicFilter.endCount] null
   * @param {integer} [args.filter.dynamicFilter.endType] null
   * @param {integer} [args.filter.dynamicFilter.endUnit] null
   * @param {integer} [args.filter.dynamicFilter.startCount] null
   * @param {integer} [args.filter.dynamicFilter.startType] null
   * @param {integer} [args.filter.dynamicFilter.startUnit] null
   * @param {string} [args.filter.filterCode] 地区图表配置
   * @param {boolean} [args.filter.filterControls[0].asc] null
   * @param {string} [args.filter.filterControls[0].controlId] null
   * @param {integer} [args.filter.filterControls[0].dataType] null
   * @param {integer} [args.filter.filterControls[0].dataType] null
   * @param {integer} [args.filter.filterControls[0].dateRange] null
   * @param {integer} [args.filter.filterControls[0].dateRange] null
   * @param {integer} [args.filter.filterControls[0].dateRangeType] null
   * @param {integer} [args.filter.filterControls[0].dateRangeType] null
   * @param {string} [args.filter.filterControls[0].dynamicSource[0].cid] null
   * @param {string} [args.filter.filterControls[0].dynamicSource[0].rcid] null
   * @param {string} [args.filter.filterControls[0].dynamicSource[0].staticValue] null
   * @param {integer} [args.filter.filterControls[0].filterType] null
   * @param {integer} [args.filter.filterControls[0].filterType] null
   * @param {boolean} [args.filter.filterControls[0].isAsc] null
   * @param {boolean} [args.filter.filterControls[0].isGroup] null
   * @param {string} [args.filter.filterControls[0].maxValue] null
   * @param {string} [args.filter.filterControls[0].maxValue] null
   * @param {string} [args.filter.filterControls[0].minValue] null
   * @param {string} [args.filter.filterControls[0].minValue] null
   * @param {integer} [args.filter.filterControls[0].spliceType] null
   * @param {integer} [args.filter.filterControls[0].spliceType] null
   * @param {string} [args.filter.filterControls[0].value] null
   * @param {string} [args.filter.filterControls[0].value] null
   * @param {array} [args.filter.filterControls[0].values] null
   * @param {array} [args.filter.filterControls[0].values] null
   * @param {string} [args.filter.filterId] 筛选ID
   * @param {string} [args.filter.filterRangeId] 筛选范围字段ID
   * @param {boolean} [args.filter.ignoreToday] 对比时忽略至今天
   * @param {integer} [args.filter.rangeType] 筛选范围: 1:今天，2：昨天，3：明天，4：本周，5：上周，6：下周，8：本月，9：上月，10：下月，11：本季度，12：上季度，13：下季度，15：本年，16：上一年，17：下一年，18：今天之前的...天，19：今天之后的..天,20:自定义,21自定义动态时间范围
   * @param {string} [args.filter.rangeValue] 范围的值：7:7天，14：14天，30：30天,90：90天，180：180天，365：365天,财年: 第一位是 上一财年-1, 本财年 0，下一财年-2，第二位是月份 例如0:3，本财年3月份
   * @param {object} [args.filter.requestParams] requestParams
   * @param {boolean} [args.filter.today] 至今天
   * @param {string} [args.filter.viewId] 视图ID
   * @param {integer} [args.filter.viewType] 视图类型
   * @param {string} [args.formulas[0].advancedSetting.alldownload] null
   * @param {string} [args.formulas[0].advancedSetting.allowdelete] null
   * @param {string} [args.formulas[0].advancedSetting.allowdownload] null
   * @param {string} [args.formulas[0].advancedSetting.allowupload] null
   * @param {string} [args.formulas[0].advancedSetting.chooserange] 地区指定国家：空代表国际，null代表中国（老数据）  有值代表指定了国家
   * @param {string} [args.formulas[0].advancedSetting.datamask] null
   * @param {string} [args.formulas[0].advancedSetting.dotformat] 数值 空/0:显示完整的位数 1:自动
   * @param {string} [args.formulas[0].advancedSetting.isdecrypt] null
   * @param {string} [args.formulas[0].advancedSetting.itemnames] null
   * @param {string} [args.formulas[0].advancedSetting.maskbegin] null
   * @param {string} [args.formulas[0].advancedSetting.maskend] null
   * @param {string} [args.formulas[0].advancedSetting.masklen] null
   * @param {string} [args.formulas[0].advancedSetting.maskmid] null
   * @param {string} [args.formulas[0].advancedSetting.masktype] null
   * @param {string} [args.formulas[0].advancedSetting.max] null
   * @param {string} [args.formulas[0].advancedSetting.mdchar] null
   * @param {string} [args.formulas[0].advancedSetting.mechar] null
   * @param {string} [args.formulas[0].advancedSetting.numshow] null
   * @param {string} [args.formulas[0].advancedSetting.prefix] null
   * @param {string} [args.formulas[0].advancedSetting.showformat] null
   * @param {string} [args.formulas[0].advancedSetting.showtype] null
   * @param {string} [args.formulas[0].advancedSetting.storelayer] null
   * @param {string} [args.formulas[0].advancedSetting.suffix] null
   * @param {integer} [args.formulas[0].attribute] 工作表标题字段属性
   * @param {integer} [args.formulas[0].col] null
   * @param {string} [args.formulas[0].controlId] 控件id
   * @param {string} [args.formulas[0].controlName] 控件名
   * @param {string} [args.formulas[0].dataSource] 控件用到的数据源
   * @param {integer} [args.formulas[0].dot] null
   * @param {string} [args.formulas[0].encryId] 加密规则的id
   * @param {integer} [args.formulas[0].enumDefault] null
   * @param {integer} [args.formulas[0].enumDefault2] null
   * @param {string} [args.formulas[0].fromValue] 逻辑里面 value toString方法使用 不存不输出
   * @param {string} [args.formulas[0].options[0].color] 颜色值
   * @param {integer} [args.formulas[0].options[0].index] null
   * @param {boolean} [args.formulas[0].options[0].isDeleted] 是否删除
   * @param {string} [args.formulas[0].options[0].key] 选项值
   * @param {number} [args.formulas[0].options[0].score] 赋分值
   * @param {string} [args.formulas[0].options[0].value] 选项名称
   * @param {boolean} [args.formulas[0].required] gson随便映射一个字段 以workflow的配置为主
   * @param {integer} [args.formulas[0].row] null
   * @param {array} [args.formulas[0].rowIds] 关联的 rowIds
   * @param {string} [args.formulas[0].sourceControlId] 关联控件ID
   * @param {integer} [args.formulas[0].sourceControlType] 关联他表字段控件的类型
   * @param {string} [args.formulas[0].sourceEntityName] 关联表的entityName
   * @param {string} [args.formulas[0].sourceTitleControlId] 关联他表里面的标题控件ID
   * @param {integer} [args.formulas[0].type] 控件类型
   * @param {string} [args.formulas[0].unit] 日期公式：1:分钟，2：小时，3：天
   * @param {object} [args.formulas[0].value] 控件值
   * @param {string} [args.id] ID
   * @param {string} [args.lastModifiedBy] 最后修改人ID
   * @param {string} [args.lastModifiedDate] 最后修改日期  默认当前日期
   * @param {string} [args.name] 名称
   * @param {string} [args.owner] 拥有者ID
   * @param {integer} [args.particleSizeType] 日期： 粒度 1:日 2:周 3:月  /地区 ： 1: 省 2：市 3：区/县
   * @param {获取图表数据} {appId:工作表id(string),contrastType:对比周期(integer),customRangeValue:同比自定义时间范围(string),dynamicFilter:动态筛选(ref),exportType:导出类型 0 ：原始值导出，1：显示值导出(integer),filterCode:范围 :空 代表全中国(string),filterControls:筛选条件(array),filterRangeId:筛选范围字段ID(string),filters:筛选条件(array),isPersonal:查看原始数据： ture，其他:false(boolean),match:点击的数值条件：{"caid":"user-workflow","ownerid":"user-undefined"}(object),pageId:自定义页面id(string),particleSizeType:粒度 1:日 2:周 3:月  /  行政区域图 1： 全国，2：省，3：市(integer),rangeType:筛选范围: 1:今天，2：昨天，3：明天，4：本周，5：上周，6：下周，8：本月，9：上月，10：下月，11：本季度，12：上季度，13：下季度，15：本年，16：上一年，17：下一年，18：今天之前的...天，19：今天之后的..天,20:自定义(integer),rangeValue:范围的值：7:7天，14：14天，30：30天,90：90天，180：180天，365：365天(string),reload:是否刷新(boolean),reportId:图表ID(string),requestParams:链接参数(object),sorts:自定义排序的数组(array),today:至今天(boolean),version:版本(string),}*reportDataRequest
   * @param {integer} [args.reportType] 类型   1:柱图 2:折线图  3:饼图  4:数值图 5：雷达图 6:漏斗图 7：双轴图 8：透视图 9:行政区划
   * @param {integer} [args.sourceType] 来源 空 代表 来自报表创建，1：page页面创建
   * @param {boolean} [args.split.XAxisEmpty] null
   * @param {integer} [args.split.XAxisEmptyType] null
   * @param {string} [args.split.c_Id] null
   * @param {string} [args.split.controlId] 控件ID
   * @param {integer} [args.split.emptyType] 无数据项目的显示规则 ：  0 ：隐藏; 1：显示为0 ; 2：显示为--(连续)；3：显示--(中断)
   * @param {string} [args.split.fields[0].advancedSetting.alldownload] null
   * @param {string} [args.split.fields[0].advancedSetting.allowdelete] null
   * @param {string} [args.split.fields[0].advancedSetting.allowdownload] null
   * @param {string} [args.split.fields[0].advancedSetting.allowupload] null
   * @param {string} [args.split.fields[0].advancedSetting.chooserange] 地区指定国家：空代表国际，null代表中国（老数据）  有值代表指定了国家
   * @param {string} [args.split.fields[0].advancedSetting.datamask] null
   * @param {string} [args.split.fields[0].advancedSetting.dotformat] 数值 空/0:显示完整的位数 1:自动
   * @param {string} [args.split.fields[0].advancedSetting.isdecrypt] null
   * @param {string} [args.split.fields[0].advancedSetting.itemnames] null
   * @param {string} [args.split.fields[0].advancedSetting.maskbegin] null
   * @param {string} [args.split.fields[0].advancedSetting.maskend] null
   * @param {string} [args.split.fields[0].advancedSetting.masklen] null
   * @param {string} [args.split.fields[0].advancedSetting.maskmid] null
   * @param {string} [args.split.fields[0].advancedSetting.masktype] null
   * @param {string} [args.split.fields[0].advancedSetting.max] null
   * @param {string} [args.split.fields[0].advancedSetting.mdchar] null
   * @param {string} [args.split.fields[0].advancedSetting.mechar] null
   * @param {string} [args.split.fields[0].advancedSetting.numshow] null
   * @param {string} [args.split.fields[0].advancedSetting.prefix] null
   * @param {string} [args.split.fields[0].advancedSetting.showformat] null
   * @param {string} [args.split.fields[0].advancedSetting.showtype] null
   * @param {string} [args.split.fields[0].advancedSetting.storelayer] null
   * @param {string} [args.split.fields[0].advancedSetting.suffix] null
   * @param {string} [args.split.fields[0].controlId] null
   * @param {string} [args.split.fields[0].controlName] null
   * @param {integer} [args.split.fields[0].controlType] null
   * @param {integer} [args.split.fields[0].size] null
   * @param {integer} [args.split.particleSizeType] 粒度 1:日 2:周 3:月
   * @param {string} [args.split.rename] 重命名
   * @param {string} [args.split.showFormat] 显示格式设置
   * @param {integer} [args.split.sortType] 排序 0 :默认 1:升序 2:降序 3:自定义排序
   * @param {boolean} [args.split.subTotal] 是否小计
   * @param {string} [args.split.subTotalName] 小计名称
   * @param {string} [args.splitId] 拆分控件ID
   * @param {object} [args.style] 前端自己定义的样式,后端统计无关的字段
   * @param {boolean} [args.summary.all] 是否勾选全部
   * @param {number} [args.summary.contrastMapSum] 同比汇总值
   * @param {number} [args.summary.contrastSum] 环比汇总值
   * @param {string} [args.summary.controlId] id
   * @param {number} [args.summary.controlList[0].contrastMapSum] 同比汇总值
   * @param {number} [args.summary.controlList[0].contrastSum] 环比汇总值
   * @param {string} [args.summary.controlList[0].controlId] id
   * @param {string} [args.summary.controlList[0].name] 名称
   * @param {boolean} [args.summary.controlList[0].number] 数值
   * @param {boolean} [args.summary.controlList[0].percent] 百分比
   * @param {number} [args.summary.controlList[0].sum] 汇总值
   * @param {integer} [args.summary.controlList[0].type] 方式：1：求和 2：最大值 3：最小值 4：平均值
   * @param {integer} [args.summary.location] 位置：1:上方 2:下方 3:左侧 4:右侧
   * @param {string} [args.summary.name] 名称
   * @param {boolean} [args.summary.number] 数值
   * @param {boolean} [args.summary.percent] 百分比
   * @param {string} [args.summary.rename] 重命名
   * @param {boolean} [args.summary.showTotal] 显示总计
   * @param {number} [args.summary.sum] 汇总值
   * @param {integer} [args.summary.type] 方式：1：求和 2：最大值 3：最小值 4：平均值
   * @param {boolean} [args.xAxes.XAxisEmpty] null
   * @param {integer} [args.xAxes.XAxisEmptyType] null
   * @param {string} [args.xAxes.c_Id] null
   * @param {string} [args.xAxes.controlId] 控件ID
   * @param {integer} [args.xAxes.emptyType] 无数据项目的显示规则 ：  0 ：隐藏; 1：显示为0 ; 2：显示为--(连续)；3：显示--(中断)
   * @param {string} [args.xAxes.fields[0].advancedSetting.alldownload] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.allowdelete] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.allowdownload] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.allowupload] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.chooserange] 地区指定国家：空代表国际，null代表中国（老数据）  有值代表指定了国家
   * @param {string} [args.xAxes.fields[0].advancedSetting.datamask] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.dotformat] 数值 空/0:显示完整的位数 1:自动
   * @param {string} [args.xAxes.fields[0].advancedSetting.isdecrypt] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.itemnames] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.maskbegin] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.maskend] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.masklen] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.maskmid] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.masktype] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.max] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.mdchar] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.mechar] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.numshow] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.prefix] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.showformat] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.showtype] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.storelayer] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.suffix] null
   * @param {string} [args.xAxes.fields[0].controlId] null
   * @param {string} [args.xAxes.fields[0].controlName] null
   * @param {integer} [args.xAxes.fields[0].controlType] null
   * @param {integer} [args.xAxes.fields[0].size] null
   * @param {integer} [args.xAxes.particleSizeType] 粒度 1:日 2:周 3:月
   * @param {string} [args.xAxes.rename] 重命名
   * @param {string} [args.xAxes.showFormat] 显示格式设置
   * @param {integer} [args.xAxes.sortType] 排序 0 :默认 1:升序 2:降序 3:自定义排序
   * @param {boolean} [args.xAxes.subTotal] 是否小计
   * @param {string} [args.xAxes.subTotalName] 小计名称
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getFavoriteData: function (args, options) {
    base.ajaxOptions.url = base.server() + '/report/getFavoriteData';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'reportgetFavoriteData', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取统计图表的条件id
   * @param {Object} args 请求参数
   * @param {获取图表数据} {appId:工作表id(string),contrastType:对比周期(integer),customRangeValue:同比自定义时间范围(string),dynamicFilter:动态筛选(ref),exportType:导出类型 0 ：原始值导出，1：显示值导出(integer),filterCode:范围 :空 代表全中国(string),filterControls:筛选条件(array),filterRangeId:筛选范围字段ID(string),filters:筛选条件(array),isPersonal:查看原始数据： ture，其他:false(boolean),match:点击的数值条件：{"caid":"user-workflow","ownerid":"user-undefined"}(object),pageId:自定义页面id(string),particleSizeType:粒度 1:日 2:周 3:月  /  行政区域图 1： 全国，2：省，3：市(integer),rangeType:筛选范围: 1:今天，2：昨天，3：明天，4：本周，5：上周，6：下周，8：本月，9：上月，10：下月，11：本季度，12：上季度，13：下季度，15：本年，16：上一年，17：下一年，18：今天之前的...天，19：今天之后的..天,20:自定义(integer),rangeValue:范围的值：7:7天，14：14天，30：30天,90：90天，180：180天，365：365天(string),reload:是否刷新(boolean),reportId:图表ID(string),requestParams:链接参数(object),sorts:自定义排序的数组(array),today:至今天(boolean),version:版本(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getReportSingleCacheId: function (args, options) {
    base.ajaxOptions.url = base.server() + '/report/getReportSingleCacheId';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'reportgetReportSingleCacheId', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取图表的数据以表的形式查看
   * @param {Object} args 请求参数
   * @param {string} [args.XAxis] null
   * @param {integer} [args.XAxisSortType] null
   * @param {string} [args.YAxisList[0].YDot] null
   * @param {string} [args.YAxisList[0].controlId] 控件ID
   * @param {string} [args.YAxisList[0].dotFormat] 1:省去末尾的0
   * @param {integer} [args.YAxisList[0].emptyShowType] 为0时或空值显示类型
   * @param {integer} [args.YAxisList[0].fixType] 0 后缀  ，1:前缀
   * @param {integer} [args.YAxisList[0].magnitude] 数值数量级 0:自动,1：无 ，2:千 3：万 4：百万 5： 亿
   * @param {integer} [args.YAxisList[0].normType] 1：求和，2：最大值，3：最小值，4：平均值
   * @param {string} [args.YAxisList[0].percent.dot] 保留位数
   * @param {string} [args.YAxisList[0].percent.dotFormat] 1:省去末尾的0
   * @param {boolean} [args.YAxisList[0].percent.enable] 是否开启
   * @param {integer} [args.YAxisList[0].percent.roundType] 四舍五入配置：0: 向下舍入，1:向上舍入，2:四舍五入
   * @param {integer} [args.YAxisList[0].percent.type] 计算方式：1: 小计 2：总计
   * @param {string} [args.YAxisList[0].rename] 重命名
   * @param {integer} [args.YAxisList[0].roundType] 四舍五入配置：0: 向下舍入，1:向上舍入，2:四舍五入
   * @param {boolean} [args.YAxisList[0].showNumber] 显示数值
   * @param {integer} [args.YAxisList[0].sortType] 排序 0 :默认 1:升序 2:降序
   * @param {string} [args.YAxisList[0].suffix] 后缀
   * @param {boolean} [args.YAxisList[0].thousandth] 是否显示千分位
   * @param {string} [args.YAxisList[0].value] 固定值
   * @param {integer} [args.YReportType] null
   * @param {string} [args.appId] 工作表ID
   * @param {integer} [args.appType] 统计应用类型 1:工作表
   * @param {integer} [args.auth] 自定义页面图表权限
   * @param {object} [args.config] null
   * @param {string} [args.createdBy] 创建人id
   * @param {string} [args.createdDate] 创建日期  默认当前日期
   * @param {boolean} [args.deleted] 是否删除  默认false
   * @param {string} [args.desc] 图表说明
   * @param {boolean} [args.displaySetup.XAxisEmpty] null
   * @param {number} [args.displaySetup.XDisplay.maxValue] 最大值
   * @param {number} [args.displaySetup.XDisplay.minValue] 最小值
   * @param {boolean} [args.displaySetup.XDisplay.showDial] 显示刻度标签
   * @param {boolean} [args.displaySetup.XDisplay.showTitle] 显示标题
   * @param {string} [args.displaySetup.XDisplay.title] 标题名称
   * @param {integer} [args.displaySetup.YDisplay.lineStyle] 线条样式：1：实线 2：虚线 3：点线
   * @param {number} [args.displaySetup.YDisplay.maxValue] 最大值
   * @param {number} [args.displaySetup.YDisplay.minValue] 最小值
   * @param {boolean} [args.displaySetup.YDisplay.showDial] 显示刻度标签
   * @param {boolean} [args.displaySetup.YDisplay.showTitle] 显示标题
   * @param {string} [args.displaySetup.YDisplay.title] 标题名称
   * @param {string} [args.displaySetup.auxiliaryLines[0].color] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].controlId] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].id] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].location] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].name] null
   * @param {integer} [args.displaySetup.auxiliaryLines[0].percent] null
   * @param {boolean} [args.displaySetup.auxiliaryLines[0].showName] null
   * @param {boolean} [args.displaySetup.auxiliaryLines[0].showValue] null
   * @param {integer} [args.displaySetup.auxiliaryLines[0].style] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].type] null
   * @param {number} [args.displaySetup.auxiliaryLines[0].value] null
   * @param {object} [args.displaySetup.colorRules[0].bgColorRule] null
   * @param {string} [args.displaySetup.colorRules[0].controlId] null
   * @param {object} [args.displaySetup.colorRules[0].dataBarRule] null
   * @param {object} [args.displaySetup.colorRules[0].textColorRule] null
   * @param {boolean} [args.displaySetup.contrast] 数值图同比
   * @param {integer} [args.displaySetup.contrastType] 对比：0 ：没有比较，1：与上一周期 2：与上一年
   * @param {integer} [args.displaySetup.fontStyle] 文字倾斜 默认 0横向 1倾斜
   * @param {boolean} [args.displaySetup.hideOverlapText] 隐藏重叠文本
   * @param {boolean} [args.displaySetup.isAccumulate] 周期累计
   * @param {boolean} [args.displaySetup.isLifecycle] 周期目标
   * @param {boolean} [args.displaySetup.isPerPile] 百分比
   * @param {boolean} [args.displaySetup.isPile] 堆叠
   * @param {boolean} [args.displaySetup.isToday] 今天
   * @param {integer} [args.displaySetup.legendType] 图例类型1:左上角，2:左居中，3：底部居中，4：右居中
   * @param {number} [args.displaySetup.lifecycleValue] 周期目标值
   * @param {boolean} [args.displaySetup.mergeCell] 合并单元格
   * @param {string} [args.displaySetup.percent.dot] 保留位数
   * @param {string} [args.displaySetup.percent.dotFormat] 1:省去末尾的0
   * @param {boolean} [args.displaySetup.percent.enable] 是否开启
   * @param {integer} [args.displaySetup.percent.roundType] 四舍五入配置：0: 向下舍入，1:向上舍入，2:四舍五入
   * @param {integer} [args.displaySetup.percent.type] 计算方式：1: 小计 2：总计
   * @param {integer} [args.displaySetup.showChartType] 柱图 锥子图 代表方向  1 竖向 2 横向 折线图代表的是 1：折线  2 : 面积   行政区域图1:区域  2：气泡
   * @param {array} [args.displaySetup.showControlIds] 显示的行数据字段ids
   * @param {boolean} [args.displaySetup.showDimension] 显示维度标签
   * @param {boolean} [args.displaySetup.showLegend] 显示图例
   * @param {boolean} [args.displaySetup.showNumber] 显示数值
   * @param {array} [args.displaySetup.showOptionIds] 漏斗图 下拉选项配置显示的选项
   * @param {boolean} [args.displaySetup.showPercent] 显示百分比
   * @param {boolean} [args.displaySetup.showPileTotal] 显示堆叠总数
   * @param {boolean} [args.displaySetup.showRowList] 是否可以查看行数据明细
   * @param {boolean} [args.displaySetup.showTitle] 是否显示标题
   * @param {boolean} [args.displaySetup.showTotal] 显示统计
   * @param {integer} [args.displaySetup.showXAxisCount] x轴前 几项
   * @param {string} [args.filter.customRangeValue] 同比自定义时间范围
   * @param {integer} [args.filter.dynamicFilter.endCount] null
   * @param {integer} [args.filter.dynamicFilter.endType] null
   * @param {integer} [args.filter.dynamicFilter.endUnit] null
   * @param {integer} [args.filter.dynamicFilter.startCount] null
   * @param {integer} [args.filter.dynamicFilter.startType] null
   * @param {integer} [args.filter.dynamicFilter.startUnit] null
   * @param {string} [args.filter.filterCode] 地区图表配置
   * @param {boolean} [args.filter.filterControls[0].asc] null
   * @param {string} [args.filter.filterControls[0].controlId] null
   * @param {integer} [args.filter.filterControls[0].dataType] null
   * @param {integer} [args.filter.filterControls[0].dataType] null
   * @param {integer} [args.filter.filterControls[0].dateRange] null
   * @param {integer} [args.filter.filterControls[0].dateRange] null
   * @param {integer} [args.filter.filterControls[0].dateRangeType] null
   * @param {integer} [args.filter.filterControls[0].dateRangeType] null
   * @param {string} [args.filter.filterControls[0].dynamicSource[0].cid] null
   * @param {string} [args.filter.filterControls[0].dynamicSource[0].rcid] null
   * @param {string} [args.filter.filterControls[0].dynamicSource[0].staticValue] null
   * @param {integer} [args.filter.filterControls[0].filterType] null
   * @param {integer} [args.filter.filterControls[0].filterType] null
   * @param {boolean} [args.filter.filterControls[0].isAsc] null
   * @param {boolean} [args.filter.filterControls[0].isGroup] null
   * @param {string} [args.filter.filterControls[0].maxValue] null
   * @param {string} [args.filter.filterControls[0].maxValue] null
   * @param {string} [args.filter.filterControls[0].minValue] null
   * @param {string} [args.filter.filterControls[0].minValue] null
   * @param {integer} [args.filter.filterControls[0].spliceType] null
   * @param {integer} [args.filter.filterControls[0].spliceType] null
   * @param {string} [args.filter.filterControls[0].value] null
   * @param {string} [args.filter.filterControls[0].value] null
   * @param {array} [args.filter.filterControls[0].values] null
   * @param {array} [args.filter.filterControls[0].values] null
   * @param {string} [args.filter.filterId] 筛选ID
   * @param {string} [args.filter.filterRangeId] 筛选范围字段ID
   * @param {boolean} [args.filter.ignoreToday] 对比时忽略至今天
   * @param {integer} [args.filter.rangeType] 筛选范围: 1:今天，2：昨天，3：明天，4：本周，5：上周，6：下周，8：本月，9：上月，10：下月，11：本季度，12：上季度，13：下季度，15：本年，16：上一年，17：下一年，18：今天之前的...天，19：今天之后的..天,20:自定义,21自定义动态时间范围
   * @param {string} [args.filter.rangeValue] 范围的值：7:7天，14：14天，30：30天,90：90天，180：180天，365：365天,财年: 第一位是 上一财年-1, 本财年 0，下一财年-2，第二位是月份 例如0:3，本财年3月份
   * @param {object} [args.filter.requestParams] requestParams
   * @param {boolean} [args.filter.today] 至今天
   * @param {string} [args.filter.viewId] 视图ID
   * @param {integer} [args.filter.viewType] 视图类型
   * @param {string} [args.formulas[0].advancedSetting.alldownload] null
   * @param {string} [args.formulas[0].advancedSetting.allowdelete] null
   * @param {string} [args.formulas[0].advancedSetting.allowdownload] null
   * @param {string} [args.formulas[0].advancedSetting.allowupload] null
   * @param {string} [args.formulas[0].advancedSetting.chooserange] 地区指定国家：空代表国际，null代表中国（老数据）  有值代表指定了国家
   * @param {string} [args.formulas[0].advancedSetting.datamask] null
   * @param {string} [args.formulas[0].advancedSetting.dotformat] 数值 空/0:显示完整的位数 1:自动
   * @param {string} [args.formulas[0].advancedSetting.isdecrypt] null
   * @param {string} [args.formulas[0].advancedSetting.itemnames] null
   * @param {string} [args.formulas[0].advancedSetting.maskbegin] null
   * @param {string} [args.formulas[0].advancedSetting.maskend] null
   * @param {string} [args.formulas[0].advancedSetting.masklen] null
   * @param {string} [args.formulas[0].advancedSetting.maskmid] null
   * @param {string} [args.formulas[0].advancedSetting.masktype] null
   * @param {string} [args.formulas[0].advancedSetting.max] null
   * @param {string} [args.formulas[0].advancedSetting.mdchar] null
   * @param {string} [args.formulas[0].advancedSetting.mechar] null
   * @param {string} [args.formulas[0].advancedSetting.numshow] null
   * @param {string} [args.formulas[0].advancedSetting.prefix] null
   * @param {string} [args.formulas[0].advancedSetting.showformat] null
   * @param {string} [args.formulas[0].advancedSetting.showtype] null
   * @param {string} [args.formulas[0].advancedSetting.storelayer] null
   * @param {string} [args.formulas[0].advancedSetting.suffix] null
   * @param {integer} [args.formulas[0].attribute] 工作表标题字段属性
   * @param {integer} [args.formulas[0].col] null
   * @param {string} [args.formulas[0].controlId] 控件id
   * @param {string} [args.formulas[0].controlName] 控件名
   * @param {string} [args.formulas[0].dataSource] 控件用到的数据源
   * @param {integer} [args.formulas[0].dot] null
   * @param {string} [args.formulas[0].encryId] 加密规则的id
   * @param {integer} [args.formulas[0].enumDefault] null
   * @param {integer} [args.formulas[0].enumDefault2] null
   * @param {string} [args.formulas[0].fromValue] 逻辑里面 value toString方法使用 不存不输出
   * @param {string} [args.formulas[0].options[0].color] 颜色值
   * @param {integer} [args.formulas[0].options[0].index] null
   * @param {boolean} [args.formulas[0].options[0].isDeleted] 是否删除
   * @param {string} [args.formulas[0].options[0].key] 选项值
   * @param {number} [args.formulas[0].options[0].score] 赋分值
   * @param {string} [args.formulas[0].options[0].value] 选项名称
   * @param {boolean} [args.formulas[0].required] gson随便映射一个字段 以workflow的配置为主
   * @param {integer} [args.formulas[0].row] null
   * @param {array} [args.formulas[0].rowIds] 关联的 rowIds
   * @param {string} [args.formulas[0].sourceControlId] 关联控件ID
   * @param {integer} [args.formulas[0].sourceControlType] 关联他表字段控件的类型
   * @param {string} [args.formulas[0].sourceEntityName] 关联表的entityName
   * @param {string} [args.formulas[0].sourceTitleControlId] 关联他表里面的标题控件ID
   * @param {integer} [args.formulas[0].type] 控件类型
   * @param {string} [args.formulas[0].unit] 日期公式：1:分钟，2：小时，3：天
   * @param {object} [args.formulas[0].value] 控件值
   * @param {string} [args.id] ID
   * @param {string} [args.lastModifiedBy] 最后修改人ID
   * @param {string} [args.lastModifiedDate] 最后修改日期  默认当前日期
   * @param {string} [args.name] 名称
   * @param {string} [args.owner] 拥有者ID
   * @param {integer} [args.particleSizeType] 日期： 粒度 1:日 2:周 3:月  /地区 ： 1: 省 2：市 3：区/县
   * @param {获取图表数据} {appId:工作表id(string),contrastType:对比周期(integer),customRangeValue:同比自定义时间范围(string),dynamicFilter:动态筛选(ref),exportType:导出类型 0 ：原始值导出，1：显示值导出(integer),filterCode:范围 :空 代表全中国(string),filterControls:筛选条件(array),filterRangeId:筛选范围字段ID(string),filters:筛选条件(array),isPersonal:查看原始数据： ture，其他:false(boolean),match:点击的数值条件：{"caid":"user-workflow","ownerid":"user-undefined"}(object),pageId:自定义页面id(string),particleSizeType:粒度 1:日 2:周 3:月  /  行政区域图 1： 全国，2：省，3：市(integer),rangeType:筛选范围: 1:今天，2：昨天，3：明天，4：本周，5：上周，6：下周，8：本月，9：上月，10：下月，11：本季度，12：上季度，13：下季度，15：本年，16：上一年，17：下一年，18：今天之前的...天，19：今天之后的..天,20:自定义(integer),rangeValue:范围的值：7:7天，14：14天，30：30天,90：90天，180：180天，365：365天(string),reload:是否刷新(boolean),reportId:图表ID(string),requestParams:链接参数(object),sorts:自定义排序的数组(array),today:至今天(boolean),version:版本(string),}*reportDataRequest
   * @param {integer} [args.reportType] 类型   1:柱图 2:折线图  3:饼图  4:数值图 5：雷达图 6:漏斗图 7：双轴图 8：透视图 9:行政区划
   * @param {integer} [args.sourceType] 来源 空 代表 来自报表创建，1：page页面创建
   * @param {boolean} [args.split.XAxisEmpty] null
   * @param {integer} [args.split.XAxisEmptyType] null
   * @param {string} [args.split.c_Id] null
   * @param {string} [args.split.controlId] 控件ID
   * @param {integer} [args.split.emptyType] 无数据项目的显示规则 ：  0 ：隐藏; 1：显示为0 ; 2：显示为--(连续)；3：显示--(中断)
   * @param {string} [args.split.fields[0].advancedSetting.alldownload] null
   * @param {string} [args.split.fields[0].advancedSetting.allowdelete] null
   * @param {string} [args.split.fields[0].advancedSetting.allowdownload] null
   * @param {string} [args.split.fields[0].advancedSetting.allowupload] null
   * @param {string} [args.split.fields[0].advancedSetting.chooserange] 地区指定国家：空代表国际，null代表中国（老数据）  有值代表指定了国家
   * @param {string} [args.split.fields[0].advancedSetting.datamask] null
   * @param {string} [args.split.fields[0].advancedSetting.dotformat] 数值 空/0:显示完整的位数 1:自动
   * @param {string} [args.split.fields[0].advancedSetting.isdecrypt] null
   * @param {string} [args.split.fields[0].advancedSetting.itemnames] null
   * @param {string} [args.split.fields[0].advancedSetting.maskbegin] null
   * @param {string} [args.split.fields[0].advancedSetting.maskend] null
   * @param {string} [args.split.fields[0].advancedSetting.masklen] null
   * @param {string} [args.split.fields[0].advancedSetting.maskmid] null
   * @param {string} [args.split.fields[0].advancedSetting.masktype] null
   * @param {string} [args.split.fields[0].advancedSetting.max] null
   * @param {string} [args.split.fields[0].advancedSetting.mdchar] null
   * @param {string} [args.split.fields[0].advancedSetting.mechar] null
   * @param {string} [args.split.fields[0].advancedSetting.numshow] null
   * @param {string} [args.split.fields[0].advancedSetting.prefix] null
   * @param {string} [args.split.fields[0].advancedSetting.showformat] null
   * @param {string} [args.split.fields[0].advancedSetting.showtype] null
   * @param {string} [args.split.fields[0].advancedSetting.storelayer] null
   * @param {string} [args.split.fields[0].advancedSetting.suffix] null
   * @param {string} [args.split.fields[0].controlId] null
   * @param {string} [args.split.fields[0].controlName] null
   * @param {integer} [args.split.fields[0].controlType] null
   * @param {integer} [args.split.fields[0].size] null
   * @param {integer} [args.split.particleSizeType] 粒度 1:日 2:周 3:月
   * @param {string} [args.split.rename] 重命名
   * @param {string} [args.split.showFormat] 显示格式设置
   * @param {integer} [args.split.sortType] 排序 0 :默认 1:升序 2:降序 3:自定义排序
   * @param {boolean} [args.split.subTotal] 是否小计
   * @param {string} [args.split.subTotalName] 小计名称
   * @param {string} [args.splitId] 拆分控件ID
   * @param {object} [args.style] 前端自己定义的样式,后端统计无关的字段
   * @param {boolean} [args.summary.all] 是否勾选全部
   * @param {number} [args.summary.contrastMapSum] 同比汇总值
   * @param {number} [args.summary.contrastSum] 环比汇总值
   * @param {string} [args.summary.controlId] id
   * @param {number} [args.summary.controlList[0].contrastMapSum] 同比汇总值
   * @param {number} [args.summary.controlList[0].contrastSum] 环比汇总值
   * @param {string} [args.summary.controlList[0].controlId] id
   * @param {string} [args.summary.controlList[0].name] 名称
   * @param {boolean} [args.summary.controlList[0].number] 数值
   * @param {boolean} [args.summary.controlList[0].percent] 百分比
   * @param {number} [args.summary.controlList[0].sum] 汇总值
   * @param {integer} [args.summary.controlList[0].type] 方式：1：求和 2：最大值 3：最小值 4：平均值
   * @param {integer} [args.summary.location] 位置：1:上方 2:下方 3:左侧 4:右侧
   * @param {string} [args.summary.name] 名称
   * @param {boolean} [args.summary.number] 数值
   * @param {boolean} [args.summary.percent] 百分比
   * @param {string} [args.summary.rename] 重命名
   * @param {boolean} [args.summary.showTotal] 显示总计
   * @param {number} [args.summary.sum] 汇总值
   * @param {integer} [args.summary.type] 方式：1：求和 2：最大值 3：最小值 4：平均值
   * @param {boolean} [args.xAxes.XAxisEmpty] null
   * @param {integer} [args.xAxes.XAxisEmptyType] null
   * @param {string} [args.xAxes.c_Id] null
   * @param {string} [args.xAxes.controlId] 控件ID
   * @param {integer} [args.xAxes.emptyType] 无数据项目的显示规则 ：  0 ：隐藏; 1：显示为0 ; 2：显示为--(连续)；3：显示--(中断)
   * @param {string} [args.xAxes.fields[0].advancedSetting.alldownload] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.allowdelete] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.allowdownload] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.allowupload] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.chooserange] 地区指定国家：空代表国际，null代表中国（老数据）  有值代表指定了国家
   * @param {string} [args.xAxes.fields[0].advancedSetting.datamask] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.dotformat] 数值 空/0:显示完整的位数 1:自动
   * @param {string} [args.xAxes.fields[0].advancedSetting.isdecrypt] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.itemnames] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.maskbegin] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.maskend] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.masklen] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.maskmid] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.masktype] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.max] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.mdchar] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.mechar] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.numshow] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.prefix] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.showformat] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.showtype] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.storelayer] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.suffix] null
   * @param {string} [args.xAxes.fields[0].controlId] null
   * @param {string} [args.xAxes.fields[0].controlName] null
   * @param {integer} [args.xAxes.fields[0].controlType] null
   * @param {integer} [args.xAxes.fields[0].size] null
   * @param {integer} [args.xAxes.particleSizeType] 粒度 1:日 2:周 3:月
   * @param {string} [args.xAxes.rename] 重命名
   * @param {string} [args.xAxes.showFormat] 显示格式设置
   * @param {integer} [args.xAxes.sortType] 排序 0 :默认 1:升序 2:降序 3:自定义排序
   * @param {boolean} [args.xAxes.subTotal] 是否小计
   * @param {string} [args.xAxes.subTotalName] 小计名称
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getTableData: function (args, options) {
    base.ajaxOptions.url = base.server() + '/report/getTableData';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'reportgetTableData', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取图表列表
   * @param {Object} args 请求参数
   * @param {string} [args.appId] *工作表ID
   * @param {string} [args.appType] 默认1：工作表
   * @param {string} [args.isOwner] 个人：true,公共：false
   * @param {string} [args.pageIndex] 页数
   * @param {string} [args.pageSize] 条数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  list: function (args, options) {
    base.ajaxOptions.url = base.server() + '/report/list';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'reportlist', args, $.extend(base, options));
  },
  /**
   * 获取自定义页面的统计图列表
   * @param {Object} args 请求参数
   * @param {string} [args.appId] appId
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  listByPageId: function (args, options) {
    base.ajaxOptions.url = base.server() + '/report/listByPageId';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'reportlistByPageId', args, $.extend(base, options));
  },
  /**
   * 刷新图表数据
   * @param {Object} args 请求参数
   * @param {string} [args.XAxis] null
   * @param {integer} [args.XAxisSortType] null
   * @param {string} [args.YAxisList[0].YDot] null
   * @param {string} [args.YAxisList[0].controlId] 控件ID
   * @param {string} [args.YAxisList[0].dotFormat] 1:省去末尾的0
   * @param {integer} [args.YAxisList[0].emptyShowType] 为0时或空值显示类型
   * @param {integer} [args.YAxisList[0].fixType] 0 后缀  ，1:前缀
   * @param {integer} [args.YAxisList[0].magnitude] 数值数量级 0:自动,1：无 ，2:千 3：万 4：百万 5： 亿
   * @param {integer} [args.YAxisList[0].normType] 1：求和，2：最大值，3：最小值，4：平均值
   * @param {string} [args.YAxisList[0].percent.dot] 保留位数
   * @param {string} [args.YAxisList[0].percent.dotFormat] 1:省去末尾的0
   * @param {boolean} [args.YAxisList[0].percent.enable] 是否开启
   * @param {integer} [args.YAxisList[0].percent.roundType] 四舍五入配置：0: 向下舍入，1:向上舍入，2:四舍五入
   * @param {integer} [args.YAxisList[0].percent.type] 计算方式：1: 小计 2：总计
   * @param {string} [args.YAxisList[0].rename] 重命名
   * @param {integer} [args.YAxisList[0].roundType] 四舍五入配置：0: 向下舍入，1:向上舍入，2:四舍五入
   * @param {boolean} [args.YAxisList[0].showNumber] 显示数值
   * @param {integer} [args.YAxisList[0].sortType] 排序 0 :默认 1:升序 2:降序
   * @param {string} [args.YAxisList[0].suffix] 后缀
   * @param {boolean} [args.YAxisList[0].thousandth] 是否显示千分位
   * @param {string} [args.YAxisList[0].value] 固定值
   * @param {integer} [args.YReportType] null
   * @param {string} [args.appId] 工作表ID
   * @param {integer} [args.appType] 统计应用类型 1:工作表
   * @param {integer} [args.auth] 自定义页面图表权限
   * @param {object} [args.config] null
   * @param {string} [args.createdBy] 创建人id
   * @param {string} [args.createdDate] 创建日期  默认当前日期
   * @param {boolean} [args.deleted] 是否删除  默认false
   * @param {string} [args.desc] 图表说明
   * @param {boolean} [args.displaySetup.XAxisEmpty] null
   * @param {number} [args.displaySetup.XDisplay.maxValue] 最大值
   * @param {number} [args.displaySetup.XDisplay.minValue] 最小值
   * @param {boolean} [args.displaySetup.XDisplay.showDial] 显示刻度标签
   * @param {boolean} [args.displaySetup.XDisplay.showTitle] 显示标题
   * @param {string} [args.displaySetup.XDisplay.title] 标题名称
   * @param {integer} [args.displaySetup.YDisplay.lineStyle] 线条样式：1：实线 2：虚线 3：点线
   * @param {number} [args.displaySetup.YDisplay.maxValue] 最大值
   * @param {number} [args.displaySetup.YDisplay.minValue] 最小值
   * @param {boolean} [args.displaySetup.YDisplay.showDial] 显示刻度标签
   * @param {boolean} [args.displaySetup.YDisplay.showTitle] 显示标题
   * @param {string} [args.displaySetup.YDisplay.title] 标题名称
   * @param {string} [args.displaySetup.auxiliaryLines[0].color] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].controlId] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].id] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].location] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].name] null
   * @param {integer} [args.displaySetup.auxiliaryLines[0].percent] null
   * @param {boolean} [args.displaySetup.auxiliaryLines[0].showName] null
   * @param {boolean} [args.displaySetup.auxiliaryLines[0].showValue] null
   * @param {integer} [args.displaySetup.auxiliaryLines[0].style] null
   * @param {string} [args.displaySetup.auxiliaryLines[0].type] null
   * @param {number} [args.displaySetup.auxiliaryLines[0].value] null
   * @param {object} [args.displaySetup.colorRules[0].bgColorRule] null
   * @param {string} [args.displaySetup.colorRules[0].controlId] null
   * @param {object} [args.displaySetup.colorRules[0].dataBarRule] null
   * @param {object} [args.displaySetup.colorRules[0].textColorRule] null
   * @param {boolean} [args.displaySetup.contrast] 数值图同比
   * @param {integer} [args.displaySetup.contrastType] 对比：0 ：没有比较，1：与上一周期 2：与上一年
   * @param {integer} [args.displaySetup.fontStyle] 文字倾斜 默认 0横向 1倾斜
   * @param {boolean} [args.displaySetup.hideOverlapText] 隐藏重叠文本
   * @param {boolean} [args.displaySetup.isAccumulate] 周期累计
   * @param {boolean} [args.displaySetup.isLifecycle] 周期目标
   * @param {boolean} [args.displaySetup.isPerPile] 百分比
   * @param {boolean} [args.displaySetup.isPile] 堆叠
   * @param {boolean} [args.displaySetup.isToday] 今天
   * @param {integer} [args.displaySetup.legendType] 图例类型1:左上角，2:左居中，3：底部居中，4：右居中
   * @param {number} [args.displaySetup.lifecycleValue] 周期目标值
   * @param {boolean} [args.displaySetup.mergeCell] 合并单元格
   * @param {string} [args.displaySetup.percent.dot] 保留位数
   * @param {string} [args.displaySetup.percent.dotFormat] 1:省去末尾的0
   * @param {boolean} [args.displaySetup.percent.enable] 是否开启
   * @param {integer} [args.displaySetup.percent.roundType] 四舍五入配置：0: 向下舍入，1:向上舍入，2:四舍五入
   * @param {integer} [args.displaySetup.percent.type] 计算方式：1: 小计 2：总计
   * @param {integer} [args.displaySetup.showChartType] 柱图 锥子图 代表方向  1 竖向 2 横向 折线图代表的是 1：折线  2 : 面积   行政区域图1:区域  2：气泡
   * @param {array} [args.displaySetup.showControlIds] 显示的行数据字段ids
   * @param {boolean} [args.displaySetup.showDimension] 显示维度标签
   * @param {boolean} [args.displaySetup.showLegend] 显示图例
   * @param {boolean} [args.displaySetup.showNumber] 显示数值
   * @param {array} [args.displaySetup.showOptionIds] 漏斗图 下拉选项配置显示的选项
   * @param {boolean} [args.displaySetup.showPercent] 显示百分比
   * @param {boolean} [args.displaySetup.showPileTotal] 显示堆叠总数
   * @param {boolean} [args.displaySetup.showRowList] 是否可以查看行数据明细
   * @param {boolean} [args.displaySetup.showTitle] 是否显示标题
   * @param {boolean} [args.displaySetup.showTotal] 显示统计
   * @param {integer} [args.displaySetup.showXAxisCount] x轴前 几项
   * @param {string} [args.filter.customRangeValue] 同比自定义时间范围
   * @param {integer} [args.filter.dynamicFilter.endCount] null
   * @param {integer} [args.filter.dynamicFilter.endType] null
   * @param {integer} [args.filter.dynamicFilter.endUnit] null
   * @param {integer} [args.filter.dynamicFilter.startCount] null
   * @param {integer} [args.filter.dynamicFilter.startType] null
   * @param {integer} [args.filter.dynamicFilter.startUnit] null
   * @param {string} [args.filter.filterCode] 地区图表配置
   * @param {boolean} [args.filter.filterControls[0].asc] null
   * @param {string} [args.filter.filterControls[0].controlId] null
   * @param {integer} [args.filter.filterControls[0].dataType] null
   * @param {integer} [args.filter.filterControls[0].dataType] null
   * @param {integer} [args.filter.filterControls[0].dateRange] null
   * @param {integer} [args.filter.filterControls[0].dateRange] null
   * @param {integer} [args.filter.filterControls[0].dateRangeType] null
   * @param {integer} [args.filter.filterControls[0].dateRangeType] null
   * @param {string} [args.filter.filterControls[0].dynamicSource[0].cid] null
   * @param {string} [args.filter.filterControls[0].dynamicSource[0].rcid] null
   * @param {string} [args.filter.filterControls[0].dynamicSource[0].staticValue] null
   * @param {integer} [args.filter.filterControls[0].filterType] null
   * @param {integer} [args.filter.filterControls[0].filterType] null
   * @param {boolean} [args.filter.filterControls[0].isAsc] null
   * @param {boolean} [args.filter.filterControls[0].isGroup] null
   * @param {string} [args.filter.filterControls[0].maxValue] null
   * @param {string} [args.filter.filterControls[0].maxValue] null
   * @param {string} [args.filter.filterControls[0].minValue] null
   * @param {string} [args.filter.filterControls[0].minValue] null
   * @param {integer} [args.filter.filterControls[0].spliceType] null
   * @param {integer} [args.filter.filterControls[0].spliceType] null
   * @param {string} [args.filter.filterControls[0].value] null
   * @param {string} [args.filter.filterControls[0].value] null
   * @param {array} [args.filter.filterControls[0].values] null
   * @param {array} [args.filter.filterControls[0].values] null
   * @param {string} [args.filter.filterId] 筛选ID
   * @param {string} [args.filter.filterRangeId] 筛选范围字段ID
   * @param {boolean} [args.filter.ignoreToday] 对比时忽略至今天
   * @param {integer} [args.filter.rangeType] 筛选范围: 1:今天，2：昨天，3：明天，4：本周，5：上周，6：下周，8：本月，9：上月，10：下月，11：本季度，12：上季度，13：下季度，15：本年，16：上一年，17：下一年，18：今天之前的...天，19：今天之后的..天,20:自定义,21自定义动态时间范围
   * @param {string} [args.filter.rangeValue] 范围的值：7:7天，14：14天，30：30天,90：90天，180：180天，365：365天,财年: 第一位是 上一财年-1, 本财年 0，下一财年-2，第二位是月份 例如0:3，本财年3月份
   * @param {object} [args.filter.requestParams] requestParams
   * @param {boolean} [args.filter.today] 至今天
   * @param {string} [args.filter.viewId] 视图ID
   * @param {integer} [args.filter.viewType] 视图类型
   * @param {string} [args.formulas[0].advancedSetting.alldownload] null
   * @param {string} [args.formulas[0].advancedSetting.allowdelete] null
   * @param {string} [args.formulas[0].advancedSetting.allowdownload] null
   * @param {string} [args.formulas[0].advancedSetting.allowupload] null
   * @param {string} [args.formulas[0].advancedSetting.chooserange] 地区指定国家：空代表国际，null代表中国（老数据）  有值代表指定了国家
   * @param {string} [args.formulas[0].advancedSetting.datamask] null
   * @param {string} [args.formulas[0].advancedSetting.dotformat] 数值 空/0:显示完整的位数 1:自动
   * @param {string} [args.formulas[0].advancedSetting.isdecrypt] null
   * @param {string} [args.formulas[0].advancedSetting.itemnames] null
   * @param {string} [args.formulas[0].advancedSetting.maskbegin] null
   * @param {string} [args.formulas[0].advancedSetting.maskend] null
   * @param {string} [args.formulas[0].advancedSetting.masklen] null
   * @param {string} [args.formulas[0].advancedSetting.maskmid] null
   * @param {string} [args.formulas[0].advancedSetting.masktype] null
   * @param {string} [args.formulas[0].advancedSetting.max] null
   * @param {string} [args.formulas[0].advancedSetting.mdchar] null
   * @param {string} [args.formulas[0].advancedSetting.mechar] null
   * @param {string} [args.formulas[0].advancedSetting.numshow] null
   * @param {string} [args.formulas[0].advancedSetting.prefix] null
   * @param {string} [args.formulas[0].advancedSetting.showformat] null
   * @param {string} [args.formulas[0].advancedSetting.showtype] null
   * @param {string} [args.formulas[0].advancedSetting.storelayer] null
   * @param {string} [args.formulas[0].advancedSetting.suffix] null
   * @param {integer} [args.formulas[0].attribute] 工作表标题字段属性
   * @param {integer} [args.formulas[0].col] null
   * @param {string} [args.formulas[0].controlId] 控件id
   * @param {string} [args.formulas[0].controlName] 控件名
   * @param {string} [args.formulas[0].dataSource] 控件用到的数据源
   * @param {integer} [args.formulas[0].dot] null
   * @param {string} [args.formulas[0].encryId] 加密规则的id
   * @param {integer} [args.formulas[0].enumDefault] null
   * @param {integer} [args.formulas[0].enumDefault2] null
   * @param {string} [args.formulas[0].fromValue] 逻辑里面 value toString方法使用 不存不输出
   * @param {string} [args.formulas[0].options[0].color] 颜色值
   * @param {integer} [args.formulas[0].options[0].index] null
   * @param {boolean} [args.formulas[0].options[0].isDeleted] 是否删除
   * @param {string} [args.formulas[0].options[0].key] 选项值
   * @param {number} [args.formulas[0].options[0].score] 赋分值
   * @param {string} [args.formulas[0].options[0].value] 选项名称
   * @param {boolean} [args.formulas[0].required] gson随便映射一个字段 以workflow的配置为主
   * @param {integer} [args.formulas[0].row] null
   * @param {array} [args.formulas[0].rowIds] 关联的 rowIds
   * @param {string} [args.formulas[0].sourceControlId] 关联控件ID
   * @param {integer} [args.formulas[0].sourceControlType] 关联他表字段控件的类型
   * @param {string} [args.formulas[0].sourceEntityName] 关联表的entityName
   * @param {string} [args.formulas[0].sourceTitleControlId] 关联他表里面的标题控件ID
   * @param {integer} [args.formulas[0].type] 控件类型
   * @param {string} [args.formulas[0].unit] 日期公式：1:分钟，2：小时，3：天
   * @param {object} [args.formulas[0].value] 控件值
   * @param {string} [args.id] ID
   * @param {string} [args.lastModifiedBy] 最后修改人ID
   * @param {string} [args.lastModifiedDate] 最后修改日期  默认当前日期
   * @param {string} [args.name] 名称
   * @param {string} [args.owner] 拥有者ID
   * @param {integer} [args.particleSizeType] 日期： 粒度 1:日 2:周 3:月  /地区 ： 1: 省 2：市 3：区/县
   * @param {获取图表数据} {appId:工作表id(string),contrastType:对比周期(integer),customRangeValue:同比自定义时间范围(string),dynamicFilter:动态筛选(ref),exportType:导出类型 0 ：原始值导出，1：显示值导出(integer),filterCode:范围 :空 代表全中国(string),filterControls:筛选条件(array),filterRangeId:筛选范围字段ID(string),filters:筛选条件(array),isPersonal:查看原始数据： ture，其他:false(boolean),match:点击的数值条件：{"caid":"user-workflow","ownerid":"user-undefined"}(object),pageId:自定义页面id(string),particleSizeType:粒度 1:日 2:周 3:月  /  行政区域图 1： 全国，2：省，3：市(integer),rangeType:筛选范围: 1:今天，2：昨天，3：明天，4：本周，5：上周，6：下周，8：本月，9：上月，10：下月，11：本季度，12：上季度，13：下季度，15：本年，16：上一年，17：下一年，18：今天之前的...天，19：今天之后的..天,20:自定义(integer),rangeValue:范围的值：7:7天，14：14天，30：30天,90：90天，180：180天，365：365天(string),reload:是否刷新(boolean),reportId:图表ID(string),requestParams:链接参数(object),sorts:自定义排序的数组(array),today:至今天(boolean),version:版本(string),}*reportDataRequest
   * @param {integer} [args.reportType] 类型   1:柱图 2:折线图  3:饼图  4:数值图 5：雷达图 6:漏斗图 7：双轴图 8：透视图 9:行政区划
   * @param {integer} [args.sourceType] 来源 空 代表 来自报表创建，1：page页面创建
   * @param {boolean} [args.split.XAxisEmpty] null
   * @param {integer} [args.split.XAxisEmptyType] null
   * @param {string} [args.split.c_Id] null
   * @param {string} [args.split.controlId] 控件ID
   * @param {integer} [args.split.emptyType] 无数据项目的显示规则 ：  0 ：隐藏; 1：显示为0 ; 2：显示为--(连续)；3：显示--(中断)
   * @param {string} [args.split.fields[0].advancedSetting.alldownload] null
   * @param {string} [args.split.fields[0].advancedSetting.allowdelete] null
   * @param {string} [args.split.fields[0].advancedSetting.allowdownload] null
   * @param {string} [args.split.fields[0].advancedSetting.allowupload] null
   * @param {string} [args.split.fields[0].advancedSetting.chooserange] 地区指定国家：空代表国际，null代表中国（老数据）  有值代表指定了国家
   * @param {string} [args.split.fields[0].advancedSetting.datamask] null
   * @param {string} [args.split.fields[0].advancedSetting.dotformat] 数值 空/0:显示完整的位数 1:自动
   * @param {string} [args.split.fields[0].advancedSetting.isdecrypt] null
   * @param {string} [args.split.fields[0].advancedSetting.itemnames] null
   * @param {string} [args.split.fields[0].advancedSetting.maskbegin] null
   * @param {string} [args.split.fields[0].advancedSetting.maskend] null
   * @param {string} [args.split.fields[0].advancedSetting.masklen] null
   * @param {string} [args.split.fields[0].advancedSetting.maskmid] null
   * @param {string} [args.split.fields[0].advancedSetting.masktype] null
   * @param {string} [args.split.fields[0].advancedSetting.max] null
   * @param {string} [args.split.fields[0].advancedSetting.mdchar] null
   * @param {string} [args.split.fields[0].advancedSetting.mechar] null
   * @param {string} [args.split.fields[0].advancedSetting.numshow] null
   * @param {string} [args.split.fields[0].advancedSetting.prefix] null
   * @param {string} [args.split.fields[0].advancedSetting.showformat] null
   * @param {string} [args.split.fields[0].advancedSetting.showtype] null
   * @param {string} [args.split.fields[0].advancedSetting.storelayer] null
   * @param {string} [args.split.fields[0].advancedSetting.suffix] null
   * @param {string} [args.split.fields[0].controlId] null
   * @param {string} [args.split.fields[0].controlName] null
   * @param {integer} [args.split.fields[0].controlType] null
   * @param {integer} [args.split.fields[0].size] null
   * @param {integer} [args.split.particleSizeType] 粒度 1:日 2:周 3:月
   * @param {string} [args.split.rename] 重命名
   * @param {string} [args.split.showFormat] 显示格式设置
   * @param {integer} [args.split.sortType] 排序 0 :默认 1:升序 2:降序 3:自定义排序
   * @param {boolean} [args.split.subTotal] 是否小计
   * @param {string} [args.split.subTotalName] 小计名称
   * @param {string} [args.splitId] 拆分控件ID
   * @param {object} [args.style] 前端自己定义的样式,后端统计无关的字段
   * @param {boolean} [args.summary.all] 是否勾选全部
   * @param {number} [args.summary.contrastMapSum] 同比汇总值
   * @param {number} [args.summary.contrastSum] 环比汇总值
   * @param {string} [args.summary.controlId] id
   * @param {number} [args.summary.controlList[0].contrastMapSum] 同比汇总值
   * @param {number} [args.summary.controlList[0].contrastSum] 环比汇总值
   * @param {string} [args.summary.controlList[0].controlId] id
   * @param {string} [args.summary.controlList[0].name] 名称
   * @param {boolean} [args.summary.controlList[0].number] 数值
   * @param {boolean} [args.summary.controlList[0].percent] 百分比
   * @param {number} [args.summary.controlList[0].sum] 汇总值
   * @param {integer} [args.summary.controlList[0].type] 方式：1：求和 2：最大值 3：最小值 4：平均值
   * @param {integer} [args.summary.location] 位置：1:上方 2:下方 3:左侧 4:右侧
   * @param {string} [args.summary.name] 名称
   * @param {boolean} [args.summary.number] 数值
   * @param {boolean} [args.summary.percent] 百分比
   * @param {string} [args.summary.rename] 重命名
   * @param {boolean} [args.summary.showTotal] 显示总计
   * @param {number} [args.summary.sum] 汇总值
   * @param {integer} [args.summary.type] 方式：1：求和 2：最大值 3：最小值 4：平均值
   * @param {boolean} [args.xAxes.XAxisEmpty] null
   * @param {integer} [args.xAxes.XAxisEmptyType] null
   * @param {string} [args.xAxes.c_Id] null
   * @param {string} [args.xAxes.controlId] 控件ID
   * @param {integer} [args.xAxes.emptyType] 无数据项目的显示规则 ：  0 ：隐藏; 1：显示为0 ; 2：显示为--(连续)；3：显示--(中断)
   * @param {string} [args.xAxes.fields[0].advancedSetting.alldownload] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.allowdelete] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.allowdownload] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.allowupload] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.chooserange] 地区指定国家：空代表国际，null代表中国（老数据）  有值代表指定了国家
   * @param {string} [args.xAxes.fields[0].advancedSetting.datamask] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.dotformat] 数值 空/0:显示完整的位数 1:自动
   * @param {string} [args.xAxes.fields[0].advancedSetting.isdecrypt] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.itemnames] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.maskbegin] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.maskend] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.masklen] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.maskmid] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.masktype] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.max] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.mdchar] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.mechar] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.numshow] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.prefix] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.showformat] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.showtype] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.storelayer] null
   * @param {string} [args.xAxes.fields[0].advancedSetting.suffix] null
   * @param {string} [args.xAxes.fields[0].controlId] null
   * @param {string} [args.xAxes.fields[0].controlName] null
   * @param {integer} [args.xAxes.fields[0].controlType] null
   * @param {integer} [args.xAxes.fields[0].size] null
   * @param {integer} [args.xAxes.particleSizeType] 粒度 1:日 2:周 3:月
   * @param {string} [args.xAxes.rename] 重命名
   * @param {string} [args.xAxes.showFormat] 显示格式设置
   * @param {integer} [args.xAxes.sortType] 排序 0 :默认 1:升序 2:降序 3:自定义排序
   * @param {boolean} [args.xAxes.subTotal] 是否小计
   * @param {string} [args.xAxes.subTotalName] 小计名称
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  refreshData: function (args, options) {
    base.ajaxOptions.url = base.server() + '/report/refreshData';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'reportrefreshData', JSON.stringify(args), $.extend(base, options));
  },
};
export default report;
