import React from 'react';
import PropTypes from 'prop-types';
import { Button, ScrollView, Dialog } from 'ming-ui';
import UserHead from 'src/pages/feed/components/userHead';
import { rolePropType } from '../config';
import ApplyAction from './ApplyAction';

import Ajax from 'src/api/appManagement';

import styles from './style.less?module';

export default class extends React.PureComponent {
  static propTypes = {
    onCancel: PropTypes.func.isRequired,
    roles: PropTypes.arrayOf(rolePropType),
    applyList: PropTypes.arrayOf(PropTypes.shape({})),
  };

  state = {
    applyList: this.props.applyList,
  };

  changeApplyStatus = params => {
    const status = params.role ? 2 : 3;
    const roleId = params.role && params.role.roleId;
    Ajax.editAppApplyStatus({ ...params, status, roleId }).then(res => {
      if (res) {
        this.setState(prevState => {
          return {
            applyList: _.map(prevState.applyList, apply => {
              if (params.id === apply.id) {
                return {
                  ...apply,
                  status,
                  role: params.role,
                };
              }
              return apply;
            }),
          };
        });
      }
    });
  };

  renderAction({ status, id, appId, currentRole }) {
    const { roles } = this.props;

    if (status === 1) {
      return (
        <div className={styles.applyAction}>
          <ApplyAction
            roles={roles}
            getPopupContainer={() => {
              return (this.scrollView && this.scrollView.content) || document.body;
            }}
            onChange={role => {
              this.changeApplyStatus({
                appId,
                id,
                role,
              });
            }}
          />
          <span
            className={styles.rejectAction + ' Hand'}
            onClick={() => {
              this.changeApplyStatus({
                appId,
                id,
              });
            }}
          >
            {_l('拒绝')}
          </span>
        </div>
      );
    } else if (status === 2) {
      return (
        <div className={styles.applyAction}>
          <span className="ThemeColor3">
            <span className="TxtMiddle InlineBlock ellipsis" style={{ maxWidth: 130 }}>
              {_l('已设为%0', currentRole.name)}
            </span>
          </span>
        </div>
      );
    } else {
      return <div className={styles.applyAction + ' Gray_9e'}>{_l('已拒绝')}</div>;
    }
  }

  renderList() {
    const { applyList } = this.state;

    return (
      <ScrollView
        className={styles.roleApplyScrollView}
        ref={scrollView => {
          this.scrollView = scrollView;
        }}
      >
        {_.map(applyList, ({ id, appId, status, remark, accountInfo: user, role: currentRole }) => {
          return (
            <div className={styles.roleApplyRecord} key={id}>
              <div className={styles.applyUser}>
                <UserHead
                  key={user.accountId}
                  size={26}
                  user={{
                    ...user,
                    userHead: user.avatar,
                  }}
                  className={styles.roleAvatar}
                />
                <div className={styles.memberName}>{user.fullName}</div>
              </div>
              <div className={styles.applyRemark} title={remark}>
                {remark}
              </div>
              {this.renderAction({
                status,
                appId,
                id,
                currentRole,
              })}
            </div>
          );
        })}
      </ScrollView>
    );
  }

  renderContent() {
    return (
      <React.Fragment>
        <div className={styles.roleApplyHeader + ' Gray'}>
          <div className={styles.titleName}>{_l('申请人')}</div>
          <div className={styles.titleMessage}>{_l('申请说明')}</div>
          <div className={styles.titleAction}>{_l('操作')}</div>
        </div>
        {this.renderList()}
      </React.Fragment>
    );
  }

  render() {
    const { onCancel } = this.props;
    const dialogProps = {
      title: _l('申请管理'),
      visible: true,
      width: 640,
      className: styles.roleApplyDialog,
      onCancel,
      footer: (
        <div className="TxtRight">
          <Button onClick={onCancel}>{_l('关闭')}</Button>
        </div>
      ),
    };

    return <Dialog {...dialogProps}>{this.renderContent()}</Dialog>;
  }
}
