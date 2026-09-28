import React from 'react';
import styled from 'styled-components';
import { UserHead } from 'ming-ui';
import { Button, Modal } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import userController from 'src/api/user';
import UserCountLimitLink from 'src/pages/Admin/user/membersDepartments/UserCountLimitLink';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { feedbackTypes } from '../../constant';
import { useRefuseUserJoinDialog } from '../refuseUserJoinDia';

const FeedbackDialog = styled(Modal)`
  .footer {
    text-align: right;
  }
`;

// 恢复权限
const recovery = ({ accountId, fullname, projectId, callback = () => {} }) => {
  Modal.confirm({
    title: _l('确定恢复 %0 权限吗？', fullname),
    onOk: () => {
      userController
        .recoveryUser({
          accountId,
          projectId,
        })
        .then(data => {
          if (data == 1) {
            alert(_l('恢复成功'));
            callback();
          } else if (data == 4) {
            alert(<UserCountLimitLink projectId={projectId} />, 3);
          } else {
            alert(_l('恢复失败'), 2);
          }
        });
    },
  });
};

// 批准加入
const agreeJoin = ({ projectId, accountId, jobIds, departmentIds, workSiteId, jobNumber, contactPhone, callback }) => {
  userController
    .agreeUserJoin({
      projectId,
      accountId,
      jobIds,
      departmentIds,
      workSiteId,
      jobNumber,
      contactPhone,
    })
    .then(
      result => {
        if (result === 1) {
          alert(_l('批准成功'));
          callback();
        } else if (result === 4) {
          alert(<UserCountLimitLink projectId={projectId} />, 3);
        } else {
          alert(_l('操作失败'), 2);
        }
      },
      _requestError => {
        alertIfNotUnauthorized(_requestError, _l('操作失败'), 2);
      },
    );
};

// 移动部门
const handleMoveDepartment = ({
  projectId,
  accountId,
  jobIds = [],
  departmentIds = [],
  jobNumber,
  workSiteId,
  contactPhone,
  userName,
  fullname,
  email,
  mobilePhone,
  companyName,
  currentDepartmentId,
  action,
  callback = () => {},
}) => {
  departmentIds = action === 'move' ? [currentDepartmentId] : departmentIds.concat(currentDepartmentId);
  if (window.platformENV.isPlatform) {
    userController
      .updateUserCard({
        projectId,
        accountId,
        jobIds,
        departmentIds,
        jobNumber,
        contactPhone,
        workSiteId,
      })
      .then(
        result => {
          if (result === 1) {
            alert(_l('设置成功'), 1);
            callback();
          } else {
            alert(_l('设置失败'), 2);
          }
        },
        _requestError3 => {
          alertIfNotUnauthorized(_requestError3, _l('设置失败'), 2);
        },
      );
  } else {
    const params = {
      accountId,
      companyName,
      departmentIds,
      email,
      fullname: userName || fullname,
      jobIds,
      jobNumber,
      mobilePhone,
      projectId,
      workSiteId,
      contactPhone,
    };

    userController.updateUser(params).then(
      result => {
        if (result === 1) {
          alert(_l('设置成功'), 1);
          callback();
        } else {
          alert(_l('设置失败'), 2);
        }
      },
      _requestError2 => {
        alertIfNotUnauthorized(_requestError2, _l('设置失败'), 2);
      },
    );
  }
};

function AddUserFeedback(props) {
  const { open: openRefuseUserJoinDialog, holder: refuseUserJoinDialogHolder } = useRefuseUserJoinDialog();
  const {
    visible,
    actionResult,
    closeDrawer = () => {},
    projectId,
    currentUser = {},
    refreshData = () => {},
    hideMask = () => {},
  } = props;
  const {
    accountId,
    avatar,
    fullname,
    mobile,
    email,
    jobIds = [],
    departmentIds = [],
    workSiteId,
    jobNumber,
    contactPhone,
  } = currentUser;

  const onCancel = () => {
    hideMask();
    props.onCancel();
  };

  const renderFooter = actionResult => {
    const { departmentId } = props;

    switch (actionResult) {
      case 2:
        return departmentId ? (
          <div className="footer">
            <Button
              color="primary"
              variant="link"
              onClick={() => {
                handleMoveDepartment({
                  ...currentUser,
                  projectId,
                  currentDepartmentId: departmentId,
                  action: 'move',
                  callback: () => {
                    onCancel();
                    refreshData();
                    closeDrawer();
                  },
                });
              }}
            >
              {_l('移动到当前部门')}
            </Button>
            <Button
              type="primary"
              className="mLeft16"
              onClick={() => {
                handleMoveDepartment({
                  ...currentUser,
                  projectId,
                  currentDepartmentId: departmentId,
                  action: 'copy',
                  callback: () => {
                    onCancel();
                    refreshData();
                    closeDrawer();
                  },
                });
              }}
            >
              {_l('复制到当前部门')}
            </Button>
          </div>
        ) : (
          <div className="footer">
            <Button
              color="primary"
              variant="link"
              onClick={() => {
                props.reviewUserInfo();
                onCancel();
              }}
            >
              {_l('查看')}
            </Button>
            <Button type="primary" className="mLeft16" onClick={onCancel}>
              {_l('关闭')}
            </Button>
          </div>
        );
      case 3:
        return (
          <div className="footer">
            <Button
              color="primary"
              variant="link"
              onClick={() => {
                Modal.confirm({
                  className: 'deleteNodeConfirm',
                  title: <span className="textError">{_l('确认取消邀请该用户吗')}</span>,
                  content: '',
                  okText: _l('确定'),
                  onOk: () => {
                    props.fetchCancelImportUser([accountId], () => {
                      onCancel();
                      closeDrawer();
                    });
                  },
                });
              }}
            >
              {_l('取消邀请并移除')}
            </Button>
            <Button
              type="primary"
              className="mLeft16"
              onClick={() => {
                props.fetchReInvite([accountId], () => {
                  onCancel();
                  closeDrawer();
                });
              }}
            >
              {_l('重新邀请')}
            </Button>
          </div>
        );
      case 4:
      case 7:
        return (
          <div className="footer">
            {actionResult !== 7 && (
              <Button
                color="primary"
                variant="link"
                onClick={() =>
                  openRefuseUserJoinDialog({
                    accountIds: [accountId],
                    projectId,
                    callback: () => {
                      onCancel();
                      refreshData();
                      closeDrawer();
                    },
                  })
                }
              >
                {_l('拒绝')}
              </Button>
            )}
            <Button
              type="primary"
              className="mLeft16"
              onClick={() =>
                agreeJoin({
                  projectId,
                  accountId,
                  jobIds,
                  departmentIds,
                  workSiteId,
                  jobNumber,
                  contactPhone,
                  callback: onCancel,
                })
              }
            >
              {_l('同意')}
            </Button>
          </div>
        );
      case 5:
        return (
          <div className="footer">
            <Button
              type="primary"
              onClick={() =>
                recovery({
                  projectId,
                  fullname,
                  accountId,
                  callback: () => {
                    onCancel();
                    closeDrawer();
                    refreshData();
                  },
                })
              }
            >
              {_l('恢复权限')}
            </Button>
          </div>
        );
      case 6:
        return (
          <div className="footer">
            <Button
              color="primary"
              variant="link"
              onClick={() => {
                props.reviewUserInfo();
                onCancel();
              }}
            >
              {_l('查看')}
            </Button>
            <Button type="primary" className="mLeft16" onClick={onCancel}>
              {_l('关闭')}
            </Button>
          </div>
        );

      default:
    }
  };

  if (!actionResult) return;

  return (
    <FeedbackDialog
      open={visible}
      mask={{ closable: true }}
      keyboard
      width={410}
      title={<div className="Font17 textPrimary bold">{feedbackTypes[actionResult]}</div>}
      onCancel={onCancel}
      footer={null}
    >
      {refuseUserJoinDialogHolder}
      <div className="flexRow mTop16">
        <UserHead
          className="createHeadImg circle userAvarar pointer userMessage"
          user={{
            userHead: avatar,
            accountId,
          }}
          size={40}
          projectId={projectId}
        />
        <div className="mLeft12 mBottom50">
          <div className="Font15 textPrimary bold">{fullname}</div>
          <div className="Font13 textSecondary">{email}</div>
          <div className="Font13 textSecondary">{mobile}</div>
        </div>
      </div>
      {renderFooter(actionResult)}
    </FeedbackDialog>
  );
}

export function useAddUserFeedback() {
  return useFunctionWrapComponent(AddUserFeedback);
}
