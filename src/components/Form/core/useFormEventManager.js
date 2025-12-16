import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { browserIsMobile } from 'src/utils/common';
import { supportTabKeyDown } from '../core/utils';

// rememberText 该文本控制是否能作为tab标记开始控件
const isTextInput = (data = {}, rememberText = false) => {
  let textTypes = [2, 3, 4, 5, 6, 7, 8, 11, 15, 16, 24, 35, 41, 46];
  if (!rememberText) {
    textTypes = textTypes.filter(type => !_.includes([15, 16, 46], type));
  }
  if (_.includes(textTypes, data.type)) {
    return true;
  }
  if (data.type === 10 && _.get(data, 'advancedSetting.checktype') === '1') {
    return true;
  }
  return false;
};

/**
 * 控件事件管理器类
 */
class WidgetEventManager {
  constructor() {
    this.subscribers = new Map(); // controlId -> callback
  }

  /**
   * 订阅事件
   * @param {string} controlId
   * @param {Function} callback
   */
  subscribe(controlId, callback) {
    this.subscribers.set(controlId, callback);

    // 返回取消订阅函数
    return () => {
      this.subscribers.delete(controlId);
    };
  }

  /**
   * 发布事件
   * @param {string} controlId - 控件ID
   * @param {any} data - 事件数据
   */
  publish(controlId, data = {}) {
    const callback = this.subscribers.get(controlId);
    if (callback) callback(data);
  }

  /**
   * 清理所有订阅
   */
  clear(instanceId) {
    if (instanceId) {
      // 清理包含特定instanceId的controlId
      const keysToDelete = [];
      for (const [controlId] of this.subscribers) {
        if (controlId.includes(instanceId)) {
          keysToDelete.push(controlId);
        }
      }
      keysToDelete.forEach(key => this.subscribers.delete(key));
    } else {
      // 如果没有传入instanceId，清理所有订阅
      this.subscribers.clear();
    }
  }
}

// 创建全局实例
const widgetEventManager = new WidgetEventManager();

/**
 * 使用事件 Hook
 * @param {string} controlId - 控件ID
 * @param {Function} callback - 键盘事件回调
 * @returns {Object} - 发布事件的函数
 */
export const useWidgetEvent = (controlId, callback) => {
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!controlId) return;

    const unsubscribe = widgetEventManager.subscribe(controlId, data => {
      if (callback) callback(data);
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [controlId]);

  return {
    publish: data => widgetEventManager.publish(controlId, data),
  };
};

/**
 * 为 Class 组件事件提供
 */
export class WidgetEventHelper {
  constructor(controlId) {
    this.controlId = controlId;
    this.callback = null;
    this.unsubscribe = null;
  }

  /**
   * 订阅事件
   * @param {Function} callback - 回调函数
   */
  subscribe(callback) {
    if (!this.controlId) {
      return;
    }

    this.callback = callback;
    this.unsubscribe = widgetEventManager.subscribe(this.controlId, data => {
      if (this.callback) {
        try {
          this.callback(data);
        } catch (error) {
          console.log(error);
        }
      }
    });
  }

  /**
   * 取消订阅事件
   */
  unsubscribe() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.callback = null;
  }

  /**
   * 发布事件
   * @param {any} data - 事件数据
   */
  publish(data) {
    if (!this.controlId) {
      return;
    }
    widgetEventManager.publish(this.controlId, data);
  }

  /**
   * 清理所有订阅
   */
  destroy() {
    this.unsubscribe();
  }
}

/**
 * 表单事件管理器 Hook
 * 用于管理表单的tab事件监听和实例隔离
 * instanceId 表单隔离唯一id
 * tabFocusArr 数组，第一个为当前激活的控件id，第二个为上一次激活的控件id
 */
export const useFormEventManager = ({ containerRef, stateRef, from, disabledTabs, disabledChildTableCheck, flag }) => {
  const [tabFocusArr, setTabFocusArr] = useState([]);
  const tabFocusArrRef = useRef([]);

  const instanceId = useMemo(() => {
    const id = uuidv4();
    // window.FormActiveTabId用于记录已渲染的表单实例id，隔离事件
    window.FormActiveTabId = (window.FormActiveTabId || []).concat(id);
    window.activeTableId = undefined;
    return id;
  }, []);

  // Tab事件处理
  const handleTabChange = useCallback(event => {
    const renderData = _.get(stateRef, 'current.renderData') || [];
    if (!containerRef.current || !renderData.length) return;
    // 不是当前页面的事件不响应
    if (_.last(window.FormActiveTabId || []) !== instanceId) return;
    // 已经进入子表tab事件，不处理
    if (window.activeTableId || disabledTabs) return;

    if (_.includes(['Enter', 'ArrowRight', 'ArrowLeft'], event.key) && _.get(tabFocusArrRef, 'current.0')) {
      widgetEventManager.publish(tabFocusArrRef.current[0], {
        triggerType: event.key,
        originalEvent: event,
      });
    } else if (event.key === 'Tab') {
      event.preventDefault();
      // 获取当前表单页面已渲染的控件key
      const allElements = containerRef.current.querySelectorAll('.customFormItem');
      const allElementKeys = [...allElements]
        .filter(i => !i.querySelector('.customFormNull'))
        .map(i => i.getAttribute('data-instance-id'));

      if (allElementKeys.length === 0) {
        return;
      }

      const currentTabFocusId = tabFocusArrRef.current[0] || tabFocusArrRef.current[1] || '';
      const currentIndex = currentTabFocusId ? allElementKeys.indexOf(currentTabFocusId) : -1;
      // 没有tab记录，或当前切换到最后一个，自动进入第一个
      let nextIndex = currentIndex === -1 || currentIndex === allElementKeys.length - 1 ? 0 : currentIndex + 1;

      // 循环查找支持Tab键的控件，添加最大循环次数防止无限循环
      let loopCount = 0;
      while (loopCount < allElementKeys.length) {
        const id = allElementKeys[nextIndex].split('~')[1];
        const controlData = _.find(renderData, { controlId: id });

        if (supportTabKeyDown(controlData, from, disabledChildTableCheck)) {
          // 离开当前控件
          if (currentTabFocusId) {
            widgetEventManager.publish(currentTabFocusId, {
              triggerType: 'trigger_tab_leave',
              originalEvent: event,
            });
          }

          if (allElementKeys[nextIndex] === currentTabFocusId) {
            setTabFocusArr([]);
            break;
          }

          // 进入下一个控件
          widgetEventManager.publish(allElementKeys[nextIndex], {
            triggerType: 'trigger_tab_enter',
            originalEvent: event,
          });
          setTabFocusArr([allElementKeys[nextIndex], currentTabFocusId]);
          break;
        } else {
          nextIndex = nextIndex === allElementKeys.length - 1 ? 0 : nextIndex + 1;
          loopCount++;
        }
      }
    } else {
      // 通过tab激活或者直接点击激活的控件，其他快捷操作引起的清除
      if (
        _.includes(['Escape'], event.key) ||
        ((window.isMacOs ? event.metaKey : event.ctrlKey) && ['s', 'S'].includes(event.key)) ||
        ((window.isMacOs ? event.metaKey : event.ctrlKey) && event.shiftKey && event.key === 'Enter')
      ) {
        publishTabFocusLeave();
      }
    }
  }, []);

  const publishTabFocusLeave = useCallback(() => {
    const activeTabFocusId = tabFocusArrRef.current[0] || tabFocusArrRef.current[1];
    if (activeTabFocusId) {
      widgetEventManager.publish(activeTabFocusId, {
        triggerType: 'trigger_tab_leave',
      });
      setTabFocusArr([]);
    }
  }, []);

  // 点击外部处理
  const handleClickOutSide = useCallback(e => {
    const $target = e.target.closest('.customFormItemControl');
    // 某些控件编辑、非编辑切换显示，捕捉不到上层，单独异化
    const specialTarget = e.target.closest('.classtabfocus');
    const specialTargetId = specialTarget ? specialTarget.getAttribute('data-instance-id') : '';
    const renderData = _.get(stateRef, 'current.renderData') || [];
    const activeTabFocusId = tabFocusArrRef.current[0] || tabFocusArrRef.current[1] || '';
    const activeData = _.find(renderData, { controlId: activeTabFocusId.split('~')[1] }) || {};

    if (
      containerRef.current &&
      ((containerRef.current.contains(e.target) && $target) ||
        (specialTargetId && specialTargetId.includes(instanceId)))
    ) {
      const $targetId = e.target.closest('.customFormItem');
      const targetId = specialTargetId || $targetId.getAttribute('data-instance-id') || '';
      const controlData = _.find(renderData, { controlId: targetId.split('~')[1] }) || {};

      // 非文本类主动清空操作状态，文本类会失焦
      if (activeTabFocusId !== targetId && !isTextInput(activeData)) {
        publishTabFocusLeave();
      }

      // 文本类记录当前点击作为下一次起始位置
      // 注意：markdown不支持tab切换，但是需要主动失焦
      if (
        supportTabKeyDown(controlData, from, disabledChildTableCheck, true) &&
        isTextInput(controlData, true) &&
        activeTabFocusId !== targetId
      ) {
        setTabFocusArr(['', targetId]);
      }
    } else {
      if (isTextInput(activeData)) {
        return;
      }
      // 非文本类弹层避免清空操作,部分点击切换显影的元素要注意

      if (
        activeTabFocusId &&
        (e.target.closest('#quickSelectDept') ||
          e.target.closest('.selectUserBox') ||
          e.target.closest('.selectRoleDialog') ||
          e.target.closest('.relationControlBox') ||
          e.target.closest('.MDMap') ||
          e.target.closest('.UploadFilesTriggerPanel') ||
          e.target.closest('.ant-picker-dropdown') ||
          e.target.className.includes('ant-picker') ||
          (activeData.type === 14 && document.querySelector('.folderSelectDialog')) ||
          e.target.closest('.CityPickerPanelTrigger'))
      ) {
        return;
      }
      publishTabFocusLeave();
    }
  }, []);

  // tab激活状态处理
  useEffect(() => {
    tabFocusArrRef.current = tabFocusArr;
    if (tabFocusArr[0]) {
      if (containerRef.current) {
        const element = containerRef.current.querySelector(`[data-instance-id="${tabFocusArr[0]}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }
  }, [tabFocusArr]);

  // 注册事件监听器
  useEffect(() => {
    if (browserIsMobile()) return;

    window.addEventListener('keydown', handleTabChange);
    document.body.addEventListener('click', handleClickOutSide);

    return () => {
      window.removeEventListener('keydown', handleTabChange);
      document.body.removeEventListener('click', handleClickOutSide);
    };
  }, [handleTabChange]);

  // 组件卸载时清理事件管理器
  useEffect(() => {
    return () => {
      widgetEventManager.clear(instanceId);
      if (window.FormActiveTabId.includes(instanceId)) {
        window.FormActiveTabId = window.FormActiveTabId.filter(id => id !== instanceId);
      }
    };
  }, []);

  useEffect(() => {
    publishTabFocusLeave();
  }, [flag]);

  return {
    instanceId,
    tabFocusArr,
    setTabFocusArr,
  };
};

// 导出事件管理器实例
export { widgetEventManager };
