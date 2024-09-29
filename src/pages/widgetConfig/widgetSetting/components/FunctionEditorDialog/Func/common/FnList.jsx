import React from 'react';
import styled from 'styled-components';
import { func, string } from 'prop-types';
import { Collapse } from 'antd';
import { functionTypes, functionDetails } from '../enum';
import { SearchFn } from 'src/pages/widgetConfig/util';
import 'antd/lib/collapse/style/index.css';
import _ from 'lodash';

const ExpandIcon = styled.i`
  display: inline-block;
  margin-top: -2px;
  font-size: 16px;
  color: #9d9d9d;
  vertical-align: middle !important;
  transform: ${({ isActive }) => `rotate(${isActive ? 0 : -90}deg)`};
`;

const Con = styled.div`
  padding: 10px 0;
  .fnTitle {
    font-weight: bold;
  }
  .ant-collapse-header {
    padding: 12px 14px !important;
  }
  .ant-collapse > .ant-collapse-item > .ant-collapse-header .ant-collapse-arrow {
    margin-right: 4px;
    vertical-align: middle;
  }
  .fnItem {
    font-size: 13px;
    cursor: pointer;
    padding: 5px 35px !important;
    .fn {
      font-weight: 500;
    }
    .fnName {
      font-size: 12px;
      color: #9e9e9e;
      cursor: pointer;
    }
    &:hover {
      background: #f5f5f5;
    }
  }
  .ant-collapse-item {
    border-bottom: none !important;
  }
  .ant-collapse-arrow {
    top: 15px !important;
    padding: 0px !important;
    left: 14px !important;
  }
  .ant-collapse-content-box {
    padding: 0px !important;
  }
`;

// 控件不支持的函数计算类型
const fnFilterByControl = (fnName, control) => {
  // 公式函数不支持当前时间
  if (fnName === 'DATENOW' && _.get(control, 'type') === 53) return false;
  return true;
};

export default function FnList(props) {
  const { keywords, insertFn, control } = props;
  const functionNames = Object.keys(functionDetails);
  let types = Object.keys(functionTypes);
  if (keywords) {
    types = types.filter(type =>
      _.find(
        functionNames,
        fnName =>
          functionDetails[fnName].type === type &&
          (SearchFn(keywords, fnName) || SearchFn(keywords, functionDetails[fnName].name)),
      ),
    );
  }
  let functionListOfTypes = types.map(type => ({
    name: functionTypes[type],
    type,
    functions: functionNames.filter(
      fnName =>
        fnFilterByControl(fnName, control) &&
        functionDetails[fnName].type === type &&
        (!keywords || SearchFn(keywords, fnName) || SearchFn(keywords, functionDetails[fnName].name)),
    ),
  }));
  const commonly = {
    name: _l('常用函数'),
    type: 'commonly',
    functions: ['IF', 'CONCAT', 'AVERAGE', 'SUM', 'NETWORKDAY', 'DATEADD', 'DATEIF'],
  };
  if (!keywords && commonly.functions.length) {
    functionListOfTypes = [commonly].concat(functionListOfTypes);
  }
  return (
    <Con>
      <Collapse
        defaultActiveKey="commonly"
        bordered={false}
        expandIcon={({ isActive }) => (
          <span>
            <ExpandIcon isActive={isActive} className="icon icon-worksheet_fall" />
          </span>
        )}
        {...(keywords
          ? {
              activeKey: types,
            }
          : {})}
      >
        {functionListOfTypes.map(item => (
          <Collapse.Panel key={item.type} header={<span className="fnTitle">{item.name}</span>}>
            {item.functions.map((fnName, j) => (
              <div
                className="fnItem"
                key={j}
                onClick={() => {
                  window.emitter.emit('FUNCTIONEDITOR_ACTIVE_FN', fnName);
                  insertFn(fnName);
                }}
                onMouseEnter={() => {
                  window.emitter.emit('FUNCTIONEDITOR_FOCUS_FN', fnName);
                }}
                onMouseLeave={() => {
                  window.emitter.emit('FUNCTIONEDITOR_BLUR_FN', fnName);
                }}
              >
                <div className="fn">{fnName}</div>
                <div className="fnName">{functionDetails[fnName].name}</div>
              </div>
            ))}
          </Collapse.Panel>
        ))}
      </Collapse>
    </Con>
  );
}

FnList.propTypes = {
  keywords: string,
  insertFn: func,
};
