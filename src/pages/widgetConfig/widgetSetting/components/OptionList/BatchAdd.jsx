import React, { useState, useEffect } from 'react';
import { Dialog, Textarea } from 'ming-ui';
import cx from 'classnames';
import styled from 'styled-components';

const BatchAddContent = styled.div`
  .hint {
    margin-bottom: 12px;
  }
  .textareaWrap {
    height: 320px;
    overflow-y: auto;
  }
`;

export default function BatchAdd({ options, onOk, ...rest }) {
  const [value, setValue] = useState(
    options.reduce((p, c, i) => (i === options.length - 1 ? `${p}${c.value}` : `${p}${c.value}\n`), ''),
  );
  return (
    <Dialog
      bodyClass="batchAddOptionDialog"
      width={640}
      visible
      title={_l('批量编辑')}
      onOk={() => onOk(value)}
      {...rest}
    >
      <BatchAddContent>
        <div className="hint Gray_9e">{_l('每个选项单列一行,将所有不重复项加为新的选项')}</div>
        <Textarea name='textarea' style={{ maxHeight: '600px', minHeight: '320px' }} value={value} onChange={setValue} />
      </BatchAddContent>
    </Dialog>
  );
}
