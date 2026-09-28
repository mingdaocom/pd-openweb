import React from 'react';
import { Modal } from 'ming-ui/antd-components';

const DANGER_OK_BUTTON_PROPS = { danger: true };

export default function PublishFail(props) {
  const { name, onCancel, toNode, errorMsgList = [] } = props;
  return (
    <Modal
      open
      title={<span className="Red">{_l('数据同步“%0”发布失败', name)}</span>}
      onCancel={onCancel}
      okText={_l('前往修改')}
      okButtonProps={DANGER_OK_BUTTON_PROPS}
      onOk={id => {
        toNode(id);
      }}
    >
      <div>
        {errorMsgList.map((o, index) => {
          return (
            <div className="mTop16" key={index}>
              <i className="icon-report Font18 Red TxtMiddle"></i>{' '}
              <span className="TxtMiddle textSecondary mLeft8 Font14">{o}</span>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
