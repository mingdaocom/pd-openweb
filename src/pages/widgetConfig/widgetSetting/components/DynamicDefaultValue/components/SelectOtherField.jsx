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
  CUSTOM_PHP_TYPES,
  CAN_AS_FX_DYNAMIC_FIELD,
  CAN_NOT_AS_FIELD_DYNAMIC_FIELD,
  DYNAMIC_FROM_MODE,
  CUR_OCR_TYPES,
  CUR_OCR_URL_TYPES,
  WATER_MASK_TYPES,
  CUR_EMPTY_TYPES,
} from '../config';
import styled from 'styled-components';
import cx from 'classnames';
import _ from 'lodash';
import { isSheetDisplay } from 'src/pages/widgetConfig/util';
import { getDaterange } from 'src/pages/worksheet/common/ViewConfig/components/fastFilter/util.js';
import { DATE_TYPE } from 'src/pages/worksheet/common/ViewConfig/components/fastFilter/config.js';

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
    showPopupType: '',
  };

  // 插入标签;
  insertField = para => {
    const { fieldId, relateSheetControlId, type } = para;
    const { data = {}, onDynamicValueChange, dynamicValue } = this.props;
    const { advancedSetting = {} } = data;
    const isText = _.includes([1, 2, 41, 45], data.type);
    const isAsync = () => {
      // 部门选成员 | 成员选部门 需要异步获取数据 isAsync设为true
      if ((_.includes([27, 48], data.type) && type === 26) || (data.type === 26 && _.includes([27, 48], type)))
        return true;
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
            staticValue: JSON.stringify({ departmentName: data.text, departmentId: 'user-departments' }),
            isAsync: true,
          },
        ]);
        this.setState({ isDynamic: false });
        break;
      case OTHER_FIELD_TYPE.ROLE:
        onDynamicValueChange([
          {
            rcid: '',
            cid: '',
            staticValue: JSON.stringify({ organizeName: data.text, organizeId: 'user-role' }),
            isAsync: true,
          },
        ]);
        this.setState({ isDynamic: false });
        break;
      case OTHER_FIELD_TYPE.USER:
        onDynamicValueChange([
          {
            rcid: '',
            cid: '',
            staticValue: JSON.stringify({
              accountId: data.id,
              name: data.text,
            }),
            isAsync: false,
          },
        ]);
        this.setState({ isDynamic: false });
        break;
      case OTHER_FIELD_TYPE.DATE:
        onDynamicValueChange([{ rcid: '', cid: '', staticValue: data.value, time: data.id }]);
        this.setState({ isDynamic: false });
        break;
      case OTHER_FIELD_TYPE.TIME:
        onDynamicValueChange([{ rcid: '', cid: '', staticValue: data.value }]);
        this.setState({ isDynamic: false });
        break;
      case OTHER_FIELD_TYPE.Location:
      case OTHER_FIELD_TYPE.OCR:
      case OTHER_FIELD_TYPE.KEYWORD:
      case OTHER_FIELD_TYPE.WATER_MASK:
      case OTHER_FIELD_TYPE.EMPTY:
      case OTHER_FIELD_TYPE.CODE_RESULT:
      case OTHER_FIELD_TYPE.TRIGGER_TIME:
      case OTHER_FIELD_TYPE.TRIGGER_DEPARTMENT:
      case OTHER_FIELD_TYPE.TRIGGER_ORG:
      case OTHER_FIELD_TYPE.TRIGGER_USER:
        onDynamicValueChange([{ rcid: '', cid: `${data.id}`, staticValue: '' }]);
        this.setState({ isDynamic: false });
        break;
    }
  };

  handleActionForLinkParam = value => {
    const { onDynamicValueChange } = this.props;
    onDynamicValueChange([{ cid: value, rcid: 'url', staticValue: '', isAsync: true }]);
    this.setState({ isDynamic: false, showPopupType: '' });
  };

  handleActionForDY = value => {
    const { onDynamicValueChange } = this.props;
    onDynamicValueChange([{ cid: value, rcid: 'dateRange', staticValue: '', isAsync: true }]);
    this.setState({ isDynamic: false, showPopupType: '' });
  };

  getCurrentField = data => {
    if (this.props.from === DYNAMIC_FROM_MODE.FAST_FILTER && data.type === 26) {
      return CURRENT_TYPES[data.type];
    }
    // 自定义默认值
    if (this.props.from === DYNAMIC_FROM_MODE.CREATE_CUSTOM) {
      let customTypes =
        this.props.writeObject === 1
          ? CURRENT_TYPES[data.type] || []
          : (CURRENT_TYPES[data.type] || []).concat([
              { icon: 'icon-workflow_other', text: _l('当前记录的字段值'), key: 1 },
            ]);
      customTypes = this.props.showEmpty ? CUR_EMPTY_TYPES.concat(customTypes) : customTypes;
      return customTypes.filter(c => !_.includes(['keyword'], c.key));
    }
    // 自定义页面---封装业务流程
    if (this.props.from === DYNAMIC_FROM_MODE.CUSTOM_PHP) {
      return data.type === 2 ? _.flatten(Object.values(CUSTOM_PHP_TYPES)) : CUSTOM_PHP_TYPES[data.type];
    }

    let types = OTHER_FIELD_LIST;
    // 没有函数的控件
    if (!_.includes(CAN_AS_FX_DYNAMIC_FIELD, data.type)) {
      types = types.filter(item => item.key !== OTHER_FIELD_TYPE.FX);
    }
    // 没有动态值的控件
    if (_.includes(CAN_NOT_AS_FIELD_DYNAMIC_FIELD, data.type) || isSheetDisplay(data)) {
      types = types.filter(item => item.key !== OTHER_FIELD_TYPE.FIELD);
    }
    // 有其他字段的控件 ｜ api查询其他字段
    if (
      _.includes(CAN_AS_OTHER_DYNAMIC_FIELD, data.type) ||
      (_.includes(data.isSearch ? [2, 6] : [15, 16, 26], data.type) &&
        DYNAMIC_FROM_MODE.SEARCH_PARAMS === this.props.from)
    ) {
      types = (CURRENT_TYPES[data.type] || []).concat(types);
    }
    // ocr其他字段控件
    if (_.includes([2, 14], data.type) && DYNAMIC_FROM_MODE.OCR_PARAMS === this.props.from) {
      types = (data.type === 2 ? CUR_OCR_URL_TYPES : CUR_OCR_TYPES).concat(types);
    }
    // 附件水印其他字段控件
    if (DYNAMIC_FROM_MODE.WATER_MASK === this.props.from) {
      types = types.concat(WATER_MASK_TYPES);
    }
    //子表里的字段默认值没有查询和函数配置
    if (this.props.hideSearchAndFun) {
      types = types.filter(item => !_.includes([OTHER_FIELD_TYPE.SEARCH, OTHER_FIELD_TYPE.FX], item.key));
    }
    //自定义事件没有查询工作表
    if (this.props.fromCustomEvent) {
      types = types.filter(item => !_.includes([OTHER_FIELD_TYPE.DEPT, OTHER_FIELD_TYPE.ROLE], item.key));
    }
    if (this.props.fromRange) {
      // 成员范围补充当前用户所在部门
      types.splice(1, 0, _.head(CURRENT_TYPES[27]));
    }
    // 包含清空操作
    if (this.props.showEmpty) {
      types = CUR_EMPTY_TYPES.concat(types);
    }
    // 未保存子表不支持查询工作表
    if (this.props.from === 'subList' && this.props.subListSheetId.includes('-')) {
      types = types.filter(item => !_.includes([OTHER_FIELD_TYPE.SEARCH], item.key));
    }
    return types;
  };

  render() {
    const { isDynamic, filedVisible, fxVisible, searchVisible, showPopupType } = this.state;
    const {
      data,
      dynamicValue,
      onDynamicValueChange,
      controls,
      allControls,
      onChange,
      popupContainer,
      propFiledVisible,
      showEmpty,
      from,
      withLinkParams,
      withDY,
      linkParams = [],
      hideDynamic,
      fromCustomEventApi,
    } = this.props;

    const filterTypes = this.getCurrentField(data);
    //子表、列表默认显示查询工作表icon，如包含清空操作时，显示动态值icon操作
    const isSubList = (_.includes([34], data.type) || isSheetDisplay(data)) && !showEmpty;

    const renderPopupForQuickFilter = () => {
      switch (showPopupType) {
        case 'DY_DATE':
          return (
            <Menu style={{ maxHeight: 200, overflowY: 'auto' }}>
              {getDaterange(data.advancedSetting || {}).map(o => {
                return (
                  <MenuItem
                    className="overflow_ellipsis"
                    onClick={e => {
                      this.handleActionForDY(o);
                      e.stopPropagation();
                    }}
                  >
                    <MenuStyle>{(_.flattenDeep(DATE_TYPE).find(it => it.value == o) || {}).text}</MenuStyle>
                  </MenuItem>
                );
              })}
            </Menu>
          );

        case 'DY_LINK':
          return linkParams.length > 0 ? (
            <Menu>
              {linkParams.map(item => {
                return (
                  <MenuItem
                    className="overflow_ellipsis"
                    onClick={e => {
                      this.handleActionForLinkParam(item);
                      e.stopPropagation();
                    }}
                  >
                    <MenuStyle>{item}</MenuStyle>
                  </MenuItem>
                );
              })}
            </Menu>
          ) : (
            <Menu>
              <div className="Gray_75 pLeft16 pTop8 pBottom8">{_l('未添加链接参数')}</div>
            </Menu>
          );
        default:
          return (
            <Menu>
              <MenuItem
                className="overflow_ellipsis"
                onClick={e => {
                  this.setState({ showPopupType: 'DY_DATE', isDynamic: true });
                  e.stopPropagation();
                }}
              >
                <MenuStyle>
                  <i className={`icon-hr_time Font20 mRight15`}></i>
                  {_l('动态时间')}
                </MenuStyle>
              </MenuItem>
              <MenuItem
                className="overflow_ellipsis"
                onClick={e => {
                  this.setState({ showPopupType: 'DY_LINK', isDynamic: true });
                  e.stopPropagation();
                }}
              >
                <MenuStyle>
                  <i className={`icon-global_variable Font20 mRight15`}></i>
                  {_l('链接参数')}
                </MenuStyle>
              </MenuItem>
            </Menu>
          );
      }
    };

    const renderPopup = () => {
      if (from === DYNAMIC_FROM_MODE.FAST_FILTER && (withLinkParams || withDY)) {
        return renderPopupForQuickFilter();
      }
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
                  {from !== DYNAMIC_FROM_MODE.CUSTOM_PHP && <i className={`${item.icon} Font20 mRight15`}></i>}
                  {item.text}
                </MenuStyle>
              </MenuItem>
            );
          })}
        </Menu>
      );
    };
    return (
      <Fragment>
        <div ref={this.$wrap} className="selectOtherFieldContainer">
          <Trigger
            action={['click']}
            popupStyle={{ width: '100%' }}
            popupVisible={isDynamic && !isSubList}
            onPopupVisibleChange={isDynamic => this.setState({ isDynamic })}
            getPopupContainer={() => popupContainer || this.$wrap.current}
            popup={renderPopup}
            popupAlign={{
              points: ['tr', 'br'],
              offset: [0, 5],
              ...(fromCustomEventApi ? {} : { overflow: { adjustX: true, adjustY: true } }),
            }}
          >
            <Tooltip
              trigger={['hover']}
              placement={'bottom'}
              title={withLinkParams && !withDY ? _l('使用链接参数') : isSubList ? _l('查询工作表') : _l('使用动态值')}
            >
              <SelectOtherFieldWrap
                onClick={() => {
                  if (isSubList) {
                    this.setState({ searchVisible: true });
                    return;
                  }
                  if (from === DYNAMIC_FROM_MODE.FAST_FILTER) {
                    this.setState({ isDynamic: true, showPopupType: withDY ? '' : 'DY_LINK' });
                    return;
                  }
                  this.setState({ isDynamic: true });
                }}
              >
                <i
                  className={cx(
                    withLinkParams && !withDY
                      ? 'icon-global_variable'
                      : isSubList
                      ? 'icon-lookup'
                      : 'icon-workflow_other',
                  )}
                ></i>
              </SelectOtherFieldWrap>
            </Tooltip>
          </Trigger>
        </div>
        {searchVisible && (
          <SearchWorksheetDialog {...this.props} onClose={() => this.setState({ searchVisible: false })} />
        )}
        {fxVisible && (
          <FunctionEditorDialog
            supportJavaScript
            control={data}
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
