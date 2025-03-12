import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import React, { Component, Fragment } from 'react';
import { Dialog as MobileDialog } from 'antd-mobile';
import { LoadDiv, Dialog } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import sheetAjax from 'src/api/worksheet';
import cx from 'classnames';
import './style.less';
import widgets from './widgets';
import WidgetsDesc from './components/WidgetsDesc';
import RecordInfoContext from 'worksheet/common/recordInfo/RecordInfoContext';
import WidgetsVerifyCode from './components/WidgetsVerifyCode';
import {
  convertControl,
  controlState,
  loadSDK,
  getControlsByTab,
  getValueStyle,
  getHideTitleStyle,
  formatControlValue,
  isUnTextWidget,
  getServiceError,
} from './tools/utils';
import { isRelateRecordTableControl, replaceRulesTranslateInfo } from 'worksheet/util';
import { FORM_ERROR_TYPE, FROM } from './tools/config';
import { updateRulesData, checkAllValueAvailable, replaceStr, getRuleErrorInfo } from './tools/filterFn';
import DataFormat, { checkRequired } from './tools/DataFormat';
import { browserIsMobile } from 'src/util';
import { formatSearchConfigs, supportDisplayRow, isCustomWidget } from 'src/pages/widgetConfig/util';
import _, { get, isEmpty } from 'lodash';
import FormLabel from './components/FormLabel';
import WidgetSection from './components/WidgetSection';
import MobileWidgetSection from './components/MobileWidgetSection';
import styled from 'styled-components';
import RefreshBtn from './components/RefreshBtn';
import FreeField from './widgets/FreeField';
import { dealCustomEvent } from './tools/customEvent';
import { getExpandWidgetIds } from 'src/pages/widgetConfig/widgetSetting/components/SplitLineConfig/config';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';

const CustomFormItemControlWrap = styled.div`
  .customFormTextarea {
    ${props => (props.size ? `font-size: ${props.size} !important;` : '')}
    line-height: ${props => (props.isTextArea ? '1.5 !important' : `${props.height - 14}px !important`)};
  }
  .customFormControlBox {
    ${props => {
      if (!props.isTextArea && props.height) {
        const paddingValue = _.includes([15, 16, 19, 23, 24, 42, 46], props.type) ? 0 : 6;
        return `height: min-content !important;min-height:${props.height}px !important;line-height:${
          props.height - 14
        }px !important;padding-top: ${paddingValue}px !important;padding-bottom: ${paddingValue}px !important;`;
      }
    }}
    ${props => (props.size ? `font-size: ${props.size} !important;` : '')}
    ${props => (_.includes([25, 31, 32, 33, 37, 38, 53], props.type) ? props.valueStyle : '')}
    & > span:first-child {
      ${props =>
        _.includes([2, 3, 4, 5, 6, 7, 8, 15, 16], props.type) ||
        (props.isMobile && _.includes([15, 16, 46], props.type))
          ? props.valueStyle
          : ''}
    }
    &.customFormControlTelPhone {
      ${props => props.valueStyle}
      -webkit-text-fill-color: ${props => (props.valueStyle ? 'unset' : '#151515')}
    }
    .ant-picker-input > input {
      ${props => (props.size ? `font-size: ${props.size} !important;` : '')}
    }
    &:not(.ant-picker-focused) .ant-picker-input > input {
      ${props => (_.includes([15, 16, 46], props.type) ? props.valueStyle : '')}
    }
  }

  .numberControlBox {
    min-height: ${props => `${props.height || 36}px`};
    .iconWrap {
      height: ${props => `${(props.height || 36) * 0.4}px`};
      &:hover {
        height: ${props => `${(props.height || 36) * 0.6}px`};
      }
    }
  }

  .CityPicker-input-container {
    .CityPicker-input-textCon {
      ${props => (props.size ? `font-size: ${props.size} !important;` : '')}
    }
    &:not(.editable) .CityPicker-input-textCon {
      ${props => props.valueStyle}
    }
  }
  .RefreshBtn {
    ${props => (props.isMobile && !props.disabled ? 'margin-right: 5px;' : '')}
    i {
      ${props => (props.isMobile ? 'color: #9e9e9e !important;' : '')}
    }
  }
`;

export default class CustomFields extends Component {
  static contextType = RecordInfoContext;
  static propTypes = {
    flag: PropTypes.any,
    initSource: PropTypes.bool,
    from: PropTypes.number,
    projectId: PropTypes.string,
    worksheetId: PropTypes.string,
    recordId: PropTypes.string,
    appId: PropTypes.string,
    groupId: PropTypes.string,
    viewId: PropTypes.string,
    data: PropTypes.array,
    recordCreateTime: PropTypes.string,
    disabled: PropTypes.bool,
    forceFull: PropTypes.bool,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    disableRules: PropTypes.bool,
    isCreate: PropTypes.bool, // 是否新建
    widgetStyle: PropTypes.object, // 表单样式配置
    ignoreLock: PropTypes.bool, // 是否忽略锁定记录
    ignoreHideControl: PropTypes.bool, // 忽略隐藏控件
    verifyAllControls: PropTypes.bool, // 是否校验全部字段
    isWorksheetQuery: PropTypes.bool, // 是否配置工作表查询
    masterRecordRowId: PropTypes.string, // 主记录id
    smsVerificationFiled: PropTypes.string, // 公开表单设置短信验证字段id
    smsVerification: PropTypes.bool, // 公开表单是否设置短信验证
    sheetSwitchPermit: PropTypes.array, // 工作表业务板块权限
    rules: PropTypes.arrayOf(PropTypes.shape({})), // 业务规则
    searchConfig: PropTypes.arrayOf(PropTypes.shape({})), // 工作表查询配置
    getMasterFormData: PropTypes.func,
    openRelateSheet: PropTypes.func,
    registerCell: PropTypes.func,
    checkCellUnique: PropTypes.func,
    onFormDataReady: PropTypes.func,
    onWidgetChange: PropTypes.func,
    onRulesLoad: PropTypes.func,
    onSave: PropTypes.func,
    customWidgets: PropTypes.object, // 自定义组件 { key: value } key: control type, value: widget
    onManualWidgetChange: PropTypes.func, // 手动更新表单数据
  };

  static defaultProps = {
    initSource: false,
    getMasterFormData: () => {},
    onChange: () => {},
    onBlur: () => {},
    openRelateSheet: () => {},
    registerCell: () => {},
    onFormDataReady: () => {},
    customWidgets: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      renderData: [],
      errorItems: [],
      uniqueErrorItems: [],
      customErrorItems: [], // 自定义事件报错
      rules: props.rules || [],
      rulesLoading: !props.disableRules && !props.rules,
      searchConfig: props.searchConfig || [],
      loadingItems: {},
      verifyCode: '', // 验证码
      activeTabControlId: '',
    };

    this.abortController = new AbortController();

    this.controlRefs = {};

    this.storeCenter = {};
    this.submitChildTableCheckData = this.submitFormData.bind(this); // 数据提交(h5子表快速编辑检查项)
  }

  componentWillMount() {
    const { data, disabled, isWorksheetQuery } = this.props;
    const { rulesLoading, searchConfig } = this.state;

    if (!rulesLoading && !isWorksheetQuery) {
      this.initSource(data, disabled);
    } else if (rulesLoading || (isWorksheetQuery && !searchConfig.length)) {
      this.getConfig(this.props, { getRules: rulesLoading, getSearchConfig: isWorksheetQuery && !searchConfig.length });
    }
  }

  componentDidMount() {
    if (window.isWeiXin) {
      // 处理微信webview键盘收起 网页未撑开
      $(document).on('blur', '.customFieldsContainer input', () => {
        window.scrollTo(0, 0);
      });
    }
    loadSDK();
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (this.props.flag !== nextProps.flag || this.props.data.length !== nextProps.data.length) {
      this.initSource(nextProps.data, nextProps.disabled, {
        setStateCb: () => {
          this.updateErrorState(false);
          this.changeStatus = false;
        },
      });
    }
    if (this.props.worksheetId !== nextProps.worksheetId) {
      this.getConfig(nextProps, { getRules: true, getSearchConfig: true });
    }
    if (this.props.recordId !== nextProps.recordId) {
      this.storeCenter = {};
    }
  }

  componentWillUnmount() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  get workflowParams() {
    const { mobileApprovalRecordInfo = {} } = this.props;
    const { instanceId, workId } = browserIsMobile()
      ? mobileApprovalRecordInfo
      : _.get(this, 'context.recordBaseInfo') || {};
    return { instanceId, workId };
  }

  get isPcCreated() {
    const { recordId } = this.props;
    return !browserIsMobile() && (!recordId || recordId === '_FAKE_RECORD_ID');
  }

  con = React.createRef();

  /**
   * 初始化数据
   */
  initSource(data, disabled, { setStateCb = () => {} } = {}) {
    const {
      appId,
      isCharge,
      isCreate,
      projectId,
      worksheetId,
      initSource,
      recordId,
      recordCreateTime,
      from,
      onFormDataReady,
      masterRecordRowId,
      ignoreLock,
      verifyAllControls,
      loadRowsWhenChildTableStoreCreated,
      controlProps = {},
      mobileApprovalRecordInfo = {},
    } = this.props;
    const { rules = [], searchConfig = [] } = this.state;
    const { instanceId, workId } = this.workflowParams;
    this.dataFormat = new DataFormat({
      setSubListStore: true,
      isCharge,
      projectId,
      appId,
      worksheetId,
      recordId,
      data: data.map(c => ({ ...c, ...controlProps })),
      isCreate: _.isUndefined(isCreate) ? initSource || !recordId : isCreate,
      disabled,
      recordCreateTime,
      masterRecordRowId,
      ignoreLock,
      rules,
      from,
      instanceId,
      workId,
      verifyAllControls,
      abortController: this.abortController,
      storeCenter: this.storeCenter,
      embedData: {
        ..._.pick(this.props, ['projectId', 'appId', 'groupId', 'worksheetId', 'recordId', 'viewId']),
      },
      searchConfig: searchConfig.filter(i => i.eventType !== 1),
      loadRowsWhenChildTableStoreCreated,
      updateLoadingItems: loadingItems => {
        this.setState({ loadingItems });
      },
      activeTrigger: () => {
        if (!this.changeStatus && this.dataFormat) {
          this.props.onChange(this.dataFormat.getDataSource(), this.dataFormat.getUpdateControlIds(), {
            noSaveTemp: true,
          });
          this.changeStatus = true;
        }
      },
      onAsyncChange: ({ controlId, value }) => {
        this.props.onChange(this.dataFormat.getDataSource(), [controlId], { isAsyncChange: true });
        this.changeStatus = true;
        this.setState(
          {
            renderData: this.getFilterDataByRule(),
            errorItems: this.dataFormat.getErrorControls(),
          },
          () => {
            if (_.every(Object.values(this.state.loadingItems), i => !i) && this.submitBegin) {
              this.submitFormData();
            }
          },
        );
      },
    });
    this.setState(
      {
        renderData: this.getFilterDataByRule(true),
        errorItems: this.dataFormat.getErrorControls(),
        uniqueErrorItems: [],
        rulesLoading: false,
      },
      () => {
        setStateCb();
        onFormDataReady(this.dataFormat);
      },
    );
  }

  /**
   * 获取配置（业务规则 || 查询配置）
   */
  getConfig = async (props, { getRules, getSearchConfig }) => {
    const { data, disabled, appId, worksheetId, onRulesLoad = () => {} } = props;
    let rules;
    let config;

    // 获取字段显示规则
    if (getRules) {
      rules = await sheetAjax.getControlRules({ worksheetId, type: 1 });
      rules = replaceRulesTranslateInfo(appId, worksheetId, rules);
      onRulesLoad(rules);
    }

    // 获取查询配置
    if (getSearchConfig) {
      config = await sheetAjax.getQueryBySheetId({ worksheetId });
    }

    this.setState(
      {
        ...(getRules ? { rules } : {}),
        ...(getSearchConfig ? { searchConfig: formatSearchConfigs(config) } : {}),
      },
      () => this.initSource(data, disabled),
    );
  };

  /**
   * 规则筛选数据
   */
  getFilterDataByRule(isInit) {
    const { ignoreHideControl, recordId, from, systemControlData, verifyAllControls } = this.props;
    const { rules = [] } = this.state;

    let tempRenderData = updateRulesData({
      rules,
      recordId,
      data: this.dataFormat.getDataSource().concat(systemControlData || []),
      from: this.props.from,
      updateControlIds: this.dataFormat.getUpdateRuleControlIds(),
      ignoreHideControl,
      checkRuleValidator: (controlId, errorType, errorMessage, rule) => {
        this.dataFormat.setErrorControl(controlId, errorType, errorMessage, rule, isInit);
      },
      verifyAllControls,
    });

    // 标签页显示，但标签页内没有显示字段，标签页隐藏
    tempRenderData.forEach(item => {
      if (item.type === 52 && controlState(item, from).visible && !item.hidden) {
        const childWidgets = tempRenderData.filter(i => i.sectionId === item.controlId);
        if (_.every(childWidgets, c => !(controlState(c, from).visible && !c.hidden))) {
          item.fieldPermission = replaceStr(item.fieldPermission || '111', 0, '0');
        }
      }
    });
    return tempRenderData;
  }

  /**
   * 渲染表单
   */
  renderForm(renderData = []) {
    const {
      from,
      worksheetId,
      recordId,
      forceFull,
      controlProps,
      widgetStyle = {},
      disabled,
      isDraft,
      tabControlProp: { setNavVisible } = {},
    } = this.props;
    const { instanceId, workId } = this.workflowParams;
    const { titlelayout_pc = '1', titlelayout_app = '1' } = widgetStyle;
    const { errorItems, uniqueErrorItems, loadingItems, customErrorItems } = this.state;
    const isMobile = browserIsMobile();
    const formList = [];
    let prevRow = -1;
    let preIsSection;
    let data = [].concat(renderData).filter(item => !item.hidden && controlState(item, from).visible);
    const richTextControlCount = data.filter(c => c.type === 41).length;

    data.forEach(item => {
      if ((item.row !== prevRow || isMobile || forceFull) && !preIsSection && prevRow > -1) {
        formList.push(
          <div
            className={cx('customFormLine', { Visibility: this.isPcCreated })}
            key={`clearfix-${item.row}-${item.col}`}
          />,
        );
      }

      const isFull = isMobile || forceFull || item.size === 12;
      const hideTitleStyle = getHideTitleStyle(item, data) || {};
      const displayRow = (isMobile ? titlelayout_app === '2' : titlelayout_pc === '2') && supportDisplayRow(item);

      formList.push(
        <div
          className={cx('customFormItem', { customFormItemRow: displayRow || hideTitleStyle.displayRow })}
          style={{
            width: isFull ? '100%' : `${(item.size / 12) * 100}%`,
            display: item.type === 49 && disabled ? 'none' : 'flex',
          }}
          id={`formItem-${worksheetId}-${item.controlId}`}
          key={`item-${item.row}-${item.col}`}
        >
          {item.type === 22 && _.includes([FROM.H5_ADD, FROM.H5_EDIT], from) && (
            <div className="relative" style={{ height: 10 }}>
              <div
                className="Absolute"
                style={{ background: '#f5f5f5', height: 10, left: -1000, right: -1000, top: -7 }}
              />
            </div>
          )}

          {!_.includes([22, 52], item.type) && (
            <FormLabel
              from={from}
              worksheetId={worksheetId}
              recordId={recordId}
              item={item}
              errorItems={errorItems}
              uniqueErrorItems={uniqueErrorItems}
              customErrorItems={customErrorItems}
              loadingItems={loadingItems}
              widgetStyle={{ ...widgetStyle, displayRow, ...hideTitleStyle }}
              disabled={disabled}
              updateErrorState={this.updateErrorState}
              handleChange={this.handleChange}
            />
          )}

          <CustomFormItemControlWrap
            className={cx('customFormItemControl', { customFormItemControlCreate: this.isPcCreated })}
            isMobile={isMobile}
            {...getValueStyle(item)}
          >
            {this.getWidgets(
              Object.assign({}, item, controlProps, {
                instanceId,
                workId,
                richTextControlCount,
                isDraft: isDraft || from === FROM.DRAFT,
                ...(item.type === 22 ? { setNavVisible } : {}),
              }),
            )}
            <RefreshBtn
              {..._.pick(this.props, ['disabledFunctions', 'worksheetId', 'recordId', 'from'])}
              item={item}
              onChange={this.handleChange}
            />
            {this.renderVerifyCode(item)}
          </CustomFormItemControlWrap>
        </div>,
      );

      prevRow = item.row;
      preIsSection = item.type === 22 || item.type === 10010;
    });

    return formList;
  }

  /**
   * 渲染短信验证码
   */
  renderVerifyCode(item) {
    const { controlId, type } = item;
    const { smsVerificationFiled, smsVerification } = this.props;

    if (window.isPublicWorksheet && smsVerification && type === 3 && smsVerificationFiled === controlId && item.value) {
      return (
        <WidgetsVerifyCode
          {...item}
          verifyCode={this.state.verifyCode}
          worksheetId={this.props.worksheetId}
          handleChange={verifyCode => this.setState({ verifyCode })}
        />
      );
    }
    return null;
  }

  /**
   * 更新error显示状态
   */
  updateErrorState = (isShow, controlId) => {
    if (controlId) {
      this.setState({
        errorItems: this.state.errorItems.map(item =>
          item.controlId === controlId ? Object.assign({}, item, { showError: false }) : item,
        ),
        uniqueErrorItems: this.state.uniqueErrorItems.map(item =>
          item.controlId === controlId ? Object.assign({}, item, { showError: false }) : item,
        ),
      });
    } else {
      this.setState({
        errorItems: this.state.errorItems.map(item => Object.assign({}, item, { showError: isShow })),
        uniqueErrorItems: this.state.uniqueErrorItems.map(item => Object.assign({}, item, { showError: isShow })),
      });
    }
  };

  /**
   * 更新errorItems,包含表单和业务规则必填错误
   */
  setErrorItemsByRule = (controlId, control) => {
    const newErrorItems = this.dataFormat.getErrorControls();
    this.setState({
      errorItems: newErrorItems.map(item =>
        item.controlId === controlId && item.errorType === FORM_ERROR_TYPE.RULE_REQUIRED
          ? Object.assign({}, item, { showError: !!checkRequired(control) })
          : item,
      ),
    });
  };

  /**
   * 组件onChange方法
   * searchByChange: api查询被动赋值引起的工作表查询，文本类按失焦处理
   */
  handleChange = (value, cid, item, searchByChange = true) => {
    const { onWidgetChange = () => {}, onManualWidgetChange = () => {} } = this.props;
    const { uniqueErrorItems } = this.state;

    if (searchByChange) {
      // 手动更改表单
      onManualWidgetChange();
    }

    if (!_.get(value, 'rows')) {
      onWidgetChange();
    }
    if (item.value !== value || cid !== item.controlId || get(value, 'isFormTable')) {
      if (get(value, 'isFormTable')) {
        value = value.value;
      }
      this.dataFormat.updateDataSource({
        controlId: cid,
        value,
        removeUniqueItem: id => {
          _.remove(uniqueErrorItems, o => o.controlId === id && o.errorType === FORM_ERROR_TYPE.UNIQUE);
        },
        searchByChange: searchByChange,
      });
      this.setState({ renderData: this.getFilterDataByRule() }, () => {
        this.setErrorItemsByRule(cid, { ...item, value });
      });

      const ids = this.dataFormat.getUpdateControlIds();
      if (ids.length) {
        this.props.onChange(this.dataFormat.getDataSource(), ids, { controlId: cid });
        this.changeStatus = true;
      }
    }
  };

  /**
   * 自定义事件
   */
  triggerCustomEvent(props) {
    const { systemControlData, handleEventPermission = () => {}, from, tabControlProp = {} } = this.props;
    const { searchConfig = [], renderData = [] } = this.state;

    const customProps = {
      ...props,
      ..._.pick(this.props, ['from', 'recordId', 'projectId', 'worksheetId', 'appId']),
      formData: this.dataFormat.getDataSource().concat(systemControlData || []),
      renderData,
      searchConfig: searchConfig.filter(i => i.eventType === 1),
      checkRuleValidator: (controlId, errorType, errorMessage) => {
        this.dataFormat.setErrorControl(controlId, errorType, errorMessage);
      },
      setErrorItems: errorInfo => {
        this.setState({ customErrorItems: errorInfo });
      },
      setRenderData: () => {
        this.updateRenderData();
        handleEventPermission();
      },
      handleChange: (value, cid, item, searchByChange) => {
        this.handleChange(value, cid, item, searchByChange);
      },
      handleActiveTab: id => {
        const curControl = _.find(renderData, r => r.controlId === id);
        if (
          curControl &&
          controlState(curControl, from).visible &&
          !(_.includes([FROM.PUBLIC_ADD, FROM.PUBLIC_EDIT], from) && _.includes([29, 51], curControl.type))
        ) {
          this.setActiveTabControlId(id);
          if (_.isFunction(tabControlProp.handleSectionClick)) {
            tabControlProp.handleSectionClick(id);
          }
        }
      },
    };
    dealCustomEvent(customProps);
  }

  /**
   * 获取控件
   */
  getWidgets(item) {
    const {
      initSource,
      flag,
      projectId,
      worksheetId,
      recordId,
      viewId,
      appId,
      from,
      openRelateSheet = () => {},
      registerCell,
      sheetSwitchPermit = [],
      systemControlData,
      popupContainer,
      getMasterFormData,
      isCharge,
      widgetStyle = {},
      mobileApprovalRecordInfo = {},
      customWidgets,
      isDraft,
      masterData,
      disabledChildTableCheck,
    } = this.props;
    const { renderData } = this.state;
    // 字段描述显示方式
    const hintType = _.get(item, 'advancedSetting.hinttype') || '0';
    const hintShowAsText =
      hintType === '0'
        ? from === FROM.DRAFT || (from !== FROM.RECORDINFO && !recordId && !item.isSubList && item.type !== 34)
        : hintType === '2' && item.type !== 34;

    // 他表字段
    if (convertControl(item.type) === 'SHEET_FIELD') {
      item = _.cloneDeep(item);
      item.value =
        item.sourceControlType === 3 && item.sourceControl.enumDefault === 1
          ? (item.value || '').replace(/\+86/, '')
          : item.value;
      item.otherSheetControlType = item.type;
      item.type = item.sourceControlType === 3 ? 2 : item.sourceControlType;
      item.enumDefault = item.sourceControlType === 3 ? 2 : item.enumDefault;
      item.disabled = true;
      item.advancedSetting = (item.sourceControl || {}).advancedSetting || {};
      if (item.type === 46) {
        item.unit = _.includes(['6', '9'], (item.sourceControl || {}).unit) ? '6' : '1';
      }
    }

    const { type, controlId } = item;
    const widgetName = convertControl(type);
    const isFreeField = isCustomWidget(item);
    let Widgets;
    if (isFreeField) {
      Widgets = FreeField;
    } else if (widgetName === 'CustomWidgets') {
      Widgets = customWidgets[type];
    } else {
      Widgets = widgets[widgetName];
    }

    if (!Widgets) {
      return undefined;
    }

    const isEditable = controlState(item, from).editable;
    const maskPermissions =
      (isCharge || _.get(item, 'advancedSetting.isdecrypt[0]') === '1') && !window.shareState.shareId;

    // (禁用或只读) 且 内容不存在
    if (
      !_.includes([22, 52, 34], item.type) &&
      !isCustomWidget(item) &&
      !(item.type === 29 && isRelateRecordTableControl(item)) &&
      !(
        _.includes([9, 10, 11], item.type) &&
        (item.advancedSetting || {}).readonlyshowall === '1' &&
        !browserIsMobile()
      ) &&
      (item.disabled || _.includes([25, 31, 32, 33, 37, 38, 53], item.type) || !isEditable) &&
      ((!item.value && item.value !== 0 && !_.includes([28, 47, 51], item.type)) ||
        (browserIsMobile() && _.includes([9, 10, 11], item.type) && item.value && !JSON.parse(item.value).length) ||
        (item.type === 29 &&
          (safeParse(item.value).length <= 0 ||
            (browserIsMobile() && !item.value) ||
            (typeof item.value === 'string' && item.value.startsWith('deleteRowIds')) ||
            (_.get(window, 'shareState.isPublicForm') && item.value === 0))) ||
        (_.includes([21, 26, 27, 48, 35, 14, 10, 11], item.type) &&
          _.isArray(JSON.parse(item.value)) &&
          !JSON.parse(item.value).length))
    ) {
      return (
        <React.Fragment>
          <div className="customFormNull" />
          {!recordId && hintShowAsText && <WidgetsDesc item={item} from={from} />}
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <Widgets
          {...item}
          customFields={this}
          mobileApprovalRecordInfo={mobileApprovalRecordInfo}
          flag={flag}
          isCharge={isCharge}
          widgetStyle={widgetStyle}
          maskPermissions={maskPermissions}
          popupContainer={popupContainer}
          sheetSwitchPermit={sheetSwitchPermit} // 工作表业务模板权限
          disabled={
            item.type === 36 ? disabledChildTableCheck || item.disabled || !isEditable : item.disabled || !isEditable
          }
          projectId={projectId}
          from={from}
          worksheetId={worksheetId}
          renderData={renderData}
          recordId={recordId}
          appId={appId}
          isDraft={isDraft || from === FROM.DRAFT} // 子表单条记录详情from不对，新增参数以供使用
          viewIdForPermit={viewId}
          initSource={initSource}
          masterData={masterData}
          onChange={(value, cid = controlId, searchByChange) => {
            this.handleChange(value, cid, item, searchByChange);
            // 非文本change校验重复、文本失焦校验
            if (item.unique && value && isUnTextWidget(item)) {
              this.checkControlUnique(controlId, type, value);
            }

            // h5附件上传完成后才能触发自定义事件
            let uploadFieldTriggerEvent = true;
            if (browserIsMobile() && item.type === 14) {
              const attachmentsData = value ? JSON.parse(value) : {};
              uploadFieldTriggerEvent = !_.some(attachmentsData.attachments || [], v => !v.fileID);
            }

            // 非文本类值改变时触发自定义事件
            if (isUnTextWidget(item) && item.value !== value && uploadFieldTriggerEvent) {
              this.triggerCustomEvent({ ...item, value, triggerType: ADD_EVENT_ENUM.CHANGE });
            }
          }}
          onBlur={(originValue, newVal) => {
            // 由输入法和onCompositionStart结合引起的组件内部未更新value值的情况，主动抛出新值
            const newValue = newVal || (`${item.value || ''}` ? `${item.value || ''}`.trim() : '');
            if (item.unique && newValue) {
              this.checkControlUnique(controlId, type, newValue);
            }
            if (newValue && newValue !== originValue) {
              this.dataFormat.updateDataBySearchConfigs({
                control: { ...item, value: newValue },
                searchType: 'onBlur',
              });
              // 文本类失焦触发自定义事件
              if (!isUnTextWidget(item)) {
                this.triggerCustomEvent({ ...item, triggerType: ADD_EVENT_ENUM.CHANGE });
              }
            }
            this.props.onBlur(controlId);
            this.triggerCustomEvent({ ...item, triggerType: ADD_EVENT_ENUM.BLUR });
          }}
          openRelateSheet={openRelateSheet}
          registerCell={cell => {
            this.controlRefs[controlId] = cell;
            registerCell({ item, cell });
          }}
          getControlRef={key => this.controlRefs[key]}
          formData={this.dataFormat
            .getDataSource()
            .concat(systemControlData || [])
            .concat(getMasterFormData() || [])}
          triggerCustomEvent={triggerType => this.triggerCustomEvent({ ...item, triggerType })}
          submitChildTableCheckData={this.submitChildTableCheckData}
        />
        {hintShowAsText && <WidgetsDesc item={item} from={from} />}
      </React.Fragment>
    );
  }

  /**
   * 验证唯一值
   */
  checkControlUnique(controlId, controlType, controlValue) {
    const { worksheetId, recordId, checkCellUnique, onError = () => {} } = this.props;
    const { uniqueErrorItems, loadingItems } = this.state;

    if (_.isFunction(checkCellUnique)) {
      if (checkCellUnique(controlId, controlValue)) {
        _.remove(uniqueErrorItems, item => item.controlId === controlId && item.errorType === FORM_ERROR_TYPE.UNIQUE);
      } else {
        uniqueErrorItems.push({
          controlId,
          errorType: FORM_ERROR_TYPE.UNIQUE,
          showError: true,
        });
        this.setState({ uniqueErrorItems });
      }
      return;
    }

    this.setState({ loadingItems: { ...loadingItems, [controlId]: true } });

    worksheetAjax
      .checkFieldUnique({
        worksheetId,
        controlId,
        controlType,
        controlValue: formatControlValue(controlValue, controlType),
      })
      .then(res => {
        const isError = !res.isSuccess && res.data && res.data.rowId !== recordId;
        if (isError) {
          uniqueErrorItems.push({
            controlId,
            errorType: FORM_ERROR_TYPE.UNIQUE,
            showError: true,
          });
          onError();
        } else if (res.isSuccess) {
          _.remove(uniqueErrorItems, item => item.controlId === controlId && item.errorType === FORM_ERROR_TYPE.UNIQUE);
        }

        this.setState({ uniqueErrorItems, loadingItems: { ...loadingItems, [controlId]: false } }, () => {
          if ((res.isSuccess || !isError) && this.submitBegin) {
            this.submitFormData();
          }
        });
      });
  }

  /**
   * 提交的时唯一值错误
   */
  uniqueErrorUpdate(uniqueErrorIds) {
    const { uniqueErrorItems } = this.state;

    alert(_l('记录提交失败：数据重复'), 2);

    (uniqueErrorIds || []).forEach(controlId => {
      if (
        !_.find(uniqueErrorItems, item => item.controlId === controlId && item.errorType === FORM_ERROR_TYPE.UNIQUE)
      ) {
        uniqueErrorItems.push({
          controlId,
          errorType: FORM_ERROR_TYPE.UNIQUE,
          showError: true,
        });
        this.setState({ uniqueErrorItems });
      }
    });
  }

  /**
   * 提交错误信息弹层
   */
  errorDialog(errors) {
    const isMobile = browserIsMobile();
    if (isMobile) {
      MobileDialog.alert({
        content: (
          <div>
            {errors.map(item => (
              <div className="Gray_75 mBottom6 WordBreak">{item}</div>
            ))}
          </div>
        ),
        confirmText: _l('取消'),
      });
    } else {
      Dialog.confirm({
        className: 'ruleErrorMsgDialog',
        title: <span className="Bold Font17 Red">{_l('错误提示')}</span>,
        description: (
          <div>
            {errors.map(item => (
              <div className="Gray_75 mBottom6 WordBreak">{item}</div>
            ))}
          </div>
        ),
        removeCancelBtn: true,
      });
    }
  }

  /**
   * 更新渲染数据
   */
  updateRenderData() {
    const newErrorItems = this.dataFormat.getErrorControls();
    const { errorItems = [] } = this.state;
    this.setState({
      renderData: this.getFilterDataByRule(),
      ...(newErrorItems.length !== errorItems.length ? { errorItems: newErrorItems } : {}),
    });
  }

  /**
   * 获取提交数据
   */
  getSubmitData({ silent, ignoreAlert, verifyAllControls } = {}) {
    const { from, recordId, ignoreHideControl, systemControlData, tabControlProp = {}, worksheetId } = this.props;
    const { errorItems, uniqueErrorItems, rules = [], activeRelateRecordControlId } = this.state;
    const updateControlIds = this.dataFormat.getUpdateControlIds();
    const data = this.dataFormat.getDataSource();
    // 校验需要系统字段，提交不需要，防止数据被变更
    const ruleList = updateRulesData({
      rules,
      data: data.concat(systemControlData || []),
      recordId,
      checkAllUpdate: true,
      ignoreHideControl,
      verifyAllControls,
    });
    // 过滤系统字段
    const list = ruleList.filter(i => !_.find(systemControlData, s => s.controlId === i.controlId));
    // 保存时必走，防止无字段变更判断错误
    const errors =
      updateControlIds.length || !recordId || this.submitBegin || verifyAllControls
        ? checkAllValueAvailable(rules, list, recordId, from)
        : [];
    const ids = verifyAllControls
      ? list.map(it => it.controlId)
      : list
          .filter(item => {
            // 标签页隐藏，内部字段报错校验过滤
            if (item.sectionId) {
              const parentControls = _.find(list, t => t.controlId === item.sectionId);
              if (parentControls && !(controlState(parentControls, from).visible && !parentControls.hidden)) {
                return false;
              }
            }
            return controlState(item, from).visible && controlState(item, from).editable && item.type !== 52;
          })
          .map(it => it.controlId);
    const subListErrorControls = data
      .filter(c => c.type === 34)
      .map(c => ({
        controlId: c.controlId,
        error: c.store && c.store.getErrors(),
      }))
      .filter(c => !isEmpty(c.error));
    const totalErrors = errorItems
      .concat(uniqueErrorItems)
      .concat(subListErrorControls)
      .filter(it => _.includes(ids, it.controlId));
    const hasError = !!totalErrors.length;
    const hasRuleError = errors.length;

    // 提交时所有错误showError更新为true
    this.updateErrorState(hasError);

    // 标签页内报错，展开标签页
    // 分段内报错，展开分段
    if (hasError) {
      // 分段
      data.forEach(d => {
        if (d.type === 22) {
          const expandWidgetIds = getExpandWidgetIds(data, d, from);
          const { handleExpand } = this.controlRefs[d.controlId] || {};
          const visibleErrors = totalErrors.filter(i => _.includes(expandWidgetIds, i.controlId));
          if (visibleErrors.length > 0 && _.isFunction(handleExpand)) {
            handleExpand(true);
          }
        }
      });

      // 标签页
      // 定位到第一个报错
      const firstErrorItem = _.head(
        totalErrors.map(t => _.find(data, d => d.controlId === t.controlId)).sort((a, b) => a.row - b.row),
      );
      if (firstErrorItem) {
        const ele = document.getElementById(`formItem-${worksheetId}-${firstErrorItem.controlId}`);
        ele && ele.scrollIntoView({ block: 'center' });
      }

      // 所有报错附属标签页
      const tabErrorControls = data
        .filter(d => _.find(totalErrors, t => t.controlId === d.controlId) && d.sectionId)
        .map(t => _.find(data, d => d.controlId === t.sectionId))
        .filter(_.identity)
        .sort((a, b) => a.row - b.row);
      if (!!tabErrorControls.length && !_.find(tabErrorControls, t => t.controlId === activeRelateRecordControlId)) {
        const tempId = _.get(tabErrorControls, '0.controlId');
        this.setActiveTabControlId(tempId);
        if (_.isFunction(tabControlProp.handleSectionClick)) {
          tabControlProp.handleSectionClick(tempId);
        }
      }
    }

    let error;

    if (hasError) {
      if (!ignoreAlert && !silent) alert(_l('请正确填写记录'), 3);
      error = true;
    } else if ($('.recordInfoForm,.formMain').find('.fileUpdateLoading').length) {
      alert(_l('附件正在上传，请稍后'), 3);
      error = true;
    } else if (hasRuleError) {
      error = true;
    }

    if (!hasError && hasRuleError && !silent) {
      this.errorDialog(errors);
    }

    return { data: list, fullData: data, updateControlIds, hasError, hasRuleError, error, ids };
  }

  /**
   * 表单提交数据
   */
  submitFormData(options) {
    this.submitBegin = true;
    const { loadingItems, rules } = this.state;
    const { onSave, from } = this.props;
    const { data, updateControlIds, error, ids } = this.getSubmitData(options);

    if (!error && _.some(Object.values(loadingItems), i => i)) {
      return;
    }

    onSave(error, {
      data,
      updateControlIds,
      handleRuleError: badData => {
        badData.forEach(itemBadData => {
          const [rowId, ruleId, controlId] = (itemBadData || '').split(':').reverse();
          const control = _.find(data, d => d.controlId === controlId);
          if (control && control.type === 34) {
            const state = control.store && control.store.getState();
            const ruleError = getRuleErrorInfo(_.get(state, 'base.worksheetInfo.rules'), [[ruleId, rowId].join(':')]);
            ruleError.forEach(ruleErrorItem => {
              if (_.get(ruleErrorItem, 'errorInfo.0.errorMessage')) {
                const error = {
                  [`${rowId}-${_.get(ruleErrorItem, 'errorInfo.0.controlId')}`]: _.get(
                    ruleErrorItem,
                    'errorInfo.0.errorMessage',
                  ),
                };
                if (!isEmpty(error)) {
                  this.dataFormat.callStore(
                    { fnName: 'dispatch', controlId: controlId },
                    {
                      type: 'UPDATE_CELL_ERRORS',
                      value: error,
                    },
                  );
                }
              }
            });
          }
        });
        let totalRuleError = getRuleErrorInfo(rules, badData)
          .reduce((total, its) => {
            return total.concat(its.errorInfo);
          }, [])
          .filter(i => _.find(data, d => d.controlId === i.controlId));
        const hideControlErrors = totalRuleError
          .filter(
            i =>
              !controlState(
                _.find(data, d => d.controlId === i.controlId),
                from,
              ).visible,
          )
          .map(i => i.errorMessage);
        // 后端校验隐藏字段报错
        if (hideControlErrors.length > 0) {
          this.errorDialog(hideControlErrors);
        }
        // 过滤掉子表报错、ids：不需校验的字段合集
        totalRuleError = totalRuleError.filter(it => _.includes(ids, it.controlId));
        this.setState({
          errorItems: totalRuleError,
        });
      },
      // 接口报错
      handleServiceError: badData => {
        const { serviceError, hideControlErrors } = getServiceError(badData, data, from);
        // 后端校验隐藏字段报错
        if (hideControlErrors.length > 0) {
          this.errorDialog(hideControlErrors);
        }
        this.setState({
          errorItems: serviceError,
        });
        alert(_l('记录提交失败：有必填字段未填写'), 2);
      },
    });
    this.submitBegin = false;
  }

  setActiveTabControlId(id) {
    this.setState({ activeTabControlId: id });
  }

  renderTab(commonData, tabControls) {
    const { tabControlProp: { isSplit, splitTabDom } = {}, from, isDraft } = this.props;
    const { activeTabControlId, renderData } = this.state;
    const isMobile = browserIsMobile();
    const sectionProps = {
      ...this.props,
      tabControls,
      hasCommon: commonData.length > 0,
      activeTabControlId: activeTabControlId || _.get(tabControls[0], 'controlId'),
      isDraft: isDraft || from === FROM.DRAFT,
      setActiveTabControlId: value => this.setActiveTabControlId(value),
      renderForm: value => this.renderForm(value),
      triggerCustomEvent: value => this.triggerCustomEvent({ ...this.props, ...value }),
    };

    if (isMobile) {
      return (
        <MobileWidgetSection
          {...sectionProps}
          onChange={(value, cid, control) => this.handleChange(value, cid, control)}
        />
      );
    }

    if (isSplit && splitTabDom) {
      return createPortal(<WidgetSection {...sectionProps} />, splitTabDom);
    }

    return (
      <div className="relateRecordBlockCon">
        <WidgetSection {...sectionProps} />
      </div>
    );
  }

  render() {
    const isMobile = browserIsMobile();
    const { from, disabled, widgetStyle = {}, ignoreSection, tabControlProp = {}, className } = this.props;
    const { otherTabs = [] } = tabControlProp;
    const { rulesLoading, renderData } = this.state;
    let { commonData, tabData } = getControlsByTab(renderData, widgetStyle, from, ignoreSection, otherTabs);
    tabData = tabData.filter(control => controlState(control, from).visible).filter(c => !c.hidden);

    if (rulesLoading) {
      return (
        <div className="customFieldsLoading" style={{ paddingTop: 50 }}>
          <LoadDiv />
        </div>
      );
    }
    return (
      <Fragment>
        <div
          className={cx('customFieldsContainer', {
            mobileContainer: isMobile,
            wxContainer: isMobile && _.includes([FROM.H5_ADD, FROM.H5_EDIT, FROM.RECORDINFO], from) && !disabled,
            pTop0: isMobile && _.includes([FROM.H5_ADD, FROM.H5_EDIT, FROM.RECORDINFO], from),
            pBottom20: isMobile && !_.isEmpty(commonData),
            [`${className}`]: className,
          })}
          ref={this.con}
        >
          {this.renderForm(commonData)}
        </div>

        {!!tabData.length && this.renderTab(commonData, tabData)}
      </Fragment>
    );
  }
}
