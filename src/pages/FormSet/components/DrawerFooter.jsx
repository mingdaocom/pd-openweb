import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Tooltip } from 'ming-ui/antd-components';

const FooterWrap = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 66px;
  background: var(--color-background-secondary);
  padding: 0 24px;
  box-sizing: border-box;
  .saveBtn {
    display: inline-block;
    padding: 0 32px;
    color: var(--color-white);
    background-color: var(--color-primary);
    border-radius: 4px;
    line-height: 36px;
    &:hover {
      background-color: var(--color-link-hover);
    }
    &.disabled {
      background-color: rgba(73, 127, 251, 0.49);
      border: none;
      line-height: 36px;
      cursor: not-allowed;
    }
  }
  .cancelBtn {
    display: inline-block;
    padding: 0 32px;
    color: var(--color-primary);
    border-radius: 4px;
    line-height: 34px;
    border: 1px solid var(--color-primary);
    background-color: var(--color-background-primary);
  }
`;

export default function DrawerFooter(props) {
  const {
    disabled,
    saveLoading,
    okText = _l('保存'),
    showTooltips,
    tipsTxt,
    handleSave = () => {},
    onCancel = () => {},
  } = props;

  return (
    <FooterWrap>
      {showTooltips ? (
        <Tooltip title={tipsTxt} placement="top">
          <span className={cx('saveBtn Hand bold', { disabled: disabled })} onClick={handleSave}>
            {saveLoading ? _l('保存中...') : okText}
          </span>
        </Tooltip>
      ) : (
        <span
          className={cx('saveBtn Hand bold', { disabled: disabled })}
          onClick={() => {
            if (saveLoading || disabled) {
              return;
            }

            handleSave();
          }}
        >
          {saveLoading ? _l('保存中...') : okText}
        </span>
      )}
      <span className="cancelBtn Hand bold mLeft16" onClick={onCancel}>
        {_l('取消')}
      </span>
    </FooterWrap>
  );
}
