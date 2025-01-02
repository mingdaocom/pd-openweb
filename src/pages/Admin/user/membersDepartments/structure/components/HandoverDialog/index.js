import React, { Fragment, useState } from 'react';
import { Dialog, Button } from 'ming-ui';
import FunctionWrap from 'ming-ui/components/FunctionWrap';
import WorkHandoverDialog from 'src/pages/Admin/components/WorkHandoverDialog';
import userController from 'src/api/user';
import styled from 'styled-components';

const DialogWrap = styled(Dialog)`
  .footer {
    margin-top: 65px;
    align-items: center;
  }
`;

const CHECK_RESULTS = {
  FAILED: 0,
  SUCCESS: 1,
  NEEDTRANSFER: 2,
  NOAUTHORITY: 3,
};

export default function HandoverDialogCom(props) {
  const { accountId, projectId, user = {}, success = () => {}, onCancel = () => {} } = props;
  const [showWorkHandover, setShowWorkHandover] = useState(false);

  const confirmHandover = () => {
    userController
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
      });
  };

  return (
    <Fragment>
      <DialogWrap
        width={520}
        visible
        title={_l('是否确认将员工【%0】离职？', user.fullname)}
        footer={null}
        onCancel={onCancel}
      >
        <div>
          <div>
            <span className="bold">{_l('建议 “交接工作” 后离职，')}</span>
            <span>{_l('避免工作中断和延误。')}</span>
          </div>
          <div>{_l('成功离职后，也可以在 “离职交接” 中交接工作。')}</div>
        </div>
        <div className="footer flexRow">
          {/* <div className="ThemeColor Hand" onClick={() => setShowWorkHandover(true)}>
            {_l('交接工作')}
          </div> */}
          <div className="flex"></div>
          <Button type="link" onClick={onCancel} className="mRight16">
            {_l('取消')}
          </Button>
          <Button type="danger" onClick={confirmHandover}>
            {_l('确认离职')}
          </Button>
        </div>
      </DialogWrap>

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

export const handoverDialog = props => FunctionWrap(HandoverDialogCom, props);
