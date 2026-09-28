import React from 'react';
import _ from 'lodash';
import { func, string } from 'prop-types';
import styled from 'styled-components';
import { Collapse } from 'ming-ui/antd-components';
import { SearchFn } from 'src/utils/domain/control/capabilities';
import { functionDetails, functionTypes } from '../enum';

const ExpandIcon = styled.i`
  display: inline-block;
  margin-top: -2px;
  font-size: 16px;
  color: var(--color-text-tertiary);
  vertical-align: middle !important;
  transform: ${({ $isActive }) => `rotate(${$isActive ? 0 : -90}deg)`};
`;

const Con = styled.div`
  padding: 10px 0;
  .hap-collapse,
  .hap-collapse-borderless {
    background-color: transparent !important;
  }
  .fnTitle {
    font-weight: bold;
    color: var(--color-text-primary);
  }
  .hap-collapse-header {
    padding: 12px 14px !important;
    .hap-collapse-expand-icon {
      margin-inline-end: 0px !important;
    }
  }
  .hap-collapse > .hap-collapse-item > .hap-collapse-header .hap-collapse-arrow {
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
      color: var(--color-text-secondary);
      cursor: pointer;
    }
    &:hover {
      background: var(--color-background-hover);
    }
  }
  .hap-collapse-item {
    border-bottom: none !important;
  }
  .hap-collapse-arrow {
    top: 15px !important;
    padding: 0px !important;
    left: 14px !important;
  }
  .hap-collapse-body {
    padding: 0px !important;
  }
`;

// 控件不支持的函数计算类型
const fnFilterByControl = (fnName, control) => {
  // 公式函数不支持当前时间
  if (fnName === 'DATENOW' && _.get(control, 'type') === 53) return false;
  return true;
};

const commonly = {
  name: _l('常用函数'),
  type: 'commonly',
  functions: ['IF', 'CONCAT', 'AVERAGE', 'SUM', 'NETWORKDAY', 'DATEADD', 'DATEIF'],
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
          fnFilterByControl(fnName, control) &&
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
            <ExpandIcon $isActive={isActive} className="icon icon-worksheet_fall" />
          </span>
        )}
        {...(keywords
          ? {
              activeKey: types,
            }
          : {})}
        items={functionListOfTypes.map(item => ({
          key: item.type,
          label: <span className="fnTitle">{item.name}</span>,
          children: item.functions.map((fnName, j) => (
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
          )),
        }))}
      />
    </Con>
  );
}

FnList.propTypes = {
  keywords: string,
  insertFn: func,
};
