import React, { useState } from 'react';
import { Dialog, Icon } from 'ming-ui';
import styled from 'styled-components';
import { isLightColor } from 'src/util';
import cx from 'classnames';
import { Tooltip } from 'antd';
import { MAX_OPTIONS_COUNT } from '../../../config';

const DelateDialogWrap = styled.ul`
  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0px 8;
    border-bottom: 1px solid #dddddd;
    line-height: 36px;
    .name {
      display: flex;
      align-items: center;
      .colorWrap {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        margin-right: 12px;
        .tri {
          width: 0;
          height: 0;
          border: 4px solid transparent;
          border-top-color: #fff;
          &.isLight {
            border-top-color: rgba(0, 0, 0, 0.7);
          }
          transform: translate(5px, 8px);
        }
      }
    }
    i {
      font-size: 16px;
      margin-left: 12px;
      cursor: pointer;
      color: #9e9e9e;
      &:hover {
        color: #2196f3;
      }
    }
  }
`;

const filterFn = (list = []) => list.filter(i => i.isDeleted);

export default function DelateDialog({ options = [], colorful, onOk, onCancel }) {
  const [deleteOptions, setOptions] = useState(filterFn(options));
  const noDelOptions = options.filter(o => !o.isDeleted);

  return (
    <Dialog
      width={480}
      visible={true}
      title={_l('已删除选项（%0）', deleteOptions.length)}
      footer={null}
      onCancel={onCancel}
    >
      <DelateDialogWrap>
        {deleteOptions.map(item => {
          return (
            <li>
              <div className="name flex ellipsis">
                {colorful && (
                  <div className="colorWrap" style={{ backgroundColor: item.color }}>
                    <div className={cx('tri', { isLight: isLightColor(item.color) })}></div>
                  </div>
                )}
                <div className="flex overflow_ellipsis">{item.value}</div>
              </div>
              <Tooltip title={_l('恢复')} placement="bottom">
                <Icon
                  icon="repeal-o"
                  onClick={() => {
                    if (options.length - deleteOptions.length >= MAX_OPTIONS_COUNT) {
                      alert(_l('选项不得超过1000个'), 3);
                      return;
                    }
                    if (_.find(noDelOptions, n => n.value === item.value)) {
                      alert(_l('与列表中选项重复'), 3);
                      return;
                    }
                    const newOptions = options.map(i => {
                      return i.key === item.key ? { ...i, isDeleted: false } : i;
                    });
                    onOk(newOptions);
                    setOptions(filterFn(newOptions));
                  }}
                />
              </Tooltip>
            </li>
          );
        })}
      </DelateDialogWrap>
    </Dialog>
  );
}
