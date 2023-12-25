import React, { Component } from 'react';
import { string } from 'prop-types';
import { Icon, LoadDiv } from 'ming-ui';
import { VIEW_TYPE_ICON } from 'src/pages/worksheet/constants/enum.js';
import styled from 'styled-components';
import pluginAjax from 'src/api/plugin';
import bg from './img/customview.png';
import SvgIcon from 'src/components/SvgIcon';

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
      // justify-content: space-between;
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
        color: #333;
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
`;
export default class AddViewDisplayMenu extends Component {
  static propTypes = {};
  static defaultProps = {};
  constructor(props) {
    super(props);
    this.state = {
      myPlugins: [],
      orgPlugins: [],
      loading: true,
    };
  }
  componentDidMount() {
    const { canAddCustomView } = this.props;
    if (canAddCustomView) {
      this.getCustomList();
    }
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
    const { onClick, canAddCustomView, ...rest } = this.props;
    const { myPlugins = [], orgPlugins = [], loading } = this.state;
    return (
      <Wrap className="flexRow">
        <div className="typeMenuWrap" {...rest}>
          <div className="title Bold Font15">{_l('默认视图')}</div>
          {VIEW_TYPE_ICON.filter(o => o.id !== 'customize').map(({ icon, text, id, color, isNew }) => (
            <div key={id} className="viewTypeItem flexRow Hand" onClick={() => onClick({ id })}>
              <div className="valignWrapper flex">
                <Icon style={{ color, fontSize: '20px' }} icon={icon} />
                <span className="viewName mLeft12 Bold">{text}</span>
              </div>
              {isNew && (
                <div className="newIcon">
                  <Icon icon="new" className="ThemeColor Font20" />
                </div>
              )}
            </div>
          ))}
        </div>
        {canAddCustomView && (
          <div className="customView flex flexColumn">
            <div className="">
              {[...orgPlugins, ...myPlugins].length <= 0 ? (
                <React.Fragment>
                  <span className="viewName Gray Font15 Bold">{_l('插件中心')}</span>
                  <Icon
                    icon={'launch'}
                    className="mLeft8 Hand toCustomLib Font16"
                    onClick={() => {
                      window.open('/plugin');
                    }}
                  />
                </React.Fragment>
              ) : (
                <span className="viewName Font15 Bold">{_l('插件视图')}</span>
              )}
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
                    <span className="viewName mLeft6">{_l('开发插件视图')}</span>
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
                    <span className="viewName mLeft8 Bold">{_l('开发插件视图')}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </Wrap>
    );
  }
}
