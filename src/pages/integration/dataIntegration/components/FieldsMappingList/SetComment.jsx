import React, { useState } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Input, Popover } from 'ming-ui/antd-components';

const COMMENT_TEXTAREA_STYLE = { minHeight: 100, maxHeight: 108 };

const Wrapper = styled.div`
  width: 310px;
  padding: 20px 24px;
`;

export default function SetComment(props) {
  const { itemData, updateFieldsMapping } = props;
  const [visible, setVisible] = useState(false);
  const destField = itemData.destField || {};

  return (
    <Popover
      noPadding
      trigger="click"
      getPopupContainer={() => document.body}
      open={visible}
      onOpenChange={setVisible}
      placement="topRight"
      content={
        <Wrapper>
          <p className="mBottom6">{_l('字段注释')}</p>
          <Input.TextArea
            autoSize
            className="Font13"
            style={COMMENT_TEXTAREA_STYLE}
            value={destField.comment || ''}
            onChange={event => {
              updateFieldsMapping({
                ...itemData,
                destField: {
                  ...destField,
                  comment: event.target.value,
                },
              });
            }}
          />
        </Wrapper>
      }
    >
      <Icon icon="info_outline" className="Font16" />
    </Popover>
  );
}
