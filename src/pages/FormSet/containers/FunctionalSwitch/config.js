import React from 'react';

export const listConfigStr = {
  10: _l('显示创建按钮'),
  // 工作表维度 都是1开头
  11: _l('讨论'), //工作表讨论
  12: _l('日志'), //工作表日志
  13: _l('从Excel导入数据'),
  14: _l('回收站'),
  500: _l('统计'),
  50: _l('公共'),
  51: _l('个人'),
  // 视图都是2开头
  20: _l('公开分享'), //视图分享
  38: _l('嵌入链接'), //嵌入链接
  21: _l('导出'), //视图导出
  22: _l('快捷编辑'), // quickSwitch
  25: _l('批量操作'), // BatchGroup
  24: _l('编辑'), //
  26: _l('复制'), //
  23: _l('系统默认打印'), //
  27: _l('导出'), //
  28: _l('删除'), //
  29: _l('执行自定义动作'), //
  // 记录都是3开头
  30: _l('公开分享'), //记录分享
  52: _l('内部访问链接'), //内部访问链接
  // 31: _l('发送填写记录'),
  32: _l('系统默认打印'),
  33: _l('附件下载'),
  34: _l('日志'), //记录日志
  35: _l('讨论'), // recordDiscussSwitch 记录讨论
  36: _l('复制'), // recordCopySwitch记录复制
  39: _l('删除'),
  37: _l('重新创建'), // recordRecreateSwitch
  40: _l('系统字段'),
  41: _l('审批流转详情'),
};
export const batch = [24, 26, 23, 27, 28, 29]; //批量操作下的操作
export const statisticsConst = 500; //统计
export const statistics = [50, 51]; //统计下的操作
export const noRangeList = [25, 40, statisticsConst]; //没有范围选择
export const hasChild = [25, statisticsConst]; //有下级
export const hasRangeList = [
  ...batch,
  10,
  11,
  12,
  13,
  14,
  ...statistics,
  20,
  21,
  22,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  39,
  41,
  37,
  38,
  52,
]; //有作用范围

export const helfList = [10, 22, 23, 33, 32, 40, 37]; //有帮助提示

export const worksheetSwitch = [10, 11, 12, 13, 14, 500, 50, 51]; //工作表相关
export const viewSwitch = [20, 38, 21, 22, 25, 24, 26, 23, 27, 28, 29]; //视图相关
export const recordSwitch = [30, 52, 36, 39, 37, 35, 32, 33, 34]; //记录相关
export const approveSwitch = [40, 41]; //审批相关
export const allSwitchKeys = [
  ...worksheetSwitch.filter(o => o !== 500),
  ...viewSwitch,
  ...recordSwitch,
  ...approveSwitch,
];
export const allSwitch = [
  { list: worksheetSwitch, txt: _l('工作表'), key: '1' },
  { list: viewSwitch, txt: _l('视图'), key: '2' },
  { list: recordSwitch, txt: _l('记录'), key: '3' },
  { list: approveSwitch, txt: _l('审批'), key: '4' },
];

export const tipStr = {
  10: _l('在工作表右上方显示的创建记录按钮。关闭后，则无法直接在工作表中创建记录，只能通过关联记录等其他位置创建'),
  22: (
    <div>
      {_l('表格视图可以单元格直接编辑；')}
      <br />
      {_l('看板、层级、甘特图在标题字段为文本类型时可以只填写标题字段快速创建记录；')}
      <br />
      {_l('可以在看板、层级、画廊和详情视图的卡片上直接修改文本类标题和检查框')}
    </div>
  ),
  23: _l('仅控制系统默认的条形码/二维码打印功能。不包含配置的打印模板'),
  32: _l('仅控制系统默认提供的打印方式，不包含打印模版'),
  33: _l('可以控制附件的下载、分享、保存到知识（不包含用户自行上传的附件）'),
  37: (
    <div>
      <div>{_l('使用对应记录的字段值新建记录。')}</div>
      <div>{_l('以下字段类型在创建时有复制数量限制:')}</div>
      <div>{_l('关联记录（卡片和下拉框）最多复制5条;')}</div>
      <div>{_l('关联记录（列表）不复制;')}</div>
      <div>{_l('子表记录最多复制200条;')}</div>
      {_l('子表中的关联记录最多复制5条。')}
    </div>
  ),
  40: _l('在视图上呈现流程名称、状态、节点负责人、节点开始、剩余时间、发起人、发起时间'),
};
