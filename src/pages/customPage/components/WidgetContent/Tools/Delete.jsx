import React from 'react';
import _ from 'lodash';
import { DeleteReconfirm as DeleteConfirm, Modal } from 'ming-ui/antd-components';

export default props => {
  const { widgetType, widget, allComponents, handleToolClick, handleUpdateDropdownVisible, renderItem } = props;

  if (['tabs', 'card'].includes(widgetType)) {
    const { componentConfig = {} } = widget;

    const handleDeleteConfirm = () => {
      handleUpdateDropdownVisible(false);
      const relevance = allComponents.filter(c => c.sectionId === _.get(widget, 'config.objectId'));
      const name = ['tabs'].includes(widgetType) ? _l('标签') : _l('容器');

      if (!relevance.length) {
        handleToolClick('delTabsWidget');
        return;
      }

      DeleteConfirm({
        title: _l('删除 “%0”', componentConfig.name),
        description: (
          <div>
            <span style={{ color: 'var(--color-text-title)', fontWeight: 'bold' }}>
              {_l('注意:%0下所有配置和数据将被删除。', name)}
            </span>
            {_l('请务必确认所有应用成员都不再需要此%0后, 再执行此操作。', name)}
          </div>
        ),
        data: [{ text: _l('我确认删除%0和所有数据', name), value: 1 }],
        onOk: () => {
          handleToolClick('delTabsWidget');
        },
      });
    };

    return renderItem({ onClick: handleDeleteConfirm });
  } else {
    const handleDeleteConfirm = () => {
      handleUpdateDropdownVisible(false);
      Modal.confirm({
        title: _l('删除组件'),
        content: _l('确定要删除此组件？'),
        okText: _l('删除'),
        okButtonProps: { danger: true },
        onOk: () => handleToolClick('del'),
      });
    };

    return renderItem({ onClick: handleDeleteConfirm });
  }
};
