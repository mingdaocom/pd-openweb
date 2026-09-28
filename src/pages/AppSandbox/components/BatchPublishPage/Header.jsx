import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';

const HeaderWrap = styled.header`
  display: flex;
  align-items: center;
  height: 50px;
  padding: 0 16px;
  border-bottom: 1px solid var(--color-border-secondary);
  background-color: var(--color-background-primary);
  flex-shrink: 0;
`;

const BackIcon = styled(Icon)`
  color: var(--color-text-primary);
  font-size: 20px;
  cursor: pointer;

  &:hover {
    color: var(--color-primary);
  }
`;

const Title = styled.span`
  margin-left: 16px;
  color: var(--color-text-primary);
  font-size: 16px;
  font-weight: 600;
`;

const noop = () => {};

export default function Header({ onClose = noop }) {
  return (
    <HeaderWrap>
      <BackIcon icon="arrow_back" onClick={onClose} />
      <Title>{_l('发布新版本')}</Title>
    </HeaderWrap>
  );
}

Header.propTypes = {
  onClose: PropTypes.func,
};
