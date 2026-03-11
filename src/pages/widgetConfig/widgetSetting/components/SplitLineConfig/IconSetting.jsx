import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { SvgIcon } from 'ming-ui';
import { dialogSelectIcon } from 'ming-ui/functions';

const ColorBox = styled.div`
  width: 100px;
  height: 32px;
  background: var(--color-background-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: 3px;
  cursor: pointer;
  padding: 4px;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  .iconBox {
    padding: 4px;
    line-height: 15px;
    color: rgb(177, 177, 177);
    font-size: 14px;
    border-radius: 3px;
    &:hover {
      background: var(--color-background-hover);
    }
  }
`;

export default function IconSetting(props) {
  const { projectId, iconColor, handleClick } = props;
  const { icon = '', iconUrl = '' } = safeParse(props.icon || '{}');

  return (
    <ColorBox
      onClick={() => {
        dialogSelectIcon({ hideColor: true, hideInput: true, icon, iconColor, projectId, onModify: handleClick });
      }}
    >
      <div className="flex pTop2 mLeft6">
        {iconUrl ? (
          <SvgIcon url={iconUrl} fill="var(--color-text-tertiary)" size={16} />
        ) : (
          <span
            className={cx('Font14', props.type === 52 ? 'icon-subheader textTertiary' : 'icon-block textPlaceholder')}
          ></span>
        )}
      </div>
      <span
        className={cx('iconBox', iconUrl ? 'icon-clear' : 'icon-arrow-down-border')}
        onClick={e => {
          if (iconUrl) {
            e.stopPropagation();
            props.handleClick();
          }
        }}
      ></span>
    </ColorBox>
  );
}
