import React, { Fragment, useRef, useState } from 'react';
import { Modal } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import userController from 'src/api/user';
import WorkHandoverDialog from 'src/pages/Admin/components/WorkHandoverDialog';

const CHECK_RESULTS = {
  FAILED: 0,
  SUCCESS: 1,
  NEEDTRANSFER: 2,
  NOAUTHORITY: 3,
};

export default function HandoverDialogCom(props) {
  const { accountId, projectId, user = {}, success = () => {}, onCancel = () => {} } = props;
  const [showWorkHandover, setShowWorkHandover] = useState(false);
  const requestPending = useRef(false);

  const confirmHandover = () => {
    if (requestPending.current) return;

    requestPending.current = true;
    return userController
      .removeUser({
        accountId,
        projectId,
      })
      .then(result => {
        if (result === CHECK_RESULTS.NEEDTRANSFER) {
          setShowWorkHandover(true);
        } else if (result === CHECK_RESULTS.SUCCESS) {
          onCancel();
          success();
        } else if (result === CHECK_RESULTS.NOAUTHORITY) {
          alert(_l('暂无权限'), 2);
        } else {
          alert(_l('操作失败, 请确认是否有足够权限移除用户'), 2);
        }
      })
      .finally(() => {
        requestPending.current = false;
      });
  };

  return (
    <Fragment>
      <Modal
        width={520}
        open
        mask={{ closable: true }}
        keyboard
        title={_l('是否确认将员工【%0】离职？', user.fullname)}
        okText={_l('确认离职')}
        okButtonProps={{ danger: true }}
        onOk={confirmHandover}
        onCancel={onCancel}
      >
        <div>
          <div>
            <span className="bold">{_l('建议 “交接工作” 后离职，')}</span>
            <span>{_l('避免工作中断和延误。')}</span>
          </div>
          <div>{_l('成功离职后，也可以在 “离职交接” 中交接工作。')}</div>
        </div>
      </Modal>

      {showWorkHandover && (
        <WorkHandoverDialog
          visible={showWorkHandover}
          projectId={projectId}
          transferor={user}
          onCancel={() => setShowWorkHandover(false)}
        />
      )}
    </Fragment>
  );
}

export function useHandoverDialog() {
  return useFunctionWrapComponent(HandoverDialogCom);
}
