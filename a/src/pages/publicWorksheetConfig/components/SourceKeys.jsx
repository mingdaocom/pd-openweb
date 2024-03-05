import React from 'react';
import styled from 'styled-components';
import { Input } from 'ming-ui';
import { TextBlock } from 'worksheet/components/Basics';
import ShareUrl from 'worksheet/components/ShareUrl';

const Con = styled.div`
  :hover .delete {
    display: inline-block;
  }
  :hover .index {
    display: none;
  }
`;

const No = styled.span`
  margin-right: 10px;
  font-size: 14px;
  line-height: 36px;
  width: 24px;
  text-align: center;
  .delete {
    cursor: pointer;
    display: none;
    font-size: 18px;
    color: #9e9e9e;
  }
`;

export default function ({ url, sourceKeys, onChange = () => {}, onDelete = () => {} }) {
  return sourceKeys.map((key, index) => (
    <Con key={key} className="mBottom6 flexRow">
      <No>
        <span className="index">{index + 1}</span>
        <i className="icon icon-task-new-delete delete" onClick={() => onDelete(index)}></i>
      </No>
      <TextBlock className="ellipsis" style={{ width: 104, marginRight: 6 }}>
        {key}
      </TextBlock>
      <ShareUrl className="flex overflowHidden" url={url + `?source=${encodeURIComponent(key)}`} />
    </Con>
  ));
}
