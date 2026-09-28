import React from 'react';
import { Icon } from 'ming-ui';
import { Modal, Tooltip } from 'ming-ui/antd-components';

export default function ChangedIcon(props) {
  const { onOk = () => {}, skipConfirm = false } = props;

  const handleClick = () => {
    if (skipConfirm) {
      onOk();
      return;
    }

    Modal.confirm({
      title: _l('你确定重置显示列吗？'),
      content: _l('显示顺序与表单字段保持一致（显示前50个）'),
      okText: _l('确定'),
      cancelText: _l('取消'),
      onOk,
    });
  };

  return (
    <button className="iconButton textTertiary hoverColorPrimary" onClick={handleClick}>
      <Tooltip title={_l('重置')} placement="bottom">
        <Icon icon="loop" className="Font20" />
      </Tooltip>
    </button>
  );
}
