export const COLORS = [
  'transparent',
  '#60292A',
  '#1677ff',
  '#00BCD4',
  '#4CAF50',
  '#F7D100',
  '#FF9800',
  '#F52222',
  '#EB2F96',
  '#7500EA',
  '#3F51B5',
];
export const ICONS = [
  '',
  'clear_1',
  'done_2',
  'star_3',
  'heart_4',
  'people_5',
  'people_alt_6',
  'shopping_7',
  'send_8',
  'mail_9',
  'flag_10',
  'notifications_11',
  'delete_12',
  'lightning_13',
  'thumb_up_14',
  'attach_money_15',
  'build_16',
  'edit_17',
  'cloudy_18',
  'qr_code_19',
  'photo_camera_20',
  'insert_photo_21',
  'watch_latersvg_22',
  'free_breakfast_23',
  'insect_24',
  'emoji_emotions_25',
  'emoji_objects_26',
  'help_center',
  'add_circle',
  'add',
  'search',
  'home',
  'event',
  'assignment',
  'settings',
  'public',
  'copy',
  'link',
  'launch',
  'play_arrow',
];
//以下字段支持设置静态默认值
export const DEF_TYPES = [
  1,
  2,
  3,
  4,
  5,
  6,
  8,
  9,
  10,
  11,
  15,
  16,
  17,
  18,
  19,
  23,
  24,
  26,
  27,
  28,
  29, //关联记录单/多（卡片、下拉框）
  // 34,//子表按钮默认值 暂不支持
  // 35,
  36,
  46,
  48,
];
//动态默认值
export const DEF_R_TYPES = [15, 16, 17, 18, 26, 46];

//自定义动作不可填写的字段（仅只读）
export const noWriteTypes = [
  20, // 20: _l('公式'),
  22, // 分段
  25, // _l('大写金额'),
  30, // _l('他表字段'),
  31, // 31: _l('公式'),
  32, // 32: _l('文本组合'),
  33, // 33: _l('自动编号'),
  37, // 37: _l('汇总'),
  38, // 38: _l('日前公式'),
  10010, // 备注
  45, // 嵌入
  47, //条码
  51, //查询记录
  52, //分段
  53, //函数公式
  54, //自定义字段
];
