import React from 'react';
import { useToggle } from 'react-use';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import DeleteConfirm from 'ming-ui/components/DeleteReconfirm';

const DelVerify = styled.div`
  box-sizing: border-box;
  width: 240px;
  background-color: #fff;
  padding: 16px;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
  p {
    margin: 0;
    font-size: 14px;
    font-weight: bold;
  }
  .delComponent {
    margin-top: 20px;
    text-align: right;
    color: #f44336;
    cursor: pointer;
  }
  .btnGroup {
    text-align: right;
    margin-top: 16px;
    cursor: pointer;
    span {
      color: #9e9e9e;
    }
    .cancel {
    }
    .del {
      margin-left: 12px;
      background-color: #f44336;
      color: #fff;
      padding: 6px 12px;
      border-radius: 3px;
      text-align: center;
      line-height: 36px;
      &:hover {
        background-color: #ba160a;
      }
    }
  }
`;

export default props => {
  const { widgetType, widget, toolItem, allComponents, handleToolClick, renderItem } = props;
  const { type } = toolItem;
  const [visible, toggle] = useToggle(false);

  if (['tabs', 'card'].includes(widgetType)) {
    const { componentConfig = {} } = widget;
    const handleDeleteConfirm = () => {
      const relevance = allComponents.filter(c => c.sectionId === _.get(widget, 'config.objectId'));
      const name = ['tabs'].includes(widgetType) ? _l('标签') : _l('容器');
      if (!relevance.length) {
        handleToolClick('delTabsWidget');
        return;
      }
      DeleteConfirm({
        clickOmitText: true,
        title: <div className="Bold">{_l('删除 “%0”', componentConfig.name)}</div>,
        description: (
          <div>
            <span style={{ color: '#151515', fontWeight: 'bold' }}>
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
    return (
      <Trigger
        key={type}
        popupVisible={visible}
        action={['click']}
        onPopupVisibleChange={visible => toggle(visible)}
        getPopupContainer={() => document.body}
        popupAlign={{
          points: ['tc', 'bc'],
          offset: [-40, 10],
          overflow: { adjustX: true, adjustY: true },
        }}
        popup={
          <DelVerify className="disableDrag">
            <p>{_l('确定要删除此组件')}</p>
            <div className="btnGroup">
              <span className="cancel" onClick={() => toggle(false)}>
                {_l('取消')}
              </span>
              <span
                className="del"
                onClick={() => {
                  handleToolClick('del');
                  toggle(false);
                }}
              >
                {_l('删除')}
              </span>
            </div>
          </DelVerify>
        }
      >
        {renderItem({ onClick: () => toggle(true) })}
      </Trigger>
    );
  }
};
