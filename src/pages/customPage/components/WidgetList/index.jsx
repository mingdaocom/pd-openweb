import React, { useState, useMemo } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import { widgets } from '../../enum';
import EditWidget from '../editWidget';

const WidgetWrap = styled.div`
  box-sizing: border-box;
  width: 240px;
  background-color: #fff;
  padding: 10px;
  .header {
    padding-left: 12px;
    line-height: 36px;
    span {
      color: #757575;
    }
    .iconWrap {
      margin-left: 6px;
    }
  }
  .widgetList {
    li {
      display: flex;
      align-items: center;
      padding: 0 10px;
      border-radius: 4px;
      line-height: 44px;
      cursor: pointer;
      span {
        flex: 1;
        margin-left: 12px;
        font-size: 14px;
      }
      .add {
        visibility: hidden;
      }
      &:hover {
        background-color: #f5f5f5;
        .add {
          visibility: visible;
        }
      }
    }
  }
`;

function WidgetList({ addWidget = _.noop, ...rest }) {
  const [createWidget, setWidget] = useState({});
  return (
    <WidgetWrap>
      <div className="header">
        <span className="Bold">{_l('添加组件')}</span>
        {/* <div className="iconWrap" data-tip={_l('添加组件')}>
          <i className="icon-help Font16 Gray_9e"></i>
        </div> */}
      </div>
      <ul className="widgetList">
        {_.keys(widgets).map(key => {
          const { icon, name } = widgets[key];
          return (
            <li key={key} onClick={() => setWidget({ type: key })}>
              <i className={`Font18 icon-${icon} Gray_75`}></i>
              <span>{name}</span>
              <i className="add icon-add Font18 Gray_75"></i>
            </li>
          );
        })}
      </ul>
      {!_.isEmpty(createWidget) && <EditWidget mode="add" onClose={() => setWidget({})} widget={createWidget} addWidget={addWidget} {...rest} />}
    </WidgetWrap>
  );
}
export default WidgetList;
