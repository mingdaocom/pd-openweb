import React, { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd-latest';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, SvgIcon } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';
import { withOpeners } from 'ming-ui/hooks/useFunctionWrapComponent';
import { deleteSection } from 'src/pages/widgetConfig/internal/editorData';
import { batchCopyWidgets } from 'src/pages/widgetConfig/internal/editorData';
import { getAdvanceSetting } from 'src/utils/domain/control/advancedSetting';
import { fixedBottomWidgets, putControlByOrder } from 'src/utils/domain/control/editorLayout';
import { getTitleStyle } from 'src/utils/domain/control/style';
import { DRAG_ACCEPT, DRAG_ITEMS, DRAG_MODE } from '../../config/Drag';
import { supportCreateTemplate, useCreateTemplateDialog } from '../../util/createTemplate';
import { batchRemoveItems, insertNewLine } from '../../util/drag';
import WidgetStatus from '../components/WidgetStatus';

const TabHeaderItemWrap = styled.div`
  max-width: 100%;
  display: inline-flex;
  align-items: center;
  height: 44px;
  line-height: 44px;
  padding: 0 16px;
  background: var(--color-background-primary);
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
  .tabHeaderTitle {
    ${props => props.$titleStyle || ''}
    color: ${props => props.$titleColor};
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
    border-bottom-color: var(--color-text-placeholder);
  }
  &.isActive {
    border-bottom-color: var(--color-primary);
  }

  .insertPointer {
    position: absolute;
    top: 0;
    height: 100%;
    width: 4px;
    background: var(--color-primary);
    &.left {
      left: -2px;
    }
    &.right {
      right: -2px;
    }
  }
`;

function TabHeaderItemBase(props) {
  const { data, styleInfo, setWidgets } = props;
  const [visible, setVisible] = useState(false);
  const isCollapse = _.get(styleInfo, 'info.sectionshow') === '2';
  const { titlestyle = '0000', titlecolor = 'var(--color-text-title)' } = getAdvanceSetting(data);
  const titleStyle = getTitleStyle(titlestyle);

  const renderIcon = () => {
    const showIcon = _.get(styleInfo, 'info.showicon') || '1';
    if (showIcon !== '1') return null;

    if (data.type === 29) {
      return <Icon icon="link_record" className="Font16 mRight8 textTertiary" />;
    }

    if (data.type === 51) {
      return <Icon icon="Worksheet_query" className="Font16 mRight8 textTertiary" />;
    }

    const { iconUrl } = getAdvanceSetting(data, 'icon');
    return iconUrl ? (
      <SvgIcon url={iconUrl} fill="var(--color-text-tertiary)" size={16} className="mRight8 LineHeight16 Width16" />
    ) : (
      <Icon icon="subheader" className="Font16 mRight8 textTertiary" />
    );
  };

  return (
    <TabHeaderItemWrap $titleStyle={titleStyle} $titleColor={titlecolor}>
      {renderIcon()}
      <span className="Font15 Bold ellipsis tabHeaderTitle">{data.controlName}</span>
      <WidgetStatus data={data} style={{ lineHeight: '16px' }} />

      {isCollapse && (
        <Dropdown
          trigger={['click']}
          open={visible}
          onOpenChange={setVisible}
          placement="bottom"
          menu={{
            items: [
              {
                key: 'copy',
                icon: <Icon icon="copy" />,
                label: _l('复制'),
                onClick: ({ domEvent }) => {
                  domEvent.stopPropagation();
                  if (fixedBottomWidgets(data)) {
                    batchCopyWidgets(props, [data]);
                    setVisible(false);
                  }
                },
              },
              supportCreateTemplate(data) && {
                key: 'createTemplate',
                icon: <Icon icon="borg" />,
                label: _l('创建字段模板'),
                onClick: ({ domEvent }) => {
                  domEvent.stopPropagation();
                  if (fixedBottomWidgets(data)) {
                    props.openCreateTemplateDialog({ ...props, templateControls: [data] });
                    setVisible(false);
                  }
                },
              },
              {
                key: 'delete',
                danger: true,
                icon: <Icon icon="trash" />,
                label: _l('删除'),
                onClick: ({ domEvent }) => {
                  domEvent.stopPropagation();
                  if (fixedBottomWidgets(data)) {
                    if (data.type === 52) {
                      deleteSection({ widgets: props.widgets, data }, props);
                    } else {
                      setWidgets(batchRemoveItems(props.widgets, [data]));
                    }

                    setVisible(false);
                  }
                },
              },
            ].filter(Boolean),
          }}
        >
          <div className="tabDeleteIcon">
            <Icon icon="arrow-down" className="textTertiary" />
          </div>
        </Dropdown>
      )}
    </TabHeaderItemWrap>
  );
}

export const TabHeaderItem = withOpeners(TabHeaderItemBase, {
  openCreateTemplateDialog: useCreateTemplateDialog,
});

export function DragHeaderItem(props) {
  const { data, path, isActive, isOpen, widgets, setWidgets, setActiveWidget, handleClick } = props;
  const [row] = path;
  const $ref = useRef(null);
  const [pointerDir, setPointerDir] = useState('');

  const [, drag] = useDrag({
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
