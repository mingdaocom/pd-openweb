import React, { Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import DynamicDefaultValue from '../DynamicDefaultValue';

const ControlWrap = styled.div`
  .childWrap {
    margin-top: 15px;
    & > div:nth-child(2) {
      margin-top: 9px;
    }
    &.isChild {
      margin-top: 8px;
      padding: 8px 0 8px 20px;
      border-left: 3px solid #f2f2f2;
    }
    .settingItemTitle {
      display: none;
    }
    .CodeMirror-placeholder {
      color: #ccc;
      font-size: 14px;
      line-height: 27px;
      margin-left: 3px;
    }
    .fieldList li {
      ${props => (props.fromOperationFlow ? 'max-width: 100%;' : '')}
    }
  }
`;

export default function SearchParams(props) {
  const { requestControls = [], data = {}, allControls = [], onChange, fromOperationFlow } = props;
  const requestmap = getAdvanceSetting(data, 'requestmap') || [];

  // 获取对象数组本身选择的子表或关联记录控件
  const getParentControl = item => {
    if (!item.dataSource) return {};
    const { defsource } = _.find(requestmap, i => i.id === item.dataSource) || {};
    if (!defsource) return {};
    const cid = (JSON.parse(defsource || '[]')[0] || {}).cid;
    return _.find(props.allControls || [], i => i.controlId === cid) || {};
  };

  const renderItem = item => {
    const isChild = item.dataSource;
    const mapItem = _.find(requestmap, i => i.id === item.controlId) || {};
    const filterAllControls = item.type === 27 ? allControls.filter(i => i.type === 27) : allControls;
    const isSearch = (data.type === 50 && data.enumDefault === 2) || data.type === 43;
    return (
      <div className={cx('childWrap', { isChild })}>
        <div className="controlLabel ellipsis">
          {item.required && (
            <div
              className="Absolute"
              style={{ left: `${isChild ? '12px' : '-6px'}`, marginTop: '1px', color: '#f44336' }}
            >
              *
            </div>
          )}
          {item.controlName}
          {item.alias && <span className="Gray_9e">（{item.alias}）</span>}
        </div>
        <DynamicDefaultValue
          from={data.type === 43 ? 3 : 2} // 为了异化默认值其他字段配置
          {..._.pick(props, ['globalSheetInfo', 'titleControl', 'fromCustomEventApi'])}
          allControls={filterAllControls}
          data={{
            ...handleAdvancedSettingChange(item, {
              defsource: mapItem.defsource || '',
              defaulttype: '',
            }),
            enumDefault: _.includes([26, 27], item.type) ? 1 : item.enumDefault,
            isSearch,
          }}
          propFiledVisible={_.includes([15, 16, 26], item.type) ? false : !isSearch}
          hideSearchAndFun={true}
          parentControl={getParentControl(item)}
          onChange={newData => {
            const { defsource } = getAdvanceSetting(newData);
            const newRequestMap = requestmap.map(i =>
              i.id === item.controlId ? Object.assign({}, i, { defsource }) : i,
            );
            onChange(
              handleAdvancedSettingChange(data, {
                requestmap: newRequestMap.length ? JSON.stringify(newRequestMap) : '',
              }),
            );
          }}
        />
        {item.desc && <span className="Gray_9e Font12 mTop5 InlineBlock WordBreak">{item.desc}</span>}
      </div>
    );
  };

  return (
    <ControlWrap fromOperationFlow={fromOperationFlow}>
      {requestControls.map(item => {
        const hasValue = _.get(
          _.find(requestmap, i => i.id === item.controlId),
          'defsource',
        );
        return (
          <Fragment>
            {renderItem(item)}
            {item.child && hasValue && <div className="childContent">{item.child.map(c => renderItem(c))}</div>}
          </Fragment>
        );
      })}
    </ControlWrap>
  );
}
