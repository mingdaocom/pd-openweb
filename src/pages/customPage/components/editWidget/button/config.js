export const COLORS = ['#e91e63', '#ff9800', '#4caf50', '#00bcd4', '#1677ff', '#9c27b0', '#3f51b5', '#455a64'];
export const ICONS = [
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
];
export const GET_DEFAULT_BUTTON_LIST = () => [
  {
    style: 1,
    width: 2,
    explain: '',
    count: 5,
    mobileCount: 1,
    buttonList: [{ name: _l('添加新订单'), color: '#1677ff' }],
  },
  {
    style: 1,
    width: 2,
    explain: _l('客户'),
    count: 5,
    mobileCount: 1,
    buttonList: [
      { name: _l('添加客户'), color: '#4caf50' },
      { name: _l('添加拜访记录'), color: '#4caf50' },
      { name: _l('添加报表'), color: '#1677ff' },
    ],
  },
  {
    style: 1,
    wdith: 2,
    explain: _l('常用导航'),
    count: 4,
    mobileCount: 4,
    buttonList: [
      {
        name: _l('我的客户'),
        color: '#f69926',
        config: {
          icon: '18_1_apartment_house',
          iconUrl: `${md.global.FileStoreConfig.pubHost}customIcon/18_1_apartment_house.svg`,
        },
      },
      {
        name: _l('我的线索'),
        color: '#e62165',
        config: { icon: '10_5_star', iconUrl: `${md.global.FileStoreConfig.pubHost}customIcon/10_5_star.svg` },
      },
      {
        name: _l('销售订单'),
        color: '#289af0',
        config: { icon: '1_2_order', iconUrl: `${md.global.FileStoreConfig.pubHost}customIcon/1_2_order.svg` },
      },
      {
        name: _l('报表'),
        color: '#4faf54',
        config: {
          icon: '2_3_statistics',
          iconUrl: `${md.global.FileStoreConfig.pubHost}customIcon/2_3_statistics.svg`,
        },
      },
    ],
    config: {
      btnType: 2,
      direction: 1,
    },
  },
  {
    style: 2,
    wdith: 2,
    explain: '',
    count: 2,
    mobileCount: 2,
    buttonList: [
      {
        name: _l('采购入库'),
        color: '#4caf50',
        config: { icon: '1_6_document', iconUrl: `${md.global.FileStoreConfig.pubHost}customIcon/1_6_document.svg` },
      },
      {
        name: _l('销售出库'),
        color: '#1677ff',
        config: { icon: '1_0_home', iconUrl: `${md.global.FileStoreConfig.pubHost}customIcon/1_0_home.svg` },
      },
      {
        name: _l('产品库存'),
        color: '#f69926',
        config: {
          icon: '10_1_health_data',
          iconUrl: `${md.global.FileStoreConfig.pubHost}customIcon/10_1_health_data.svg`,
        },
      },
      {
        name: _l('调拨记录'),
        color: '#3e53b4',
        config: {
          icon: '1_5_create_new',
          iconUrl: `${md.global.FileStoreConfig.pubHost}customIcon/1_5_create_new.svg`,
        },
      },
    ],
    config: {
      btnType: 2,
      direction: 2,
    },
  },
  {
    style: 3,
    width: 1,
    explain: _l('快捷方式'),
    count: 2,
    mobileCount: 1,
    buttonList: [
      { name: _l('添加新订单'), color: '#1677ff' },
      { name: _l('添加新客户'), color: '#1677ff' },
      { name: _l('查看我的订单'), color: '#1677ff' },
      { name: _l('查看我的统计'), color: '#1677ff' },
    ],
  },
];
