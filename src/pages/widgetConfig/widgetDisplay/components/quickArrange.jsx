import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import update from 'immutability-helper';
import { Dropdown, Button } from 'antd';
import { flatten, last, head, isEmpty } from 'lodash';
import cx from 'classnames';
import Icon from 'src/components/Icon';
import { isFullLineControl, isHaveGap } from '../../util/widgets';
import { WHOLE_SIZE } from '../../config/Drag';
import { getDefaultSizeByType } from '../../util';

const ARRANGE_TYPE = [
  { text: '一列', value: 1, icon: 'one_column' },
  { text: '二列', value: 2, icon: 'two_column' },
  { text: '三列', value: 3, icon: 'three_column' },
  { text: '四列', value: 4, icon: 'four_column' },
];

const ArrangeWrap = styled.div`
  width: 320px;
  padding: 24px;
  background: #ffffff;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.24);
  ul {
    display: flex;
    padding: 16px 0;
    li {
      flex: 1;
      text-align: center;
      padding-top: 12px;
      cursor: pointer;
      border-radius: 4px;
      i {
        font-size: 40px;
      }
      &:hover {
        background-color: #f5f5f5;
      }
      &.active {
        color: #2196f3;
        i {
          color: #2196f3;
        }
      }
    }
  }
  .btns {
    text-align: right;
    border: none;
    .restore {
      box-shadow: none;
    }
    .apply {
      margin-left: 16px;
    }
  }
`;

const ArrangeText = styled.div`
  display: flex;
  align-items: center;
  color: #757575;
  cursor: pointer;
  &:hover {
    color: #2196f3;
    i {
      color: #2196f3;
    }
  }
  .quickArrange {
    margin-left: 6px;
  }
`;

export default function QuickArrange({ widgets, setWidgets }) {
  const $originWidgets = useRef(widgets);
  const [visible, setVisible] = useState(false);
  const [activeColumn, setActive] = useState(-1);

  const quickArrange = columnNumber => {
    if (activeColumn !== columnNumber) {
      setActive(columnNumber);
    }
    const flattenWidgets = flatten(widgets);
    // 1列排列
    if (columnNumber === 1) {
      setWidgets(flattenWidgets.map(item => [{ ...item, size: WHOLE_SIZE }]));
      return;
    }
    // 多列排列
    const nextWidgets = flattenWidgets.reduce((widgetList, widget, curIdx) => {
      const lastRow = last(widgetList);

      /**
       * 第一行直接添加
       * 当前控件是整行控件 直接另起一行
       * 当前行的第一个控件是整行控件 也另起一行
       */
      if (isEmpty(lastRow) || isFullLineControl(widget) || isFullLineControl(head(lastRow))) {
        return update(widgetList, { $push: [[widget]] });
      }
      // 如果最后一行还有空位则添加控件 否则另起一行
      if (lastRow.length < columnNumber) {
        return update(widgetList, {
          [widgetList.length - 1]: {
            $apply: list => {
              const nextList = list.concat(widget);
              return nextList.map(item => ({ ...item, size: WHOLE_SIZE / nextList.length }));
            },
          },
        });
      }
      return update(widgetList, { $push: [[widget]] });
    }, []);

    // 快速排列切换的时候，将落单的控件设为与当前排列相适应的宽度
    function sortWidgets(list) {
      return list.map(row =>
        row.map(item => {
          if (isHaveGap(row, item)) {
            return { ...item, size: WHOLE_SIZE / columnNumber };
          }
          return item;
        }),
      );
    }

    setWidgets(sortWidgets(nextWidgets));
  };

  const handleClose = () => {
    setVisible(false);
    setActive(-1);
  };

  // 还原
  const restore = () => {
    const controls = flatten(widgets);
    const nextWidgets = $originWidgets.current.map(row =>
      row.map(item => {
        const data = controls.find(({ controlId }) => item.controlId === controlId);
        return { ...data, size: item.size };
      }),
    );

    handleClose();
    setWidgets(nextWidgets);
  };

  return (
    <Dropdown
      arrow
      placement="bottomLeft"
      trigger={['click']}
      visible={visible}
      onVisibleChange={value => {
        if (!value) {
          restore();
        }
        if (!visible && value) {
          $originWidgets.current = widgets;
        }
        setVisible(value);
      }}
      overlay={
        <ArrangeWrap>
          <div className="title">{_l('快速排列')}</div>
          <ul>
            {ARRANGE_TYPE.map(({ text, value, icon }) => (
              <li key={value} className={cx({ active: value === activeColumn })} onClick={() => quickArrange(value)}>
                <div>
                  <Icon icon={icon} />
                </div>
                <p>{text}</p>
              </li>
            ))}
          </ul>
          <div className="btns">
            {activeColumn > 0 && (
              <Button className="restoreBtn" onClick={restore}>
                {_l('还原')}
              </Button>
            )}
            <Button
              className="apply"
              disabled={activeColumn < 1}
              type="primary"
              onClick={() => {
                handleClose();
                $originWidgets.current = widgets;
              }}>
              {_l('应用')}
            </Button>
          </div>
        </ArrangeWrap>
      }>
      <ArrangeText>
        <Icon type="clickable" icon="style" />
        <div className="quickArrange">{_l('快速排列')}</div>
      </ArrangeText>
    </Dropdown>
  );
}
