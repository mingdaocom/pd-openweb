import React from 'react';
import { useMeasure } from 'react-use';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import emptyPng from 'src/pages/worksheet/assets/record.png';

const Con = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .iconBox {
    width: 130px;
    height: 130px;
    display: inline-block;
    border-radius: 50%;
    background: url(${emptyPng}) no-repeat;
    background-size: 130px 130px;
    background-color: #f5f5f5;
  }
`;
export default function NoRecords(props) {
  const { style, sheetIsFiltered, allowAdd, showNewRecord, text, icon } = props;
  const [ref, { height }] = useMeasure();
  return (
    <Con ref={ref} style={style}>
      {!!height && (
        <div
          className={cx('TxtCenter', {
            Hand: !(sheetIsFiltered || !allowAdd),
          })}
          onClick={() => {
            if (sheetIsFiltered || !allowAdd) {
              return;
            }
            showNewRecord();
          }}
        >
          {height > 200 && (icon || <i className="iconBox mBottom12" />)}
          <span className="Gray_9e Block mBottom20 TxtCenter Font17 Gray_9e">
            {text
              ? text
              : sheetIsFiltered
                ? _l('没有符合条件的记录')
                : allowAdd
                  ? _l('暂未添加记录，点击创建')
                  : _l('暂未添加记录')}
          </span>
        </div>
      )}
    </Con>
  );
}

NoRecords.propTypes = {
  style: PropTypes.shape(),
  sheetIsFiltered: PropTypes.bool,
  text: PropTypes.bool,
  icon: PropTypes.element,
  allowAdd: PropTypes.bool,
  showNewRecord: PropTypes.func,
};
