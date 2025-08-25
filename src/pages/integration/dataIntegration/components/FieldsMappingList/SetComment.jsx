import React, { useState } from 'react';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon, Textarea } from 'ming-ui';

const Wrapper = styled.div`
  width: 310px;
  padding: 20px 24px;
  background: #fff;
  box-shadow: 0px 4px 16px 1px rgba(0, 0, 0, 0.16);
  border-radius: 3px;
`;

export default function SetComment(props) {
  const { itemData, updateFieldsMapping } = props;
  const [visible, setVisible] = useState(false);
  const destField = itemData.destField || {};

  return (
    <Trigger
      action={['click']}
      popupClassName="moreOption"
      getPopupContainer={() => document.body}
      popupVisible={visible}
      onPopupVisibleChange={visible => setVisible(visible)}
      popupAlign={{
        points: ['br', 'tr'],
        offset: [0, -5],
        overflow: { adjustX: true, adjustY: true },
      }}
      popup={
        <Wrapper>
          <p className="mBottom6">{_l('字段注释')}</p>
          <Textarea
            className="Font13"
            maxHeight={108}
            value={destField.comment || ''}
            onChange={value => {
              updateFieldsMapping({
                ...itemData,
                destField: {
                  ...destField,
                  comment: value,
                },
              });
            }}
          />
        </Wrapper>
      }
    >
      <Icon icon="info_outline" className="Font16" />
    </Trigger>
  );
}
