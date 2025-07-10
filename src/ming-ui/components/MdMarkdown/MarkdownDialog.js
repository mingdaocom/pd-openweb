import React, { useState } from 'react';
import MdMarkdown from '.';
import styled from 'styled-components';
import { Modal } from 'ming-ui';

const Con = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  height: 50px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  .inner {
    width: 100%;
  }
  .main {
    font-size: 17px;
    color: #151515;
    font-weight: bold;
  }
`;

const Content = styled.div`
  position: relative;
  padding: 0 25px 36px;
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
      visible
      type="fixed"
      verticalAlign="bottom"
      className="openMarkdownDialog"
      closeIcon={<span />}
      bodyStyle={{ padding: 0, position: 'relative' }}
      fullScreen={true}
    >
      <Con>
        <Header>
          <div className="inner flexRow">
            <div className="main ellipsis" title={controlName}>
              {controlName}
            </div>
            <div className="flex"></div>
            <span
              className="icon-worksheet_narrow Font20 ThemeHoverColor3 pointer"
              onClick={() => handleClose(value)}
            />
          </div>
        </Header>
        <Content>
          <MdMarkdown
            {...props}
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
