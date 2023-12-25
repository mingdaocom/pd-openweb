import { number } from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const CreatedBy = styled.div`
  color: #757575;
`;

export default function CreateByMingDaoYun(props) {
  const { fontSize = 13 } = props;
  return (
    <CreatedBy
      style={{ fontSize }}
      dangerouslySetInnerHTML={{
        __html: _l('使用 %0明道云%1 创建', '<a href="https://mingdao.com" target="_blank">', '</a>'),
      }}
    />
  );
}

CreateByMingDaoYun.propTypes = {
  fontSize: number,
};
