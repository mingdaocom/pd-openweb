import ck from './createKeyMirrorFromArray';

const enums = {
  // LOV:0表示普通；1代表链接；2代表图片；3代表文档；4代表提问；5代表系统的自动推送（如人员加入、创建群组、安装应用等）；6代表用户安装的应用主动分享信息推送；7代表投票；8代表音视频；
  POST_TYPE: {
    all: -1,
    link: 1,
    pic: 2,
    doc: 3,
    qa: 4,
    vote: 7,
    video: 8,
  },
  FROM_TYPE: ck([
    'feed', // 动态列表首页
    'center', // 知识中心
  ]),
  LIST_TYPE: ck([
    'project', // 全公司
    'followed', // 我关注的
    'my', // 我加入的群组等，不包括我关注的，据说是没用的
    'myself', // 我自己的
    'with', // 提到我的
    'fav', // 我收藏的
    'group', // 群组动态
    'user', // 用户
    'ireply', // 我回复别人的
    'reply', // 回复我的

    'pic',
    'doc',
    'qa',
    'vid',
  ]),

  OPERATE_TYPE: ck(['comment', 'tag']),
};

export default enums;
