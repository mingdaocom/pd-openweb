import React from 'react';
import { number, string } from 'prop-types';
import styled from 'styled-components';

const CreatedBy = styled.div`
  color: #757575;
  a {
    color: #151515;
    font-weight: bold;
    font-style: italic;
    &:hover {
      color: #40a9ff;
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
