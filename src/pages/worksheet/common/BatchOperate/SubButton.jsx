import React, { useState } from 'react';
import Trigger from 'rc-trigger';
import { Menu, MenuItem, VCenterIconText } from 'ming-ui';
import IconText from 'worksheet/components/IconText';
import styled from 'styled-components';

const Con = styled.div`
  display: inline-block;
  .dropIcon {
  }
`;

export default function SubButton(props) {
  const { text, icon, children, popupAlign, list = [], ...rest } = props;
  const [popupVisible, setPopupVisible] = useState(false);
  return (
    <Con {...rest}>
      <Trigger
        popupVisible={popupVisible}
        action={['click']}
        popupAlign={
          popupAlign || {
            points: ['tl', 'bl'],
            overflow: { adjustX: true, adjustY: true },
          }
        }
        popup={
          <Menu className="Relative" style={{ width: 140 }} onClickAway={() => setPopupVisible(false)}>
            {list.map((item, key) => (
              <MenuItem
                key={key}
                onClick={() => {
                  item.onClick();
                  setPopupVisible(false);
                }}
              >
                <VCenterIconText icon={item.icon} iconSize={18} text={item.text} textSize={13} />
              </MenuItem>
            ))}
          </Menu>
        }
        onPopupVisible={setPopupVisible}
      >
        <div
          onClick={() => {
            setPopupVisible(true);
          }}
        >
          {children || (
            <IconText
              icon={icon}
              text={
                <span>
                  {text} <i className="dropIcon icon-arrow-down-border" />
                </span>
              }
            />
          )}
        </div>
      </Trigger>
    </Con>
  );
}
