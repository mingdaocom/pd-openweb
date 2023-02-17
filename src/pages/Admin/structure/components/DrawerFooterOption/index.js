import React, { Fragment, useState } from 'react';
import { Dialog, Input } from 'ming-ui';
import TransferDialog from '../../modules/dialogHandover';
import RefuseUserJoinDia from '../../modules/refuseUserJoinDia';
import Confirm from 'ming-ui/components/Dialog/Confirm';
import departmentController from 'src/api/department';
import importUserController from 'src/api/importUser';
import userController from 'src/api/user';
import { encrypt } from 'src/util';
import RegExp from 'src/util/expression';
import cx from 'classnames';

export default function DrawerFooterOption(props) {
  const [showRefuseUserJoin, setShowRefuseUserJoin] = useState(false);
  const [resetPasswordShowDialog, setResetPasswordShowDialog] = useState(false);
  const [password, setPassword] = useState('');
  const {
    actType,
    typeCursor,
    isUploading,
    editCurrentUser = {},
    projectId,
    departmentId,
    handleSubmit = () => {},
    saveFn = () => {},
    clickSave = () => {},
    onClose = () => {},
  } = props;

  const { accountId, isDepartmentChargeUser } = editCurrentUser;

  // 离职
  const handleRemoveUserClick = () => {
    TransferDialog({
      accountId,
      projectId,
      user: { ...editCurrentUser },
      success() {
        clickSave();
      },
    });
  };
  // 取消/设为部门负责人
  const setAndCancelCharge = () => {
    departmentController
      .editDepartmentSingleChargeUser({
        projectId,
        departmentId,
        chargeAccountId: accountId,
      })
      .then(res => {
        if (res) {
          alert(_l('设置成功', 1));
          clickSave();
        } else {
          alert(_l('设置失败', 2));
        }
      });
  };
  // 重新邀请
  const reInvite = () => {
    importUserController
      .reInviteImportUser({
        accounts: [accountId],
        projectId,
      })
      .done(function (result) {
        if (result) {
          alert(_l('重新邀请成功'), 1);
          onClose();
        } else {
          alert(_l('重新邀请失败'), 2);
        }
      });
  };

  const renderResetPasswordInfo = () => {
    const { md = {} } = window;
    const { global = {} } = md;
    const { SysSettings = {} } = global;
    const { passwordRegexTip } = SysSettings;
    if (!resetPasswordShowDialog) return;
    return (
      <Dialog
        title={_l('重置密码')}
        okText={_l('保存')}
        cancelText={_l('取消')}
        onCancel={() => setResetPasswordShowDialog(false)}
        onOk={handleSavePassWord}
        visible={resetPasswordShowDialog}
      >
        <div className="Font15 Gray mTop20 mBottom10">{_l('请输入新密码')}</div>
        <Input
          className="w100"
          type="password"
          autocomplete="new-password"
          value={password}
          placeholder={passwordRegexTip || _l('密码，8-20位，必须含字母+数字')}
          onChange={value => setPassword(value)}
        />
      </Dialog>
    );
  };

  const handleSavePassWord = () => {
    const { passwordRegexTip, passwordRegex } = _.get(window, 'md.global.SysSettings') || {};
    if (_.isEmpty(password)) {
      alert(_l('请输入新密码'), 3);
      return;
    } else if (!RegExp.isPasswordRule(password, passwordRegex)) {
      alert(passwordRegexTip || _l('密码过于简单，至少8~20位且含字母+数字'), 3);
      return;
    }
    userController
      .resetPassword({
        projectId,
        accountId,
        password: encrypt(password),
      })
      .then(result => {
        if (result) {
          alert(_l('修改成功'), 1);
          setPassword(false);
          setResetPasswordShowDialog(false);
          onClose();
        } else {
          alert(_l('修改失败'), 2);
        }
      });
  };

  return (
    <Fragment>
      {typeCursor === 0 && actType === 'add' && (
        <div className="btnGroups">
          <a
            className="btnBootstrap addBtn"
            href="javascript:void(0);"
            disabled={isUploading}
            onClick={() => handleSubmit()}
          >
            {_l('添加')}
          </a>
          <a
            className="btnBootstrap mLeft8 addContinueBtn"
            href="javascript:void(0);"
            disabled={isUploading}
            onClick={() => handleSubmit(true)}
          >
            {_l('继续添加')}
          </a>
          <span
            className="Hand cancelBtn mLeft8"
            onClick={() => {
              onClose(true);
            }}
          >
            {_l('取消')}
          </span>
        </div>
      )}
      {(typeCursor === 0 || typeCursor === 1) && actType !== 'add' && (
        <div className="btnGroups flexRow">
          <div className="flex">
            <a
              className={cx('btnBootstrap addBtn', { disabledBtn: isUploading })}
              href="javascript:void(0);"
              disabled={isUploading}
              onClick={() => {
                if (isUploading) {
                  return;
                }
                saveFn();
              }}
            >
              {_l('保存')}
            </a>
            <span
              className="Hand cancelBtn mLeft8"
              onClick={() => {
                onClose(true);
              }}
            >
              {_l('取消')}
            </span>
          </div>
          {md.global.Config.IsLocal && !md.global.Config.IsPlatformLocal && (
            <span className="Hand normalBtn mRight8" onClick={() => setResetPasswordShowDialog(true)}>
              {_l('重置密码')}
            </span>
          )}

          {!departmentId ? (
            ''
          ) : (
            <span className="Hand normalBtn" onClick={setAndCancelCharge}>
              {isDepartmentChargeUser ? _l('取消部门负责人') : _l('设为部门负责人')}
            </span>
          )}
          {editCurrentUser.accountId !== md.global.Account.accountId && (
            <div className="resign Hand mLeft8" onClick={handleRemoveUserClick}>
              {_l('离职')}
            </div>
          )}
        </div>
      )}
      {typeCursor === 2 && (
        <div className="btnGroups flexRow">
          <div className="flex">
            <a className="btnBootstrap addBtn" href="javascript:void(0);" onClick={reInvite}>
              {_l('重新邀请')}
            </a>
            <span className="Hand cancelBtn mLeft8" onClick={onClose}>
              {_l('取消')}
            </span>
          </div>
          <span
            className="Hand normalBtn"
            onClick={() => {
              Confirm({
                className: 'deleteNodeConfirm',
                title: _l('确认取消邀请该用户吗'),
                description: '',
                okText: _l('确定'),
                onOk: () => {
                  importUserController
                    .cancelImportUser({
                      accounts: [accountId],
                      projectId,
                    })
                    .done(function (result) {
                      if (result) {
                        clickSave();
                      } else {
                        alert(_l('取消失败'), 2);
                      }
                    });
                },
              });
            }}
          >
            {_l('取消邀请并移除')}
          </span>
        </div>
      )}
      {typeCursor === 3 && (
        <div className="btnGroups flexRow">
          <div className="flex">
            <span className="btnBootstrap addBtn" onClick={props.agreeJoin}>
              {_l('批准加入')}
            </span>
            <span
              className="Hand cancelBtn mLeft8"
              onClick={() => {
                onClose(true);
              }}
            >
              {_l('取消')}
            </span>
          </div>
          {editCurrentUser.status !== 2 && (
            <span className="Hand normalBtn" onClick={() => setShowRefuseUserJoin(true)}>
              {_l('拒绝')}
            </span>
          )}
        </div>
      )}

      {showRefuseUserJoin && (
        <RefuseUserJoinDia
          key={`RefuseUserJoinDia_${accountId}`}
          showDialog={showRefuseUserJoin}
          accountId={accountId}
          projectId={projectId}
          setValue={({ isOk = false }) => {
            if (isOk) {
              setShowRefuseUserJoin(false);
              clickSave();
            }
          }}
        />
      )}
      {resetPasswordShowDialog && renderResetPasswordInfo()}
    </Fragment>
  );
}
