import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, Textarea } from 'ming-ui';
import { MAX_OPTIONS_COUNT, OPTION_COLORS_LIST } from '../../../config';

const BatchAddContent = styled.div`
  .hint {
    margin-bottom: 12px;
  }
  .textareaWrap {
    height: 320px;
    overflow-y: auto;
  }
  .footerBox {
    display: flex
    justify-content: flex-end;
    .countBox {
      color: ${props => (props.disabled ? '#F52222' : '#9e9e9e')};
    }
  }
`;

export default function BatchAdd({ data, options, onOk, ...rest }) {
  const { controlId } = data;
  const [value, setValue] = useState('');
  const isSaved = !controlId || (controlId && !controlId.includes('-'));
  const noDelOptions = options.filter(i => !i.isDeleted);

  useEffect(() => {
    if (!isSaved) {
      setValue(noDelOptions.map(i => i.value).join('\n'));
    } else {
      setValue('');
    }
  }, []);

  const addOptions = _.uniqBy(value.split(/\n/).filter(_.identity));
  const filterAddOptions = isSaved ? addOptions.filter(a => !_.find(noDelOptions, o => o.value === a)) : addOptions;
  const totalNum = isSaved ? filterAddOptions.length + noDelOptions.length : addOptions.length;
  // 没有新增、超过数量上限、与显示列重复
  const okDisabled = !addOptions.length || totalNum > MAX_OPTIONS_COUNT;

  return (
    <Dialog
      bodyClass="batchAddOptionDialog"
      width={640}
      visible
      title={_l('批量添加')}
      okDisabled={okDisabled}
      onOk={() => {
        let newOptions = isSaved ? [].concat(options) : [];

        filterAddOptions.forEach(a => {
          const deleteIndex = _.findIndex(newOptions, o => o.value === a && o.isDeleted);
          if (deleteIndex > -1) {
            newOptions[deleteIndex].isDeleted = false;
          } else {
            newOptions.push({
              key: uuidv4(),
              value: a,
              checked: false,
              isDeleted: false,
              color: OPTION_COLORS_LIST[(newOptions.length + 1) % OPTION_COLORS_LIST.length],
            });
          }
        });
        newOptions = _.sortBy(newOptions, n => {
          return n.key === 'other' ? 9999 : _.findIndex(newOptions, i => i.key === n.key);
        });
        newOptions = newOptions.map((item, idx) => ({ ...item, index: idx + 1 }));

        onOk(newOptions);
      }}
      {...rest}
    >
      <BatchAddContent disabled={totalNum > MAX_OPTIONS_COUNT}>
        <div className="hint Gray_9e">
          {_l(
            '每个选项单列一行。若选项与选项列表重复，保存时将忽略重复选项；若选项与回收站内选项重复，保存时将自动恢复回收站的选项',
          )}
        </div>
        <Textarea
          name="textarea"
          style={{ maxHeight: '600px', minHeight: '320px' }}
          value={value}
          onChange={setValue}
        />
        <div className="footerBox">
          <span className="countBox">{`${totalNum} / ${MAX_OPTIONS_COUNT}`}</span>
        </div>
      </BatchAddContent>
    </Dialog>
  );
}
