import React, { Fragment, useState } from 'react';
import { Icon } from 'ming-ui';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import { SelectColorWrap } from './style';
import cx from 'classnames';
import _ from 'lodash';

const ColorBox = styled.div`
  width: 52px;
  height: 32px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 3px;
  cursor: pointer;
  padding: 3px 4px;
  box-sizing: border-box;
  div {
    width: 100%;
    height: 100%;
    border-radius: 3px;
    background: ${props => props.background || '#2196F3'};
  }
`;

export default function ColorSetting(props) {
  const { data, value, isCustom, onChange } = props;

  const renderList = isCus => {
    const list = isCus ? (_.includes(data, value) ? [] : [value]) : data;
    return (
      <ul>
        {isCus ? (
          <li>
            <div className="colorItem">
              <Icon icon="task-add-member-circle" className="Font24 Gray_bd" />
              <input type="color" value="#333333" onChange={event => onChange(event.target.value)} />
            </div>
          </li>
        ) : null}
        {list.map((item, index) => (
          <li
            className={cx({ active: value === item })}
            key={index}
            style={{ color: item }}
            onClick={() => onChange(item)}
          >
            <Icon className="colorItemCheck" icon="done" />
            <div
              className="colorItem"
              style={{
                backgroundColor: item,
                border: _.includes(['#fff', '#ffffff', 'rgb(255, 255, 255)'], item) ? '1px solid #F0F0F0' : null,
              }}
            />
          </li>
        ))}
      </ul>
    );
  };

  const renderContent = () => {
    return (
      <SelectColorWrap>
        {renderList()}
        {isCustom ? (
          <Fragment>
            <div className="Gray_9e mTop10">{_l('自定义')}</div>
            {renderList(true)}
          </Fragment>
        ) : null}
      </SelectColorWrap>
    );
  };

  return (
    <Trigger
      popup={renderContent}
      action={['click']}
      popupAlign={{
        points: ['tl', 'bl'],
        offset: [-80, 3],
      }}
    >
      <ColorBox background={value}>
        <div></div>
      </ColorBox>
    </Trigger>
  );
}
