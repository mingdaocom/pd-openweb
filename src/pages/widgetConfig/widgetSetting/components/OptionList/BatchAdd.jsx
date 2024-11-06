import React, { useEffect, useState } from 'react';
import { Dialog, Textarea, Checkbox } from 'ming-ui';
import styled from 'styled-components';
import { MAX_OPTIONS_COUNT, OPTION_COLORS_LIST } from '../../../config';
import { v4 as uuidv4 } from 'uuid';

const BatchAddContent = styled.div`
  .hint {
    margin-bottom: 12px;
  }
  .textareaWrap {
    height: 320px;
    overflow-y: auto;
  }
  .footerBox {
    display: flex;
    justify-content: space-between;
    .countBox {
      color: ${props => (props.disabled ? '#F52222' : '#9e9e9e')};
    }
  }
`;

export default function BatchAdd({ data, options, onOk, ...rest }) {
  const { controlId } = data;
  const [value, setValue] = useState('');
  const [checked, setCheck] = useState(false);
  const isSaved = !controlId || (controlId && !controlId.includes('-'));
  const noDelOptions = options.filter(i => !i.isDeleted);
  const deleteOptions = options.filter(i => i.isDeleted);

  useEffect(() => {
    if (!isSaved) {
      setValue(noDelOptions.map(i => i.value).join('\n'));
    } else {
      setValue('');
    }
  }, []);

  const addOptions = _.uniqBy(value.split(/\n/).filter(_.identity));
  const totalNum = isSaved ? addOptions.length + noDelOptions.length : addOptions.length;
  // 显示列表重复
  const noDelRepeat = _.some(isSaved ? noDelOptions : [], o => _.includes(addOptions, o.value));
  // 回收站重复
  const delRepeat = _.some(deleteOptions, o => _.includes(addOptions, o.value));
  // 没有新增、超过数量上限、与显示列重复
  const okDisabled = !addOptions.length || totalNum > MAX_OPTIONS_COUNT || noDelRepeat || (delRepeat && !checked);

  return (
    <Dialog
      bodyClass="batchAddOptionDialog"
      width={640}
      visible
      title={_l('批量添加')}
      okDisabled={okDisabled}
      onOk={() => {
        let newOptions = isSaved ? [].concat(options) : [];

        addOptions.forEach(a => {
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
      footerLeftElement={() => {
        if (delRepeat) {
          return (
            <div className="flexCenter">
              <Checkbox text={_l('保存时恢复回收站重复选项')} checked={checked} onClick={() => setCheck(!checked)} />
            </div>
          );
        }
        return null;
      }}
      {...rest}
    >
      <BatchAddContent disabled={totalNum > MAX_OPTIONS_COUNT}>
        <div className="hint Gray_9e">{_l('每个选项单列一行，重复选项无法添加（包括不得与回收站重复）')}</div>
        <Textarea
          name="textarea"
          style={{ maxHeight: '600px', minHeight: '320px' }}
          value={value}
          onChange={setValue}
        />
        <div className="footerBox">
          <span>{(noDelRepeat || delRepeat) && <span className="Red">{_l('存在重复选项')}</span>}</span>
          <span className="countBox">{`${totalNum} / ${MAX_OPTIONS_COUNT}`}</span>
        </div>
      </BatchAddContent>
    </Dialog>
  );
}
