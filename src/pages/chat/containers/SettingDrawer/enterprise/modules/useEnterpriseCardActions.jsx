import React, { useCallback, useMemo } from 'react';
import { navigateTo } from 'router/navigation/navigateTo';
import { Icon, VerifyPasswordConfirm } from 'ming-ui';
import { Modal } from 'ming-ui/antd-components';
import account from 'src/api/account';
import projectAjax from 'src/api/project';
import roleAjax from 'src/api/role';
import { purchaseMethodFunc } from 'src/components/pay/versionUpgrade/PurchaseMethodModal';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import ExitDialog from './ExitDialog';
import ValidPassword from './ValidPassword';

const noop = () => {};

export default function useEnterpriseCardActions({ card, getData = noop, onEdit = noop, onOpenReportRelation = noop }) {
  const handleEdit = useCallback(item => onEdit(item), [onEdit]);

  const exitProject = useCallback(projectId => {
    account.exitProject({ projectId }).then(res => {
      if (res === 1) alert(_l('退出成功'));
    });
  }, []);

  const onCancelExit = useCallback((item, closeProject) => {
    if (closeProject) navigateTo(`/admin/sysinfo/${item.projectId}`);
  }, []);

  const onOkExit = useCallback(
    (item, isLastSuperAdmin, isClose) => {
      if (!isLastSuperAdmin) {
        exitProject(item.projectId);
        getData();
        return null;
      }

      if (isClose) {
        VerifyPasswordConfirm.confirm({
          onOk: () => {
            exitProject(item.projectId);
            getData();
          },
        });
        return null;
      }

      navigateTo(
        card.effectiveUserCount > 1 ? `/admin/sysroles/${item.projectId}` : `/admin/sysinfo/${item.projectId}`,
      );
    },
    [card.effectiveUserCount, exitProject, getData],
  );

  const transferAdminProject = useCallback(
    function openTransferModal(projectId, companyName, password, type) {
      const needTransfer = type === 3;
      let modal;

      modal = Modal.info({
        centered: true,
        className: 'dialogBoxTransferAdminProject',
        closable: true,
        content: (
          <ExitDialog
            needTransfer={needTransfer}
            companyName={companyName}
            projectId={projectId}
            password={password}
            closeDialog={() => modal.destroy()}
            transferAdminProject={openTransferModal}
            getData={getData}
          />
        ),
        footer: null,
        title: needTransfer ? _l('您是组织：%0 中唯一一个管理员', companyName) : _l('退出组织：%0', companyName),
      });

      return modal;
    },
    [getData],
  );

  const handleNormalUserExit = useCallback(
    item => {
      ValidPassword.confirm({
        projectId: item.projectId,
        companyName: item.companyName,
        transferAdminProject,
      });
    },
    [transferAdminProject],
  );

  const handleExit = useCallback(
    async (item, isClose) => {
      const isLastSuperAdmin = await roleAjax.isLastSuperAdmin({ projectId: item.projectId });
      const hasOtherUser = card.effectiveUserCount > 1;

      if (!isClose && !isLastSuperAdmin) return handleNormalUserExit(item);

      let content = null;

      if (isLastSuperAdmin && isClose) {
        content = _l('您一旦退出后，将没有人可以再恢复组织');
      } else if (isLastSuperAdmin && !isClose) {
        content = hasOtherUser
          ? _l(
              '当前组织内有其他 %0 个用户，为避免您退出后组织无法正常使用，请添加其他超级管理员后再退出组织。如果您已确定不需要使用此组织，可以选择关闭组织',
              card.effectiveUserCount - 1,
            )
          : _l('当前组织内有其他 0 个用户。如果您已不需要使用此组织，可以选择关闭组织');
      }

      let modal;

      modal = Modal.confirm({
        title: isLastSuperAdmin
          ? _l('您是组织：%0  中唯一一个超级管理员', item.companyName)
          : _l('退出组织：%0', item.companyName),
        content,
        className: 'dialogBoxValidate',
        closeIcon: (
          <Icon
            icon="close"
            className="textTertiary Font22"
            onClick={event => {
              event.stopPropagation();
              modal.destroy();
            }}
          />
        ),
        keyboard: false,
        okButtonProps: { danger: !!isClose },
        okText: !isClose && isLastSuperAdmin ? (hasOtherUser ? _l('添加超级管理员') : _l('关闭组织')) : _l('退出组织'),
        cancelText: !isClose && isLastSuperAdmin && hasOtherUser ? _l('关闭组织') : _l('取消'),
        cancelButtonProps: {
          style: { display: !isClose && isLastSuperAdmin && !hasOtherUser ? 'none' : undefined },
        },
        onOk: () => onOkExit(item, isLastSuperAdmin, isClose),
        onCancel: () => onCancelExit(item, !isClose && isLastSuperAdmin && hasOtherUser),
      });

      return modal;
    },
    [card.effectiveUserCount, handleNormalUserExit, onCancelExit, onOkExit],
  );

  const handleRelation = useCallback(
    item => {
      onOpenReportRelation(item.projectId);
    },
    [onOpenReportRelation],
  );

  const handleGoAdmin = useCallback(item => {
    window.location.href = pathCompletion('/admin/home/' + item.projectId);
  }, []);

  const cancelApplication = useCallback(
    item => {
      Modal.confirm({
        title: _l('取消申请'),
        onOk: () => {
          account.revokedJoinProject({ projectId: item.projectId }).then(res => {
            getData();
            if (res) {
              alert(_l('取消成功'));
            } else {
              alert(_l('取消失败'), 2);
            }
          });
        },
      });
    },
    [getData],
  );

  const handleOpenCard = useCallback(item => {
    purchaseMethodFunc({ projectId: item.projectId });
  }, []);

  const handleReview = useCallback(item => {
    account
      .sendSystemMessageToAdmin({
        projectId: item.projectId,
        msgType: 1,
      })
      .then(result => {
        if (result) {
          alert(_l('已提醒管理员审核'));
        } else {
          alert(_l('操作失败'), 2);
        }
      })
      .catch(noop);
  }, []);

  const handleRecover = useCallback(
    item => {
      Modal.confirm({
        title: _l('恢复组织：%0', item.companyName),
        okText: _l('恢复组织'),
        content: (
          <span className="Font14 textSecondary">
            {_l('关闭超过90天的组织，所有应用已自动进入回收站，进入回收站60天后，所有应用会被彻底物理删除')}
          </span>
        ),
        onOk: () => {
          projectAjax.recoverProject({ projectId: item.projectId }).then(res => {
            if (res) {
              alert(_l('恢复组织成功'));
              getData();
            } else {
              alert(_l('恢复组织失败'), 2);
            }
          });
        },
      });
    },
    [getData],
  );

  return useMemo(
    () => ({
      cancelApplication,
      handleEdit,
      handleExit,
      handleGoAdmin,
      handleOpenCard,
      handleRecover,
      handleRelation,
      handleReview,
      transferAdminProject,
    }),
    [
      cancelApplication,
      handleEdit,
      handleExit,
      handleGoAdmin,
      handleOpenCard,
      handleRecover,
      handleRelation,
      handleReview,
      transferAdminProject,
    ],
  );
}
