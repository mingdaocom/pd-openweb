import React, { useRef, useState, useEffect } from 'react';
import { Button } from 'ming-ui';
import { Input } from 'antd';
import 'antd/es/input/style/css';
import SVG from 'svg.js';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import { getPosition } from '../HierarchyView/util';
import _ from 'lodash';

const CreateRecordWrap = styled.div`
  width: 280px;
  margin-bottom: 8px;
  position: relative;
  textarea {
    padding: 12px 30px 12px 12px;
    resize: none;
  }

  .switchToCompleteCreate {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 16px;
    color: #9e9e9e;
    &:hover {
      color: #2196f3;
    }
  }
`;
export default function CreateRecord(props) {
  const {
    index,
    noConnector,
    itemData,
    scale,
    data,
    removeHierarchyTempItem,
    createTextTitleRecord,
    handleAddRecord,
    isStraightLine = false,
    view = {},
    uniqId,
  } = props;
  const { pid, rowId, pathId } = itemData;
  const { advancedSetting } = view;

  // 用来防止触发失焦
  const [isOutFocus, setOutFocus] = useState(false);
  const [value, setValue] = useState('');
  const $itemWrap = useRef(null);
  const getLinesValue = () => value.trim().split('\n');
  const lines = getLinesValue();

  // 绘制连接线
  const drawConnector = () => {
    const { view = {} } = props;
    const { advancedSetting = {} } = view;
    // 顶级记录没有连线
    if (!pid) return;
    const $svgWrap = document.getElementById(uniqId ? `svg-${pathId.join('-')}-${uniqId}` : `svg-${pathId.join('-')}`);
    const $ele = _.get($itemWrap, ['current']);
    if ($ele) {
      const $parent = document.getElementById(
        uniqId ? `${data.pathId.join('-')}-${uniqId}` : `${data.pathId.join('-')}`,
      );
      if ($parent === $ele) return;
      const {
        height = 0,
        top = 0,
        start = [],
        end = [],
        straightLineInflection = [],
      } = getPosition($parent, $ele, scale, advancedSetting.hierarchyViewConnectLine === '1' || isStraightLine);
      $($svgWrap).height(height).css({ top: -top });

      /* 为了防止连线过于重叠,处理控制点的横坐标
       靠上的记录的控制点靠右 靠下的记录控制点靠左，最右到父子记录间隔的一半即60px,最左为起点0
       */
      const controlPointX = 0;

      // 获取控制点
      const controlPoint = [controlPointX, end[1]];
      if ($svgWrap.childElementCount > 0) {
        $svgWrap.childNodes.forEach(child => $svgWrap.removeChild(child));
      }
      const draw = SVG(uniqId ? `svg-${pathId.join('-')}-${uniqId}` : `svg-${pathId.join('-')}`).size('100%', '100%');
      if (advancedSetting.hierarchyViewConnectLine === '1' || isStraightLine) {
        draw.polyline([start, straightLineInflection, end]).stroke({ width: 2, color: '#d3d3d3' }).fill('none');
      } else {
        const linePath = ['M', ...start, 'Q', ...controlPoint, ...end].join(' ');
        draw.path(linePath).stroke({ width: 2, color: '#d3d3d3' }).fill('none');
      }
    }
  };

  useEffect(() => {
    drawConnector();
  }, [index, lines.length, pid]);

  const handleClick = type => {
    setOutFocus(true);
    createTextTitleRecord(type === 'multi' ? getLinesValue(value) : value.trim());
    setValue('');
    removeHierarchyTempItem({ rowId, path: data.path });
  };
  return (
    <div className="sortableTreeNodeWrap" id={pathId.join('-')} ref={$itemWrap}>
      <div
        id={uniqId ? `svg-${pathId.join('-')}-${uniqId}` : `svg-${pathId.join('-')}`}
        className={isStraightLine || advancedSetting.hierarchyViewConnectLine === '1' ? 'svgStraightWrap' : 'svgWrap'}
      />
      <Trigger
        popupAlign={{ points: ['tl', 'bl'], offset: [0, 4] }}
        popupVisible={lines.length > 1}
        popup={
          <div className="createMultiRecord">
            <div className="hint Font15">
              {_l('检测到您输入了 %0 行内容,可以为您创建 %0 条记录。您也可以只创建一条记录', lines.length)}
            </div>
            <Button fullWidth type="link" onMouseDown={() => handleClick('multi')}>
              {_l('创建%0条记录', lines.length)}
            </Button>
            <Button fullWidth type="link" onMouseDown={handleClick}>
              {_l('只创建一条记录')}
            </Button>
          </div>
        }
      >
        <CreateRecordWrap>
          <Input.TextArea
            autoSize={{ minRows: 1, maxRows: 10 }}
            autoFocus
            onPressEnter={() => {
              const _value = value.trim();
              if (_value) {
                setOutFocus(true);
                createTextTitleRecord(_value, true);
                setValue('');
              } else {
                removeHierarchyTempItem({ rowId, path: data.path });
              }
            }}
            onChange={e => setValue(e.target.value)}
            value={value}
            onBlur={e => {
              const _value = value.trim();
              if (_value) {
                createTextTitleRecord(_value);
                setValue('');
                removeHierarchyTempItem({ rowId, path: data.path });
              } else {
                removeHierarchyTempItem({ rowId, path: data.path });
              }
            }}
          ></Input.TextArea>
          <div
            className="switchToCompleteCreate pointer"
            onMouseDown={() => {
              setOutFocus(true);
              handleAddRecord({ path: itemData.path, pathId: itemData.pathId });
              removeHierarchyTempItem({ rowId, path: data.path });
            }}
          >
            <i className="icon-worksheet_enlarge"></i>
          </div>
        </CreateRecordWrap>
      </Trigger>
    </div>
  );
}
