import React, { useState } from 'react';
import MdMarkdown from '.';
import styled from 'styled-components';
import { Modal } from 'ming-ui/antd-components';

const Con = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  & > div {
    height: 100%;
    flex: 1;
  }
`;

export default function MarkdownDialog(props) {
  const { data, controlName, handleClose } = props;
  const [value, setValue] = useState(data);

  return (
    <Modal
      open
      type="fixed"
      verticalAlign="bottom"
      className="openMarkdownDialog"
      title={controlName}
      iconButtons={[
        {
          type: 'fullScreen',
          icon: 'worksheet_narrow',
          tip: _l('退出'),
          onClick: () => handleClose(value),
        },
      ]}
      closable={false}
      fullScreen={true}
    >
      <Con>
        <Content>
          <MdMarkdown
            {...props}
            data={value}
            mode="sv"
            isFullScreen={true}
            handleChange={value => {
              setValue(value);
            }}
          />
        </Content>
      </Con>
    </Modal>
  );
}
