// Mingo「搭建应用」示例提示词池。独立成模块，供 MingoWelcome、创建应用弹窗等多处复用同一数据源。
export const BUILD_SAMPLES = [
  _l('搭建设备厂商售后管理系统'),
  _l('搭建保险代理业务管理应用'),
  _l('搭建宠物医院诊疗管理应用'),
  _l('搭建餐饮连锁门店运营系统'),
  _l('搭建建筑施工项目管理系统'),
  _l('搭建教育培训机构教务应用'),
  _l('搭建物业社区服务管理系统'),
  _l('搭建医美机构客户管理应用'),
  _l('搭建汽车维修厂业务系统'),
  _l('搭建农产品溯源管理应用'),
];

export function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// 从池中随机取 count 条不重复样本（不足时返回全部）
export function pickRandomSamples(count, list = BUILD_SAMPLES) {
  const pool = [...list];
  const result = [];

  while (pool.length && result.length < count) {
    result.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }

  return result;
}
