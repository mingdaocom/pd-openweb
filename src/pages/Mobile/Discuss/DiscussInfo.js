import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { Icon, LoadDiv } from 'ming-ui';
import { Tabs, Flex } from 'antd-mobile';
import * as actions from './redux/actions';
import DiscussList from './DiscussList';
import AttachmentList from './AttachmentList';
import Logs from './Logs';
import Back from '../components/Back';
import homeAppAjax from 'src/api/homeApp';
import worksheetAjax from 'src/api/worksheet';
import './index.less';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { getDiscussConfig } from 'src/api/externalPortal';
import AddDiscuss from 'mobile/AddDiscuss';

const isWxWork = window.navigator.userAgent.toLowerCase().includes('wxwork');

const tabs = md.global.Account.isPortal
  ? [{ title: _l('讨论'), type: 1 }]
  : [
      { title: _l('讨论'), type: 1 },
      { title: _l('文件'), type: 2 },
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
      height: document.documentElement.clientHeight - tabsHeight - bottomHeight,
      groupId: null,
      switchPermit: {},
      allowExAccountDiscuss: false, //允许外部用户讨论
      exAccountDiscussEnum: 0, //外部用户的讨论类型 0：所有讨论 1：不可见内部讨论
      loading: true,
      replyVisible: false,
      discussionInfo: {}
    };
  }
  componentDidMount() {
    const { params } = this.props.match;
    if (_.isEmpty(params.rowId)) {
      this.getGroupInfo();
    }
    this.getPortalDiscussSet();
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
  componentWillUnmount() {
    this.props.dispatch(actions.emptySheetDiscussion());
    this.props.dispatch(actions.emptySheetLogs());
  }

  getPortalDiscussSet = () => {
    const { params } = this.props.match;
    const { appId } = params;

    getDiscussConfig({ appId }).then(res => {
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
      .getAppInfo({
        appId,
      })
      .then(result => {
        this.setState({
          groupId: getGroupId(result.appSectionDetail, worksheetId),
        });
      });
  }
  render() {
    const { isModal, onClose } = this.props;
    const { params } = this.props.match;
    const { worksheetId, rowId } = params;
    const { replyVisible, discussionInfo } = this.state;
    const style = { height: this.state.height };
    const {
      switchPermit,
      allowExAccountDiscuss, //允许外部用户讨论
      exAccountDiscussEnum,
      loading,
    } = this.state;
    let entityType = 0;
    //外部用户且未开启讨论 不能内部讨论
    if (md.global.Account.isPortal && allowExAccountDiscuss && exAccountDiscussEnum === 1) {
      entityType = 2;
    }
    if (md.global.Account.isPortal && loading) {
      return <LoadDiv />;
    }
    return (
      <div className="discussTabs">
        {isModal && <Icon icon="closeelement-bg-circle" className="close Font22 Gray_9e" onClick={onClose} />}
        <Tabs
          tabs={isOpenPermit(permitList.logSwitch, switchPermit) ? tabs : tabs.filter(item => item.type !== 3)}
          tabBarInactiveTextColor="#9e9e9e"
          renderTabBar={props => <Tabs.DefaultTabBar {...props} />}
        >
          <div style={style}>
            <DiscussList
              worksheetId={worksheetId}
              rowId={rowId}
              height={style.height}
              entityType={entityType}
              onReply={(replyId, replyName) => {
                this.setState({
                  replyVisible: true,
                  discussionInfo: { replyId, replyName }
                });
                // window.mobileNavigateTo(
                //   `/mobile/addDiscuss/${params.appId}/${params.worksheetId}/${params.viewId}/${
                //     params.rowId || null
                //   }/${discussionId}|${name}`,
                // );
              }}
            />
          </div>
          <div style={style}>
            <AttachmentList worksheetId={params.worksheetId} rowId={rowId} height={style.height} />
          </div>
          <div style={style}>
            <Logs worksheetId={params.worksheetId} rowId={rowId || ''} height={style.height} />
          </div>
        </Tabs>
        <Flex
          className="participation"
          onClick={() => {
            if (window.isPublicApp) {
              alert(_l('预览模式下，不能操作'), 3);
              return;
            }
            this.setState({ replyVisible: true });
            // window.mobileNavigateTo(
            //   `/mobile/addDiscuss/${params.appId}/${params.worksheetId}/${params.viewId}/${params.rowId || ''}`,
            // );
          }}
        >
          <div className="text">{_l('参与讨论...')}</div>
          <Icon className="Gray_9e" icon="chat" />
        </Flex>
        {!isModal && (
          <Back
            onClick={() => {
              const { groupId } = this.state;
              if (rowId) {
                window.mobileNavigateTo(`/mobile/record/${params.appId}/${params.worksheetId}/${params.viewId}/${rowId}`);
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
              discussionInfo: {}
            });
          }}
          onAdd={(data) => {
            this.props.dispatch(actions.unshiftSheetDiscussion(data));
            this.props.onAddCount();
            this.setState({
              replyVisible: false,
              discussionInfo: {}
            });
          }}
        />
      </div>
    );
  }
}

export default connect(state => {
  return {};
})(Discuss);
