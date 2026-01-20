import React, { useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import _, { isFunction } from 'lodash';
import { Icon } from 'ming-ui';
import { isCustomWidget } from 'src/pages/widgetConfig/util';
import { isRelateRecordTableControl } from 'src/utils/control';
import { addBehaviorLog } from 'src/utils/project.js';
import FreeField from '../../components/FreeField';
import WidgetsDesc from '../../components/WidgetsDesc';
import { FROM } from '../../core/config';
import { ADD_EVENT_ENUM } from '../../core/enum';
import {
  controlState,
  convertControl,
  getControlDisabled,
  getValueStyle,
  isUnTextWidget,
  showRefreshBtn,
} from '../../core/utils';
import { CustomFormItemControlWrap } from '../style';
import widgets from '../widgets';
import RefreshBtn from './RefreshBtn';

// 阻止默认的tab行为
const createEventHandler = (event, customHandler) => {
  if (event.key === 'Tab') {
    event.preventDefault();
  }
  // 自定义处理器--留给其他事件
  if (customHandler) {
    customHandler(event);
  }
};

export default function DeskFormWidget(props) {
  const {
    disabled,
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
    formDidMountFlag,
    onBlur = () => {},
    renderData,
    item: originItem,
    triggerCustomEvent = () => {},
    handleChange,
    checkControlUnique,
    controlRefs,
    dataFormat,
    submitFormData,
    renderVerifyCode = () => {},
    isCreated,
    tabFocusId,
    updateRenderData,
  } = props;
  const [showMaskValue, setShowMaskValue] = useState(false);
  const itemRef = useRef(null);

  // controlItem 处理
  const item = useMemo(() => {
    // 他表字段
    if (convertControl(originItem.type) === 'SHEET_FIELD') {
      const newItem = _.cloneDeep(originItem);
      newItem.value =
        newItem.sourceControlType === 3 && newItem.sourceControl.enumDefault === 1
          ? (newItem.value || '').replace(/\+86/, '')
          : newItem.value;
      newItem.otherSheetControlType = newItem.type;
      newItem.type = newItem.sourceControlType === 3 ? 2 : newItem.sourceControlType;
      newItem.enumDefault = newItem.sourceControlType === 3 ? 2 : newItem.enumDefault;
      newItem.disabled = true;
      newItem.advancedSetting = {
        ...((newItem.sourceControl || {}).advancedSetting || {}),
        ..._.pick(originItem.advancedSetting, [
          'datamask',
          'isdecrypt',
          'masktype',
          'maskbegin',
          'mdchar',
          'maskend',
          'mechar',
          'maskmid',
          'masklen',
        ]),
      };
      if (newItem.type === 46) {
        newItem.unit = _.includes(['6', '9'], (newItem.sourceControl || {}).unit) ? '6' : '1';
      }
      return newItem;
    }
    return originItem;
  }, [originItem]);

  const { advancedSetting = {}, controlId } = item;
  itemRef.current = item;

  const isEditable = controlState(item, from).editable;
  const controlDisabled = getControlDisabled(item, from, disabledChildTableCheck);
  const isShowRefreshBtn = showRefreshBtn({
    ..._.pick(props, ['disabledFunctions', 'recordId', 'from']),
    item: originItem,
  });

  // 字段描述显示方式
  const hintShowAsText = useMemo(() => {
    const hintType = advancedSetting.hinttype || '0';
    return hintType === '0'
      ? from === FROM.DRAFT || (from !== FROM.RECORDINFO && !recordId && !item.isSubList && item.type !== 34)
      : hintType === '2' && item.type !== 34;
  }, [advancedSetting.hinttype, from, recordId, item.isSubList, item.type]);

  // 是否掩码
  const controlCanMask = useMemo(() => {
    return (
      ((item.type === 2 && item.enumDefault === 2) || _.includes([3, 4, 5, 6, 7, 8], item.type)) &&
      advancedSetting.datamask === '1' &&
      item.value
    );
  }, [item.type, item.enumDefault, advancedSetting.datamask, item.value]);

  // 是否有解码权限
  const maskPermissions = useMemo(() => {
    return isCharge || advancedSetting.isdecrypt === '1';
  }, [isCharge, advancedSetting.isdecrypt]);

  // 掩码icon渲染
  const renderMaskContent = () => {
    if (maskPermissions && controlCanMask) {
      return (
        <Icon
          icon={showMaskValue ? 'eye_off' : 'eye'}
          className={cx('Gray_bd', controlDisabled ? 'mLeft7' : 'maskIcon')}
        />
      );
    }
    return null;
  };

  const handleMaskClick = () => {
    if (maskPermissions && controlCanMask && controlDisabled) {
      // 解码需要记录行为日志
      if (showMaskValue) {
        addBehaviorLog('worksheetDecode', worksheetId, {
          rowId: recordId,
          controlId: controlId,
        });
      }
      setShowMaskValue(!showMaskValue);
    }
  };

  useEffect(() => {
    if (_.isFunction(triggerCustomEvent)) {
      const showEventTimer = setTimeout(() => {
        triggerCustomEvent({ ...item, triggerType: ADD_EVENT_ENUM.SHOW });
        clearTimeout(showEventTimer);
      }, 500);

      return () => {
        triggerCustomEvent({ ...item, triggerType: ADD_EVENT_ENUM.HIDE });
      };
    }
  }, [formDidMountFlag]);

  useEffect(() => {
    setShowMaskValue(controlCanMask);
  }, [controlCanMask]);

  // 渲染表单项
  const renderWidgetsContent = () => {
    const widgetName = convertControl(item.type);
    const isFreeField = isCustomWidget(item);
    let Widgets;
    if (isFreeField) {
      Widgets = FreeField;
    } else if (widgetName === 'CustomWidgets') {
      Widgets = customWidgets[item.type];
    } else {
      Widgets = widgets[widgetName];
    }

    if (!Widgets) {
      return undefined;
    }

    if (item.notSupport) {
      return (
        <CustomFormItemControlWrap className="customFormItemControl">
          <div className="center Gray_9e GrayBGFA pTop20 pBottom20">
            {item.notSupportTip || _l('%0暂不支持', item.controlName)}
          </div>
        </CustomFormItemControlWrap>
      );
    }

    // (禁用或只读) 且 内容不存在
    if (
      !_.includes([22, 52, 34], item.type) &&
      !isCustomWidget(item) &&
      !(item.type === 29 && isRelateRecordTableControl(item)) &&
      !(_.includes([9, 10, 11], item.type) && advancedSetting.readonlyshowall === '1') &&
      (item.disabled || _.includes([25, 31, 32, 33, 37, 38, 53], item.type) || !isEditable) &&
      ((!item.value && item.value !== 0 && !_.includes([28, 47, 51], item.type)) ||
        (item.type === 29 &&
          (safeParse(item.value).length <= 0 ||
            (typeof item.value === 'string' && item.value.startsWith('deleteRowIds')) ||
            (_.get(window, 'shareState.isPublicForm') && item.value === 0))) ||
        (_.includes([21, 26, 27, 48, 35, 14, 10, 11], item.type) &&
          _.isArray(JSON.parse(item.value)) &&
          !JSON.parse(item.value).length))
    ) {
      return (
        <CustomFormItemControlWrap className="customFormItemControl" isShowRefreshBtn={isShowRefreshBtn}>
          <div className="customFormNull" />
          {!recordId && hintShowAsText && <WidgetsDesc item={item} from={from} />}
          {isShowRefreshBtn && (
            <RefreshBtn {..._.pick(props, ['worksheetId', 'recordId'])} item={item} onChange={handleChange} />
          )}
        </CustomFormItemControlWrap>
      );
    }

    const tabFocusActive = (tabFocusId || '').includes(controlId) && !controlDisabled;

    const widgetProps = {
      ...item,
      mobileApprovalRecordInfo,
      flag,
      isCharge,
      widgetStyle,
      popupContainer,
      sheetSwitchPermit,
      disabled: controlDisabled,
      formDisabled: disabled,
      isEditable,
      projectId,
      from,
      worksheetId,
      recordId,
      appId,
      viewIdForPermit: viewId,
      renderData,
      isDraft: isDraft || from === FROM.DRAFT, // 子表单条记录详情from不对，新增参数以供使用
      initSource,
      masterData,
      showMaskValue,
      isMaskReadonly: controlDisabled && controlCanMask && maskPermissions,
      tabFocusActive,
      handleMaskClick,
      renderMaskContent,
      createEventHandler,
      onChange: (value, cid = controlId, searchByChange) => {
        // 使用 ref 获取最新的 item，自动避开闭包问题
        const currentItem = itemRef.current;
        handleChange(value, cid, currentItem, searchByChange);
        // 非文本change校验重复、文本失焦校验
        if (currentItem.unique && value && isUnTextWidget(currentItem)) {
          checkControlUnique(controlId, currentItem.type, value);
        }

        // 非文本类值改变时触发自定义事件
        if (isUnTextWidget(currentItem) && currentItem.value !== value && currentItem.type !== 34) {
          triggerCustomEvent({ ...currentItem, value, triggerType: ADD_EVENT_ENUM.CHANGE });
        }
      },
      onBlur: (originValue, newVal) => {
        // 使用 ref 获取最新的 item，自动避开闭包问题
        const currentItem = itemRef.current;
        // 由输入法和onCompositionStart结合引起的组件内部未更新value值的情况，主动抛出新值
        const newValue = _.isUndefined(newVal)
          ? `${currentItem.value || ''}`
            ? `${currentItem.value || ''}`.trim()
            : ''
          : newVal;
        if (currentItem.unique && newValue) {
          checkControlUnique(controlId, currentItem.type, newValue);
        }
        if (newValue && newValue !== originValue) {
          dataFormat.current.updateDataBySearchConfigs({
            control: { ...currentItem, value: newValue },
            searchType: 'onBlur',
          });
        }
        // 文本类失焦触发自定义事件
        if (newValue !== originValue && !isUnTextWidget(currentItem)) {
          triggerCustomEvent({ ...currentItem, triggerType: ADD_EVENT_ENUM.CHANGE });
        }
        onBlur(controlId);
        triggerCustomEvent({ ...currentItem, triggerType: ADD_EVENT_ENUM.BLUR });
      },
      openRelateSheet,
      registerCell: cell => {
        controlRefs.current[controlId] = cell;
        registerCell({ item, cell });
      },
      getControlRef: key => controlRefs.current[key],
      formData: dataFormat.current
        .getDataSource()
        .concat(systemControlData || [])
        .concat(getMasterFormData() || []),
      triggerCustomEvent: triggerType => triggerCustomEvent({ ...item, triggerType }),
      submitChildTableCheckData: submitFormData,
      onChildTableLoaded: () => {
        if (isFunction(updateRenderData)) {
          updateRenderData();
        }
      },
    };

    return (
      <CustomFormItemControlWrap
        className={cx('customFormItemControl', {
          customFormItemControlCreate: isCreated,
          customFormItemTabFocus: tabFocusActive,
        })}
        {...getValueStyle(item)}
        disabled={disabled}
        isShowRefreshBtn={isShowRefreshBtn}
      >
        <Widgets {...widgetProps} />
        {hintShowAsText && <WidgetsDesc item={item} from={from} />}
        {isShowRefreshBtn && (
          <RefreshBtn {..._.pick(props, ['worksheetId', 'recordId'])} item={item} onChange={handleChange} />
        )}
        {renderVerifyCode(item)}
      </CustomFormItemControlWrap>
    );
  };

  return renderWidgetsContent();
}
