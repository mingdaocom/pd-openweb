import React, { Component, Fragment } from 'react';
import ClipboardButton from 'react-clipboard.js';
import cx from 'classnames';
import _ from 'lodash';
import { navigateTo } from 'router/navigateTo';
import { Dialog, Icon, LoadDiv, VerifyPasswordConfirm } from 'ming-ui';
import account from 'src/api/account';
import projectAjax from 'src/api/project';
import roleAjax from 'src/api/role';
import { hasBackStageAdminAuth } from 'src/components/checkPermission';
import { purchaseMethodFunc } from 'src/components/pay/versionUpgrade/PurchaseMethodModal';
import common from '../../common';
import EditCardInfo from './EditCardInfo';
import ExitDialog from './ExitDialog';
import ValidPassword from './ValidPassword';
import './index.less';

const optionsList = [
  { icon: 'icon-edit_17', label: _l('编辑组织名片'), click: 'handleEdit', key: 'editCard' },
  { icon: 'icon-build', label: _l('组织管理'), click: 'handleGoAdmin', key: 'manage' },
  { icon: 'icon-manage', label: _l('我的汇报关系'), click: 'handleRelation', key: 'reportRelation' },
  { icon: 'icon-exit', label: _l('退出组织'), click: 'handleExit', key: 'exit' },
];

const closeOptionsList = [
  {
    icon: 'icon-back',
    label: _l('恢复组织'),
    click: 'handleRecover',
    key: 'recover',
    isSuperAdmin: true,
    disabledKey: 'recoverDisabled',
  },
  optionsList[3],
];

export default class EnterpriseCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showItem: false,
      loading: false,
      userInfo: {},
      hasProjectAdminAuth: false,
      recoverDisabled: false,
    };
  }

  //card操作权限判断
  formatProjectStatus(item) {
    const PROJECT_STATUS_TYPES = common.PROJECT_STATUS_TYPES;
    const USER_STATUS = common.USER_STATUS;
    const { userStatus, projectStatus, isSuperAdmin } = item;

    let result = {
      buttonState: 'default', //右侧处理类型（review: '待审核‘ | ’open: '开通' |  trial: '试用' | default: '按成员类型展示'）
      editCard: false, //可否编辑
      reportRelation: false, //查看汇报关系
      exit: false, //退出
      manage: false, //管理后台
      recover: isSuperAdmin, // 恢复组织
    };

    if (userStatus === USER_STATUS.UNAUDITED) {
      result.buttonState = 'review';
    } else {
      if (projectStatus === PROJECT_STATUS_TYPES.FREE) {
        result.buttonState = 'open';
      }

      if (projectStatus === PROJECT_STATUS_TYPES.TRIAL) {
        result.buttonState = 'trial';
      }

      switch (projectStatus) {
        case PROJECT_STATUS_TYPES.FREE:
        case PROJECT_STATUS_TYPES.TRIAL:
        case PROJECT_STATUS_TYPES.PAID:
          result = {
            ...result,
            editCard: true,
            manage: true,
            reportRelation: true,
            exit: true,
          };
          break;
        case PROJECT_STATUS_TYPES.TOPAID:
        case PROJECT_STATUS_TYPES.REPAID:
          result.exit = true;
          break;
        default:
          result.exit = true;
          break;
      }
    }
    return result;
  }

  //展开或收起card
  handleChangeShow(e) {
    if (e.target.className.includes('childTag')) {
      return;
    }
    this.setState(
      {
        showItem: !this.state.showItem,
      },
      () => {
        if (this.state.showItem) {
          this.getAuthInfo();
        }
      },
    );
  }

  //card数据
  getAuthInfo() {
    const { card } = this.props;
    this.setState({ loading: true });

    const hasProjectAdminAuth = hasBackStageAdminAuth({ projectId: card.projectId });
    this.setState({ hasProjectAdminAuth });

    account.getUserCard({ projectId: card.projectId }).then(data => {
      if (data) {
        this.setState({ userInfo: data.user, loading: false });
      }
    });
  }

  //编辑
  handleEdit(item) {
    Dialog.confirm({
      dialogClasses: 'editInfoEnterprise',
      noFooter: true,
      children: (
        <EditCardInfo
          userInfo={item}
          updateData={data => this.setState({ userInfo: data })}
          closeDialog={() => {
            $('.editInfoEnterprise.mui-dialog-container').parent().remove();
          }}
        />
      ),
    });
  }

  checkIsLastSuperAdmin = async projectId => {
    const res = await roleAjax.isLastSuperAdmin({ projectId });

    return res;
  };

  exitProject(projectId) {
    account.exitProject({ projectId: projectId }).then(res => {
      if (res === 1) alert(_l('退出成功'));
    });
  }

  onCancelExit(item, closeProject) {
    if (!closeProject) return;

    navigateTo(`/admin/sysinfo/${item.projectId}`);
  }

  onOkExit(item, isLastSuperAdmin, isClose) {
    const { card } = this.props;

    if (!isLastSuperAdmin) {
      this.exitProject(item.projectId);
      this.props.getData();
      return null;
    }

    if (isClose) {
      VerifyPasswordConfirm.confirm({
        onOk: () => {
          this.exitProject(item.projectId);
          this.props.getData();
        },
      });
      return null;
    }

    navigateTo(card.effectiveUserCount > 1 ? `/admin/sysroles/${item.projectId}` : `/admin/sysinfo/${item.projectId}`);
  }

  handleNormalUserExit(item) {
    Dialog.confirm({
      title: _l('提示'),
      dialogClasses: 'dialogBoxValidate',
      noFooter: true,
      children: (
        <ValidPassword
          projectId={item.projectId}
          companyName={item.companyName}
          closeDialog={() => {
            $('.dialogBoxValidate.mui-dialog-container').parent().remove();
          }}
          transferAdminProject={this.transferAdminProject}
        />
      ),
    });
  }

  //退出
  handleExit = async (item, isClose) => {
    const { card } = this.props;
    const isLastSuperAdmin = await this.checkIsLastSuperAdmin(item.projectId);
    const hasOtherUser = card.effectiveUserCount > 1;

    if (!isClose && !isLastSuperAdmin) return this.handleNormalUserExit(item);

    let description = null;

    if (isLastSuperAdmin && isClose) {
      description = _l('您一旦退出后，将没有人可以再恢复组织');
    } else if (isLastSuperAdmin && !isClose) {
      description = hasOtherUser
        ? _l(
            '当前组织内有其他 %0 个用户，为避免您退出后组织无法正常使用，请添加其他超级管理员后再退出组织。如果您已确定不需要使用此组织，可以选择关闭组织',
            card.effectiveUserCount - 1,
          )
        : _l('当前组织内有其他 0 个用户。如果您已不需要使用此组织，可以选择关闭组织');
    }

    Dialog.confirm({
      title: isLastSuperAdmin
        ? _l('您是组织：%0  中唯一一个超级管理员', item.companyName)
        : _l('退出组织：%0', item.companyName),
      description: description,
      dialogClasses: 'dialogBoxValidate',
      onlyClose: true,
      buttonType: isClose ? 'danger' : 'primary',
      okText: !isClose && isLastSuperAdmin ? (hasOtherUser ? _l('添加超级管理员') : _l('关闭组织')) : _l('退出组织'),
      cancelText: !isClose && isLastSuperAdmin && hasOtherUser ? _l('关闭组织') : _l('取消'),
      removeCancelBtn: !isClose && isLastSuperAdmin && !hasOtherUser,
      onOk: () => this.onOkExit(item, isLastSuperAdmin, isClose),
      onCancel: () => this.onCancelExit(item, !isClose && isLastSuperAdmin && hasOtherUser),
    });
  };

  // 指定同事
  transferAdminProject = (projectId, companyName, password, type) => {
    const needTransfer = type === 3;

    Dialog.confirm({
      dialogClasses: 'dialogBoxTransferAdminProject',
      title: needTransfer ? _l('您是组织：Mingdao App Room  中唯一一个管理员') : _l('退出组织：%0', companyName),
      noFooter: true,
      children: (
        <ExitDialog
          needTransfer={needTransfer}
          companyName={companyName}
          projectId={projectId}
          password={password}
          closeDialog={() => {
            $('.dialogBoxTransferAdminProject.mui-dialog-container').parent().remove();
          }}
          transferAdminProject={this.transferAdminProject}
          getData={() => this.props.getData()}
        />
      ),
    });
  };

  //汇报关系
  handleRelation(item) {
    navigateTo('/personal?type=reportRelation&projectId=' + item.projectId);
  }

  //管理后台
  handleGoAdmin(item) {
    window.location.href = '/admin/home/' + item.projectId;
  }

  //复制
  handleCopyTextSuccess() {
    alert(_l('复制成功'));
    return false;
  }

  //获取部门，工作
  getItems(list, key) {
    const listInfo = list.map(item => item[key]);
    return listInfo.join(' ; ');
  }

  // 取消申请
  cancelApplication = card => {
    Dialog.confirm({
      title: _l('取消申请'),
      onOk: () => {
        account.revokedJoinProject({ projectId: card.projectId }).then(res => {
          this.props.getData();
          if (res) {
            alert(_l('取消成功'));
          } else {
            alert(_l('取消失败'), 2);
          }
        });
      },
    });
  };

  //操作行为
  renderOption(type) {
    const { card } = this.props;
    switch (type) {
      case 'open':
        if (!md.global.Config.IsLocal) {
          return (
            <span className="openNowBtn" onClick={() => this.handleOpenCard(card)}>
              {_l('购买')}
            </span>
          );
        } else {
          return;
        }
      case 'review':
        return (
          <span>
            <span className="ThemeColor3 Hover_49 Hand" onClick={() => this.handleReview(card)}>
              {_l('待审核')}
            </span>
            <span className="cancelApplication Hover_49 Hand mLeft24" onClick={() => this.cancelApplication(card)}>
              {_l('取消申请')}
            </span>
          </span>
        );
      case 'trial':
        return <span className="trialText">{_l('免费试用剩余%0天', _.get(card, 'currentLicense.expireDays'))}</span>;
      case 'default':
        return null;
    }
  }

  //开通
  handleOpenCard(card) {
    purchaseMethodFunc({ projectId: card.projectId });
  }

  //待审核
  handleReview(card) {
    account
      .sendSystemMessageToAdmin({
        projectId: card.projectId,
        msgType: 1,
      })
      .then(function (result) {
        if (result) {
          alert(_l('已提醒管理员审核'));
        } else {
          alert(_l('操作失败'), 2);
        }
      })
      .catch();
  }

  handleRecover(card) {
    Dialog.confirm({
      title: _l('恢复组织：%0', card.companyName),
      okText: _l('恢复组织'),
      description: (
        <span className="Font14 Gray_75">
          {_l('关闭超过90天的组织，所有应用已自动进入回收站，进入回收站60天后，所有应用会被彻底物理删除')}
        </span>
      ),
      onOk: () => {
        projectAjax
          .recoverProject({
            projectId: card.projectId,
          })
          .then(res => {
            alert(res ? _l('恢复组织成功') : _l('恢复组织失败', 2));
            res && this.props.getData();
          });
      },
    });
  }

  render() {
    const { showItem, userInfo, loading, hasProjectAdminAuth } = this.state;
    const { departmentInfos = [], jobInfos = [] } = userInfo;
    const { card, DragHandle, isClose } = this.props;
    const { currentLicense = {}, closedOperatorName, closedTime } = card;
    const parmas = this.formatProjectStatus(card);
    //待开通状态
    const isWaitOpen =
      card.projectStatus === common.PROJECT_STATUS_TYPES.FREE ||
      card.projectStatus === common.PROJECT_STATUS_TYPES.TOPAID;

    return (
      <div className={cx('enterpriseCardItem', { active: showItem })} onClick={e => this.handleChangeShow(e)}>
        {DragHandle && (
          <DragHandle>
            <Icon icon="drag" className="dragIcon" />
          </DragHandle>
        )}
        <div className="cardItemHeader Hand">
          <div className="cardItemLeft">
            <div className="Font17 Bold mBottom12 Gray">{card.companyName}</div>
            <div className="cardItemInfo">
              <div className={cx('itemTag', isClose ? 'closeActive' : isWaitOpen ? 'grayActive' : 'active')}>
                {isClose ? _l('已关闭') : currentLicense.version ? currentLicense.version.name : _l('免费版')}
              </div>
              <div className="mLeft24 mRight24 itemDivice"></div>
              <div className={cx('Gray_75', { hover_blue: !isClose })}>
                {isClose ? (
                  _l('%0 于%1关闭', closedOperatorName, closedTime ? createTimeSpan(closedTime) : '-')
                ) : (
                  <ClipboardButton
                    component="span"
                    data-clipboard-text={card.projectCode}
                    onSuccess={this.handleCopyTextSuccess.bind(this)}
                  >
                    <span className="childTag">{_l('组织门牌号：%0', card.projectCode)}</span>
                    <span className="icon-content-copy Font12 mLeft5 childTag"></span>
                  </ClipboardButton>
                )}
              </div>
              {md.global.Config.IsLocal && (
                <div className="Gray_75 hover_blue mLeft16">
                  <ClipboardButton
                    component="span"
                    data-clipboard-text={card.projectId}
                    onSuccess={this.handleCopyTextSuccess.bind(this)}
                  >
                    <span className="childTag">{_l('组织 ID：%0', card.projectId)}</span>
                    <span className="icon-content-copy Font12 mLeft5 childTag"></span>
                  </ClipboardButton>
                </div>
              )}
            </div>
          </div>
          <div className="cardItemRight">
            {!isClose && this.renderOption(parmas.buttonState)}
            <span className={cx('Font20 mLeft12 Gray_70', showItem ? 'icon-expand_more' : 'icon-navigate_next')}></span>
          </div>
        </div>
        <div className={cx('infoContent', showItem ? 'extendInfo' : 'closeInfo')}>
          {loading ? (
            <LoadDiv />
          ) : (
            <Fragment>
              <div className="extendItemBox">
                <div className="extendItemLabel Gray_75">{_l('组织名片')}</div>
                <div className="extendRight">
                  <div className="flexRow mBottom8">
                    <div className="extendRightLabel">{_l('姓名')}</div>
                    <div>{userInfo.fullname || _l('未填写')}</div>
                  </div>
                  <div className="flexRow mBottom8">
                    <div className="extendRightLabel">{_l('部门')}</div>
                    <div>
                      {departmentInfos.length > 0 ? this.getItems(departmentInfos, 'departmentName') : _l('未填写')}
                    </div>
                  </div>
                  <div className="flexRow">
                    <div className="extendRightLabel">{_l('职位')}</div>
                    <div>{jobInfos.length > 0 ? this.getItems(jobInfos, 'jobName') : _l('未填写')}</div>
                  </div>
                </div>
              </div>
              <div className="extendItemBox Gray_75">
                {(isClose
                  ? closeOptionsList
                  : optionsList.filter(
                      v => !(md.global.Config.IsLocal && !md.global.Config.IsPlatformLocal && v.key === 'exit'),
                    )
                ).map((item, index) => {
                  return (
                    <span
                      key={index}
                      className={cx('flexRow mRight40', parmas[item.key] ? 'Hand Gray hover_blue' : 'Gray_9e')}
                      onClick={() => (parmas[item.key] ? this[item.click](userInfo, isClose) : null)}
                    >
                      <span className={cx('mRight12 LineHeight20 childTag', item.icon)}></span>
                      {item.key === 'manage' ? (
                        <span className="childTag">{hasProjectAdminAuth ? item.label : _l('申请管理权限')}</span>
                      ) : (
                        <span className="childTag">{item.label}</span>
                      )}
                    </span>
                  );
                })}
              </div>
            </Fragment>
          )}
        </div>
      </div>
    );
  }
}
