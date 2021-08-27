import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Trigger from 'rc-trigger';
import shallowEqual from 'shallowequal';

import LoadDiv from 'ming-ui/components/LoadDiv';
import UserController from 'src/api/user';
import GroupController from 'src/api/group';
import './css/mdBusinessCard.less';
import placements from './placements';

const TYPES = {
  USER: 1,
  GROUP: 2,
  SECRET_TPYE_1: 3, // 通用`企业小秘书`
  SECRET_TYPE_2: 4, // `任务 文件夹 群组 企业小秘书`
};

const USER_STATUS = {
  DEFAULT: 0, // 辅助
  NORMAL: 1, // 正常
  LOGOFF: 2, // 注销
  INACTIVE: 3, // 未激活
  REMOVED: 4, // 已删除
};

class MdBusinessCard extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    trigger: PropTypes.any,
    children: PropTypes.any,
    opHtml: PropTypes.element,
    placement: PropTypes.string,
    // transitionName: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    // animation: PropTypes.any,
    mouseEnterDelay: PropTypes.number,
    mouseLeaveDelay: PropTypes.number,
    reset: PropTypes.bool,
    getPopupContainer: PropTypes.func,

    sourceId: PropTypes.string,
    type: PropTypes.oneOf(_.values(TYPES)),
    inviterAccount: PropTypes.shape({
      accountId: PropTypes.string,
      fullName: PropTypes.string,
    }),

    data: PropTypes.shape({
      avatar: PropTypes.string, // 头像
      detail_closed: PropTypes.bool, // 帐号是否关闭
      fullname: PropTypes.string, // 名称
      status: PropTypes.oneOf(_.values(USER_STATUS)), // 状态
      accountId: PropTypes.string, // id
      companyName: PropTypes.string, // 公司名称
      profession: PropTypes.string, // 职位
      email: PropTypes.string, // email
      mobilePhone: PropTypes.string, // 联系方式,
      sameProjectIds: PropTypes.array, // 当前用户和这个 Account 加入的相同的网络的
    }),

    // Deprecated
    accountId: PropTypes.string,
    groupId: PropTypes.string,
  };
  static defaultProps = {
    getPopupContainer: () => document.body,
    reset: false,
    offset: {
      x: 0,
      y: 0,
    },
    mouseEnterDelay: 0.1,
    mouseLeaveDelay: 0.3,
    align: {},
    trigger: ['hover'],
    placement: 'topLeft',

    data: null,

    sourceId: '',
    type: TYPES.USER,
    accountId: '',
    groupId: '',
  };

  constructor(props) {
    super();

    this.state = {
      isLoading: false,
      isSourceValid: true,
      visible: false,
      data: props.data,

      arrowLeft: 'auto',
      arrowRight: 'auto',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!shallowEqual(nextProps.data, this.props.data)) {
      this.setState({
        data: nextProps.data,
      });
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.visible && !this.state.data) {
      if (this.state.isLoading) return;
      this.fetchData();
    }
  }

  saveTrigger = node => {
    this.trigger = node;
  };

  setArrowPosition(popupDomNode, align) {
    if (this.trigger && this.node) {
      const cls = this.trigger.getPopupClassNameFromAlign(align);
      const width = $(this.node).width();
      if (cls.indexOf('Left') > -1) {
        if (width / 2 !== this.state.arrowLeft) {
          this.setState({
            arrowLeft: width / 2,
            arrowRight: 'auto',
          });
        }
      } else {
        if (width / 2 !== this.state.arrowRight) {
          this.setState({
            arrowRight: width / 2,
            arrowLeft: 'auto',
          });
        }
      }
    }
  }

  getAccountOrGroupId() {
    const { accountId, groupId } = this.props;
    let sourceId, type;
    if (accountId) {
      type = TYPES.USER;
      sourceId = accountId;
    } else if (groupId) {
      type = TYPES.GROUP;
      sourceId = groupId;
    } else {
      type = TYPES.SECRET;
      sourceId = Date.now() / 1000;
    }
    if (sourceId && type) {
      return {
        sourceId,
        type,
      };
    } else {
      return {
        sourceId: this.props.sourceId,
        type: this.props.type,
      };
    }
  }

  formatData = function (result) {
    var type = this.props.type;
    var data = {};
    if (type === TYPES.USER) {
      data.isContact = result.isContact;
      data.avatar = result.avatar;
      data.detail_closed = result.accountStatus == 2;
      data.fullname = result.fullname;
      data.status = result.accountStatus;
      data.accountId = result.accountId;
      data.companyName = result.companyName;
      data.profession = result.profession;
      data.email = result.email;
      data.mobilePhone = result.mobilePhone;
      data.sameProjectIds = result.sameProjectIds || [];
    } else if (type === TYPES.GROUP) {
      data.groupName = result.name;
      data.avatar = result.avatar;
      data.groupId = result.groupId;
      data.project = result.project || null;
      data.sameProjectIds = result.sameProjectIds || [];
    }
    return data;
  };

  fetchData() {
    const { sourceId, type } = this.getAccountOrGroupId();

    this.setState({
      isLoading: true,
      isSourceValid: true,
    });

    this.promise =
      type === TYPES.USER
        ? UserController.getAccountBaseInfo({
            accountId: sourceId,
            withSameProjectId: true,
          })
        : GroupController.getGroupCardInfo({
            groupId: sourceId,
          });

    this.promise.done(result => {
      if (result) {
        this.setState({
          isLoading: false,
          data: this.formatData(result),
        });
      } else {
        this.setState({
          isSourceValid: false,
        });
      }
    });
  }

  getPopupNode() {
    const { opHtml } = this.props;
    const { isLoading, visible, data } = this.state;
    this.haveOpened = this.haveOpened || visible;
    if (!this.haveOpened) return <div />;
    const style = {
      left: this.state.arrowLeft,
      right: this.state.arrowRight,
    };
    return (
      <div className="cardContentBox">
        <div className="cardContent">
          {isLoading || !data ? <LoadDiv className="pBottom16" /> : this.renderContent()}
          {!isLoading ? opHtml : null}
        </div>
        <span className="arrowBox" style={style}>
          <span className="arrow" />
        </span>
      </div>
    );
  }

  renderInviteAccount() {
    const { inviterAccount } = this.props;
    if (inviterAccount) {
      return (
        <div className="inviterName">
          <a className="overflow_ellipsis ThemeColor3" target="_blank" href={'/user_' + inviterAccount.accountId} title={!inviterAccount.fullName}>
            {inviterAccount.fullName}
          </a>{' '}
          {_l('邀请')}
        </div>
      );
    }
  }

  renderContent() {
    const { type } = this.props;
    const { data, isSourceValid } = this.state;
    if (!isSourceValid) {
      if (type === TYPES.USER) {
        return <div className="Gray_c pLeft15 pBottom15">{_l('未找到此%0', _l('用户'))}</div>;
      } else if (type === TYPES.GROUP) {
        const text = data && data.isPost === false ? _l('聊天') : _l('群组');
        return <div className="Gray_c pLeft15 pBottom15">{_l('未找到此%0', text)}</div>;
      }
    } else {
      if (type === TYPES.USER) {
        const renderInfo = info => {
          return info ? <span className="overflow_ellipsis contentItem">{info}</span> : null;
        };
        return (
          <React.Fragment>
            <div className="cardHeader">
              {data.status === USER_STATUS.INACTIVE ? (
                <span className="imgLink">
                  <img src={data.avatar} className="circle avatar" />
                </span>
              ) : (
                <a href={'/user_' + data.accountId} className="imgLink" target="_blank">
                  <img src={data.avatar} className="circle avatar" />
                </a>
              )}

              <div className="cardContent-wrapper">
                {data.status === USER_STATUS.INACTIVE ? (
                  <span className="name overflow_ellipsis ThemeColor3">
                    {data.fullname}
                    <span className="icon-folder-public smallEarth" />
                  </span>
                ) : (
                  <a className="name overflow_ellipsis ThemeHoverColor3 " target="_blank" href="/user_{{=data.accountId}}" title={data.fullname}>
                    {data.fullname}
                    {data.status === USER_STATUS.LOGOFF ? _l('帐号已注销') : ''}
                  </a>
                )}

                <div className="cardContentDesc userCard">
                  {renderInfo(data.companyName)}
                  {renderInfo(data.profession)}
                  {renderInfo(data.email)}
                  {renderInfo(data.mobilePhone)}
                  {!data.companyName && !data.profession && !data.email && !data.mobilePhone ? (
                    <span className="overflow_ellipsis contentItem Gray_c">{_l('这个家伙什么也没有留下')}~</span>
                  ) : null}
                </div>
              </div>

              {data.status === USER_STATUS.NORMAL && md.global.Account && data.accountId !== md.global.Account.accountId ? (
                <div className="pRight15">
                  <span data-tip={_l('发消息')}>
                    <span className="startChat icon-chat-session ThemeColor3" />
                  </span>
                </div>
              ) : null}
            </div>
            <div className="pTop20" />
          </React.Fragment>
        );
      } else if (type === TYPES.GROUP) {
        return (
          <div className={classNames('cardHeader', data.sameProjectIds.length ? 'pBottom10' : 'pBottom20')}>
            <span className="imgLink">
              <img src="{{=data.avatar}}" className="circle avatar" />
            </span>
            <div className="cardContent-wrapper">
              <span className="name overflow_ellipsis ThemeHoverColor3" title={data.groupName}>
                {data.groupName}
              </span>
              <div className="cardContentDesc">
                {data.project ? (
                  <React.Fragment>
                    <span className="icon-company Font18 mRight5" />
                    {data.project.companyName}
                  </React.Fragment>
                ) : null}
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="cardHeader">
            <span className="imgLink">
              <img src={`${md.global.FileStoreConfig.pictureHost.replace(/\/$/, '')}/UserAvatar/littleSecretary.png`} className="circle avatar" />
            </span>
            <div className="cardContent-wrapper">
              <span className="name overflow_ellipsis">{_l('企业小秘书')}</span>
              {type === TYPES.SECRET_TPYE_1 ? (
                <React.Fragment>
                  <span className="contentItem">{_l('当员工离职时，企业小秘书暂时托管数据')}</span>
                  <span className="contentItem">010-53153053</span>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <span className="contentItem">{_l('原负责人已经离职，由企业小秘书托管')}</span> :
                  <span className="contentItem">{_l('你可以联系管理员进行移交')}</span>
                </React.Fragment>
              )}
            </div>
          </div>
        );
      }
    }
  }

  render() {
    const { id, reset, getPopupContainer, mouseEnterDelay, mouseLeaveDelay, trigger, placement } = this.props;
    const props = {
      id,
      ref: this.saveTrigger,
      popupClassName: 'businessCardSite',
      prefixCls: 'businessCard',
      popup: this.getPopupNode(),
      action: trigger,
      builtinPlacements: placements,
      popupPlacement: placement,
      onPopupAlign: this.setArrowPosition.bind(this),
      destroyPopupOnHide: reset,
      getPopupContainer,
      mouseEnterDelay,
      mouseLeaveDelay,
      onPopupVisibleChange: visible => {
        this.setState({
          visible,
        });
      },
    };
    return (
      <Trigger {...props}>
        {React.cloneElement(this.props.children, {
          ref: el => {
            this.node = el;
          },
        })}
      </Trigger>
    );
  }
}

MdBusinessCard.TYPES = TYPES;

export default MdBusinessCard;
