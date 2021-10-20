import React, { Component, Fragment } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import withClickAway from 'ming-ui/decorators/withClickAway';
import update from 'immutability-helper';
import { Checkbox } from 'ming-ui';
import {
  CAN_AS_TEXT_DYNAMIC_FIELD,
  CAN_AS_EMAIL_DYNAMIC_FIELD,
  CAN_AS_DEPARTMENT_DYNAMIC_FIELD,
  CAN_AS_NUMBER_DYNAMIC_FIELD,
  CAN_AS_TIME_DYNAMIC_FIELD,
  SYSTEM_TIME,
  SYSTEM_USER,
  CAN_AS_USER_DYNAMIC_FIELD,
} from '../config';
import { SelectFieldsWrap } from 'src/pages/widgetConfig/styled';
import { getIconByType } from '../../../../util';
import { includes } from 'lodash';
import { SYSTEM_CONTROL } from '../../../../config/widget';

const Empty = styled.div`
  color: #9e9e9e;
  padding: 60px 0;
  text-align: center;
  background-color: #fff;
`;

const isSingleRelate = control => control.type === 29 && control.enumDefault === 1;

// // 汇总字段对应的类型
// const isSummaryType = (item, matchType = [15, 16]) => {
//   return item.type === 37 && _.includes(matchType, item.enumDefault2);
// };

// 公式控件计算为数值的
const isFormulaResultAsNumber = item => {
  return item.type === 31 || (item.type === 38 && item.enumDefault === 1);
};
// 他表字段值为数值的
const relateSheetFiledIsNumber = item => {
  return item.type === 30 && _.includes(CAN_AS_NUMBER_DYNAMIC_FIELD, _.get(item, ['sourceControl', 'type']));
};
// 公式控件计算为日期的
const isFormulaResultAsDate = item => {
  return item.type === 38 && item.enumDefault !== 1;
};

// 赋分值的选项
const isEnableScoreOption = item => {
  return includes([9, 10, 11], item.type) && item.enumDefault === 1;
};

// 根据类型筛选 可用的动态默认值类型
const FILTER = {
  // 文本
  2: item => _.includes(CAN_AS_TEXT_DYNAMIC_FIELD, item.type),
  3: item => _.includes([3], item.type),
  4: item => _.includes([4], item.type),
  5: item => _.includes(CAN_AS_EMAIL_DYNAMIC_FIELD, item.type),
  // 数值
  6: item =>
    _.includes(CAN_AS_NUMBER_DYNAMIC_FIELD, item.type) ||
    isEnableScoreOption(item) ||
    isFormulaResultAsNumber(item) ||
    relateSheetFiledIsNumber(item),
  // 金额
  8: item =>
    _.includes(CAN_AS_NUMBER_DYNAMIC_FIELD, item.type) ||
    isEnableScoreOption(item) ||
    isFormulaResultAsNumber(item) ||
    relateSheetFiledIsNumber(item),
  // 日期
  15: item => _.includes(CAN_AS_TIME_DYNAMIC_FIELD, item.type) || isFormulaResultAsDate(item),
  16: item => _.includes(CAN_AS_TIME_DYNAMIC_FIELD, item.type) || isFormulaResultAsDate(item),

  // 多选可以选择单选字段 单选不能选多选字段
  // 用户
  26: (item, enumDefault) =>
    enumDefault === 0
      ? _.includes(CAN_AS_USER_DYNAMIC_FIELD, item.type) && item.enumDefault === enumDefault
      : _.includes(CAN_AS_USER_DYNAMIC_FIELD, item.type),
  27: item => _.includes(CAN_AS_DEPARTMENT_DYNAMIC_FIELD, item.type),
};

@withClickAway
export default class SelectFields extends Component {
  static propTypes = {};
  static defaultProps = {};
  state = {
    searchValue: '',
  };
  // 省略掉自身和循环引用
  omitSelfAndNest = controls => {
    const { data } = this.props;
    return _.filter(controls, item => {
      try {
        const defaultValue = JSON.parse(_.get(item, ['advancedSetting', 'defsource']) || '[]');
        // 去除循环引用
        if (_.some(defaultValue, item => _.includes([data.controlId], item.cid))) {
          return false;
        }
      } catch (error) {
        return false;
      }
      return item.controlId !== data.controlId;
    });
  };
  handleChange = e => {
    const { value } = e.target;
    this.setState({ searchValue: value });
  };
  getControls = controls => {
    const { type, enumDefault, dataSource } = _.get(this.props, 'data');
    const filterFn = FILTER[type];
    if (_.includes([2, 3, 4, 5, 6, 8, 27], type)) return _.filter(controls, filterFn);
    // 单选选项集
    if (_.includes([9, 11], type)) {
      return _.filter(controls, item => item.dataSource === dataSource && _.includes([9, 11], item.type));
    }
    // 多选选项集
    if (_.includes([10], type)) return _.filter(controls, item => item.dataSource === dataSource);

    if (_.includes([15, 16], type)) {
      return _.filter(controls, filterFn);
    }

    if (_.includes([26], type)) {
      return _.filter(controls, item => filterFn(item, enumDefault)).concat(SYSTEM_USER);
    }
    if (_.includes([29], type)) {
      return _.filter(controls, item => item.dataSource === dataSource && item.enumDefault === 1);
    }
    return controls;
  };
  filterFieldList = () => {
    const { from, globalSheetInfo, controls } = this.props;
    const subListControls = this.omitSelfAndNest(controls);
    const globalSheetControls = this.omitSelfAndNest(this.props.globalSheetControls);
    const { worksheetId } = globalSheetInfo;
    const { searchValue } = this.state;
    const initSheetList =
      from === 'subList'
        ? [
            { id: worksheetId, name: _l('主记录') },
            { id: 'current', name: _l('当前子表记录') },
          ]
        : [{ id: 'current', name: _l('当前记录') }];
    // 获取当前记录和关联表控件
    const sheetList = initSheetList.concat(
      _.filter(subListControls, item => isSingleRelate(item) || item.type === 35).map(item => ({
        id: item.controlId,
        name: item.type === 35 ? _l('级联选择 “%0”', item.controlName) : _l('关联记录 “%0”', item.controlName),
      })),
    );
    // 获取当前表的控件
    const fieldList = {
      current: this.getControls(subListControls),
      [worksheetId]: this.getControls(globalSheetControls),
    };
    // 获取关联表控件下的所有符合条件的字段
    sheetList.slice(initSheetList.length).forEach(({ id }) => {
      const relateSheetControl = _.find(subListControls, ({ controlId }) => controlId === id);

      let relationControls = _.get(relateSheetControl, 'relationControls') || [];
      // 如果relationControl没有返回系统字段， 则手动添加上
      if (!relationControls.some(item => item.controlId === 'ctime')) {
        relationControls = relationControls.concat(SYSTEM_CONTROL);
      }

      const filteredRelationControls = this.getControls(relationControls);
      fieldList[id] = filteredRelationControls;
    });
    if (!searchValue) return { sheetList, filteredList: fieldList };
    const filteredList = {};
    _.keys(fieldList).forEach(key => {
      const item = fieldList[key];
      filteredList[key] = item.filter(field => _.includes(field.controlName, searchValue));
    });
    return { sheetList, filteredList };
  };
  isMultiUser = data => {
    return data.type === 26 && data.enumDefault === 1;
  };
  handleMultiUserClick = para => {
    const { checked, relateSheetControlId, fieldId } = para;
    const { onMultiUserChange, dynamicValue } = this.props;
    const newValue = checked
      ? update(dynamicValue, {
          $push: [{ cid: fieldId, rcid: relateSheetControlId, staticValue: '' }],
        })
      : update(dynamicValue, {
          $splice: [[_.findIndex(dynamicValue, item => item.cid === fieldId && item.rcid === relateSheetControlId), 1]],
        });
    onMultiUserChange(newValue);
  };
  getControlCount = list => {
    return _.keys(list).reduce((p, c) => p + (list[c] || []).length, 0);
  };
  render() {
    const { searchValue } = this.state;
    const { onClick, data, dynamicValue } = this.props;
    const { sheetList, filteredList } = this.filterFieldList();
    const filteredControlCount = this.getControlCount(filteredList);
    return (
      <SelectFieldsWrap>
        <div className="search">
          <i className="icon-search Gray_9e" />
          <input value={searchValue} onChange={this.handleChange} placeholder={_l('搜索字段')}></input>
        </div>
        <div className="fieldsWrap">
          {sheetList.map(({ id: recordId, name }) => {
            const list = filteredList[recordId];
            return list.length > 0 ? (
              <ul className="relateSheetList">
                <li>
                  <div className="title">
                    <span>{name}</span>
                  </div>
                  <ul className="fieldList">
                    {list.map(({ type, controlName, controlId, id }) => {
                      const ids = {
                        type,
                        relateSheetControlId: recordId === 'current' ? '' : recordId,
                        fieldId: controlId || id,
                      };
                      return this.isMultiUser(data) ? (
                        <li className="overflow_ellipsis">
                          <Checkbox
                            size="small"
                            checked={_.some(
                              dynamicValue,
                              item => item.cid === ids.fieldId && item.rcid === ids.relateSheetControlId,
                            )}
                            onClick={checked => {
                              this.handleMultiUserClick({
                                checked: !checked,
                                ...ids,
                              });
                            }}
                          >
                            <i className={`icon-${getIconByType(type)}`}></i>
                            <span className="overflow_ellipsis">{controlName}</span>
                          </Checkbox>
                        </li>
                      ) : (
                        <li className="overflow_ellipsis" onClick={() => onClick(ids)}>
                          <i className={`icon-${getIconByType(type)}`}></i>
                          <span className="overflow_ellipsis">{controlName}</span>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              </ul>
            ) : null;
          })}
          {!filteredControlCount && <Empty>{searchValue ? _l('暂无搜索结果') : _l('没有可用字段')}</Empty>}
        </div>
      </SelectFieldsWrap>
    );
  }
}
