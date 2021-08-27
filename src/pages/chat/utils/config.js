import Constant from './constant';

const builtinPlacements = {
  left: {
    points: ['cr', 'cl'],
  },
  right: {
    points: ['cl', 'cr'],
  },
  top: {
    points: ['bc', 'tc'],
  },
  bottom: {
    points: ['tc', 'bc'],
  },
  topLeft: {
    points: ['bl', 'tl'],
  },
  topRight: {
    points: ['br', 'tr'],
  },
  bottomRight: {
    points: ['tr', 'br'],
  },
  bottomLeft: {
    points: ['tl', 'bl'],
  },
};

const Config = {
  // 文件上传路径
  EmailConnector: 'http://172.17.30.103:4002',

  // 头像尺寸
  AVATAR_24: '?imageView2/1/w/100/h/100/q/90',
  AVATAR_48: '?imageView2/1/w/100/h/100/q/90',
  AVATAR_100: '?imageView2/1/w/100/h/100/q/90',

  // 全局的辅助图
  // errorImgPath: seajs.data.base + "src/components/chat/resource/images/chat_error.png", // 图片加载错误时显示的图片
  // placeholderImgPath: seajs.data.base + "src/components/chat/resource/images/chat_placeholder.png", // 图片加载中时显示的默认图片
  // ajaxLoadingImg: seajs.data.base + "src/components/chat/resource/images/chat_ajax_loading.gif",

  PREVIEW_IMG: '?imageView2/2/w/310', // 图片预览的的大小配置，依据的是青牛的api
  MESSAGE_THUMBNAIL: '?imageView2/2/w/76/h/76', // 图片预览的的大小配置，依据的是青牛的api
  // FILE_MESSAGEREFERENCE_PLACEHODLER: seajs.data.base + 'src/components/chat/resource/images/whiteboard.png',
  // FILE_PLACEHODLER: seajs.data.base + 'src/components/chat/resource/images/message_placeholder.png',
  MSG_LENGTH_DEFAULT: 10, // 默认显示的消息条数
  MSG_LENGTH_MORE: 10, // 加载更多一次加载的消息条数
  sendInterval: 600, // 文本消息的发送时间间距
  shakeInterval: 3000, // 抖动的时间间隔
  retryInterval: 10000, // 出现重试按钮的时间间隔
  inputMode: Number(window.localStorage.getItem('im_input_mode') || 0) || Constant.INPUT_MODE_ENTER, // 有两种，enter键提交和ctrl+enter提交
  maxFileSize: 50 + 'mb', // 最大文件上传大小,单位为mb
  docExtends:
    'doc,docx,ppt,pot,pps,pptx,xls,xlsx,pdf,txt,mmap,vsd,md,ai,psd,tif,dwt,dwg,dws,dxf,wps,dps,dpt,pps,et,xmind,cdr,project,key,numbers,pages,rp,pub,cal,3ds,max,indd,mpp,eml',
  picExtends: 'gif,png,jpg,jpeg,bmp',
  compressedExtends: 'zip,rar,7z',
  emotionHost: '/images/', // 表情文件的路径
  reconnectAttempt: 5, // 重连次数
  maxSessionUnread: 20, // 会话默认显示的最大数目
  msgMaxSize: 20480, // 消息的最大长度
  sessionInfoOpen: true, // 右侧会话信息栏是否打开
  smallPicHeight: 150, // 小图片的高度，低于这个高度将视作小图片显示
  searchInterval: 0, // 搜索的时间间隔
  builtinPlacements,
};

// window.Config = Config;

export default Config;
