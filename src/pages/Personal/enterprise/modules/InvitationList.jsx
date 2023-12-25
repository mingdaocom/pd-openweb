import React, { Component, Fragment } from 'react';
import account from 'src/api/account';

export default class InvitationList extends Component {
  renderOption(item) {
    switch (item.status) {
      case 0:
        return <li className="Left LineHeight25 TxtLeft mLeft20">{_l('已加入')}</li>;
      case 1:
        return <li className="Left LineHeight25 TxtLeft mLeft20">{_l('已拒绝')}</li>;
      case 2:
        return <li className="Left LineHeight25 TxtLeft mLeft20">{_l('待审批')}</li>;
      case 3:
        return <li className="Left LineHeight25 TxtLeft mLeft20">{_l('加入失败')}</li>;
      case 4:
        return <li className="Left LineHeight25 TxtLeft mLeft20">{_l('已失效')}</li>;
      case 5:
        return <li className="Left LineHeight25 TxtLeft mLeft20">{_l('已退出')}</li>;
      default:
        return (
          <Fragment>
            <li
              className="Left LineHeight25 TxtLeft ThemeColor3 btnForAuthListAdd Hand mLeft20"
              onClick={() => this.handleAdd(item)}
            >
              {_l('加入')}
            </li>
            <li
              className="Left LineHeight25 TxtLeft ThemeColor3 btnForAuthListRefused Hand mLeft20"
              onClick={() => this.handleCancel(item)}
            >
              {_l('拒绝')}
            </li>
          </Fragment>
        );
    }
  }

  handleAdd(item) {
    this.props.updateAuthCount();
    const { projectId, token } = item;
    account.checkJoinProjectByTokenWithCard({ projectId, token }).then(data => {
      switch (data.joinProjectResult) {
        case 1: //验证通过
          location.href = '/enterpriseRegister?type=editInfo&projectId=' + projectId + '&token=' + token;
          break;
        case 3: //已存在
          this.props.existUserNotice(data.userCard.user.status);
          break;
        default:
          alert(_l('操作失败'), 2);
      }
      this.props.closeDialog();
    });
  }

  handleCancel(item) {
    this.props.updateAuthCount();
    const { projectId, token } = item;
    account.refuseJoin({ projectId, token }).then(result => {
      if (result) {
        alert(_l('您已成功拒绝该组织的邀请'));
      } else {
        alert(_l('操作失败'), 2);
      }
      this.props.closeDialog();
    });
  }

  render() {
    const { list = [] } = this.props;
    return (
      <div className="overflowHidden pAll10">
        <span className="Normal Gray14 Left Width250">{_l('组织')}</span>
        <span className="Normal Gray14 Left mLeft20">{_l('操作')}</span>
        <div className="Clear"></div>
        <ul className="pTop10">
          {list.length ? (
            <Fragment>
              {list.map(item => {
                return (
                  <Fragment>
                    <li className="Left LineHeight25 Width250 overflow_ellipsis">{item.companyName}</li>
                    {this.renderOption(item)}
                  </Fragment>
                );
              })}
            </Fragment>
          ) : (
            <li class="Left LineHeight25 w100">{_l('暂无邀请记录！')}</li>
          )}
        </ul>
      </div>
    );
  }
}
