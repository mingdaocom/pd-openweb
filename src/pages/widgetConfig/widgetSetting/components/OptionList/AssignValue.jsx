import React, { useState } from 'react';
import cx from 'classnames';
import update from 'immutability-helper';
import styled from 'styled-components';
import { InputNumber, Modal, Switch } from 'ming-ui/antd-components';

const ASSIGN_VALUE_MODAL_STYLES = {
  body: { overflowX: 'hidden', padding: '0 0 20px' },
};

const AssignValueContent = styled.div`
  .switchWrap {
    margin: 12px 0 0 0;
    .switch {
      margin-right: 12px;
    }
  }
  .content {
    display: flex;
    max-height: 445px;
    margin-top: 20px;
    box-sizing: border-box;
    ul {
      width: 50%;
      transition: background-color 0.25s;
      &.valueList {
        li {
          border-right: 1px solid var(--color-border-primary);
        }
      }
      &.disabled {
        li {
          background-color: var(--color-background-secondary);
          cursor: not-allowed;
        }
      }
    }
    li {
      display: flex;
      align-items: center;
      line-height: 36px;
      height: 36px;
      padding-left: 12px;
      border-bottom: 1px solid var(--color-border-primary);
      border-left: 1px solid var(--color-border-primary);

      &.title {
        border-top: 1px solid var(--color-border-primary);
      }

      .colorWrap {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 6px;
      }
    }
    .valueList {
      border-left: none;
      li {
      }
    }
    input {
      border: none;
      box-shadow: none;
      padding-left: 0;
    }
  }
  .hap-input-number {
    border: none;
    width: 100%;
    .hap-input-number-handler-wrap {
      display: none;
    }
  }
`;

export default function AssignValue(props) {
  const { enableScore, onOk, options: defaultOptions, ...modalProps } = props;
  const [options, setOptions] = useState(defaultOptions);
  const [checked, setChecked] = useState(enableScore);

  return (
    <Modal
      {...modalProps}
      width={640}
      styles={ASSIGN_VALUE_MODAL_STYLES}
      onOk={() => {
        onOk({
          enableScore: checked,
          options,
        });
      }}
      open
      title={_l('赋分值')}
      keyboard
    >
      <AssignValueContent>
        <div className="hint textTertiary">
          {_l(
            '启用后，可以为每个选项赋分值。赋值后的选项字段可以公式运算或作为数值字段默认值使用。字段值取所有选择项的分值求和，支持输入正负值。',
          )}
        </div>
        <div className="switchWrap flexCenter">
          <Switch size="small" className="switch" checked={checked} onChange={setChecked} />
          {checked ? _l('启用') : _l('关闭')}
        </div>

        <div className="content">
          <ul>
            <li className="Bold title">{_l('选项')}</li>
            {options.map(
              ({ color, value, isDeleted }) =>
                !isDeleted && (
                  <li>
                    <div style={{ background: color }} className="colorWrap"></div>
                    <div className="flex overflow_ellipsis">{value}</div>
                  </li>
                ),
            )}
          </ul>
          <ul className={cx('valueList', { disabled: !checked })}>
            <li className="Bold title">{_l('分值')}</li>
            {options.map(
              (item, index) =>
                !item.isDeleted && (
                  <li>
                    {checked && (
                      <InputNumber
                        value={item.score}
                        placeholder={_l('请输入')}
                        disabled={!checked}
                        onChange={value => {
                          setOptions(update(options, { [index]: { score: { $set: value } } }));
                        }}
                      />
                    )}
                  </li>
                ),
            )}
          </ul>
        </div>
      </AssignValueContent>
    </Modal>
  );
}
