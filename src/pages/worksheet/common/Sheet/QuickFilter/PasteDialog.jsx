import React, { useState } from 'react';
import { string, func } from 'prop-types';
import { Dialog } from 'ming-ui';
import styled from 'styled-components';

const KeywordInput = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  height: 158px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 3px;
  resize: none;
  &:focus {
    border-color: #2196f3;
  }
  &::placeholder {
    color: #bdbdbd;
  }
`;

const Tip = styled.div`
  margin-bottom: -10px;
  text-align: right;
  color: #333;
`;

function cutStringByLine(str, length = 500) {
  const lines = str.split('\n').map((line, i) => ({ index: i, text: line }));
  const lastLine = lines.filter(l => !!l.text.trim()).slice(0, length)[length - 1];
  return lastLine
    ? lines
        .slice(0, lastLine.index + 1)
        .map(l => l.text)
        .join('\n')
    : str;
}
export default function PasteDialog(props) {
  const { keywords = '', onClose, onChange } = props;
  const [value, setValue] = useState(cutStringByLine(keywords));
  return (
    <Dialog
      visible
      width={480}
      title={_l('添加多个搜索关键词')}
      handleClose={onClose}
      cancelText={value ? _l('清除') : _l('取消')}
      onCancel={() => (value ? setValue('') : onClose())}
      onOk={() => {
        onChange(value);
        onClose();
      }}
    >
      <KeywordInput
        autoFocus
        placeholder={_l('多个关键词请用换行符分隔')}
        value={value}
        onChange={e => setValue(cutStringByLine(e.target.value))}
      />
      <Tip>{_l('%0/500 个', value.split('\n').filter(v => v.trim()).length)}</Tip>
    </Dialog>
  );
}

PasteDialog.propTypes = {
  keywords: string,
  onChange: func,
  onClose: func,
};
