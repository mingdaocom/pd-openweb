import React from 'react';
import { func } from 'prop-types';
import styled from 'styled-components';
import { Button } from 'ming-ui';

const FooterCon = styled.div`
  height: 90px;
  display: flex;
  align-items: center;
  a {
    font-size: 13px;
    color: #2196f3;
    text-decoration: none;
  }
`;

export default function Footer(props) {
  const { onClose, onSave } = props;
  return (
    <FooterCon>
      <a href="/">{_l('使用帮助')}</a>
      <div className="flex"></div>
      <Button type="link" onClick={onClose}>
        {_l('取消')}
      </Button>
      <Button type="primary" onClick={onSave}>
        {_l('保存')}
      </Button>
    </FooterCon>
  );
}

Footer.propTypes = {
  onClose: func,
  onSave: func,
};
