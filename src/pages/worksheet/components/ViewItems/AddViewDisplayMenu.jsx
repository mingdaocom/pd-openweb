import React, { Component } from 'react';
import { Icon, LoadDiv, SvgIcon } from 'ming-ui';
import Trigger from 'rc-trigger';
import { VIEW_TYPE_ICON } from 'src/pages/worksheet/constants/enum.js';
import styled from 'styled-components';
import pluginAjax from 'src/api/plugin';
import bg from './img/customview.png';
import Board from './lottie/board.json';
import Calendar from './lottie/calendar.json';
import Detail from './lottie/detail.json';
import Gunter from './lottie/gantt.json';
import Map from './lottie/map.json';
import Resource from './lottie/resources.json';
import Sheet from './lottie/table.json';
import Structure from './lottie/structure.json';
import Gallery from './lottie/gallery.json';
import { checkPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';

const Wrap = styled.div`
  background-color: #fff;
  border-radius: 3px 3px 3px 3px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.13), 0 2px 6px rgba(0, 0, 0, 0.1);
  .title {
    padding: 0 12px 12px;
  }
  .typeMenuWrap {
    border-right: 1px solid #dddddd;
    width: 180px;
    background: #fafafa;
    padding: 16px 6px;
    .viewTypeItem {
      line-height: 36px;
      border-radius: 3px 3px 3px 3px;
      padding: 0 13px;
      position: relative;
      &:hover {
        background: rgba(0, 0, 0, 0.04);
      }
      .viewName {
        font-weight: 400;
      }
    }
  }
  .customView {
    background: #fff;
    width: 540px;
    height: 440px;
    padding: 16px 0 16px 24px;
    .listCon {
      overflow: auto;
    }
    .con {
      flex-wrap: wrap;
    }
    .valignWrapper {
      min-width: 152px;
      width: 152px;
      max-width: 152px;
      height: 36px;
      border-radius: 3px 3px 3px 3px;
      padding: 0 6px;
      &:hover {
        background: rgba(0, 0, 0, 0.04);
      }
    }
    .addCustomView {
      font-weight: 600;
      color: #757575;
      vertical-align: middle;
      line-height: 20px;
      .icon {
        color: #757575;
      }
      &:hover {
        color: #2196f3;
        .icon {
          color: #2196f3;
        }
      }
    }
  }
  .toCustomLib {
    color: #9d9d9d;
    &:hover {
      color: #2196f3;
    }
  }
  .minBold {
    font-weight: 400;
  }
  .emptyCon {
    .imgCon {
      height: 176px;
      text-align: center;
      img {
        height: 100%;
      }
    }
    .Beta {
      padding: 4px 5px;
      background: #43bd36;
      border-radius: 3px;
      color: #fff;
    }
    .addCustomView {
      background: #ffffff;
      border-radius: 4px 4px 4px 4px;
      border: 1px solid #dddddd;
      padding: 11px 14px;
      margin: 32px auto 48px;
      i {
        color: #757575;
      }
      .viewName {
        color: #151515;
      }
      &:hover {
        border: 1px solid #2196f3;
        i,
        .viewName {
          color: #2196f3;
        }
      }
    }
  }
  .customListCon {
    gap: 6px 12px;
  }
  .guildDescAct {
    animation-name: fadeInUp;
    animation-duration: 0.66s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: 1;
    animation-direction: normal;
    animation-fill-mode: forwards;
  }
`;

const GuildWrap = styled.div`
  width: 280px;
  background: #ffffff;
  box-shadow: 0px 2px 16px 1px rgba(0, 0, 0, 0.16);
  border-radius: 3px 3px 3px 3px;
  left: 100%;
  justify-content: space-between;
  padding: 20px 20px 16px 20px;
  box-sizing: border-box;
  .left {
    text-align: left;
    margin-bottom: 16px;
    .guildTitle {
      line-height: 14px;
    }
  }
  .rightCon {
    > div {
      text-align: center;
    }
    svg {
      width: 98% !important;
    }
  }
`;

const GuildText = {
  sheet: {
    title: _l('表格视图'),
    desc: _l('结构化展示大量数据，编辑更方便'),
    img: Sheet,
  },
  board: {
    title: _l('看板视图'),
    desc: _l('以卡片形式展示数据，分配更灵活'),
    img: Board,
  },
  calendar: {
    title: _l('日历视图'),
    desc: _l('按所在日期排列数据，日程安排更直观'),
    img: Calendar,
  },
  gallery: {
    title: _l('画廊视图'),
    desc: _l('以图片为主要元素查看数据，浏览更高效'),
    img: Gallery,
  },
  detail: {
    title: _l('详情视图'),
    desc: _l('聚焦数据详细内容，阅读更方便'),
    img: Detail,
  },
  structure: {
    title: _l('层级视图'),
    desc: _l('根据父-子关系展示数据，结构更清晰'),
    img: Structure,
  },
  map: {
    title: _l('地图视图'),
    desc: _l('按定位显示数据，区域分布更直观'),
    img: Map,
  },
  gunter: {
    title: _l('甘特图'),
    desc: _l('以时间轴展示数据，项目管理更方便'),
    img: Gunter,
  },
  resource: {
    title: _l('资源视图'),
    desc: _l('按所属资源展示数据，资源调度更方便'),
    img: Resource,
  },
};

export default class AddViewDisplayMenu extends Component {
  static propTypes = {};
  static defaultProps = {};
  constructor(props) {
    super(props);
    this.state = {
      myPlugins: [],
      orgPlugins: [],
      loading: true,
      guild: '',
      LottieComponent: null,
    };
  }

  componentDidMount() {
    const { canAddCustomView } = this.props;

    if (canAddCustomView) {
      this.getCustomList();
    }

    import('react-lottie').then(component => {
      this.setState({ LottieComponent: component.default });
    });
  }

  componentWillReceiveProps(nextProps) {
    const { canAddCustomView, popupVisible } = nextProps;
    if (canAddCustomView && popupVisible) {
      this.getCustomList();
    }
  }
  //或是自定义列表，更新customList
  getCustomList = () => {
    const { projectId, appId } = this.props;
    pluginAjax.getAll({ projectId, pageIndex: 1, pageSize: 10000, appId }).then(res => {
      const { myPlugins = [], orgPlugins = [] } = res;
      this.setState({
        myPlugins,
        orgPlugins,
        loading: false,
      });
    });
  };

  renderCon = (info, isDev) => {
    const { onClick } = this.props;
    return info.map(o => {
      const { icon, id, iconColor = '#445A65', name, iconUrl } = o;
      return (
        <div
          className="valignWrapper flex Hand"
          onClick={() =>
            // pluginSource 插件来源 0:开发 1:已发布
            onClick({
              id: 'customize',
              name: _l('自定义视图'),
              pluginSource: isDev ? 0 : 1,
              pluginId: id,
              pluginName: name,
              pluginIcon: icon || 'sys_12_4_puzzle',
              pluginIconColor: iconColor,
            })
          }
        >
          <SvgIcon
            url={iconUrl || 'https://fp1.mingdaoyun.cn/customIcon/sys_12_4_puzzle.svg'}
            fill={iconColor || '#445A65'}
            size={18}
          />
          <span className="viewName mLeft8 WordBreak overflow_ellipsis" title={name}>
            {name}
          </span>
        </div>
      );
    });
  };

  render() {
    const { onClick, canAddCustomView, projectId, ...rest } = this.props;
    const { myPlugins = [], orgPlugins = [], loading, LottieComponent } = this.state;
    const hasPluginAuth =
      _.get(
        _.find(md.global.Account.projects, item => item.projectId === projectId),
        'allowPlugin',
      ) || checkPermission(projectId, [PERMISSION_ENUM.DEVELOP_PLUGIN, PERMISSION_ENUM.MANAGE_PLUGINS]);

    return (
      <Wrap className="flexRow">
        <div className="typeMenuWrap" {...rest}>
          <div className="title Bold Font15">{_l('默认视图')}</div>
          {VIEW_TYPE_ICON.filter(
            o => o.id !== 'customize' && (!md.global.SysSettings.enableMap ? o.id !== 'map' : true),
          ).map(({ icon, text, id, color, isNew }) => (
            <Trigger
              popup={
                <GuildWrap className="guildWrap">
                  <div className="left">
                    <div className="guildTitle Font14 Bold">{GuildText[id].title}</div>
                    <div className="guildDesc mTop8 Gray_75 LineHeight20 Font13">{GuildText[id].desc}</div>
                  </div>
                  <div className="rightCon">
                    {LottieComponent && (
                      <LottieComponent
                        options={{
                          autoplay: true,
                          loop: false,
                          animationData: GuildText[id].img,
                          rendererSettings: {
                            preserveAspectRatio: 'xMidYMid slice',
                          },
                        }}
                      />
                    )}
                  </div>
                </GuildWrap>
              }
              popupTransitionName="Tooltip-move-top"
              destroyPopupOnHide
              action={['hover']}
              mouseEnterDelay={0.3}
              popupAlign={{
                points: ['tl', 'tr'],
                offset: [5, 0],
                overflow: { adjustX: true, adjustY: true },
              }}
            >
              <div
                key={id}
                className="viewTypeItem flexRow Hand"
                onClick={() => onClick({ id })}
                onMouseEnter={e => this.setState({ guild: id })}
                onMouseLeave={e => this.setState({ guild: '' })}
              >
                <div className="valignWrapper flex">
                  <Icon style={{ color, fontSize: '20px' }} icon={icon} />
                  <span className="viewName mLeft12 Bold Font14">{text}</span>
                </div>
                {isNew && (
                  <div className="newIcon">
                    <Icon icon="new" className="ThemeColor Font20" />
                  </div>
                )}
              </div>
            </Trigger>
          ))}
        </div>
        {canAddCustomView && !md.global.SysSettings.hidePlugin && (
          <div className="customView flex flexColumn">
            <div className="">
              <span className="viewName Font15 Bold">{_l('插件视图')}</span>
            </div>
            {loading ? (
              <LoadDiv className="mTop80" />
            ) : [...orgPlugins, ...myPlugins].length > 0 ? (
              <React.Fragment>
                <div className="flex pRight24 listCon">
                  <div className="">
                    {orgPlugins.length > 0 && (
                      <React.Fragment>
                        <div className="Gray_9e mTop16 Bold">{_l('组织发布的')}</div>
                        <div className="flexRow con customListCon mTop8">{this.renderCon(orgPlugins)}</div>
                      </React.Fragment>
                    )}
                    {myPlugins.length > 0 && (
                      <React.Fragment>
                        <div className="Gray_9e mTop16 Bold">{_l('我开发的')}</div>
                        <div className="flexRow con customListCon mTop8">{this.renderCon(myPlugins, true)}</div>
                      </React.Fragment>
                    )}
                  </div>
                </div>
                {hasPluginAuth && (
                  <div className="mTop24">
                    <span
                      className="addCustomView Hand"
                      onClick={() =>
                        onClick({
                          id: 'customize',
                          name: _l('自定义视图'),
                          pluginName: _l('自定义视图'),
                          pluginSource: 0,
                          pluginIcon: 'sys_12_4_puzzle',
                          pluginIconColor: '#445A65',
                          isNew: true,
                        })
                      }
                    >
                      <Icon icon={'plus'} />
                      <span className="viewName mLeft6">{_l('开发视图插件')}</span>
                    </span>
                    <span
                      className="mLeft40 Hand addCustomView"
                      onClick={() => {
                        window.open('/plugin');
                      }}
                    >
                      <span className="viewName">{_l('管理插件')}</span>
                      <Icon icon={'launch'} className="mLeft6 Hand toCustomLib Font14" />
                    </span>
                  </div>
                )}
              </React.Fragment>
            ) : (
              <div className="emptyCon">
                <div className="imgCon mTop24">
                  <img src={bg} />
                </div>
                <div className="TxtCenter mTop32">
                  <span className="Font16 Bold">{_l('自定义视图')}</span>
                  <span className="Beta mLeft8 Bold">Beta</span>
                </div>
                <div className="mTop16 minBold Font14 TxtCenter">{_l('通过插件开发，定制自己的视图')}</div>

                {hasPluginAuth && (
                  <div className="flexRow alignItemsCenter">
                    <span
                      className="addCustomView Hand"
                      onClick={() =>
                        onClick(
                          {
                            id: 'customize',
                            name: _l('自定义视图'),
                            pluginName: _l('自定义视图'),
                            pluginSource: 0,
                            pluginIcon: 'sys_12_4_puzzle',
                            pluginIconColor: '#445A65',
                            isNew: true,
                          },
                          true,
                        )
                      }
                    >
                      <Icon icon={'plus'} className="Font16" />
                      <span className="viewName mLeft8 Bold">{_l('开发视图插件')}</span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Wrap>
    );
  }
}
