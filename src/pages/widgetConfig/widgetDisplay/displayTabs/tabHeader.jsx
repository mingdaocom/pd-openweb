import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Icon, SvgIcon } from 'ming-ui';
import { Dropdown } from 'antd';
import { useDrag, useDrop } from 'react-dnd-latest';
import { getAdvanceSetting } from '../../util/setting';
import { DRAG_ACCEPT, DRAG_ITEMS, DRAG_MODE } from '../../config/Drag';
import { insertNewLine, batchRemoveItems } from '../../util/drag';
import { putControlByOrder, fixedBottomWidgets } from '../../util';
import { deleteSection } from '../../util/data';
import { DropdownOverlay } from '../../styled';
import cx from 'classnames';
import WidgetStatus from '../components/WidgetStatus';

const TabHeaderItemWrap = styled.div`
  max-width: 100%;
  display: inline-flex;
  align-items: center;
  height: 44px;
  line-height: 44px;
  padding: 0 16px;
  background: #fff;
  .Width16 {
    width: 16px;
  }
  .tabDeleteIcon {
    width: 24px;
    height: 30px;
    line-height: 34px;
    text-align: center;
    cursor: pointer;
  }
`;

const DragItemWrap = styled.div`
  max-width: 200px;
  display: flex;
  border-bottom: 3px solid transparent;
  cursor: grab;
  align-self: stretch;
  position: relative;
  box-sizing: border-box;
  list-style: none;
  transition: all 0.25s ease-in-out;
  transform: translate3d(0, 0, 0);
  margin-left: 8px;
  &:hover,
  &.isOpen {
    border-bottom-color: #cccccc;
  }
  &.isActive {
    border-bottom-color: #2196f3;
  }

  .insertPointer {
    position: absolute;
    top: 0;
    height: 100%;
    width: 4px;
    background: #2196f3;
    &.left {
      left: -2px;
    }
    &.right {
      right: -2px;
    }
  }
`;

export function TabHeaderItem(props) {
  const { data, styleInfo, setWidgets } = props;
  const [visible, setVisible] = useState(false);
  const isCollapse = _.get(styleInfo, 'info.sectionshow') === '2';

  const renderIcon = () => {
    const showIcon = _.get(styleInfo, 'info.showicon') || '1';
    if (showIcon !== '1') return null;

    if (data.type === 29) {
      return <Icon icon="link_record" className="Font16 mRight8 Gray_9e" />;
    }

    if (data.type === 51) {
      return <Icon icon="Worksheet_query" className="Font16 mRight8 Gray_9e" />;
    }

    const { iconUrl } = getAdvanceSetting(data, 'icon');
    return iconUrl ? (
      <SvgIcon url={iconUrl} fill="#9e9e9e" size={16} className="mRight8 LineHeight16 Width16" />
    ) : (
      <Icon icon="tab" className="Font16 mRight8 Gray_9e" />
    );
  };

  return (
    <TabHeaderItemWrap>
      {renderIcon()}
      <span className="Font15 Bold ellipsis">{data.controlName}</span>
      <WidgetStatus data={data} style={{ lineHeight: '16px' }} />

      {isCollapse && (
        <Dropdown
          trigger={['click']}
          visible={visible}
          onVisibleChange={visible => setVisible(visible)}
          overlay={
            <DropdownOverlay>
              <div
                className="dropdownContent"
                onClick={e => {
                  e.stopPropagation();
                  if (fixedBottomWidgets(data)) {
                    if (data.type === 52) {
                      deleteSection({ widgets: props.widgets, data }, props);
                    } else {
                      setWidgets(batchRemoveItems(props.widgets, [data]));
                    }
                    setVisible(false);
                  }
                }}
              >
                <div className="item delete">
                  <Icon icon="delete1" />
                  {_l('删除')}
                </div>
              </div>
            </DropdownOverlay>
          }
          placement="bottom"
        >
          <div className="tabDeleteIcon">
            <Icon icon="arrow-down" className="Gray_9" />
          </div>
        </Dropdown>
      )}
    </TabHeaderItemWrap>
  );
}

export function DragHeaderItem(props) {
  const { data, path, isActive, isOpen, widgets, setWidgets, setActiveWidget, handleClick } = props;
  const [row, col] = path;
  const $ref = useRef(null);
  const [pointerDir, setPointerDir] = useState('');

  const [collectDrag, drag] = useDrag({
    item: {
      type: data.type === 52 ? DRAG_ITEMS.DISPLAY_TAB : DRAG_ITEMS.DISPLAY_LIST_TAB,
      widgetType: data.type,
      id: data.controlId,
    },

    end(obj, monitor) {
      const dropResult = monitor.getDropResult();
      if (!dropResult) return;
      const { rowIndex } = dropResult;
      setWidgets(insertNewLine({ widgets, srcItem: data, srcPath: path, targetIndex: rowIndex }));
      setActiveWidget(data);
    },
  });

  const [{ isOver }, drop] = useDrop({
    accept: DRAG_ACCEPT.tab,
    hover(item, monitor) {
      if (item.id === data.controlId || !$ref.current) return;
      if (monitor.isOver({ shallow: true })) {
        let dir = '';
        // 若拖拽点在左半部则指示线在左
        const { width, left } = $ref.current.getBoundingClientRect();
        const { x } = monitor.getClientOffset();
        const marginLeft = 8;
        if (x - left - marginLeft < width / 2) dir = 'left';
        if (x - left - marginLeft >= width / 2) dir = 'right';
        if (pointerDir !== dir) {
          setPointerDir(dir);
        }
      }
    },
    drop(item, monitor) {
      if (monitor.isOver({ shallow: true })) {
        if (!pointerDir) return;
        const childLength = data.type === 52 ? _.get(putControlByOrder(data.relationControls), 'length') || 1 : 1;
        // 左右插入标签页控件
        return { mode: DRAG_MODE.INSERT_NEW_LINE, rowIndex: pointerDir === 'left' ? row : row + childLength };
      }
    },
    collect(monitor) {
      return { isOver: monitor.isOver({ shallow: true }) };
    },
  });

  drop(drag($ref));

  return (
    <DragItemWrap
      ref={$ref}
      className={cx({ isActive, isOpen })}
      onClick={() => handleClick(data)}
      title={data.controlName}
    >
      <TabHeaderItem {...props} />
      {isOver && pointerDir && <div className={cx('insertPointer', pointerDir)}></div>}
    </DragItemWrap>
  );
}
