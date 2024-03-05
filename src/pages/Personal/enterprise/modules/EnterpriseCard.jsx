import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import common from '../../common';
import account from 'src/api/account';
import { LoadDiv, Dialog } from 'ming-ui';
import ClipboardButton from 'react-clipboard.js';
import ValidPassword from './ValidPassword';
import ExitDialog from './ExitDialog';
import EditCardInfo from './EditCardInfo';
import { navigateTo } from 'router/navigateTo';
import { purchaseMethodFunc } from 'src/components/pay/versionUpgrade/PurchaseMethodModal';

import './index.less';

const optionsList = [
  { icon: 'icon-edit_17', label: _l('编辑组织名片'), click: 'handleEdit', key: 'editCard' },
  { icon: 'icon-enterprise_tool', label: _l('组织管理'), click: 'handleGoAdmin', key: 'manage' },
  { icon: 'icon-manage', label: _l('我的汇报关系'), click: 'handleRelation', key: 'reportRelation' },
  { icon: 'icon-exit', label: _l('退出组织'), click: 'handleExit', key: 'exit' },
];

export default class EnterpriseCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showItem: false,
      loading: false,
      userInfo: {},
    };
  }

  //card操作权限判断
  formatProjectStatus(item) {
    const PROJECT_STATUS_TYPES = common.PROJECT_STATUS_TYPES;
    const USER_STATUS = common.USER_STATUS;
    const { userStatus, projectStatus } = item;

    let result = {
      buttonState: 'default', //右侧处理类型（review: '待审核‘ | ’open: '开通' | default: '按成员类型展示'）
      editCard: false, //可否编辑
      reportRelation: false, //查看汇报关系
      exit: false, //退出
      manage: false, //管理后台
    };

    if (userStatus === USER_STATUS.UNAUDITED) {
      result.buttonState = 'review';
    } else {
      if (projectStatus === PROJECT_STATUS_TYPES.FREE) {
        result.buttonState = 'open';
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
          closeDialog={() => {
            $('.editInfoEnterprise.mui-dialog-container').parent().remove();
          }}
        />
      ),
    });
  }

  //退出
  handleExit(item) {
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

  // 指定同事
  transferAdminProject = (projectId, companyName, password, type) => {
    Dialog.confirm({
      dialogClasses: 'dialogBoxTransferAdminProject',
      title: _l('提示'),
      noFooter: true,
      children: (
        <ExitDialog
          needTransfer={type === 3}
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
      case 'default':
        return (
          <span className="Gray_9e">
            {card.isProjectAdmin ? (card.isCreateUser ? _l('管理员') + _l('(创建人)') : _l('管理员')) : _l('普通成员')}
          </span>
        );
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
      .fail();
  }

  render() {
    const { showItem, userInfo, loading } = this.state;
    const { departmentInfos = [], jobInfos = [] } = userInfo;
    const { card } = this.props;
    const { currentLicense = {} } = card;
    const parmas = this.formatProjectStatus(card);
    //待开通状态
    const isWaitOpen =
      card.projectStatus === common.PROJECT_STATUS_TYPES.FREE ||
      card.projectStatus === common.PROJECT_STATUS_TYPES.TOPAID;
    return (
      <div className={cx('enterpriseCardItem', { active: showItem })} onClick={e => this.handleChangeShow(e)}>
        <div className="cardItemHeader Hand">
          <div className="cardItemLeft">
            <div className="Font17 Bold mBottom12 Gray">{card.companyName}</div>
            <div className="cardItemInfo">
              <div className={cx('itemTag', isWaitOpen ? 'grayActive' : 'active')}>
                {currentLicense.version ? currentLicense.version.name : _l('免费版')}
              </div>
              <div className="mLeft24 mRight24 itemDivice"></div>
              <div className="Gray_75 hover_blue">
                <ClipboardButton
                  component="span"
                  data-clipboard-text={card.projectCode}
                  onSuccess={this.handleCopyTextSuccess.bind(this)}
                >
                  <span className="childTag">{_l('组织门牌号：%0', card.projectCode)}</span>
                  <span className="icon-content-copy Font12 mLeft5 childTag"></span>
                </ClipboardButton>
              </div>
            </div>
          </div>
          <div className="cardItemRight">
            {this.renderOption(parmas.buttonState)}
            <span className={cx('Font20 mLeft24 Gray_70', showItem ? 'icon-expand_more' : 'icon-navigate_next')}></span>
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
                {optionsList.map((item, index) => {
                  return (
                    <span
                      key={index}
                      className={cx('flexRow mRight40', parmas[item.key] ? 'Hand Gray hover_blue' : 'Gray_9e')}
                      onClick={() => (parmas[item.key] ? this[item.click](userInfo) : null)}
                    >
                      <span className={cx('mRight12 LineHeight20 childTag', item.icon)}></span>
                      {item.key === 'manage' ? (
                        <span className="childTag">{card.hasRole ? item.label : _l('申请管理权限')}</span>
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
