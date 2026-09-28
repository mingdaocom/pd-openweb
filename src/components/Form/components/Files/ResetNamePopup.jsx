import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Input, Popover } from 'ming-ui/antd-components';

const ResetNameWrap = styled.div`
  width: 230px;
  .btns {
    justify-content: flex-end;
  }
`;

export default props => {
  const { originalFileName, isEdit, setIsEdit, onSave } = props;
  const [fileName, setFileName] = useState(originalFileName);
  const ref = useRef(null);

  const handleFocus = () => {
    setTimeout(() => {
      ref && ref.current && ref.current.resizableTextArea.textArea.select();
    }, 0);
  };

  useEffect(() => {
    if (isEdit) {
      setFileName(originalFileName);
    }
  }, [isEdit]);

  return (
    <Popover
      noPadding
      trigger="click"
      content={
        <ResetNameWrap className="pAll10">
          <Input.TextArea
            ref={ref}
            autoFocus
            onFocus={handleFocus}
            value={fileName}
            rows={4}
            style={{ resize: 'none' }}
            onChange={event => {
              setFileName(event.target.value.trim());
            }}
          />
          <div className="flexRow alignItemsCenter mTop10 btns">
            <Button type="text" onClick={() => setIsEdit && setIsEdit(false)}>
              {_l('取消')}
            </Button>
            <Button
              type="primary"
              onClick={() => {
                if (_.isEmpty(fileName)) {
                  alert(_l('名称不能为空'), 2);
                  return;
                }

                onSave && onSave(fileName);
                setIsEdit && setIsEdit(false);
              }}
            >
              {_l('保存')}
            </Button>
          </div>
        </ResetNameWrap>
      }
      open={isEdit}
      onOpenChange={visible => setIsEdit && setIsEdit(visible)}
      placement="bottom"
      destroyOnHidden={true}
    >
      {props.children}
    </Popover>
  );
};
