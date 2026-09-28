import React from 'react';
import { Icon } from 'ming-ui';
import { Button, Modal } from 'ming-ui/antd-components';
import MoreOption from './MoreOption';

export default function CustomBtnMoreOption({
  item,
  isDisabled,
  visible,
  setFn,
  onCopy,
  onDelete,
  onToggleEnable,
  onVisibleChange,
}) {
  const handleCopy = () => {
    return Modal.confirm({
      title: <span className="WordBreak Block">{_l('复制自定义动作“%0”', item.name)}</span>,
      content: _l('将复制该自定义动作及其对应工作流，复制后的工作流与原工作流配置一致'),
      onOk: onCopy,
    }).destroy;
  };

  return (
    <MoreOption
      open={visible}
      placement="bottomRight"
      onOpenChange={onVisibleChange}
      showCopy
      onCopy={handleCopy}
      disabledRename={isDisabled}
      showDisabledRename
      showEnableSwitch
      disabled={isDisabled}
      onToggleEnable={onToggleEnable}
      delTxt={_l('删除')}
      description={_l('动作将被删除，请确认执行此操作')}
      setFn={setFn}
      deleteFn={onDelete}
    >
      <Button
        color="default"
        variant="text"
        size="small"
        icon={<Icon icon="more_horiz" />}
        onClick={e => {
          e.stopPropagation();
        }}
      />
    </MoreOption>
  );
}
