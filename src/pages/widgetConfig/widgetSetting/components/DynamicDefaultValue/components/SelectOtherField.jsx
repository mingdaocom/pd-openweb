import React, { Component, createRef, Fragment } from 'react';
import cx from 'classnames';
import _, { get } from 'lodash';
import { func } from 'prop-types';
import styled from 'styled-components';
import { Menu, Popover, Tooltip } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import {
  CAN_AS_FX_DYNAMIC_FIELD,
  CAN_AS_OTHER_DYNAMIC_FIELD,
  CAN_NOT_AS_FIELD_DYNAMIC_FIELD,
  CUR_EMPTY_TYPES,
  CUR_OCR_TYPES,
  CUR_OCR_URL_TYPES,
  CURRENT_TYPES,
  CUSTOM_PHP_TYPES,
  DYNAMIC_FROM_MODE,
  H5_WATER_MASK_TYPES,
  OTHER_FIELD_LIST,
  OTHER_FIELD_TYPE,
  PRINT_TEMP_TYPES,
  WATER_MASK_TYPES,
} from 'src/utils/domain/control/dynamicValueConfig';
import { isSheetDisplay } from 'src/utils/domain/control/style';
import { getDaterange } from 'src/utils/domain/worksheet/fastFilter';
import { DATE_TYPE } from 'src/utils/domain/worksheet/fastFilterConfig';
import { ACTION_VALUE_ENUM } from '../../CustomEvent/config';
import FunctionEditorDialog from '../../FunctionEditorDialog';
import SearchWorksheetDialog from '../../SearchWorksheet/SearchWorksheetDialog';
import { SelectOtherFieldWrap } from '../styled';
import SelectFields from './SelectFields';

const PopoverContent = styled.div`
  width: 100%;
  padding: 6px 0;
`;

const CLEAR_EMPTY_ITEM_STYLE = { paddingInlineEnd: 48 };
const CLEAR_EMPTY_TIP_STYLE = { insetInlineEnd: 16, top: '50%', transform: 'translateY(-50%)' };

const POPOVER_STYLES = {
  root: {
    width: '100%',
  },
};

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
    const { data = {}, onDynamicValueChange } = this.props;
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
      case OTHER_FIELD_TYPE.H5_WATER_MASK:
      case OTHER_FIELD_TYPE.EMPTY:
      case OTHER_FIELD_TYPE.CODE_RESULT:
      case OTHER_FIELD_TYPE.TRIGGER_TIME:
      case OTHER_FIELD_TYPE.TRIGGER_DEPARTMENT:
      case OTHER_FIELD_TYPE.TRIGGER_ORG:
      case OTHER_FIELD_TYPE.TRIGGER_USER:
      case OTHER_FIELD_TYPE.PRINT_TEMP:
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
    if (this.props.from === DYNAMIC_FROM_MODE.FAST_FILTER && [26, 27, 48].includes(data.type)) {
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
      return data.type === 2 ? _.flatten(Object.values(CUSTOM_PHP_TYPES)) : CUSTOM_PHP_TYPES[data.type] || [];
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
    if (this.props.from === DYNAMIC_FROM_MODE.WATER_MASK) {
      types = types.concat(WATER_MASK_TYPES);
    }

    if (this.props.from === DYNAMIC_FROM_MODE.H5_WATER_MASK) {
      types = types.concat(H5_WATER_MASK_TYPES);
    }

    // 打印模板导出文件名
    if (this.props.from === DYNAMIC_FROM_MODE.PRINT_TEMP) {
      types = types.concat(PRINT_TEMP_TYPES);
    }

    if (this.props.hideSearchAndFun) {
      //子表里的字段默认值没有查询和函数配置
      types = types.filter(item => !_.includes([OTHER_FIELD_TYPE.SEARCH, OTHER_FIELD_TYPE.FX], item.key));
    }

    //自定义事件、业务规则没有部门和角色,需要掉接口
    if (this.props.from === DYNAMIC_FROM_MODE.CUSTOM_EVENT || this.props.from === DYNAMIC_FROM_MODE.RULES) {
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
      allControls,
      onChange,
      popupContainer,
      propFiledVisible,
      showEmpty,
      emptyTip,
      from,
      withLinkParams,
      withDY,
      linkParams = [],
      actionData = {},
    } = this.props;

    const filterTypes = this.getCurrentField(data);
    //子表、列表默认显示查询工作表icon，如包含清空操作时，显示动态值icon操作
    const isSubList = (_.includes([34], data.type) || isSheetDisplay(data)) && !showEmpty;

    // 事件设置值，子表函数默认值支持本身
    const subListSetValueEvent = data.type === 34 && actionData.actionType === ACTION_VALUE_ENUM.SET_VALUE;

    const renderPopupForQuickFilter = () => {
      switch (showPopupType) {
        case 'DY_DATE': {
          const dateRanges = getDaterange(data.advancedSetting || {});

          return (
            <Menu
              selectable={false}
              style={{ maxHeight: 200, overflowY: 'auto' }}
              items={dateRanges.map((value, index) => ({
                key: `${index}`,
                className: 'overflow_ellipsis',
                label: (_.flattenDeep(DATE_TYPE).find(item => item.value == value) || {}).text,
              }))}
              onClick={({ key, domEvent }) => {
                this.handleActionForDY(dateRanges[Number(key)]);
                domEvent.stopPropagation();
              }}
            />
          );
        }

        case 'DY_LINK':
          return linkParams.length > 0 ? (
            <Menu
              selectable={false}
              items={linkParams.map((item, index) => ({
                key: `${index}`,
                className: 'overflow_ellipsis',
                label: item,
              }))}
              onClick={({ key, domEvent }) => {
                this.handleActionForLinkParam(linkParams[Number(key)]);
                domEvent.stopPropagation();
              }}
            />
          ) : (
            <Menu
              selectable={false}
              items={[
                {
                  key: 'empty',
                  disabled: true,
                  label: _l('未添加链接参数'),
                },
              ]}
            />
          );
        default:
          return (
            <Menu
              selectable={false}
              items={[
                {
                  key: 'DY_DATE',
                  className: 'overflow_ellipsis',
                  icon: <i className="icon-task_custom_today Font20"></i>,
                  label: _l('动态时间'),
                },
                {
                  key: 'DY_LINK',
                  className: 'overflow_ellipsis',
                  icon: <i className="icon-global_variable Font20"></i>,
                  label: _l('链接参数'),
                },
              ]}
              onClick={({ key, domEvent }) => {
                this.setState({ showPopupType: key, isDynamic: true });
                domEvent.stopPropagation();
              }}
            />
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
        <Menu
          selectable={false}
          items={filterTypes.map((item, index) => {
            const showEmptyTip = item.key === OTHER_FIELD_TYPE.EMPTY && !!emptyTip;

            return {
              key: `${index}`,
              className: showEmptyTip ? undefined : 'overflow_ellipsis',
              style: showEmptyTip ? CLEAR_EMPTY_ITEM_STYLE : undefined,
              icon:
                from !== DYNAMIC_FROM_MODE.CUSTOM_PHP ? (
                  <i className={`${item.icon} Font20 textTertiary`}></i>
                ) : undefined,
              label: showEmptyTip ? (
                <span>
                  <span className="clearEmptyText">{item.text}</span>
                  <Tooltip placement="bottom" title={emptyTip}>
                    <i
                      className="clearEmptyTip icon-info Font16 textTertiary Absolute InlineFlex alignItemsCenter justifyContentCenter LineHeight16"
                      style={CLEAR_EMPTY_TIP_STYLE}
                      onClick={event => event.stopPropagation()}
                    />
                  </Tooltip>
                </span>
              ) : (
                item.text
              ),
            };
          })}
          onClick={({ key }) => this.handleAction(filterTypes[Number(key)])}
        />
      );
    };

    return (
      <Fragment>
        <div ref={this.$wrap} className="selectOtherFieldContainer">
          <Tooltip
            trigger={['hover']}
            placement="bottom"
            title={withLinkParams && !withDY ? _l('使用链接参数') : isSubList ? _l('查询工作表') : _l('使用动态值')}
          >
            <Popover
              trigger="click"
              placement="bottomRight"
              destroyOnHidden={false}
              noPadding
              styles={POPOVER_STYLES}
              open={isDynamic && !isSubList}
              onOpenChange={isDynamic => this.setState({ isDynamic })}
              getPopupContainer={() => popupContainer || this.$wrap.current}
              autoAdjustOverflow={false}
              content={<PopoverContent>{renderPopup()}</PopoverContent>}
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
            </Popover>
          </Tooltip>
        </div>
        {searchVisible && (
          <SearchWorksheetDialog {...this.props} onClose={() => this.setState({ searchVisible: false })} />
        )}
        {fxVisible && (
          <FunctionEditorDialog
            supportJavaScript
            supportDebug
            fromCustom={subListSetValueEvent}
            appId={get(this.props, 'globalSheetInfo.appId')}
            worksheetId={get(this.props, 'globalSheetInfo.worksheetId')}
            projectId={get(this.props, 'globalSheetInfo.projectId')}
            control={data}
            value={
              subListSetValueEvent
                ? { ...getAdvanceSetting(data, 'defaultfunc'), type: 'javascript' }
                : getAdvanceSetting(data, 'defaultfunc')
            }
            title={data.controlName}
            controls={
              from === DYNAMIC_FROM_MODE.CUSTOM_EVENT
                ? allControls
                : allControls.filter(c => c.controlId !== data.controlId)
            }
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
