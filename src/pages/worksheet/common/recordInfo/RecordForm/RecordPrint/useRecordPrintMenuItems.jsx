import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import worksheetAjax from 'src/api/worksheet';
import { getPrintCardInfoOfTemplate } from 'worksheet/common/PrintQrBarCode/enum';
import { useGeneratePdf } from 'worksheet/common/PrintQrBarCode/GeneratingPdf';
import { PRINT_TEMP, PRINT_TYPE, PRINT_TYPE_STYLE } from 'src/pages/Print/core/config';
import { getDownLoadUrl } from 'src/pages/Print/core/util';
import { permitList } from 'src/utils/domain/control/formEnum';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { hasPrintLimitTemplate } from 'src/utils/domain/worksheet/print';
import { emitter } from 'src/utils/platform/browser/dom';
import { addBehaviorLog, getFeatureStatus } from 'src/utils/services/project';
import { handleSystemPrintRecord, handleTemplateRecordPrint, precheckTemplatePrint } from './recordPrintActions';
import './RecordPrint.less';

const ManagePrintCountModal = lazy(() => import('./ManagePrintCountModal'));
const EMPTY_LIST = [];
const EMPTY_OBJECT = {};
const PRINT_COUNT_PLACEHOLDER = '__PRINT_COUNT__';
const DEFAULT_TEMPLATE_TYPES = [PRINT_TYPE.SYS_PRINT, PRINT_TYPE.WORD_PRINT, PRINT_TYPE.EXCEL_PRINT];
const CUSTOM_TEMPLATE_TYPES = [PRINT_TYPE.WORD_PRINT, PRINT_TYPE.EXCEL_PRINT];
const CODE_TEMPLATE_TYPES = [PRINT_TYPE.QR_CODE_PRINT, PRINT_TYPE.BAR_CODE_PRINT];
export const PRINT_MENU_STYLE = {
  width: 320,
  maxHeight: 400,
  overflowX: 'hidden',
  overflowY: 'auto',
};
const RECORD_PRINT_COUNT_SUMMARY_ITEM_STYLE = {
  height: 36,
  margin: '0 4px 2px',
  padding: 0,
  borderRadius: 3,
  background: 'var(--color-warning-bg)',
  cursor: 'default',
  opacity: 1,
};
const MANAGE_PRINT_COUNT_ITEM_STYLE = {
  marginTop: 6,
  borderRadius: 0,
  color: 'var(--color-primary)',
  fontSize: 13,
};
const MANAGE_PRINT_COUNT_ICON_STYLE = {
  marginInlineEnd: 12,
  color: 'var(--color-primary)',
};

const PrintTemplateLabel = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;

  .templateName {
    max-width: 142px;
  }

  .detail {
    position: absolute;
    top: 50%;
    right: 4px;
    transform: translateY(-50%);
    color: var(--color-text-tertiary);
    font-size: 12px;

    &.hoverDetail {
      display: none;
    }
  }

  .downloadIcon {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &::before {
      transform: translateY(2px);
    }
  }

  .printCountDetail.printLimitReached {
    color: var(--color-text-disabled);
  }

  &:hover {
    .printCountDetail.hasHoverDetail {
      display: none;
    }

    .hoverDetail {
      display: block;
    }
  }
`;

const PrintMenuIcon = styled.span`
  display: inline-flex;
  flex: 0 0 18px;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;

  .fileIcon {
    width: 13px !important;
    min-width: 13px;
    height: 15px !important;
  }
`;

const PrintCountSummary = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 36px;
  color: var(--color-text-secondary);
  font-size: 13px;
`;

const PrintMenuStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  color: var(--color-text-tertiary);

  .icon-loading_button {
    margin-right: 6px;
    animation: rotate 0.6s infinite linear;
  }
`;

const getSortedPrintList = ({ list, viewId }) =>
  (!viewId ? list.filter(item => item.range === 1) : list)
    .filter(item => !item.disabled)
    .sort(
      (a, b) =>
        PRINT_TEMP[_.findKey(PRINT_TYPE, type => type === a.type)] -
        PRINT_TEMP[_.findKey(PRINT_TYPE, type => type === b.type)],
    );

export default function useRecordPrintMenuItems({
  enabled,
  mode = 'menu',
  isCharge,
  viewId,
  recordId,
  appId,
  worksheetId,
  workId,
  instanceId,
  controls = EMPTY_LIST,
  projectId,
  sheetSwitchPermit = EMPTY_LIST,
  printCountEnabled,
  showDownload = true,
}) {
  const contextKey = [appId, projectId, worksheetId, viewId, recordId].join('-');
  const templateRequest = useRef({ contextKey: '', list: EMPTY_LIST, loaded: false, promise: null });
  const printCountRequest = useRef({ contextKey: '', loaded: false, promise: null });
  const [templateState, setTemplateState] = useState({ contextKey: '', list: [], loading: false, loaded: false });
  const [printCountState, setPrintCountState] = useState({ contextKey: '', value: {} });
  const [printStatus, setPrintStatus] = useState({ contextKey: '', templateId: '', printLoading: false });
  const [managePrintCountContext, setManagePrintCountContext] = useState();
  const { open: openGeneratePdf, holder: generatePdfHolder } = useGeneratePdf();
  const printCountFeatureAvailable = getFeatureStatus(projectId, VersionProductType.printCountLimit) !== '2';
  const tempList = templateState.contextKey === contextKey ? templateState.list : EMPTY_LIST;
  const templateLoading = templateState.contextKey === contextKey && templateState.loading;
  const templateLoaded = templateState.contextKey === contextKey && templateState.loaded;
  const printCountInfo =
    printCountFeatureAvailable && printCountState.contextKey === contextKey ? printCountState.value : EMPTY_OBJECT;
  const currentPrintStatus = printStatus.contextKey === contextKey ? printStatus : EMPTY_OBJECT;

  const loadPrintList = useCallback(
    ({ force = false } = {}) => {
      if (mode === 'system' || !worksheetId) {
        return Promise.resolve(EMPTY_LIST);
      }

      const currentRequest = templateRequest.current;

      if (!force && currentRequest.contextKey === contextKey && currentRequest.loaded) {
        return Promise.resolve(currentRequest.list);
      }

      if (!force && currentRequest.contextKey === contextKey && currentRequest.promise) {
        return currentRequest.promise;
      }

      setTemplateState({ contextKey, list: [], loading: true, loaded: false });

      let request;
      request = worksheetAjax
        .getPrintList({ worksheetId, viewId, rowIds: [recordId].filter(Boolean) })
        .then(list => {
          const sortedList = getSortedPrintList({ list, viewId });

          if (templateRequest.current.promise !== request) {
            return undefined;
          }

          templateRequest.current = { contextKey, list: sortedList, loaded: true, promise: null };
          setTemplateState({ contextKey, list: sortedList, loading: false, loaded: true });
          return sortedList;
        })
        .catch(() => {
          if (templateRequest.current.promise !== request) {
            return undefined;
          }

          templateRequest.current = { contextKey, list: EMPTY_LIST, loaded: false, promise: null };
          setTemplateState({ contextKey, list: [], loading: false, loaded: true });
          return undefined;
        });

      templateRequest.current = { contextKey, list: EMPTY_LIST, loaded: false, promise: request };
      return request;
    },
    [contextKey, mode, recordId, viewId, worksheetId],
  );

  const loadPrintCount = useCallback(
    ({ force = false, templates } = {}) => {
      const currentProjectId = projectId || localStorage.getItem('currentProjectId');
      const currentTemplates =
        templates || (templateRequest.current.contextKey === contextKey ? templateRequest.current.list : EMPTY_LIST);
      const printCountSupported =
        currentProjectId && getFeatureStatus(currentProjectId, VersionProductType.printCountLimit) !== '2';
      const printCountRequired = printCountEnabled || hasPrintLimitTemplate(currentTemplates);

      if (mode === 'system' || !worksheetId || !printCountSupported || !printCountRequired) {
        printCountRequest.current = { contextKey: '', loaded: false, promise: null };
        setPrintCountState(current => (current.contextKey === contextKey ? { contextKey: '', value: {} } : current));
        return Promise.resolve();
      }

      const currentRequest = printCountRequest.current;

      if (!force && currentRequest.contextKey === contextKey && currentRequest.promise) {
        return currentRequest.promise;
      }

      if (!force && currentRequest.contextKey === contextKey && currentRequest.loaded) {
        return Promise.resolve();
      }

      let request;
      request = worksheetAjax
        .getRowPrintCount({ projectId: currentProjectId, worksheetId, rowIds: [recordId].filter(Boolean) })
        .then(([value = {}]) => {
          if (printCountRequest.current.promise !== request) {
            return;
          }

          printCountRequest.current = { contextKey, loaded: true, promise: null };
          setPrintCountState({ contextKey, value });
        })
        .catch(() => {
          if (printCountRequest.current.promise !== request) {
            return;
          }

          printCountRequest.current = { contextKey, loaded: false, promise: null };
          setPrintCountState({ contextKey, value: {} });
        });

      printCountRequest.current = { contextKey, loaded: false, promise: request };
      return request;
    },
    [contextKey, mode, printCountEnabled, projectId, recordId, worksheetId],
  );

  const reload = useCallback(() => {
    if (mode === 'system' || !worksheetId) {
      return Promise.resolve();
    }

    if (templateRequest.current.contextKey !== contextKey || !templateRequest.current.loaded) {
      return Promise.resolve();
    }

    const shouldReloadPrintCount =
      printCountRequest.current.contextKey === contextKey && printCountRequest.current.loaded;
    return loadPrintList({ force: true }).then(templates =>
      templates && shouldReloadPrintCount ? loadPrintCount({ force: true, templates }) : undefined,
    );
  }, [contextKey, loadPrintCount, loadPrintList, mode, worksheetId]);

  useEffect(() => {
    if (!enabled || mode === 'system') {
      return undefined;
    }

    if (mode === 'menu' || mode === 'toolbar') {
      loadPrintList();
    }

    emitter.on('RELOAD_RECORD_INFO_PRINT_LIST', reload);

    return () => {
      emitter.off('RELOAD_RECORD_INFO_PRINT_LIST', reload);
    };
  }, [enabled, loadPrintList, mode, reload]);

  const updatePrintStatus = useCallback(
    status => {
      setPrintStatus(current => ({
        ...(current.contextKey === contextKey ? current : {}),
        ...status,
        contextKey,
      }));
    },
    [contextKey],
  );

  const handleSystemPrint = useCallback(() => {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }

    handleSystemPrintRecord({
      worksheetId,
      viewId,
      recordId,
      appId,
      projectId,
      workId,
      instanceId,
      rowIds: [recordId],
    });
  }, [appId, instanceId, projectId, recordId, viewId, workId, worksheetId]);

  const handleDownload = useCallback(
    async (template, event) => {
      const { type: templateType, id } = template;

      if (templateType === PRINT_TYPE.SYS_PRINT) {
        return;
      }

      event.stopPropagation();

      if (!(await precheckTemplatePrint({ projectId, worksheetId, printId: id, rowIds: [recordId] }))) {
        return;
      }

      addBehaviorLog('printWord', worksheetId, { printId: id, rowId: recordId });
      getDownLoadUrl(
        md.global.Config.WorksheetDownUrl,
        {
          worksheetId,
          rowId: recordId,
          printId: id,
          projectId,
          appId,
          viewId,
          fileTypeNum: templateType,
          download: 1,
        },
        link => {
          if (link !== 'error') {
            window.open(link);
          }
        },
      );
    },
    [appId, projectId, recordId, viewId, worksheetId],
  );

  const handleTemplatePrint = useCallback(
    async (template, disabledCloudPrint) => {
      if (window.isPublicApp) {
        alert(_l('预览模式下，不能操作'), 3);
        return;
      }

      if (
        template.type !== PRINT_TYPE.CLOUD_PRINT &&
        !(await precheckTemplatePrint({ projectId, worksheetId, printId: template.id, rowIds: [recordId] }))
      ) {
        return;
      }

      handleTemplateRecordPrint({
        worksheetId,
        viewId,
        recordId,
        appId,
        projectId,
        template,
        attriData: controls.filter(control => control.attribute === 1),
        workId,
        instanceId,
        openGeneratePdf,
        disabledCloudPrint,
        updatePrintStatus,
      });
    },
    [appId, controls, instanceId, openGeneratePdf, projectId, recordId, updatePrintStatus, viewId, workId, worksheetId],
  );

  const printCountTemplates = useMemo(
    () =>
      printCountFeatureAvailable
        ? tempList
            .map(template => {
              const printCount = _.find(printCountInfo.templates, { printId: template.id });
              return printCount?.printLimitEnabled && { ...template, ...printCount };
            })
            .filter(Boolean)
        : [],
    [printCountFeatureAvailable, printCountInfo.templates, tempList],
  );

  const printTemplateMenuItems = useMemo(() => {
    const defaultTempList = tempList.filter(template => DEFAULT_TEMPLATE_TYPES.includes(template.type));
    const codeTempList = tempList.filter(template => CODE_TEMPLATE_TYPES.includes(template.type));
    const cloudTempList = tempList.filter(template => template.type === PRINT_TYPE.CLOUD_PRINT);
    const groups = [
      { key: 'defaultPrint', title: _l('记录打印'), list: defaultTempList },
      { key: 'codePrint', title: _l('条码打印'), list: codeTempList },
      { key: 'cloudPrint', title: _l('云打印'), list: cloudTempList },
    ];
    const templateGroups = groups
      .filter(group => group.list.length)
      .map(group => ({
        type: 'group',
        key: group.key,
        label: group.title,
        children: group.list.map((template, index) => {
          const isCustom = CUSTOM_TEMPLATE_TYPES.includes(template.type);
          const isDownloadable = DEFAULT_TEMPLATE_TYPES.includes(template.type);
          const showSizeDetail = CODE_TEMPLATE_TYPES.includes(template.type);
          const templatePrintCount = _.find(printCountInfo.templates, { printId: template.id });
          const isPrintLimitEnabled = printCountFeatureAvailable && !!templatePrintCount?.printLimitEnabled;
          const isPrintLimitReached = isPrintLimitEnabled && !templatePrintCount.leftPrintCount;
          const showDownloadDetail =
            isDownloadable && !isPrintLimitReached && (isCharge || !template.allowDownloadPermission) && showDownload;
          const hasHoverDetail = showSizeDetail || showDownloadDetail;
          const disabledCloudPrint =
            currentPrintStatus.printLoading &&
            currentPrintStatus.templateId === template.id &&
            template.type === PRINT_TYPE.CLOUD_PRINT;

          return {
            key: `${group.key}-${index}`,
            disabled: isPrintLimitReached || disabledCloudPrint,
            icon: (
              <PrintMenuIcon>
                {isCustom ? (
                  <span className={`${PRINT_TYPE_STYLE[template.type].fileIcon} fileIcon`} />
                ) : template.type === PRINT_TYPE.CLOUD_PRINT ? (
                  <Icon icon="cloud_printing" className="Font18" />
                ) : (
                  <Icon icon={getPrintCardInfoOfTemplate(template).icon} className="Font18" />
                )}
              </PrintMenuIcon>
            ),
            label: (
              <PrintTemplateLabel>
                <div title={template.name} className="ellipsis templateName">
                  {template.name}
                </div>
                {isPrintLimitEnabled && (
                  <span
                    className={cx('detail printCountDetail', {
                      hasHoverDetail,
                      printLimitReached: isPrintLimitReached,
                    })}
                  >
                    {isPrintLimitReached
                      ? _l('次数受限')
                      : `${templatePrintCount.printCount}/${templatePrintCount.printLimitCount}`}
                  </span>
                )}
                {showSizeDetail ? (
                  <span className="detail hoverDetail">{getPrintCardInfoOfTemplate(template).text}</span>
                ) : showDownloadDetail ? (
                  <span className="detail hoverDetail" onClick={event => handleDownload(template, event)}>
                    <Tooltip title={_l('导出')} placement="bottom">
                      <Icon icon="download" className="Font16 downloadIcon Block" />
                    </Tooltip>
                  </span>
                ) : null}
              </PrintTemplateLabel>
            ),
            onClick: () => handleTemplatePrint(template, disabledCloudPrint),
          };
        }),
      }));
    const separatedTemplateGroups = templateGroups.flatMap((group, index) => [
      ...(index ? [{ type: 'divider', key: `${group.key}Divider` }] : []),
      group,
    ]);
    const totalPrintCount = Number(printCountInfo.totalPrintCount) || 0;
    const [printCountPrefix = '', printCountSuffix = ''] = _l('已打印 %0 次', PRINT_COUNT_PLACEHOLDER).split(
      PRINT_COUNT_PLACEHOLDER,
    );

    return [
      ...(printCountFeatureAvailable && printCountEnabled && totalPrintCount > 0
        ? [
            {
              key: 'recordPrintCountSummary',
              className: 'recordPrintCountSummaryItem',
              style: RECORD_PRINT_COUNT_SUMMARY_ITEM_STYLE,
              disabled: true,
              label: (
                <PrintCountSummary>
                  {printCountPrefix}
                  <span className="Bold mLeft4 mRight4">{totalPrintCount}</span>
                  {printCountSuffix}
                </PrintCountSummary>
              ),
            },
          ]
        : []),
      ...separatedTemplateGroups,
      ...(isCharge && printCountTemplates.length
        ? [
            {
              type: 'divider',
              key: 'managePrintCountDivider',
            },
            {
              key: 'managePrintCount',
              className: 'managePrintCount',
              style: MANAGE_PRINT_COUNT_ITEM_STYLE,
              icon: <Icon icon="settings" className="Font18" style={MANAGE_PRINT_COUNT_ICON_STYLE} />,
              label: _l('管理打印次数'),
              onClick: () => setManagePrintCountContext(contextKey),
            },
          ]
        : []),
    ];
  }, [
    contextKey,
    currentPrintStatus.printLoading,
    currentPrintStatus.templateId,
    handleDownload,
    handleTemplatePrint,
    isCharge,
    printCountEnabled,
    printCountFeatureAvailable,
    printCountInfo.templates,
    printCountInfo.totalPrintCount,
    printCountTemplates.length,
    showDownload,
    tempList,
  ]);

  const items = useMemo(() => {
    if (!enabled) {
      return [];
    }

    const templateStatusItems = [
      {
        key: templateLoading ? 'printTemplatesLoading' : 'printTemplatesEmpty',
        disabled: true,
        label: (
          <PrintMenuStatus>
            {templateLoading || !templateLoaded ? (
              <React.Fragment>
                <Icon icon="loading_button" />
                {_l('加载中...')}
              </React.Fragment>
            ) : (
              _l('暂无可用的打印模板')
            )}
          </PrintMenuStatus>
        ),
      },
    ];
    const systemPrintItem =
      mode !== 'toolbar' && isOpenPermit(permitList.recordPrintSwitch, sheetSwitchPermit, viewId)
        ? {
            key: 'systemPrint',
            icon: <Icon icon="print" className="Font17" />,
            label: _l('系统打印'),
            onClick: handleSystemPrint,
          }
        : null;

    if (mode === 'system') {
      return [systemPrintItem].filter(Boolean);
    }

    if (mode === 'toolbar') {
      return tempList.length ? printTemplateMenuItems : templateStatusItems;
    }

    if (!templateLoaded || templateLoading) {
      return [
        {
          key: 'printTemplates',
          icon: <Icon icon="archive" className="Font17" />,
          label: _l('打印/导出'),
          popupClassName: 'recordPrintSubMenu',
          children: templateStatusItems,
        },
        systemPrintItem,
      ].filter(Boolean);
    }

    if (!tempList.length) {
      return [systemPrintItem].filter(Boolean);
    }

    return [
      {
        key: 'printTemplates',
        icon: <Icon icon="archive" className="Font17" />,
        label: _l('打印/导出'),
        popupClassName: 'recordPrintSubMenu',
        children: printTemplateMenuItems,
      },
      systemPrintItem,
    ].filter(Boolean);
  }, [
    enabled,
    handleSystemPrint,
    mode,
    printTemplateMenuItems,
    sheetSwitchPermit,
    templateLoaded,
    templateLoading,
    tempList.length,
    viewId,
  ]);

  const holder = (
    <React.Fragment>
      {generatePdfHolder}
      {managePrintCountContext === contextKey && !!printCountTemplates.length && (
        <Suspense fallback={null}>
          <ManagePrintCountModal
            templates={printCountTemplates}
            projectId={projectId}
            worksheetId={worksheetId}
            rowId={recordId}
            onReset={() => loadPrintCount({ force: true })}
            onCancel={() => setManagePrintCountContext(undefined)}
          />
        </Suspense>
      )}
    </React.Fragment>
  );

  return {
    items,
    holder,
    loadPrintList,
    loadPrintCount,
    reload,
    hasPrintTemplates: templateLoaded && !!tempList.length,
  };
}
