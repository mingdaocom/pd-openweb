import React, { useState } from 'react';
import styled from 'styled-components';
import { Dialog } from 'ming-ui';
import ajaxRequest from 'src/api/worksheet';

const Wrap = styled.div`
  input {
    border: 1px solid #ddd;
    border-radius: 3px;
    height: 36px;
    line-height: 36px;
    padding: 0 6px;
    width: 100%;
    box-sizing: border-box;
    &:focus {
      border: 1px solid #1677ff;
    }
  }
`;

export default function WorkAliasDialog(props) {
  const { type = 'worksheet', appId, worksheetId, updateAlias, onClose } = props;
  const [alias, setAlias] = useState(props.alias || '');
  const workType = type === 'worksheet' ? _l('工作表') : _l('工作流');

  const onOk = () => {
    if (type === 'worksheet') {
      ajaxRequest.updateWorksheetAlias({ appId, worksheetId, alias }).then(res => {
        if (res === 0) {
          updateAlias(alias);
        } else if (res === 3) {
          alert(_l('工作表别名格式不匹配'), 3);
        } else if (res === 2) {
          alert(_l('工作表别名已存在，请重新输入'), 3);
        } else {
          alert(_l('别名修改失败'), 3);
        }
      });
      return;
    }
  };

  return (
    <Dialog className="" visible={true} onCancel={onClose} title={_l('设置%0别名', workType)} onOk={() => onOk()}>
      <Wrap>
        <input
          type="text"
          className="name mTop6"
          placeholder={_l('请输入')}
          value={alias}
          onChange={e => {
            setAlias(e.target.value.trim());
          }}
        />
      </Wrap>
    </Dialog>
  );
}
