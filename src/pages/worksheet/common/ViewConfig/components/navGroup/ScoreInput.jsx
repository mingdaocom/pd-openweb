import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';

const DropWrap = styled.div`
  padding: 5px 0;
  border-radius: 3px;
  width: 360px;
  z-index: 1000;
  background: var(--color-background-primary);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.13),
    0 2px 6px rgba(0, 0, 0, 0.1);
  .dropLi {
    line-height: 32px;
    padding: 0 12px;
    &:hover {
      background: var(--color-background-hover);
    }
    &.cur {
      background: rgba(33, 150, 243, 0.2);
      .icon {
        color: var(--color-primary);
        display: inline-block;
        line-height: 32px;
      }
    }
  }
`;
const Wrap = styled.div`
  align-items: center;
  height: 32px;
  line-height: 32px;
  border-radius: 4px;
  border: 1px solid var(--color-border-primary);
  line-height: 32px;
  padding: 0 0 0 12px;
  .iconBox {
    width: 24px;
    color: var(--color-text-tertiary);
    font-size: 14px;
    position: relative;
    height: 100%;
    background: var(--color-background-primary);
    .dropIcon,
    .clearIcon {
      opacity: 0;
      display: block;
      position: absolute;
      left: 0;
      width: 100%;
      line-height: 32px;
      &.dropIcon {
        opacity: 1;
        z-index: 1;
      }
    }
    &:hover {
      &.dropIcon {
        opacity: 0;
        z-index: -1;
      }
      .clearIcon {
        z-index: 1;
        opacity: 1;
        &:hover {
          color: var(--color-text-secondary);
        }
      }
    }
  }
`;

export default function ScoreInput(props) {
  const { onChange = () => {}, control } = props;
  const list = new Array(parseInt(_.get(control, ['advancedSetting', 'max']) || '1', 10));

  return (
    <Trigger
      action={['click']}
      popup={
        <DropWrap className="dropList">
          {list.fill(1).map((o, i) => {
            let num = i + 1;
            return (
              <div
                className={cx('flexRow dropLi Hand', { cur: (props.values || []).includes(num + '') })}
                onClick={() => {
                  if ((props.values || []).includes(num + '')) {
                    onChange((props.values || []).filter(o => o !== num + ''));
                  } else {
                    onChange((props.values || []).concat(num + ''));
                  }
                }}
              >
                <span className="flex">{_l('%0 级', parseInt(num, 10))}</span>
                {(props.values || []).includes(num + '') && <i className="icon icon-done" />}
              </div>
            );
          })}
        </DropWrap>
      }
      popupClassName={cx('dropdownTrigger scoreDrop')}
      popupAlign={{
        points: ['tl', 'bl'],
        overflow: {
          adjustX: true,
          adjustY: true,
        },
      }}
    >
      <Wrap className="inputBox flexRow Hand">
        <span className={cx('flex', { textDisabled: (props.values || []).length <= 0 })}>
          {(props.values || []).length <= 0 ? _l('请选择') : _l('选中%0个', props.values.length)}
        </span>
        <div className="iconBox">
          <i className="icon icon-arrow-down-border dropIcon TxtCenter textTertiary" />
          <i
            className="icon icon-cancel Hand clearIcon TxtCenter "
            onClick={() => {
              onChange([]);
            }}
          />
        </div>
      </Wrap>
    </Trigger>
  );
}
