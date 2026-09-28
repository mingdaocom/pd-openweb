import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Input, Modal } from 'ming-ui/antd-components';

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
    <Modal
      className="EditNameDialog"
      width={480}
      open={visible}
      mask={{ closable: true }}
      keyboard
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
          ref={$inputRef}
          defaultValue={defauleValue}
          value={value}
          onChange={e => {
            setValue(e.target.value);
          }}
        />
      </Wrap>
    </Modal>
  );
}

export default EditNameDialog;
