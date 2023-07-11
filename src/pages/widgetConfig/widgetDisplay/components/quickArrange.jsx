import React, { useRef, useState } from 'react';
import update from 'immutability-helper';
import { flatten, last, head, isEmpty } from 'lodash';
import cx from 'classnames';
import { SettingItem } from '../../styled';
import { isFullLineControl, isHaveGap } from '../../util/widgets';
import { WHOLE_SIZE } from '../../config/Drag';
import { AnimationWrap } from './WidgetStyle';

const ARRANGE_TYPE = [
  { text: _l('一列'), value: 1 },
  { text: _l('二列'), value: 2 },
  { text: _l('三列'), value: 3 },
  { text: _l('四列'), value: 4 },
];

export default function QuickArrange({ widgets, setWidgets }) {
  const $originWidgets = useRef(widgets);
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
    <SettingItem className="settingItem withSplitLine">
      <div className="settingItemTitle">
        <span className='Font14'>{_l('快速排列')}</span>
        <div className="Absolute Right1 flexCenter">
          {activeColumn > 0 && (
            <div className="arrangeBtn mRight16" onClick={restore}>
              {_l('还原')}
            </div>
          )}
          <div
            className="arrangeBtn"
            disabled={activeColumn < 1}
            onClick={() => {
              handleClose();
              $originWidgets.current = widgets;
            }}
          >
            {_l('应用%04014')}
          </div>
        </div>
      </div>
      <AnimationWrap>
        {ARRANGE_TYPE.map(item => (
          <div
            className={cx('animaItem overflow_ellipsis', { active: activeColumn === item.value })}
            onClick={() => quickArrange(item.value)}
          >
            {item.text}
          </div>
        ))}
      </AnimationWrap>
    </SettingItem>
  );
}
