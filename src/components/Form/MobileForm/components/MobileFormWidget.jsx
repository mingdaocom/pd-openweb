import React, { Fragment, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, LoadDiv } from 'ming-ui';
import { isUnTextWidget } from 'src/utils/domain/control/capabilities';
import { ADD_EVENT_ENUM } from 'src/utils/domain/control/formEnum';
import { isCustomWidget } from 'src/utils/domain/control/metadata';
import { controlState } from 'src/utils/domain/control/state';
import { isRelateRecordTableControl } from 'src/utils/domain/control/type';
import { addBehaviorLog } from 'src/utils/services/project';
import FreeField from '../../components/FreeField';
import WidgetsDesc from '../../components/WidgetsDesc';
import { FROM, MASK_ADVANCEDSETTING } from '../../core/config';
import { createWidgetPropsEqual } from '../../core/renderDataUtils';
import { convertControl } from '../../core/utils';
import widgets from '../widgets';

const COMPARE_FUNCTION_PROP_KEYS = new Set([
  'checkControlUnique',
  'handleChange',
  'onBlur',
  'openRelateSheet',
  'registerCell',
  'submitFormData',
  'triggerCustomEvent',
]);
const arePropsEqual = createWidgetPropsEqual(COMPARE_FUNCTION_PROP_KEYS, isCustomWidget);

function MobileFormWidget(props) {
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
    popupContainer,
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
    formData,
    item: originItem,
    triggerCustomEvent = () => {},
    handleChange,
    checkControlUnique,
    controlRefs,
    dataFormat,
    submitFormData,
  } = props;

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
        ..._.pick(originItem.advancedSetting, MASK_ADVANCEDSETTING),
      };
      if (newItem.type === 46) {
        newItem.unit = _.includes(['6', '9'], (newItem.sourceControl || {}).unit) ? '6' : '1';
      }

      return newItem;
    }

    return originItem;
  }, [originItem]);
  const eventItemRef = useRef(item);

  const { advancedSetting = {}, controlId } = item;

  useLayoutEffect(() => {
    eventItemRef.current = item;
  }, [item]);

  const isEditable = controlState(item, from).editable;
  const controlDisabled =
    item.type === 36 ? disabledChildTableCheck || item.disabled || !isEditable : item.disabled || !isEditable;

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
  const maskStateKey = controlCanMask ? `${controlId}-${item.value}` : controlId;
  const [maskState, setMaskState] = useState({
    key: maskStateKey,
    showMaskValue: controlCanMask,
  });
  const showMaskValue = maskState.key === maskStateKey ? maskState.showMaskValue : controlCanMask;

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
          className={cx('commonFormIcon', controlDisabled ? 'mLeft7' : 'maskIcon')}
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

      setMaskState({ key: maskStateKey, showMaskValue: !showMaskValue });
    }
  };

  useEffect(() => {
    if (_.isFunction(triggerCustomEvent)) {
      const showEventTimer = setTimeout(() => {
        triggerCustomEvent({ ...eventItemRef.current, triggerType: ADD_EVENT_ENUM.SHOW });
        clearTimeout(showEventTimer);
      }, 500);

      return () => {
        triggerCustomEvent({ ...eventItemRef.current, triggerType: ADD_EVENT_ENUM.HIDE });
      };
    }
  }, [formDidMountFlag, triggerCustomEvent]);

  // 渲染表单项
  const renderWidgetsContent = () => {
    const widgetName = convertControl(item.type);
    const isFreeField = isCustomWidget(item) && !(item.otherSheetControlType === 30 && item.type !== 54);
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
        <div className="center textTertiary bgSecondary pTop20 pBottom20">
          {item.notSupportTip || _l('%0暂不支持', item.controlName)}
        </div>
      );
    }

    // (禁用或只读) 且 内容不存在
    if (
      !_.includes([22, 52, 34], item.type) &&
      !isFreeField &&
      !(item.type === 29 && isRelateRecordTableControl(item)) &&
      (item.disabled || _.includes([25, 31, 32, 33, 37, 38, 53], item.type) || !isEditable) &&
      ((!item.value && item.value !== 0 && !_.includes([28, 47, 51], item.type)) ||
        (_.includes([9, 10, 11], item.type) && item.value && !JSON.parse(item.value).length) ||
        (item.type === 29 &&
          (safeParse(item.value).length <= 0 ||
            !item.value ||
            (typeof item.value === 'string' && item.value.startsWith('deleteRowIds')) ||
            (_.get(window, 'shareState.isPublicForm') && item.value === 0))) ||
        (_.includes([21, 26, 27, 48, 35, 14, 10, 11], item.type) &&
          _.isArray(JSON.parse(item.value)) &&
          !JSON.parse(item.value).length))
    ) {
      return (
        <Fragment>
          <div className="customFormNull" />
          {!recordId && hintShowAsText && <WidgetsDesc item={item} from={from} />}
        </Fragment>
      );
    }

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
      handleMaskClick,
      renderMaskContent,
      onChange: (value, cid = controlId, searchByChange) => {
        const currentItem = item;
        handleChange(value, cid, currentItem, searchByChange);
        // 非文本change校验重复、文本失焦校验
        if (currentItem.unique && value && isUnTextWidget(currentItem)) {
          checkControlUnique(controlId, currentItem.type, value);
        }

        // h5附件上传完成后才能触发自定义事件
        if (
          currentItem.type === 14 &&
          currentItem.value !== value &&
          !$('.customMobileFormContainer').find('.fileUpdateLoading').length
        ) {
          currentItem.value = value;
          triggerCustomEvent({ ...currentItem, value, triggerType: ADD_EVENT_ENUM.CHANGE });
          return;
        }

        // 非文本类值改变时触发自定义事件
        if (isUnTextWidget(currentItem) && currentItem.value !== value && currentItem.type !== 34) {
          triggerCustomEvent({ ...currentItem, value, triggerType: ADD_EVENT_ENUM.CHANGE });
        }
      },
      onBlur: (originValue, newVal) => {
        const currentItem = item;
        // 由输入法和onCompositionStart结合引起的组件内部未更新value值的情况，主动抛出新值
        const newValue = newVal || (`${currentItem.value || ''}` ? `${currentItem.value || ''}`.trim() : '');
        const isTextWidget = !isUnTextWidget(currentItem);
        const valueChanged = newValue !== originValue;

        if (currentItem.unique && newValue) {
          checkControlUnique(controlId, currentItem.type, newValue);
        }

        if (valueChanged && isTextWidget) {
          handleChange(newValue, controlId, currentItem, false);
        }

        if (newValue && valueChanged) {
          dataFormat.current.updateDataBySearchConfigs({
            control: { ...currentItem, value: newValue },
            searchType: 'onBlur',
          });
        }

        // 文本类失焦触发自定义事件
        if (valueChanged && isTextWidget) {
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
      formData,
      // 子表打开关联记录选择器时需要读取动态字段回填后的最新值，不能依赖当前渲染周期的 formData 快照。
      getCurrentFormData: () =>
        dataFormat.current ? _.unionBy(dataFormat.current.getDataSource(), formData, 'controlId') : formData,
      triggerCustomEvent: triggerType => triggerCustomEvent({ ...item, triggerType }),
      submitChildTableCheckData: submitFormData,
    };

    return (
      <Fragment>
        <Suspense fallback={<LoadDiv className="mTop10" />}>
          <Widgets {...widgetProps} />
        </Suspense>
        {hintShowAsText && <WidgetsDesc item={item} from={from} />}
      </Fragment>
    );
  };

  return renderWidgetsContent();
}

export default React.memo(MobileFormWidget, arePropsEqual);
