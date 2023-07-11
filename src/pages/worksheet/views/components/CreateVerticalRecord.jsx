import React, { useRef, useState, useEffect } from 'react';
import { Button } from 'ming-ui';
import { Input } from 'antd';
import 'antd/es/input/style/css';
import SVG from 'svg.js';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import { getPosition } from '../HierarchyVerticalView/util';
import _ from 'lodash';

const CreateRecordWrap = styled.div`
  width: 280px;
  margin-bottom: 8px;
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

const CreateVerticalRecordWrap = styled.div`
  .sortableVerticalTreeNodeWrap {
    position: relative;
    &::before {
      top: -20px;
      left: 0;
      right: -10px;
      position: absolute;
      height: 2px;
      background: #d3d3d3;
      content: '';
    }
    &::after {
      top: -20px;
      left: calc(50% - 1px);
      position: absolute;
      width: 2px;
      height: 20px;
      background: #d3d3d3;
      content: '';
    }
  }
`;
export default function CreateVerticalRecord(props) {
  const {
    index,
    noConnector,
    itemData,
    scale,
    data,
    broCount,
    removeHierarchyTempItem,
    createTextTitleRecord,
    handleAddRecord,
  } = props;
  const { pid, rowId, pathId } = itemData;

  // 用来防止触发失焦
  const [isOutFocus, setOutFocus] = useState(false);
  const [value, setValue] = useState('');
  const $itemWrap = useRef(null);
  const getLinesValue = () => value.trim().split('\n');
  const lines = getLinesValue();

  const handleClick = type => {
    setOutFocus(true);
    createTextTitleRecord(type === 'multi' ? getLinesValue(value) : value);
    setValue('');
    removeHierarchyTempItem({ rowId, path: data.path });
  };
  return (
    <CreateVerticalRecordWrap>
      <div className="sortableVerticalTreeNodeWrap" id={pathId.join('-')} ref={$itemWrap}>
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
                if (value) {
                  setOutFocus(true);
                  createTextTitleRecord(value, true);
                  setValue('');
                } else {
                  removeHierarchyTempItem({ rowId, path: data.path });
                }
              }}
              onChange={e => setValue(e.target.value.trim())}
              value={value}
              onBlur={e => {
                if (value) {
                  createTextTitleRecord(value);
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
    </CreateVerticalRecordWrap>
  );
}
