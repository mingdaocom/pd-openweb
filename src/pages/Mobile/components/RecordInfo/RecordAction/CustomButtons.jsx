import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, SvgIcon } from 'ming-ui';
import { getButtonColor } from 'src/utils/control';

const BtnCon = styled.div`
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: left;
  border-radius: 18px;
  padding: 0 10px;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  .opcIcon {
    color: rgba(117, 117, 117, 0.5) !important;
  }
  &.disabled {
    background-color: rgba(0, 0, 0, 0.03) !important;
    color: #757575 !important;
    border: none !important;
  }
`;

export default class CustomButtons extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      classNames,
      customBtns = [],
      isSlice,
      handleClick = () => {},
      btnDisable = {},
      isBatch,
      isEditLock,
      isRecordLock,
      entityName = _l('记录'),
    } = this.props;
    const buttons = isSlice ? customBtns.slice(0, 2) : customBtns;

    return buttons
      .filter(it => (isBatch ? !it.disabled : true))
      .map(btn => {
        return (
          <BtnCon
            className={cx(`LineHeight36 ${classNames}`, { disabled: btnDisable[btn.btnId] || btn.disabled })}
            style={{ ...getButtonColor(btn.color) }}
            onClick={() => {
              if (btnDisable[btn.btnId] || btn.disabled) return;
              if (
                (isRecordLock && !_.includes(['copy', 'print', 'sysprint', 'share'], btn.type)) ||
                (isEditLock && btn.clickType === 3)
              ) {
                alert(isRecordLock ? _l('%0已锁定', entityName) : _l('不允许多人同时编辑，稍后重试'), 3);
                return;
              }
              handleClick(btn);
            }}
          >
            {!!btn.iconUrl && !!btn.icon && btn.icon.endsWith('_svg') ? (
              <SvgIcon
                className="InlineBlock icon mRight6"
                addClassName="TxtMiddle"
                url={btn.iconUrl}
                fill={
                  btnDisable[btn.btnId] || btn.disabled
                    ? 'rgba(117, 117, 117, 0.5)'
                    : btn.color && btn.color !== 'transparent'
                      ? getButtonColor(btn.color).color
                      : '#151515'
                }
                size={15}
              />
            ) : (
              <Icon
                icon={btn.icon || 'custom_actions'}
                className={cx('mRight6 Font20', {
                  opcIcon: (!btn.icon && (!btn.color || btn.color === 'transparent')) || btn.disabled,
                })}
              />
            )}
            <span className={cx('breakAll overflow_ellipsis Font13', { Gray_bd: btn.disabled })}>{btn.name}</span>
          </BtnCon>
        );
      });
  }
}
