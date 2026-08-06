import React from 'react';
import Trigger from 'rc-trigger';
import { Dialog, Icon } from 'ming-ui';
import MoreOption from './MoreOption';
import './MoreOption.less';

const confirm = Dialog.confirm;

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
    return confirm({
      title: <span className="WordBreak Block">{_l('复制自定义动作“%0”', item.name)}</span>,
      onOk: onCopy,
    });
  };

  return (
    <Trigger
      popupVisible={visible}
      action={['click']}
      popupAlign={{
        points: ['tr', 'br'],
        offset: [0, 10],
        overflow: { adjustX: true, adjustY: true },
      }}
      getPopupContainer={() => document.body}
      onPopupVisibleChange={onVisibleChange}
      popup={
        <MoreOption
          showCopy
          onCopy={handleCopy}
          disabledRename={isDisabled}
          showDisabledRename
          showEnableSwitch
          disabled={isDisabled}
          onToggleEnable={onToggleEnable}
          delTxt={_l('删除')}
          description={_l('动作将被删除，请确认执行此操作')}
          showMoreOption={visible}
          onClickAwayExceptions={[]}
          onClickAway={() => onVisibleChange(false)}
          setFn={setFn}
          deleteFn={onDelete}
        />
      }
    >
      <Icon
        icon="more_horiz"
        className="moreActive Hand Font18 textTertiary hoverColorPrimary"
        onClick={e => {
          e.stopPropagation();
          onVisibleChange(true);
        }}
      />
    </Trigger>
  );
}
