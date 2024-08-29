import React, { Fragment, useState, useRef, useEffect } from 'react';
import { useSetState, useTitle } from 'react-use';
import worksheetAjax from 'src/api/worksheet';
import externalPortalAjax from 'src/api/externalPortal';
import projectEncryptAjax from 'src/api/projectEncrypt';
import update from 'immutability-helper';
import styled from 'styled-components';
import { Dialog } from 'ming-ui';
import { flatten, isFunction, pick, head, isEmpty, get, find, isEqual, findIndex } from 'lodash';
import { useSheetInfo } from './hooks';
import Header from './Header';
import Content from './content';
import { getCurrentRowSize, getPathById } from './util/widgets';
import {
  formatControlsData,
  checkCustomEventError,
  getMsgByCode,
  scrollToVisibleRange,
  getChildWidgetsBySection,
} from './util/data';
import {
  getUrlPara,
  genWidgetsByControls,
  genControlsByWidgets,
  returnMasterPage,
  formatSearchConfigs,
  getBoundRowByTab,
  fixedBottomWidgets,
} from './util';
import { resetDisplay } from './util/drag';
import NoTitleControlDialog from './widgetSetting/components/NoTitleControlDialog';
import VerifyModifyDialog from './widgetSetting/components/VerifyModifyDialog';
import { verifyModifyDialog } from './widgetSetting/components/VerifyModifyDialog';
import './index.less';
import { WHOLE_SIZE } from './config/Drag';
import ErrorState from 'src/components/errorPage/errorState';
import { navigateTo } from 'src/router/navigateTo';

const WidgetConfig = styled.div`
  height: 100%;
  .savingMask {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.5);
    z-index: 9;
  }
`;

export default function Container(props) {
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
  // 外部门户开启状态
  const [enableState, setEnableState] = useState(false);
  // 加密数据源
  const [encryData, setEncryData] = useState([]);
  // 表单样式
  const [styleInfo, setStyle] = useState({
    activeStatus: true,
    info: {},
  });

  const setStyleInfo = obj => setStyle(Object.assign({}, styleInfo, obj));

  const $switchArgs = useRef(null);
  const $contentRef = useRef(null);

  const [status, setStatus] = useSetState({ saved: false, saveIndex: 0, modify: false, noTitleControl: false });

  const sourceId = props.worksheetId || _.get(getUrlPara(), 'sourceId');
  const [{ getLoading, saveLoading }, setLoading] = useSetState({ getLoading: false, saveLoading: false });

  let $originControls = useRef([]);
  let $originStyle = useRef({});

  const {
    data: { info: globalInfo, noAuth },
  } = useSheetInfo({ worksheetId: sourceId, getSwitchPermit: true });

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
    const flattenControls = flatten(widgets);
    $originControls.current = flattenControls;
    setWidgets(widgets);
    setInfo({ version });

    // 如果是从关联记录点过来 url参数会带有targetControl参数 自动选中
    let paras = new URLSearchParams(location.href);
    const targetControlId = paras.get('targetControl');
    if (targetControlId) {
      const activeControl = flattenControls.find(item => item.controlId === targetControlId) || {};
      setActiveWidget(activeControl);
      setStyleInfo({ activeStatus: false });
      // 滚动到激活控件
      setTimeout(() => {
        const $ele = document.getElementById(`widget-${targetControlId}`);
        if ($ele) {
          $ele.scrollIntoView();
        }
      }, 0);
      return;
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
    setStyleInfo({ info: _.get(globalInfo, 'advancedSetting') || {} });
    $originStyle.current = _.get(globalInfo, 'advancedSetting') || {};
    getQueryConfigs(globalInfo && globalInfo.isWorksheetQuery);
    if (globalInfo && globalInfo.appId) {
      externalPortalAjax.getPortalEnableState({ appId: globalInfo.appId }).then(res => {
        setEnableState(res.isEnable);
      });
    }
    if (globalInfo && globalInfo.projectId) {
      // 加密规则
      projectEncryptAjax.getProjectEncryptRules({ projectId: globalInfo.projectId }).then(res => {
        setEncryData(res.encryptRules);
      });
    }
  }, [globalInfo]);

  useEffect(() => {
    // 子表配置,防止激活子表掉接口冲掉临时变更
    window.subListSheetConfig = {};
    // 自定义事件集成api数据缓存
    window.IntegratedApi = {};
    setLoading({ getLoading: true });
    worksheetAjax
      .getWorksheetControls({
        worksheetId: sourceId,
        getRelationSearch: true,
      })
      .then(({ code, data }) => {
        if (code === 1) {
          const { version, controls } = data;

          let widgets = genWidgetsByControls(controls);

          const savedWidgets = safeParse(localStorage.getItem(`worksheetConfig-${sourceId}`));
          if (savedWidgets) {
            // 未被保存过的更改 可以恢复
            if (savedWidgets.version === version) {
              Dialog.confirm({
                title: _l('发现有未保存的更改，是否需要恢复 ？'),
                okText: _l('恢复'),
                cancelText: _l('取消'),
                cancelType: 'ghost',
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
  }, []);

  const saveControls = ({ actualWidgets } = {}) => {
    const saveControls = genControlsByWidgets(actualWidgets || widgets);
    if (!saveControls.some(item => item.attribute === 1)) {
      setStatus({ noTitleControl: true });
      return;
    }

    if (checkCustomEventError(saveControls)) return;

    let activeWidgetPath = getPathById(widgets, (activeWidget || {}).controlId);

    // 清除不走缓存
    window.clearLocalDataTime({
      requestData: { worksheetId: sourceId },
      clearSpecificKey: 'Worksheet_GetQueryBySheetId',
    });

    if (activeWidget && activeWidget.type === 34) {
      // 清除不走缓存
      window.clearLocalDataTime({
        requestData: { worksheetId: activeWidget.dataSource },
        clearSpecificKey: 'Worksheet_GetWorksheetInfo',
      });
    }

    setLoading({ saveLoading: true });
    worksheetAjax
      .saveWorksheetControls({
        version,
        sourceId,
        controls: formatControlsData(saveControls),
      })
      .then(({ data, code }) => {
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
        const nextActiveWidget = !isEmpty(activeWidgetPath)
          ? get(nextWidgets, activeWidgetPath)
          : head(flattenControls);

        setActiveWidget(nextActiveWidget);
        setBatchActive([]);

        //有配置查询，保存后拉取配置
        const needGetQuery = queryConfigs.length > 0;
        getQueryConfigs(needGetQuery);
      })
      .finally(() => {
        setLoading({ saveLoading: false });
      });
  };

  const saveStyleInfo = () => {
    if (!isEqual($originStyle.current, styleInfo.info)) {
      worksheetAjax
        .editWorksheetSetting({
          worksheetId: globalInfo.worksheetId,
          appId: globalInfo.appId,
          advancedSetting: styleInfo.info,
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
    const currentControls = flatten(widgets);
    const prevControls = $originControls.current;
    if (currentControls.length !== prevControls.length) return true;
    return currentControls.some(item => {
      const prevItem = find(prevControls, ({ controlId }) => item.controlId === controlId);
      return !isEqual(
        _.omit(prevItem, ['half', 'relationControls', 'sourceEntityName', 'deleteAccount', 'needUpdate']),
        _.omit(item, ['half', 'relationControls', 'sourceEntityName', 'deleteAccount', 'needUpdate']),
      );
    });
  };

  const updateQueryConfigs = (value = {}) => {
    const index = findIndex(queryConfigs, item => item.id === value.id);
    const newQueryConfigs =
      index > -1
        ? queryConfigs.map(item => {
            return item.id === value.id ? value : item;
          })
        : queryConfigs.concat([value]);
    setQueryConfigs(newQueryConfigs);
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

  const widgetProps = {
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
    encryData,
    updateQueryConfigs,
    allControls: genControlsByWidgets(widgets),
    enableState,
    styleInfo,
    setStyleInfo,
    relateToNewPage,
    batchActive,
    setBatchActive,
    batchDrag,
    setBatchDrag,
    // 全局表信息
    globalSheetInfo: pick(globalInfo, ['appId', 'projectId', 'worksheetId', 'name', 'groupId', 'roleType', 'appName']),
  };

  const cancelSubmit = ({ redirectfn, desp } = {}) => {
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

  const handleSave = () => {
    if (!activeWidget) {
      saveStyleInfo();
      saveControls();
      return;
    }
    saveStyleInfo();
    saveControls();
  };

  return (
    <Fragment>
      {noAuth ? (
        <div className="w100 WhiteBG Absolute" style={{ top: 0, bottom: 0 }}>
          <ErrorState
            text={_l('权限不足，无法编辑')}
            showBtn
            btnText={_l('返回')}
            callback={() => navigateTo(`/app/${globalInfo.appId}/${globalInfo.groupId}/${globalInfo.worksheetId}`)}
          />
        </div>
      ) : (
        <WidgetConfig>
          <Header
            {...widgetProps}
            {...globalInfo}
            worksheetId={sourceId}
            showSaveButton={!getLoading}
            saveLoading={saveLoading}
            onClose={handleClose}
            onBack={handleClose}
            onSave={handleSave}
          />
          <Content {...widgetProps} onRef={$contentRef} />
          {status.noTitleControl && <NoTitleControlDialog onClose={() => setStatus({ noTitleControl: false })} />}
          {status.modify && (
            <VerifyModifyDialog
              onOk={() => {
                handleSave();
                cancelSubmit($switchArgs.current);
                localStorage.removeItem(`worksheetConfig-${sourceId}`);
                setStatus({ modify: false });
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
