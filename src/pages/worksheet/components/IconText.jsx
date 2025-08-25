import React from 'react';
import cx from 'classnames';
import { bool, element, func, shape, string } from 'prop-types';
import styled from 'styled-components';
import { SvgIcon } from 'ming-ui';

const Con = styled.div`
  display: inline-block;
  cursor: pointer;
  color: #151515;
  padding: 0px 12px;
  height: 28px;
  line-height: 28px;
  border-radius: 4px;
  white-space: nowrap;
  &:hover {
    background: #f5f5f5;
  }
  &.disabled {
    cursor: not-allowed !important;
    opacity: 0.5;
  }
  .svgIcon {
    margin-right: 4px;
  }
`;

const Icon = styled.span`
  margin-right: 4px;
  font-size: 18px;
  vertical-align: middle;
  color: #757575;
`;

const Text = styled.span`
  vertical-align: middle;
  font-size: 13px;
`;

export default function IconText(props) {
  const { disabled, className, icon, text, iconColor, style, onClick, textCmp, iconUrl, dataEvent = '' } = props;
  return (
    <Con className={cx(className, { disabled })} style={style} onClick={onClick} data-event={dataEvent}>
      {icon &&
        (!!iconUrl && icon.endsWith('_svg') ? (
          <SvgIcon className="svgIcon InlineBlock" addClassName="TxtMiddle" url={iconUrl} fill={iconColor} size={18} />
        ) : (
          <Icon className={cx('icon icon-' + icon)} style={iconColor ? { color: iconColor } : {}} />
        ))}
      <Text className={cx('text')}>{textCmp ? textCmp() : text}</Text>
    </Con>
  );
}

IconText.propTypes = {
  icon: string,
  style: shape({}),
  disabled: bool,
  className: string,
  text: string,
  iconColor: string,
  after: element,
  onClick: func,
};
