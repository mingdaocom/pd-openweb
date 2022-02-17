import React, { Component, Fragment, createRef } from 'react';
import { func } from 'prop-types';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import SelectFields from './SelectFields';
import FunctionEditorDialog from '../../FunctionEditorDialog';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../../util/setting';
import SearchWorksheetDialog from '../../SearchWorksheet/SearchWorksheetDialog';
import { SelectOtherFieldWrap } from '../styled';
import { Menu, MenuItem } from 'ming-ui';
import { Tooltip } from 'antd';
import {
  OTHER_FIELD_LIST,
  OTHER_FIELD_TYPE,
  CAN_AS_OTHER_DYNAMIC_FIELD,
  CURRENT_TYPES,
  CAN_AS_FX_DYNAMIC_FIELD,
  CAN_NOT_AS_FIELD_DYNAMIC_FIELD,
} from '../config';
import styled from 'styled-components';
import cx from 'classnames';

const MenuStyle = styled.div`
  display: flex;
  align-items: center;
  i {
    width: 20px;
    color: #757575;
  }
  &:hover {
    i {
      color: #fff;
    }
  }
`;

export default class SelectOtherField extends Component {
  static propTypes = { onTriggerClick: func };
  static defaultProps = {
    onTriggerClick: _.noop,
  };
  constructor(props) {
    super(props);
    this.$wrap = createRef(null);
  }
  state = {
    isDynamic: false,
    filedVisible: false,
    searchVisible: false,
    fxVisible: false,
  };

  // 插入标签;
  insertField = para => {
    const { fieldId, relateSheetControlId, type } = para;
    const { data = {}, onDynamicValueChange, dynamicValue } = this.props;
    const { advancedSetting = {} } = data;
    const isText = _.includes([1, 2, 45], data.type);
    const isAsync = () => {
      // 部门选成员 需要异步获取数据 isAsync设为true
      if (data.type === 27 && type === 26) return true;
      return false;
    };

    const newField = [{ cid: fieldId, rcid: relateSheetControlId, staticValue: '', isAsync: isAsync() }];
    onDynamicValueChange(newField);
    //多选类型不关闭
    if (isText || (_.includes([26, 27], data.type) && advancedSetting.enumDefault === 1)) return;
    this.setState({ isDynamic: false, filedVisible: false });
  };

  triggerClick = () => {
    const { defaultType } = this.props;
    if (defaultType === 'dynamicsrc') {
      this.handleAction({ key: OTHER_FIELD_TYPE.SEARCH });
    } else if (defaultType === 'defaultfunc') {
      this.handleAction({ key: OTHER_FIELD_TYPE.FX });
    }
  };

  handleAction = data => {
    const { onDynamicValueChange } = this.props;
    switch (data.key) {
      case OTHER_FIELD_TYPE.FIELD:
        this.setState({ filedVisible: true });
        break;
      case OTHER_FIELD_TYPE.SEARCH:
        this.setState({ searchVisible: true, isDynamic: false });
        break;
      case OTHER_FIELD_TYPE.FX:
        this.setState({ fxVisible: true, isDynamic: false });
        break;
      case OTHER_FIELD_TYPE.DEPT:
        onDynamicValueChange([
          {
            rcid: '',
            cid: '',
            staticValue: JSON.stringify({ departmentName: _l('当前用户所在部门'), departmentId: 'user-departments' }),
            isAsync: true,
          },
        ]);
        this.setState({ isDynamic: false });
        break;
      case OTHER_FIELD_TYPE.USER:
        onDynamicValueChange([{ rcid: '', cid: data.id, staticValue: '', isAsync: false }]);
        this.setState({ isDynamic: false });
        break;
      case OTHER_FIELD_TYPE.DATE:
        onDynamicValueChange([{ rcid: '', cid: '', staticValue: data.value, time: data.id }]);
        this.setState({ isDynamic: false });
        break;
    }
  };

  getCurrentField = data => {
    let types = OTHER_FIELD_LIST;
    // 没有函数的控件
    if (!_.includes(CAN_AS_FX_DYNAMIC_FIELD, data.type)) {
      types = types.filter(item => item.key !== OTHER_FIELD_TYPE.FX);
    }
    // 没有动态值的控件
    if (_.includes(CAN_NOT_AS_FIELD_DYNAMIC_FIELD, data.type)) {
      types = types.filter(item => item.key !== OTHER_FIELD_TYPE.FIELD);
    }
    // 有其他字段的控件
    if (_.includes(CAN_AS_OTHER_DYNAMIC_FIELD, data.type)) {
      types = (CURRENT_TYPES[data.type] || []).concat(types);
    }
    //子表里的字段默认值没有查询和函数配置
    if (this.props.hideSearchAndFun) {
      types = types.filter(item => !_.includes([OTHER_FIELD_TYPE.SEARCH, OTHER_FIELD_TYPE.FX], item.key));
    }
    return types;
  };

  render() {
    const { isDynamic, filedVisible, fxVisible, searchVisible } = this.state;
    const {
      data,
      dynamicValue,
      onDynamicValueChange,
      controls,
      allControls,
      onChange,
      popupContainer,
      propFiledVisible,
    } = this.props;
    const filterTypes = this.getCurrentField(data);
    //子表特殊处理
    const isSubList = _.includes([34], data.type);
    return (
      <Fragment>
        <div ref={this.$wrap} className="selectOtherFieldContainer">
          <Trigger
            action={['click']}
            popupStyle={{ width: '100%' }}
            popupVisible={isDynamic && !isSubList}
            onPopupVisibleChange={isDynamic => this.setState({ isDynamic })}
            getPopupContainer={() => popupContainer || this.$wrap.current}
            popup={() => {
              return propFiledVisible || filedVisible ? (
                <SelectFields
                  onClickAway={() => this.setState({ isDynamic: false, filedVisible: false })}
                  data={data}
                  dynamicValue={dynamicValue}
                  onClick={this.insertField}
                  onMultiUserChange={onDynamicValueChange}
                  {...this.props}
                />
              ) : (
                <Menu>
                  {filterTypes.map(item => {
                    return (
                      <MenuItem className="overflow_ellipsis" onClick={() => this.handleAction(item)}>
                        <MenuStyle>
                          <i className={`${item.icon} Font20 mRight15`}></i>
                          {item.text}
                        </MenuStyle>
                      </MenuItem>
                    );
                  })}
                </Menu>
              );
            }}
            popupAlign={{
              points: ['tr', 'br'],
              offset: [0, 5],
              overflow: { adjustX: true, adjustY: true },
            }}
          >
            <Tooltip trigger={['hover']} placement={'bottom'} title={isSubList ? _l('查询工作表') : _l('使用动态值')}>
              <SelectOtherFieldWrap
                onClick={() => {
                  if (isSubList) {
                    this.setState({ searchVisible: true });
                    return;
                  }
                  this.setState({ isDynamic: true });
                }}
              >
                <i className={cx(isSubList ? 'icon-lookup' : 'icon-workflow_other')}></i>
              </SelectOtherFieldWrap>
            </Tooltip>
          </Trigger>
        </div>
        {searchVisible && (
          <SearchWorksheetDialog
            {...this.props}
            fromCondition={'relateSheet'}
            onClose={() => this.setState({ searchVisible: false })}
          />
        )}
        {fxVisible && (
          <FunctionEditorDialog
            value={getAdvanceSetting(data, 'defaultfunc')}
            title={data.controlName}
            controls={allControls.filter(c => c.controlId !== data.controlId)}
            onClose={() => this.setState({ fxVisible: false })}
            onSave={value => {
              onChange(
                handleAdvancedSettingChange(data, {
                  defsource: '',
                  defaulttype: '1',
                  dynamicsrc: '',
                  defaultfunc: JSON.stringify(value),
                }),
              );
            }}
          />
        )}
      </Fragment>
    );
  }
}
