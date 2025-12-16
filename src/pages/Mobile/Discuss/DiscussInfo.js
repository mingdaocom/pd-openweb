import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Popup, Tabs } from 'antd-mobile';
import _ from 'lodash';
import { Icon, LoadDiv } from 'ming-ui';
import externalPortalAjax from 'src/api/externalPortal';
import homeAppAjax from 'src/api/homeApp';
import worksheetAjax from 'src/api/worksheet';
import AddDiscuss from 'mobile/AddDiscuss';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { handleReplaceState } from 'src/utils/project';
import Back from '../components/Back';
import DiscussList from './DiscussList';
import Logs from './Logs';
import * as actions from './redux/actions';
import './index.less';

const tabs = md.global.Account.isPortal
  ? [{ title: _l('讨论'), type: 1 }]
  : [
      { title: _l('讨论'), type: 1 },
      { title: _l('日志'), type: 3 },
    ];

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
      pageType: undefined,
      temporaryDiscuss: {}, // 暂存填写内容
      focusUsers: [],
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
    window.addEventListener('popstate', this.onQueryChange);
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.sheetDiscussions, this.props.sheetDiscussions)) {
      this.setState({ discussions: nextProps.sheetDiscussions }, this.getRecordPartner);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.onQueryChange);
  }

  onQueryChange = () => {
    handleReplaceState('page', 'discussInfos', this.props.onClose);
  };

  getPortalConfigSet = () => {
    const { params } = this.props.match;
    const { appId } = params;

    externalPortalAjax.getConfig({ appId }).then(res => {
      const {
        allowExAccountDiscuss, //允许外部用户讨论
        exAccountDiscussEnum,
      } = res;
      this.setState(
        {
          allowExAccountDiscuss, //允许外部用户讨论
          exAccountDiscussEnum,
          loading: false,
          disType: md.global.Account.isPortal && exAccountDiscussEnum === 1 ? 2 : 1, //外部门户且不可见内部讨论 则直接显示外部讨论
        },
        this.getRecordPartner,
      );
    });
  };

  // 获取记录参与者
  getRecordPartner = () => {
    let { formData = [] } = this.props;
    const {
      discussions = [],
      disType,
      allowExAccountDiscuss = false, //是否配置外部门户可参与讨论
      exAccountDiscussEnum = 0, //外部门户可见讨论区域为全部
    } = this.state;
    let data = [];
    formData = formData.filter(
      o =>
        [o.sourceControlType, o.type].includes(26) && //成员字段
        (o.userPermission !== 0 || o.controlId === 'ownerid' || (o.type === 30 && _.get(o, 'strDefault.0') !== '1')), //排除仅用于记录人员数据(除了拥有者字段外)
    );
    if (disType === 1) {
      //内部讨论
      if (!allowExAccountDiscuss || (allowExAccountDiscuss && exAccountDiscussEnum !== 0)) {
        //未配置外部人员可参与讨论 或配置了外部成员不可见内部讨论 不能@外部用户
        formData = formData.filter(o => (o.advancedSetting || {}).usertype !== '2');
      }
    }
    formData.map(o => {
      let d;
      try {
        d = JSON.parse(o.value).map(item => {
          return Object.assign({}, item, { job: o.controlName });
        });
      } catch (err) {
        console.log(err);
        d = [];
      }
      data = data.concat(d);
    });
    let accountsInMessage = [];
    let dis = discussions.map(o => {
      accountsInMessage = accountsInMessage.concat(o.accountsInMessage);
      return o.createAccount;
    });
    data = data
      //参与讨论的
      .concat(dis.map(item => Object.assign({}, item, { job: _l('讨论用户') })))
      //@到的
      .concat(accountsInMessage.map(item => Object.assign({}, item, { job: _l('讨论用户') })))
      //排除自己以及未指定等
      .filter(
        d =>
          !(
            ['user-undefined', 'user-publicform', md.global.Account.accountId].includes(d.accountId) ||
            d.accountId.indexOf('user-') >= 0
          ),
      );
    data = data.filter(
      d =>
        !(
          disType === 1 &&
          (!allowExAccountDiscuss || (allowExAccountDiscuss && exAccountDiscussEnum !== 0)) &&
          d.accountId.indexOf('a#') >= 0
        ),
      //内部讨论 未配置外部人员可参与讨论 或配置了外部成员不可见内部讨论 不能@外部用户
    );
    const hash = {};
    const data2 = data.reduce((result, current) => {
      if (!hash[current.accountId]) {
        hash[current.accountId] = true; // 标记已存在
        result.push(current); // 添加到结果数组
      }
      return result;
    }, []);

    this.setState({ recordPartner: data2 });
  };

  getGroupInfo() {
    const { params } = this.props.match;
    const { appId, worksheetId } = params;
    homeAppAjax
      .getApp({
        appId,
        getSection: true,
      })
      .then(result => {
        this.setState({
          groupId: getGroupId(result.sections, worksheetId),
        });
      });
  }
  refreshDiscussCount = () => {
    const { getDiscussionsCount } = this.props;
    getDiscussionsCount();
  };

  handleShowAttention = e => {
    e.stopPropagation();
    this.setState({ attentionVisible: true });
  };

  setFollow = () => {
    const { focusUsers, focusLoading } = this.state;
    const isAttention = focusUsers.findIndex(v => v.accountId === md.global.Account.accountId) > -1; //  是否关注讨论
    if (focusLoading) return;
    const { params } = this.props.match;
    const { worksheetId, rowId, viewId } = params;
    this.setState({ focusLoading: true });
    worksheetAjax.setFollow({ worksheetId, rowId, viewId, checkView: true, setFollow: !isAttention }).then(res => {
      this.setState({ focusLoading: false });
      if (res) {
        if (res.resultCode === 7) {
          alert(_l('您没有权限关注此记录'), 3);
        } else {
          alert(!isAttention ? _l('关注成功') : _l('取消关注'));
          this.setState({ focusUsers: res?.users || [], attentionVisible: false });
        }
      }
    });
  };

  render() {
    const { isModal, onClose, originalData, discussionCount, projectId } = this.props;
    const { params } = this.props.match;
    const { appId, worksheetId, rowId } = params;
    const { replyVisible, discussionInfo, recordPartner = [] } = this.state;
    const { replyId } = discussionInfo;
    const {
      switchPermit,
      allowExAccountDiscuss, // 允许外部用户讨论
      exAccountDiscussEnum,
      loading,
      temporaryDiscuss,
      attentionVisible,
      focusUsers,
    } = this.state;
    const isAttention = focusUsers.findIndex(v => v.accountId === md.global.Account.accountId) > -1; //  是否关注讨论
    const recordDiscussSwitch = isOpenPermit(permitList.recordDiscussSwitch, switchPermit, params.viewId);
    const recordLogSwitch = isOpenPermit(permitList.recordLogSwitch, switchPermit, params.viewId);
    // 外部用户且未开启讨论 不能内部讨论
    const entityType = md.global.Account.isPortal && allowExAccountDiscuss && exAccountDiscussEnum === 1 ? 2 : 0;
    if ((md.global.Account.isPortal && loading) || _.isEmpty(switchPermit)) {
      return <LoadDiv />;
    }
    const newTabs = tabs.filter(item => {
      if (item.type === 1) return recordDiscussSwitch;
      if (item.type === 3) return recordLogSwitch;
    });
    const pageType = this.state.pageType ? this.state.pageType : newTabs[0].type;
    const keys = _.keys(temporaryDiscuss).reverse();
    const firstTemporaryDiscuss = _.isEmpty(keys)
      ? {}
      : replyId
        ? temporaryDiscuss[replyId]
        : temporaryDiscuss[keys[0]];

    return (
      <div className="discussTabs h100 flexColumn">
        {isModal && (
          <div
            className="closeDiscuss"
            onClick={() => {
              this.onQueryChange();
              onClose();
            }}
          >
            {_l('查看记录')}
          </div>
        )}
        <Tabs
          className="md-adm-tabs flexUnset"
          activeLineMode="fixed"
          activeKey={pageType.toString()}
          onChange={type => {
            this.refreshDiscussCount();
            this.setState({
              pageType: Number(type),
            });
          }}
        >
          {newTabs.map(tab => (
            <Tabs.Tab title={<span className="bold">{tab.title}</span>} key={tab.type} />
          ))}
        </Tabs>
        {recordDiscussSwitch && pageType === 1 && (
          <div className="flex overflowHidden">
            <DiscussList
              appId={appId}
              projectId={projectId}
              worksheetId={worksheetId}
              rowId={rowId}
              entityType={entityType}
              refreshDiscussCount={this.refreshDiscussCount}
              onReply={(replyId, replyName) => {
                this.setState({
                  replyVisible: true,
                  discussionInfo: { replyId, replyName, content: (temporaryDiscuss[replyId] || {}).content },
                });
              }}
            />
          </div>
        )}
        {recordLogSwitch && pageType === 3 && (
          <div className="flex overflowHidden">
            <Logs
              appId={appId}
              worksheetId={params.worksheetId}
              rowId={rowId || ''}
              originalData={originalData}
              refreshDiscussCount={this.refreshDiscussCount}
            />
          </div>
        )}
        {recordDiscussSwitch && (
          <div
            className="flexRow alignItemsCenter participation WhiteBG"
            onClick={() => {
              if (window.isPublicApp) {
                alert(_l('预览模式下，不能操作'), 3);
                return;
              }
              this.setState({ replyVisible: true, discussionInfo: firstTemporaryDiscuss });
            }}
          >
            {_.isEmpty(firstTemporaryDiscuss) ? (
              <Fragment>
                <i className="icon icon-chat Font24 Gray_9e mTop3" />
                {discussionCount ? <span className="Font15 Gray_75 mLeft5 mTop2">{discussionCount}</span> : null}
                <div className="flex"></div>
                {!md.global.Account.isPortal && entityType !== 2 && rowId && (
                  <div onClick={this.handleShowAttention}>
                    <i
                      className={`icon Font24 mTop3 ${isAttention ? 'icon-notification_turn_on ThemeColor3' : 'icon-Silent Gray_9e'}`}
                    />
                  </div>
                )}
              </Fragment>
            ) : (
              <Fragment>
                <span className="ThemeColor">{_l('草稿：')}</span>
                <span className="flex ellipsis Gray_9e">{firstTemporaryDiscuss.content || ''}</span>
                <Icon
                  icon="cancel"
                  className="close Font22 Gray_9e Static"
                  onClick={e => {
                    e.stopPropagation();
                    delete temporaryDiscuss[firstTemporaryDiscuss.replyId || 'empty'];
                    this.setState({ temporaryDiscuss });
                  }}
                />
              </Fragment>
            )}
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
        {replyVisible && (
          <AddDiscuss
            appId={params.appId}
            worksheetId={params.worksheetId}
            viewId={params.viewId}
            rowId={params.rowId}
            discussionInfo={discussionInfo}
            visible={replyVisible}
            projectId={this.props.projectId}
            temporaryDiscuss={temporaryDiscuss}
            recordPartner={recordPartner}
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
            handleTemporaryDiscuss={temporaryDiscuss => {
              this.setState({ temporaryDiscuss });
            }}
          />
        )}
        {attentionVisible && (
          <Popup
            className="mobileModal topRadius"
            visible={attentionVisible}
            closeOnMaskClick
            onClose={() => this.setState({ attentionVisible: false })}
          >
            <div className="header flexRow">
              <span className="Font13">{_l('关注讨论')}</span>
              <div className="closeIcon TxtCenter" onClick={() => this.setState({ attentionVisible: false })}>
                <Icon icon="close" />
              </div>
            </div>
            <div
              className={`flexRow alignItemsCenter pLeft15 pRight15 mBottom20 ${isAttention ? 'ThemeColor3' : 'Gray_9e'}`}
              onClick={this.setFollow}
            >
              <i className="icon icon-notification_turn_on Font24 mRight12" />
              <div className="flex">
                <div className={`Font15 bold ${isAttention ? 'ThemeColor3' : 'Gray'}`}>
                  {!isAttention ? _l('关注') : _l('关注中...')}
                </div>
                <div className="Font12">
                  {isAttention ? _l('通知所有讨论') : _l('关注后接收全部提醒，未关注仅@你或回复时通知')}
                </div>
              </div>
              {isAttention ? <i className="icon icon-done Font24" /> : null}
            </div>
          </Popup>
        )}
      </div>
    );
  }
}

export default connect(state => {
  const { sheetDiscussions } = state.mobile;
  return {
    sheetDiscussions,
  };
})(Discuss);
