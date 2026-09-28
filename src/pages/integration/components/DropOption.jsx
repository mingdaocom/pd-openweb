import React from 'react';
import { useSetState } from 'react-use';
import { Dropdown } from 'ming-ui/antd-components';

export default function DropOption(props) {
  const { forGroup } = props;
  const [{ popupVisible }, setState] = useSetState({
    popupVisible: props.popupVisible,
  });
  const getItem = ({ text, value, disabled, getTime = () => {} }) => ({
    key: value,
    disabled,
    label: (
      <div className="flexRow">
        <span className="viewName flex">{text}</span>
        {forGroup && <span className="textSecondary">{getTime()}</span>}
      </div>
    ),
    onClick: () => {
      if (value !== props.value) {
        props.handleChangeType(value);
      }

      setState({ popupVisible: false });
    },
  });
  const menuItems = [];

  if (forGroup) {
    const firstCollectionIndex = props.list.findIndex(item => ['TIME', 'CUR_MINUTE'].includes(item.value));
    const splitIndex = firstCollectionIndex === -1 ? props.list.length - 1 : firstCollectionIndex;
    menuItems.push({
      key: 'time',
      type: 'group',
      label: _l('时间'),
      children: props.list.slice(0, splitIndex + 1).map(getItem),
    });
    menuItems.push({
      key: 'collection',
      type: 'group',
      label: _l('集合'),
      children: props.list.slice(splitIndex + 1).map(getItem),
    });
  } else {
    menuItems.push(...props.list.map(getItem));
  }

  menuItems.push(
    { key: 'renameDivider', type: 'divider' },
    {
      key: 'rename',
      label: _l('重命名'),
      onClick: ({ domEvent }) => {
        props.handleOpenChangeName();
        setState({ popupVisible: false });
        domEvent.stopPropagation();
      },
    },
  );

  return (
    <Dropdown
      trigger={['click']}
      placement={forGroup ? 'topRight' : 'bottomRight'}
      getPopupContainer={() => document.body}
      open={popupVisible}
      onOpenChange={(popupVisible, { source }) => {
        if (!props.value && !popupVisible && source !== 'menu') {
          return alert(_l('请选择类型'), 3);
        }

        setState({ popupVisible });
      }}
      menu={{
        items: menuItems,
        selectedKeys: [props.value],
        style: { width: 200 },
      }}
    >
      <i className="icon icon-expand_more InlineBlock Hand Font16 mLeft10"></i>
    </Dropdown>
  );
}
