import React, { useState } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';
import IconText from 'worksheet/components/IconText';

const Con = styled.div`
  display: inline-block;
`;

export default function SubButton(props) {
  const { text, icon, children, list = [], ...rest } = props;
  const [popupVisible, setPopupVisible] = useState(false);
  return (
    <Con {...rest}>
      <Dropdown
        open={popupVisible}
        trigger={['click']}
        placement="bottomLeft"
        menu={{
          items: list.map((item, index) => ({
            key: index,
            icon: <Icon icon={item.icon} className="Font18" />,
            label: item.text,
            onClick: () => {
              item.onClick();
              setPopupVisible(false);
            },
          })),
          style: { minWidth: 140 },
        }}
        onOpenChange={setPopupVisible}
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
      </Dropdown>
    </Con>
  );
}
