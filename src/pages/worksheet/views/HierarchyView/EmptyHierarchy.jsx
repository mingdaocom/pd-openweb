import React, { useState } from 'react';
import { string } from 'prop-types';
import { Input } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';

const EmptyHierarchyWrap = styled.div`
  .ming.Input {
    border: none;
    padding: 0;
    height: 28px;
    border-radius: 0;
    border-bottom: 2px solid #2196f3;
    background-color: transparent;
    font-size: 14px;
    font-weight: bold;
  }
  .titleWrap {
    margin-bottom: 4px;
    height: 36px;
    display: flex;
    align-items: center;
    span {
      margin-bottom: 1px;
    }
  }

  .addWrap {
    box-sizing: border-box;
    width: 280px;
    padding: 0 12px;
    line-height: 48px;
    transition: all 0.25s;
    border-radius: 3px;
    background-color: #fff;
    color: #9e9e9e;
    font-weight: bold;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.16);
    &:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.16);
    }
    &.allowAdd {
      cursor: pointer;
      &:hover {
        color: #2196f3;
      }
    }
  }
`;

export default function EmptyHierarchy({ allowAdd, onAdd, layersName, updateLayersName }) {
  const [isEdit, setEdit] = useState(false);
  const [value, setValue] = useState(layersName[0] || '');
  return (
    <EmptyHierarchyWrap>
      <div className="titleWrap">
        {isEdit ? (
          <Input
            value={value}
            autoFocus
            onChange={setValue}
            onBlur={() => {
              setEdit(false);
              updateLayersName([value]);
            }}
          />
        ) : (
          <span className={cx('overflow_ellipsis layerTitle', value ? 'Gray_75 Bold' : 'Gray_bd Bold')} onClick={() => setEdit(true)}>
            {value || _l('一级')}
          </span>
        )}
      </div>

      <div onClick={onAdd} className={cx('addWrap', { allowAdd })}>
        <i className="icon-add"></i>
        <span>{allowAdd ? _l('添加记录') : _l('暂无记录')}</span>
      </div>
    </EmptyHierarchyWrap>
  );
}
