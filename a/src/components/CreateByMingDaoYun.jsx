import { number } from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const CreatedBy = styled.div`
  color: #757575;
  a {
    color: #333;
    font-weight: bold;
    font-style: italic;
    &:hover {
      color: #40a9ff;
    }
  }
`;

const MODE = {
  CREATE: 1,
  POWERED: 2,
};

export default function CreateByMingDaoYun(props) {
  const { mode = MODE.CREATE, fontSize = 13 } = props;
  const html = {
    [MODE.CREATE]: _l('使用 %0HAP%1 创建', '<a href="https://mingdao.com" target="_blank">', '</a>'),
    [MODE.POWERED]: _l(
      'powered by %0HAP%1 - 零代码构建企业应用',
      '<a href="https://mingdao.com" target="_blank">',
      '</a>',
    ),
  }[mode];
  return (
    <CreatedBy
      style={{ fontSize }}
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    />
  );
}

CreateByMingDaoYun.propTypes = {
  mode: number,
  fontSize: number,
};
