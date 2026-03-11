import React from 'react';
import { number, string } from 'prop-types';
import styled from 'styled-components';

const CreatedBy = styled.div`
  color: var(--color-text-secondary);
  a {
    color: var(--color-text-title);
    font-weight: bold;
    font-style: italic;
    &:hover {
      color: var(--color-primary-light);
    }
  }
`;

export default function CreateByMingDaoYun(props) {
  const { className, fontSize = 13 } = props;

  return (
    <CreatedBy
      className={className}
      style={{ fontSize }}
      dangerouslySetInnerHTML={{
        __html: '',
      }}
    />
  );
}

CreateByMingDaoYun.propTypes = {
  mode: number,
  fontSize: number,
  className: string,
};
