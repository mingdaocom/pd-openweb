import React from 'react';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { SvgIcon } from 'ming-ui';
import cx from 'classnames';
import IconTabs from 'src/pages/AppHomepage/components/SelectIcon/IconTabs';

const ColorBox = styled.div`
  width: 100px;
  height: 32px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
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
      background: #f5f5f5;
    }
  }
`;

export default function IconSetting(props) {
  const { icon = '', iconUrl = '' } = safeParse(props.icon || '{}');

  return (
    <Trigger
      popup={() => {
        return (
          <div className="selectIconWrap" style={{ width: '350px', position: 'relative' }}>
            <IconTabs {..._.pick(props, ['projectId', 'iconColor', 'handleClick'])} icon={icon} />
          </div>
        );
      }}
      action={['click']}
      popupAlign={{
        points: ['tl', 'bl'],
        offset: [-80, 3],
        overflow: { adjustX: true, adjustY: true },
      }}
      getPopupContainer={() => document.body}
      destroyPopupOnHide
    >
      <ColorBox>
        <div className="flex pTop2 mLeft6">
          {iconUrl ? (
            <SvgIcon url={iconUrl} fill="#9E9E9E" size={16} />
          ) : (
            <span className={cx('Font14', props.type === 52 ? 'icon-tab Gray_9e' : 'icon-block Gray_c')}></span>
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
    </Trigger>
  );
}
