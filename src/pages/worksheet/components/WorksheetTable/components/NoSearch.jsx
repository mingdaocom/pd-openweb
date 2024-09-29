import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Con = styled.div`
  position: absolute;
  text-align: center;
  width: 100%;
  height: 36px;
  top: 35px;
  line-height: 34px;
  background: #d8effe;
  .green {
    color: #30ae01;
  }
`;

export default function NoSearch(props) {
  const { columnHeadHeight = 34 } = props;
  return (
    <Con style={{ top: columnHeadHeight }}>
      <div className="ThemeColor3">
        {_l('没有搜索到"')}
        <span class="green">{props.keyWords}</span>
        {_l('"相关的记录')}
      </div>
    </Con>
  );
}

NoSearch.propTypes = {
  keyWords: PropTypes.string,
  columnHeadHeight: PropTypes.number,
};
