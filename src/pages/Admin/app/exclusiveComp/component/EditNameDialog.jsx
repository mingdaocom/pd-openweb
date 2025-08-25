import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Dialog, Input } from 'ming-ui';

const Wrap = styled.div`
  input {
    width: 100%;
  }
`;

function EditNameDialog(props) {
  const { visible = false, defauleValue, onOk, onCancel } = props;

  const $inputRef = useRef(null);
  const [value, setValue] = useState(defauleValue || undefined);

  useEffect(() => {
    setValue(defauleValue || undefined);
    if ($inputRef.current) $inputRef.current.focus();
  }, [defauleValue]);

  return (
    <Dialog
      className="EditNameDialog"
      width="480"
      visible={visible}
      title={_l('修改名称')}
      okText={_l('确定')}
      onCancel={onCancel}
      onOk={() => {
        if (value.trim() === '') {
          alert(_l('名称不能为空'), 2);
          return;
        }
        onOk(value);
      }}
    >
      <Wrap>
        <Input
          manualRef={$inputRef}
          defaultValue={defauleValue}
          value={value}
          size="default"
          onChange={e => {
            setValue(e);
          }}
        />
      </Wrap>
    </Dialog>
  );
}

export default EditNameDialog;
