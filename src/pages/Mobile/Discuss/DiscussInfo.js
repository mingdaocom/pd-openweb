import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { Icon, LoadDiv } from 'ming-ui';
import { Tabs } from 'antd-mobile';
import * as actions from './redux/actions';
import DiscussList from './DiscussList';
import Logs from './Logs';
import Back from '../components/Back';
import homeAppAjax from 'src/api/homeApp';
import worksheetAjax from 'src/api/worksheet';
import './index.less';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import externalPortalAjax from 'src/api/externalPortal';
import AddDiscuss from 'mobile/AddDiscuss';
import _ from 'lodash';

const tabs = md.global.Account.isPortal
  ? [{ title: _l('讨论'), type: 1 }]
  : [
      { title: _l('讨论'), type: 1 },
      { title: _l('日志'), type: 3 },
    ];

const tabsHeight = 43;
const bottomHeight = 52;

const getGroupId = (appSectionDetail, worksheetId) => {
  let groupId = null;
  for (let i = 0; i < appSectionDetail.length; i++) {
    let section = appSectionDetail[i];
    for (let j = 0; j < section.workSheetInfo.length; j++) {
      if (section.workSheetInfo[j].workSheetId === worksheetId) {
        groupId = section.appSectionId;
        break;
      }
    }
    if (groupId) break;
  }
  return groupId;
};

class Discuss extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groupId: null,
      switchPermit: {},
      allowExAccountDiscuss: false, //允许外部用户讨论
      exAccountDiscussEnum: 0, //外部用户的讨论类型 0：所有讨论 1：不可见内部讨论
      loading: true,
      replyVisible: false,
      discussionInfo: {},
      pageType: undefined
    };
  }
  componentDidMount() {
    const { params } = this.props.match;
    if (_.isEmpty(params.rowId)) {
      this.getGroupInfo();
    }
    this.getPortalConfigSet();
    worksheetAjax
      .getSwitchPermit({
        appId: params.appId,
        worksheetId: params.worksheetId,
      })
      .then(res => {
        this.setState({
          switchPermit: res,
        });
      });
  }

  getPortalConfigSet = () => {
    const { params } = this.props.match;
    const { appId } = params;

    externalPortalAjax.getConfig({ appId }).then(res => {
      const {
        allowExAccountDiscuss, //允许外部用户讨论
        exAccountDiscussEnum,
      } = res;
      this.setState({
        allowExAccountDiscuss, //允许外部用户讨论
        exAccountDiscussEnum,
        loading: false,
      });
    });
  };
  getGroupInfo() {
    const { params } = this.props.match;
    const { appId, worksheetId } = params;
    homeAppAjax
      .getApp({
        appId,
        getSection: true
      })
      .then(result => {
        this.setState({
          groupId: getGroupId(result.sections, worksheetId),
        });
      });
  }
  render() {
    const { isModal, onClose, originalData } = this.props;
    const { params } = this.props.match;
    const { worksheetId, rowId } = params;
    const { replyVisible, discussionInfo } = this.state;
    const {
      switchPermit,
      allowExAccountDiscuss, // 允许外部用户讨论
      exAccountDiscussEnum,
      loading,
    } = this.state;
    const recordDiscussSwitch = isOpenPermit(permitList.recordDiscussSwitch, switchPermit);
    const recordLogSwitch = isOpenPermit(permitList.recordLogSwitch, switchPermit);
    // 外部用户且未开启讨论 不能内部讨论
    const entityType = md.global.Account.isPortal && allowExAccountDiscuss && exAccountDiscussEnum === 1 ? 2 : 0;
    if (md.global.Account.isPortal && loading || _.isEmpty(switchPermit)) {
      return <LoadDiv />;
    }
    const newTabs = tabs.filter(item => {
      if (item.type === 1) return recordDiscussSwitch;
      if (item.type === 3) return recordLogSwitch;
    });
    const pageType = this.state.pageType ? this.state.pageType : newTabs[0].type;
    const style = { height: document.documentElement.clientHeight - tabsHeight - (recordDiscussSwitch ? bottomHeight : 0) };
    return (
      <div className="discussTabs h100 flexColumn">
        {isModal && (
          <div className="closeDiscuss" onClick={onClose}>
            {_l('查看记录')}
          </div>
        )}
        <Tabs
          className="md-adm-tabs flexUnset"
          activeLineMode="fixed"
          activeKey={pageType.toString()}
          onChange={type => {
            this.setState({
              pageType: Number(type)
            });
          }}
        >
          {newTabs.map((tab, index) => (
            <Tabs.Tab title={<span className="bold">{tab.title}</span>} key={tab.type} />
          ))}
        </Tabs>
        {recordDiscussSwitch && pageType === 1 && (
          <div style={style}>
            <DiscussList
              worksheetId={worksheetId}
              rowId={rowId}
              height={style.height}
              entityType={entityType}
              onReply={(replyId, replyName) => {
                this.setState({
                  replyVisible: true,
                  discussionInfo: { replyId, replyName },
                });
              }}
            />
          </div>
        )}
        {recordLogSwitch && pageType === 3 && (
          <div style={style}>
            <Logs
              worksheetId={params.worksheetId}
              rowId={rowId || ''}
              originalData={originalData}
            />
          </div>
        )}
        {recordDiscussSwitch && (
          <div
            className="flexRow alignItemsCenter participation"
            onClick={() => {
              if (window.isPublicApp) {
                alert(_l('预览模式下，不能操作'), 3);
                return;
              }
              this.setState({ replyVisible: true });
            }}
          >
            <div className="text">{_l('参与讨论...')}</div>
          </div>
        )}
        {!isModal && (
          <Back
            onClick={() => {
              const { groupId } = this.state;
              if (rowId) {
                window.mobileNavigateTo(
                  `/mobile/record/${params.appId}/${params.worksheetId}/${params.viewId}/${rowId}`,
                );
              } else if (groupId) {
                window.mobileNavigateTo(`/mobile/recordList/${params.appId}/${groupId}/${params.worksheetId}`);
              }
            }}
          />
        )}
        <AddDiscuss
          appId={params.appId}
          worksheetId={params.worksheetId}
          viewId={params.viewId}
          rowId={params.rowId}
          discussionInfo={discussionInfo}
          visible={replyVisible}
          onClose={() => {
            this.setState({
              replyVisible: false,
              discussionInfo: {},
            });
          }}
          onAdd={data => {
            this.props.dispatch(actions.unshiftSheetDiscussion(data));
            this.props.onAddCount();
            this.setState({
              replyVisible: false,
              discussionInfo: {},
            });
          }}
          projectId={this.props.projectId}
        />
      </div>
    );
  }
}

export default connect(state => {
  return {};
})(Discuss);
