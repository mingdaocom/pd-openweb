import React, { useState } from 'react';
import { Dialog, Textarea } from 'ming-ui';
import styled from 'styled-components';
import { MAX_OPTIONS_COUNT } from '../../../config';

const BatchAddContent = styled.div`
  .hint {
    margin-bottom: 12px;
  }
  .textareaWrap {
    height: 320px;
    overflow-y: auto;
  }
  .countBox {
    display: flex;
    justify-content: flex-end;
    color: ${props => (props.disabled ? '#F52222' : '#9e9e9e')};
  }
`;

const getNewOptions = (value = '', options = []) => {
  const textArr = _.uniqBy(
    value
      .split(/\n/)
      .map(v => v.trim())
      .filter(v => !!v),
  );
  const texts = options.map(item => item.value);
  return textArr.filter(i => !_.includes(texts, i));
};

export default function BatchAdd({ options, onOk, ...rest }) {
  const [value, setValue] = useState('');
  const noDelOptions = options.filter(i => !i.isDeleted);
  const addOptions = getNewOptions(value, options);
  const totalNum = addOptions.length + noDelOptions.length;
  const okDisabled = !addOptions.length || totalNum > MAX_OPTIONS_COUNT;

  return (
    <Dialog
      bodyClass="batchAddOptionDialog"
      width={640}
      visible
      title={_l('批量编辑')}
      okDisabled={okDisabled}
      onOk={() => onOk(addOptions)}
      {...rest}
    >
      <BatchAddContent disabled={totalNum > MAX_OPTIONS_COUNT}>
        <div className="hint Gray_9e">{_l('每个选项单列一行,将所有不重复项加为新的选项')}</div>
        <Textarea
          name="textarea"
          style={{ maxHeight: '600px', minHeight: '320px' }}
          value={value}
          onChange={setValue}
        />
        <div className="countBox">{`${totalNum} / ${MAX_OPTIONS_COUNT}`}</div>
      </BatchAddContent>
    </Dialog>
  );
}
