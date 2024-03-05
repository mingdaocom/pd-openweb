import React, { Fragment, useState, useRef } from 'react';
import { Button, Input } from 'antd';
import styled from 'styled-components';
import Trigger from 'rc-trigger';

const ResetNameWrap = styled.div`
  width: 230px;
  border-radius: 4px;
  .btns {
    justify-content: flex-end;
  }
`;

export default (props) => {
  const { originalFileName, isEdit, setIsEdit, onSave } = props;
  const [fileName, setFileName] = useState(originalFileName);
  const ref = useRef(null);

  const handleFocus = (e) => {
    setTimeout(() => {
      ref && ref.current && ref.current.resizableTextArea.textArea.select();
    }, 0);
  }

  return (
    <Trigger
      action={['click']}
      popup={(
        <ResetNameWrap className="card pAll10">
          <Input.TextArea
            ref={ref}
            autoFocus
            onFocus={handleFocus}
            value={fileName}
            rows={4}
            style={{ resize: 'none' }}
            onChange={(event) => {
              setFileName(event.target.value.trim());
            }}
          />
          <div className="flexRow alignItemsCenter mTop10 btns">
            <Button
              type="text"
              onClick={() => setIsEdit(false)}
            >
              {_l('取消')}
            </Button>
            <Button
              type="primary"
              onClick={() => {
                if (_.isEmpty(fileName)) {
                  alert(_l('名称不能为空'), 2);
                  return;
                } 
                onSave(fileName);
                setIsEdit(false)
              }}
            >
              {_l('保存')}
            </Button>
          </div>
        </ResetNameWrap>
      )}
      popupVisible={isEdit}
      onPopupVisibleChange={visible => setIsEdit(visible)}
      popupAlign={{
        points: ['tc', 'bc'],
        offset: [0, 10],
        overflow: { adjustX: true, adjustY: true },
      }}
      destroyPopupOnHide={true}
    >
      {props.children}
    </Trigger>
  );
}