import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSetState, useTitle } from 'react-use';
import update from 'immutability-helper';
import _, { assign, find, findIndex, flatten, get, isEmpty, isEqual, isFunction, pick } from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { Modal } from 'ming-ui/antd-components';
import externalPortalAjax from 'src/api/externalPortal';
import projectEncryptAjax from 'src/api/projectEncrypt';
import worksheetAjax from 'src/api/worksheet';
import { useGlobalStore } from 'src/common/providers/GlobalStore';
import { updateGlobalStoreForMingo } from 'src/common/runtime/mingoStore';
import ErrorState from 'src/components/errorPage/errorState';
import {
  batchUpdateWidgetsLayout,
  checkWidgetErrorBeforeSave,
  clearAndSetWidgets,
  getChildWidgetsBySection,
  getMsgByCode,
  handleAddWidgets,
  handleDeleteWidgetsForMingo,
  handleUpdateWidgetsAttribute,
  scrollToVisibleRange,
} from 'src/pages/widgetConfig/internal/editorData';
import { getUrlPara, returnMasterPage } from 'src/pages/widgetConfig/navigation';
import { navigateTo } from 'src/router/navigation/navigateTo';
import { getAdvanceSetting } from 'src/utils/domain/control/advancedSetting';
import {
  fixedBottomWidgets,
  genControlsByWidgets,
  genWidgetRowAndCol,
  genWidgetsByControls,
  getBoundRowByTab,
} from 'src/utils/domain/control/editorLayout';
import { formatSearchConfigs } from 'src/utils/domain/control/filters';
import { getCurrentRowSize, getPathById, WHOLE_SIZE } from 'src/utils/domain/control/layout';
import { canSetAsTitle } from 'src/utils/domain/control/metadata';
import { formatControlsData } from 'src/utils/domain/control/normalization';
import { ALL_SYS } from 'src/utils/domain/control/widget';
import { emitter } from 'src/utils/platform/browser/dom';
import { dateConvertToUserZone } from 'src/utils/platform/runtime/timeZone';
import Content from './content';
import Header from './Header';
import { useSheetInfo } from './hooks';
import { resetDisplay } from './util/drag';
import NoTitleControlDialog from './widgetSetting/components/NoTitleControlDialog';
import VerifyModifyDialog, { verifyModifyDialog } from './widgetSetting/components/VerifyModifyDialog';
import './index.less';

const checkAutoIdReset = (data = {}, originControls = [], globalInfo = {}) => {
  const increase = getAdvanceSetting(data, 'increase') || [];
  const originAutoId = _.find(originControls, item => item.controlId === data.controlId);
  const originIncrease = getAdvanceSetting(originAutoId, 'increase') || [];
  const startValueChange =
    _.get(_.find(increase, { type: 1 }), 'start') !== _.get(_.find(originIncrease, { type: 1 }), 'start');

  if (startValueChange && window.auto_id_reset[data.controlId]) {
    worksheetAjax.resetControlIncrease({
      ..._.pick(globalInfo, ['appId', 'worksheetId']),
      controlId: data.controlId,
      initNum: 0,
    });
  }
};

/** 保存字段配置前处理自动编号及游离子表中的自动编号重置。 */
const checkWidgetBeforeSave = (controls = [], originControls = [], globalInfo = {}, deep = 0) => {
  controls.forEach(data => {
    if (data.type === 33 && !data.controlId.includes('-')) {
      checkAutoIdReset(data, originControls, globalInfo);
    }

    if (data.type === 34 && getAdvanceSetting(data, 'detailworksheettype') === 2 && deep === 0) {
      deep = 1;
      const oriControls = _.get(
        _.find(originControls, item => item.controlId === data.controlId),
        'relationControls',
      );
      checkWidgetBeforeSave(data.relationControls, oriControls, {
        appId: globalInfo.appId,
        worksheetId: data.dataSource,
      });
    }
  });
};

const WidgetConfig = styled.div`
  height: 100%;
  .savingMask {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: var(--color-background-overlay-white);
    z-index: 9;
  }
`;

export default function Container({ isDialog, ...props }) {
  const { store: { mingoIsCreatingWorksheetStatus } = {} } = useGlobalStore() || {};
  // 本表设置相关信息
  const [{ version }, setInfo] = useState({ version: 1 });
  // 所有的控件 二维数组方式保存
  const [widgets, setWidgets] = useState([]);
  // 选中的控件
  const [activeWidget, setActiveWidget] = useState({});
  // 批量选中
  const [batchActive, setBatchActive] = useState([]);
  // 批量拖拽
  const [batchDrag, setBatchDrag] = useState(false);
  // 查询工作表配置
  const [queryConfigs, setQueryConfigs] = useState([]);

  // 缓存的各种信息
  const [settingConfig, setConfig] = useSetState({
    enableState: undefined, // 外部门户开启状态
    encryData: undefined, // 加密规则
    ruleList: undefined, // 业务规则
    templatePersonalList: undefined, // 个人模板列表
    templateOrganizationList: undefined, // 组织模板列表
  });
  // 表单样式
  const [styleInfo, setStyle] = useState({
    activeStatus: true,
    info: {},
  });

  const setStyleInfo = obj => setStyle(Object.assign({}, styleInfo, obj));

  const $switchArgs = useRef(null);
  const $contentRef = useRef(null);

  const cache = useRef({});

  const [status, setStatus] = useSetState({
    saved: false,
    saveIndex: 0,
    modify: false,
    noTitleControl: false,
  });

  const sourceId = props.worksheetId || _.get(getUrlPara(), 'sourceId');
  const [{ getLoading, saveLoading }, setLoading] = useSetState({ getLoading: false, saveLoading: false });

  let $originControls = useRef([]);
  let $originStyle = useRef({});

  const {
    data: { info: globalInfo, noAuth },
  } = useSheetInfo({
    worksheetId: sourceId,
    getSwitchPermit: true,
    setConfigLoading: setLoading,
  });

  const [worksheetName, setWorksheetName] = useState();

  useTitle(_l('编辑字段 - %0', get(globalInfo, 'name') || ''));

  const handleSizeChange = (id, data) => {
    const path = getPathById(widgets, id);
    const { size } = data;
    if (isEmpty(path)) return widgets;
    const [row, col] = path;

    // 以下为布局更新情况
    if (_.includes([29, 51], data.type)) {
      const preData = widgets[row][col];
      // 1、关联记录切换成标签页表格
      const relateToTabList = !fixedBottomWidgets(preData) && fixedBottomWidgets(data);
      // 2、关联记录标签页表格切换成其他形态
      const tabListToRelate = fixedBottomWidgets(preData) && !fixedBottomWidgets(data);

      if (relateToTabList || tabListToRelate) {
        let targetIndex = getBoundRowByTab(widgets);
        let newData = { ...data, size: 12 };

        // 标签页内
        if (relateToTabList && data.sectionId) {
          const childrenList = getChildWidgetsBySection(genControlsByWidgets(widgets), newData.sectionId);
          targetIndex = _.head(getPathById(widgets, newData.sectionId)) + childrenList.length + 1;
          newData.sectionId = '';
        }

        setActiveWidget(newData);
        setTimeout(() => {
          scrollToVisibleRange(newData, { activeWidget: newData });
        }, 100);
        return resetDisplay({ widgets, srcPath: path, srcItem: newData, targetIndex });
      }
    }

    // 不支持设置为标题的，被设为标题了，清空一下
    if (!canSetAsTitle(data) && data.attribute === 1) {
      data.attribute = 0;
    }

    // 如果将当前变成整行 且当前行有其他控件 则另起一行
    if (size === WHOLE_SIZE && widgets[row].length > 1) {
      setActiveWidget(data);
      return update(widgets, { [row]: { $splice: [[col, 1]] }, $splice: [[row + 1, 0, [data]]] });
    }

    const nextWidgets = update(widgets, { [row]: { [col]: { $set: data } } });

    // 如果当前行的size大小大于整行 重新排列
    if (getCurrentRowSize(nextWidgets[row]) > WHOLE_SIZE) {
      const nextSize = WHOLE_SIZE / widgets[row].length;
      setActiveWidget({ ...data, size: nextSize });
      return update(nextWidgets, {
        [row]: { $apply: items => items.map(item => ({ ...item, size: nextSize })) },
      });
    }

    setActiveWidget(data);
    return nextWidgets;
  };

  const handleDataChange = (id, data, callback) => {
    let nextWidgets = handleSizeChange(id, data);
    setWidgets(nextWidgets);

    try {
      safeLocalStorageSetItem(
        `worksheetConfig-${sourceId}`,
        JSON.stringify({ widgets: nextWidgets, time: Date.now(), version }),
      );
    } catch (error) {
      console.log(error);
    }

    if (isFunction(callback)) {
      callback(nextWidgets);
    }
  };

  const initData = ({ widgets, version }) => {
    const widgetsWithRowAndCol = genWidgetRowAndCol(widgets);
    const flattenControls = flatten(widgetsWithRowAndCol);
    $originControls.current = flattenControls;
    setWidgets(widgetsWithRowAndCol);
    setInfo({ version });

    // 如果是从关联记录点过来 url参数会带有targetControl参数 自动选中
    let paras = new URLSearchParams(location.href);
    const targetControlId = paras.get('targetControl');

    if (targetControlId) {
      const activeControl = flattenControls.find(item => item.controlId === targetControlId) || {};
      setActiveWidget(activeControl);
      setStyleInfo({ activeStatus: false, info: _.get(globalInfo, 'advancedSetting') || {} });
      // 滚动到激活控件
      setTimeout(() => {
        const $ele = document.getElementById(`widget-${targetControlId}`);

        if ($ele) {
          $ele.scrollIntoView();
        }
      }, 0);
      return;
    }

    if (isFunction(window.pendingTaskForEditWorksheet)) {
      window.pendingTaskForEditWorksheet();
      delete window.pendingTaskForEditWorksheet;
    }
  };

  const getQueryConfigs = (hasSearchQuery = false) => {
    if (hasSearchQuery) {
      worksheetAjax.getQueryBySheetId({ worksheetId: sourceId }).then(res => {
        setQueryConfigs(formatSearchConfigs(res));
      });
    }
  };

  useEffect(() => {
    // 权限相关信息没返回前控制接口调用
    if (!globalInfo || noAuth) return;

    // 子表配置,防止激活子表掉接口冲掉临时变更
    window.subListSheetConfig = {};
    // 自定义事件集成api数据缓存
    window.IntegratedApi = {};
    // 自动编号重置缓存
    window.auto_id_reset = {};
    worksheetAjax
      .getWorksheetControls({
        worksheetId: sourceId,
        getRelationSearch: true,
        resultType: 3,
      })
      .then(({ code, data }) => {
        if (code === 1) {
          const { version, controls } = data;

          let widgets = genWidgetsByControls(controls);

          const savedWidgets = safeParse(localStorage.getItem(`worksheetConfig-${sourceId}`));

          if (savedWidgets) {
            // 未被保存过的更改 可以恢复
            if (savedWidgets.version === version) {
              Modal.confirm({
                title: _l('发现有未保存的更改，是否需要恢复 ？'),
                okText: _l('恢复'),
                cancelText: _l('取消'),
                onOk: () => {
                  initData(savedWidgets);
                },
                onCancel: () => {
                  localStorage.removeItem(`worksheetConfig-${sourceId}`);
                },
              });
            } else {
              localStorage.removeItem(`worksheetConfig-${sourceId}`);
            }
          }

          initData({ widgets, version });
          return;
        }

        alert(_l('获取控件错误'));
      })
      .finally(() => {
        setLoading({ getLoading: false });
      });

    const tempInfo = safeParse(window.localStorage.getItem(`worksheetPanelFixed-${sourceId}`) || '{}');
    setStyleInfo({
      info: _.get(globalInfo, 'advancedSetting') || {},
      activeStatus: _.isEmpty(tempInfo) ? true : tempInfo.settingPanelFixed,
    });
    $originStyle.current = _.get(globalInfo, 'advancedSetting') || {};
    getQueryConfigs(globalInfo.isWorksheetQuery);
    updateGlobalStoreForMingo(
      {
        activeModule: 'worksheetControlsEdit',
        appId: globalInfo.appId,
        appName: globalInfo.appName,
        worksheetId: sourceId,
        worksheetName: globalInfo.name,
        projectId: globalInfo.projectId,
      },
      'clear',
    );
  }, [globalInfo]);

  const getPortalState = () => {
    const appId = _.get(globalInfo, 'appId');

    if (appId) {
      externalPortalAjax.getPortalEnableState({ appId }).then(res => {
        setConfig({ enableState: res.isEnable });
      });
    }
  };

  const getEncryptData = () => {
    const projectId = _.get(globalInfo, 'projectId');

    if (projectId) {
      projectEncryptAjax.getProjectEncryptRules({ projectId }).then(res => {
        setConfig({ encryData: res.encryptRules });
      });
    }
  };

  const getRulesData = () => {
    if (sourceId) {
      worksheetAjax.getControlRules({ worksheetId: sourceId, type: 1 }).then(res => {
        setConfig({ ruleList: res });
      });
    }
  };

  const getTemplateListByPersonal = () => {
    if (!globalInfo.projectId) return;
    worksheetAjax
      .getControlTemplate({ type: 1, pageSize: 100, pageIndex: 1, projectId: globalInfo.projectId, getControls: true })
      .then(res => {
        setConfig({ templatePersonalList: _.get(res, 'data.data') || [] });
      });
  };

  const getTemplateListByOrganization = () => {
    if (!globalInfo.projectId) return;
    worksheetAjax
      .getControlTemplate({ type: 2, pageSize: 100, pageIndex: 1, projectId: globalInfo.projectId, getControls: true })
      .then(res => {
        setConfig({ templateOrganizationList: _.get(res, 'data.data') || [] });
      });
  };

  useEffect(() => {
    if (_.isEmpty(activeWidget)) return;
    if (_.isUndefined(settingConfig.ruleList)) {
      getRulesData();
    }

    if (_.isUndefined(settingConfig.encryData)) {
      getEncryptData();
    }

    if (_.isUndefined(settingConfig.enableState)) {
      getPortalState();
    }
  }, [activeWidget]);

  const saveControls = ({ actualWidgets, callback, newVersion } = {}) => {
    const saveControls = genControlsByWidgets(actualWidgets || widgets);

    if (!saveControls.some(item => item.attribute === 1)) {
      setStatus({ noTitleControl: true });
      return;
    }

    if (checkWidgetErrorBeforeSave(saveControls, $originControls.current)) {
      _.isFunction(callback) && callback(true);
      return;
    }

    checkWidgetBeforeSave(saveControls, $originControls.current, globalInfo);

    let activeWidgetPath = getPathById(widgets, (activeWidget || {}).controlId);

    // 清除不走缓存
    window.clearLocalDataTime({
      requestData: { worksheetId: sourceId },
      clearSpecificKeys: ['Worksheet_GetQueryBySheetId'],
    });

    if (activeWidget && activeWidget.type === 34) {
      // 清除不走缓存
      window.clearLocalDataTime({
        requestData: { worksheetId: activeWidget.dataSource },
        clearSpecificKeys: ['Worksheet_GetWorksheetInfo', 'Worksheet_GetWorksheetById'],
      });
    }

    setLoading({ saveLoading: true });
    worksheetAjax
      .saveWorksheetControls({
        version: newVersion || version,
        sourceId,
        controls: formatControlsData(saveControls),
      })
      .then(({ data, code }) => {
        // 多窗口编辑冲突
        if (code === 10) {
          updateConflictDialog(data);
          return;
        }

        let error = getMsgByCode({ code, data, controls: saveControls });
        if (error) return;
        const { controls, version } = data;

        // 子表重新拉缓存数据，保存后，relationControls不处理，防止一些隐藏问题
        window.subListSheetConfig = {};

        const nextWidgets = genWidgetsByControls(controls);
        const flattenControls = flatten(nextWidgets);
        setWidgets(nextWidgets);
        $originControls.current = flattenControls;
        setInfo({ version });
        setStatus({ saved: true, saveIndex: status.saveIndex + 1, modify: false });

        localStorage.removeItem(`worksheetConfig-${sourceId}`);

        // 新控件保存后 替换激活控件Id
        const nextActiveWidget = !isEmpty(activeWidgetPath) ? get(nextWidgets, activeWidgetPath) : '';

        nextActiveWidget && setActiveWidget(nextActiveWidget);
        setBatchActive([]);

        //有配置查询，保存后拉取配置
        const needGetQuery = queryConfigs.length > 0;
        getQueryConfigs(needGetQuery);
        _.isFunction(callback) && callback();
      })
      .finally(() => {
        setLoading({ saveLoading: false });
      });
  };

  const updateConflictDialog = data => {
    const { version, fullname, updateTime } = safeParse(data || '{}');
    const timeAgo = window.createTimeSpan(dateConvertToUserZone(updateTime));
    Modal.confirm({
      title: _l('发现更新冲突，是否覆盖 ？'),
      content: _l('在你编辑期间，当前表单已被更新（%0, %1）。现在保存将会覆盖此更新。', fullname, timeAgo),
      okText: _l('放弃保存'),
      cancelText: _l('保存并覆盖'),
      cancelButtonProps: {
        danger: true,
      },
      onOk: () => {},
      onCancel: () => {
        saveControls({
          newVersion: version,
        });
      },
    });
  };

  const saveStyleInfo = () => {
    if (!isEqual($originStyle.current, styleInfo.info)) {
      worksheetAjax
        .editWorksheetSetting({
          worksheetId: globalInfo.worksheetId,
          appId: globalInfo.appId,
          advancedSetting: styleInfo.info,
          projectId: globalInfo.projectId,
          editAdKeys: [
            'titlestorage',
            'coverid',
            'covertype',
            'covercolor',
            'coverheight',
            'animation',
            'autosecond',
            'showthumbnail',
            'titlelayout_pc',
            'titlelayout_app',
            'align_pc',
            'align_app',
            'titlewidth_pc',
            'titlewidth_app',
            'sectionstyle',
            'tabposition',
            'deftabname',
            'tabicon',
            'showicon',
            'hidetab',
            'sectionshow',
          ],
        })
        .then(res => {
          if (res) {
            setStyleInfo({ info: styleInfo.info });
            $originStyle.current = styleInfo.info;
          }
        });
    }
  };

  const deleteWidget = controlId => {
    const [row, col] = getPathById(widgets, controlId);
    setWidgets(update(widgets, { [row]: { $splice: [[col, 1]] } }));
    setActiveWidget({});
  };

  // 判断controls是否更改过
  const isControlsModified = () => {
    const currentControls = flatten(genWidgetRowAndCol(widgets));
    const prevControls = $originControls.current;
    if (currentControls.length !== prevControls.length) return true;
    return currentControls.some(item => {
      const prevItem = find(prevControls, ({ controlId }) => item.controlId === controlId);
      return !isEqual(
        _.omit(prevItem, [
          'half',
          'relationControls',
          'sourceEntityName',
          'sourceBtnName',
          'deleteAccount',
          'needUpdate',
        ]),
        _.omit(item, ['half', 'relationControls', 'sourceEntityName', 'sourceBtnName', 'deleteAccount', 'needUpdate']),
      );
    });
  };

  const updateQueryConfigs = (value = {}) => {
    const values = _.isArray(value) ? value : [value];

    setQueryConfigs(prevQueryConfigs =>
      values.reduce((newQueryConfigs, item) => {
        const index = findIndex(newQueryConfigs, queryConfig => queryConfig.id === item.id);

        return index > -1
          ? newQueryConfigs.map(queryConfig => {
              return queryConfig.id === item.id ? item : queryConfig;
            })
          : newQueryConfigs.concat([item]);
      }, prevQueryConfigs),
    );
  };

  const handleActiveSet = newWidgets => {
    setActiveWidget(newWidgets);
    if (!_.isEmpty(newWidgets)) {
      setStyleInfo({ activeStatus: false });
    }
  };

  const relateToNewPage = toPage => {
    if (isControlsModified()) {
      verifyModifyDialog({
        desc: _l('当前有尚未保存的更改，您在打开新页面前是否需要先保存这些更改'),
        cancelText: _l('否，暂不打开'),
        okText: _l('是，保存更改'),
        handleSave,
        toPage,
      });
    } else {
      toPage();
    }
  };

  const allControls = useMemo(() => genControlsByWidgets(widgets), [widgets]);
  const widgetProps = {
    isDialog,
    activeWidget,
    setActiveWidget: handleActiveSet,
    widgets,
    setWidgets,
    handleDataChange,
    deleteWidget,
    saveControls,
    status,
    getLoading,
    queryConfigs,
    ...settingConfig,
    setConfig,
    getTemplateListByPersonal,
    getTemplateListByOrganization,
    updateQueryConfigs,
    allControls,
    styleInfo,
    setStyleInfo,
    relateToNewPage,
    batchActive,
    setBatchActive,
    batchDrag,
    setBatchDrag,
    // 全局表信息
    globalSheetInfo: assign(
      {},
      pick(globalInfo, [
        'appId',
        'projectId',
        'worksheetId',
        'name',
        'desc',
        'groupId',
        'roleType',
        'appName',
        'switches',
      ]),
      worksheetName ? { name: worksheetName } : {},
      { systemControls: (_.get(globalInfo, 'template.controls') || []).filter(i => _.includes(ALL_SYS, i.controlId)) },
    ),
  };

  // Mingo 生成字段等外部调用通过 emitter 操作表单数据，监听必须挂在常驻的配置页容器上：
  // 建表模式下左侧字段库面板会被收起（Drawer 未打开即不渲染），挂在面板内会导致事件无人接收。
  useEffect(() => {
    cache.current.widgetProps = widgetProps;
  });

  const clearAndSetWidgetsFromEmitter = useCallback((data, para = {}, callback) => {
    window.lastAddWidgetsTriggerByMingo = true;
    clearAndSetWidgets(data, para, cache.current.widgetProps, callback);
    setTimeout(() => {
      window.lastAddWidgetsTriggerByMingo = false;
    }, 100);
  }, []);

  const handleAddWidgetsFromEmitter = useCallback((data, para = {}, callback) => {
    window.lastAddWidgetsTriggerByMingo = true;
    handleAddWidgets(
      data.map(item => ({ ...item, isMingo: true })),
      {
        ...para,
        isMingo: true,
      },
      cache.current.widgetProps,
      ({ newWidgets = [] } = []) => {
        if (para.isStreaming) {
          return;
        }

        batchUpdateWidgetsLayout(
          para.layoutOfAllWidgets,
          {
            ...cache.current.widgetProps,
            widgets: newWidgets,
          },
          callback,
        );
      },
    );
    setTimeout(() => {
      window.lastAddWidgetsTriggerByMingo = false;
    }, 100);
  }, []);

  const handleUpdateWidgetsAttributeFromEmitter = useCallback((data, callback) => {
    handleUpdateWidgetsAttribute(data, cache.current.widgetProps, callback);
  }, []);

  const handleDeleteWidgetsForMingoFromEmitter = useCallback((data, para = {}, callback) => {
    handleDeleteWidgetsForMingo(data, cache.current.widgetProps, ({ newWidgets = [] } = []) => {
      batchUpdateWidgetsLayout(
        para.layoutOfAllWidgets,
        {
          ...cache.current.widgetProps,
          widgets: newWidgets,
        },
        callback,
      );
    });
  }, []);

  useEffect(() => {
    updateGlobalStoreForMingo('allWidgets', allControls);
  }, [allControls]);

  const cancelSubmit = ({ redirectfn } = {}) => {
    if (_.isFunction(props.handleClose)) {
      props.handleClose();
      return;
    }

    if (redirectfn) {
      redirectfn();
    } else {
      returnMasterPage(globalInfo);
    }
  };

  const handleClose = args => {
    if (isControlsModified()) {
      setStatus({ modify: true });
      if (!isEmpty(args)) $switchArgs.current = args;
      return;
    }

    cancelSubmit(args);
    localStorage.removeItem(`worksheetConfig-${sourceId}`);
  };

  const handleSave = callback => {
    saveStyleInfo();
    saveControls({
      callback: err => {
        if (err) return;
        if (_.isFunction(callback)) {
          callback();
        }
      },
    });
  };

  cache.current.handleSave = handleSave;

  const saveForEvent = useCallback(() => {
    cache.current.handleSave();
  }, []);

  const updateWorksheetName = ({ worksheetId, worksheetName }) => {
    if (worksheetId === sourceId) {
      setWorksheetName(worksheetName);
    }
  };

  useEffect(() => {
    emitter.on('SAVE_WIDGET_CONFIG', saveForEvent);
    emitter.on('UPDATE_WORKSHEET_NAME', updateWorksheetName);
    emitter.on('WIDGET_CONFIG_CLEAR_AND_SET_WIDGETS', clearAndSetWidgetsFromEmitter);
    emitter.on('WIDGET_CONFIG_DELETE_WIDGETS', handleDeleteWidgetsForMingoFromEmitter);
    emitter.on('WIDGET_CONFIG_ADD_WIDGETS', handleAddWidgetsFromEmitter);
    emitter.on('WIDGET_CONFIG_UPDATE_WIDGETS_ATTRIBUTE', handleUpdateWidgetsAttributeFromEmitter);
    return () => {
      emitter.emit('UPDATE_GLOBAL_STORE', 'mingoCreateWorksheetAction', false);
      emitter.emit('WIDGET_CONFIG_UNMOUNT');
      updateGlobalStoreForMingo('allWidgets', []);
      emitter.off('SAVE_WIDGET_CONFIG', saveForEvent);
      emitter.off('UPDATE_WORKSHEET_NAME', updateWorksheetName);
      emitter.off('WIDGET_CONFIG_CLEAR_AND_SET_WIDGETS', clearAndSetWidgetsFromEmitter);
      emitter.off('WIDGET_CONFIG_DELETE_WIDGETS', handleDeleteWidgetsForMingoFromEmitter);
      emitter.off('WIDGET_CONFIG_ADD_WIDGETS', handleAddWidgetsFromEmitter);
      emitter.off('WIDGET_CONFIG_UPDATE_WIDGETS_ATTRIBUTE', handleUpdateWidgetsAttributeFromEmitter);
    };
  }, []);

  return (
    <Fragment>
      {getLoading ? (
        <div className="savingMask flexCenter">
          <LoadDiv className="mTop20" />
        </div>
      ) : noAuth ? (
        <div className="w100 bgPrimary Absolute" style={{ top: 0, bottom: 0 }}>
          <ErrorState
            text={_l('权限不足，无法编辑')}
            showBtn
            btnText={_l('返回')}
            callback={() => navigateTo(`/app/${globalInfo.appId}/${globalInfo.groupId}/${globalInfo.worksheetId}`)}
          />
        </div>
      ) : (
        <WidgetConfig>
          {!mingoIsCreatingWorksheetStatus && (
            <Header
              {...globalInfo}
              name={worksheetName || globalInfo?.name}
              worksheetId={sourceId}
              showSaveButton={!getLoading}
              saveLoading={saveLoading}
              onClose={handleClose}
              onBack={handleClose}
              onSave={handleSave}
            />
          )}
          <Content {...widgetProps} onRef={$contentRef} />
          {status.noTitleControl && <NoTitleControlDialog onClose={() => setStatus({ noTitleControl: false })} />}
          {status.modify && (
            <VerifyModifyDialog
              onOk={() => {
                handleSave(() => {
                  cancelSubmit($switchArgs.current);
                  localStorage.removeItem(`worksheetConfig-${sourceId}`);
                  setStatus({ modify: false });
                });
              }}
              onCancel={() => {
                setStatus({ modify: false });
              }}
              onClose={() => {
                setStatus({ modify: false });
                cancelSubmit($switchArgs.current);
                localStorage.removeItem(`worksheetConfig-${sourceId}`);
              }}
            />
          )}
          {saveLoading && <div className="savingMask"></div>}
        </WidgetConfig>
      )}
    </Fragment>
  );
}
