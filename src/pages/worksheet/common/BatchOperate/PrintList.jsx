import React, { useState } from 'react';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Icon, LoadDiv } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';
import webCacheAjax from 'src/api/webCache';
import worksheetAjax from 'src/api/worksheet';
import { usePrintQrBarCode } from 'worksheet/common/PrintQrBarCode';
import { PRINT_TYPE as CODE_PRINT_TYPE, getPrintCardInfoOfTemplate } from 'worksheet/common/PrintQrBarCode/enum';
import { useGeneratePdf } from 'worksheet/common/PrintQrBarCode/GeneratingPdf';
import { isPrintableRecord, isPrintableRowId } from 'worksheet/common/printRowUtils';
import {
  handleSystemPrintRecord,
  handleTemplateRecordPrint,
} from 'worksheet/common/recordInfo/RecordForm/RecordPrint/recordPrintActions';
import IconText from 'worksheet/components/IconText';
import { sendCloudPrint } from 'src/components/print/sendCloudPrint';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { PRINT_TEMP, PRINT_TYPE, PRINT_TYPE_STYLE } from 'src/pages/Print/core/config';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { addBehaviorLog, getFeatureStatus } from 'src/utils/services/project';
import BatchPrintErrorModal from '../BatchPrintErrorModal';

const PRINT_MENU_STYLE = { width: 280, maxHeight: 400, overflowX: 'hidden', overflowY: 'auto' };
const PRINT_MENU_ICON_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 18,
  height: 18,
};
const PRINT_FILE_ICON_STYLE = { width: 13, minWidth: 13, height: 15 };
const PRINT_MENU_MESSAGE_STYLE = { cursor: 'default', opacity: 1 };

const codePrintList = [
  {
    name: _l('打印二维码%02056'),
    printType: CODE_PRINT_TYPE.QR,
    key: 'qrCode',
  },
  {
    name: _l('打印条形码%02057'),
    printType: CODE_PRINT_TYPE.BAR,
    key: 'barCode',
  },
];

// 批量系统打印最大条数
const MAX_SYSTEM_PRINT_COUNT = 50;
const ALL_ROWS_PRINT_TYPES = [
  PRINT_TYPE.SYS_PRINT,
  PRINT_TYPE.QR_CODE_PRINT,
  PRINT_TYPE.BAR_CODE_PRINT,
  PRINT_TYPE.CLOUD_PRINT,
];
const SELECTED_ROWS_PRINT_TYPES = [
  PRINT_TYPE.SYS_PRINT,
  PRINT_TYPE.WORD_PRINT,
  PRINT_TYPE.EXCEL_PRINT,
  PRINT_TYPE.QR_CODE_PRINT,
  PRINT_TYPE.BAR_CODE_PRINT,
  PRINT_TYPE.CLOUD_PRINT,
];
const CODE_TEMPLATE_TYPES = [PRINT_TYPE.QR_CODE_PRINT, PRINT_TYPE.BAR_CODE_PRINT];
const BATCH_PRECHECK_PRINT_TYPES = [PRINT_TYPE.SYS_PRINT, PRINT_TYPE.WORD_PRINT, PRINT_TYPE.EXCEL_PRINT];

export default function PrintList(props) {
  const {
    disabled,
    isCharge,
    showCodePrint,
    showSystemPrint,
    appId,
    projectId,
    worksheetId,
    viewId,
    controls,
    selectedRows,
    selectedRowIds,
    allowLoadMore,
    count,
    filterControls,
    fastFilters,
    navGroupFilters,
    selectedLength = 0,
    children,
  } = props;
  const uniqueSelectedRows = _.uniqBy((selectedRows || []).filter(isPrintableRecord), 'rowid');
  const idsFromSelectedRows = uniqueSelectedRows.map(row => row.rowid);
  const rowIds = _.uniq(
    (idsFromSelectedRows.length ? idsFromSelectedRows : selectedRowIds || []).filter(isPrintableRowId),
  );
  const [printListLoading, setPrintListLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loadedTemplateList, setLoadedTemplateList] = useState([]);
  const loading = !props.templateList && printListLoading;
  const templateList = props.templateList || loadedTemplateList;
  const featureType = getFeatureStatus(projectId, VersionProductType.wordPrintTemplate);
  const printCountFeatureAvailable = getFeatureStatus(projectId, VersionProductType.printCountLimit) !== '2';
  const [printLoading, setPrintLoading] = useState(false);
  const [templateId, setTemplateId] = useState('');
  const [precheckError, setPrecheckError] = useState();
  const { open: generatePdf, holder: generatePdfHolder } = useGeneratePdf();
  const { open: printQrBarCode, holder: printQrBarCodeHolder } = usePrintQrBarCode();

  function loadPrintList() {
    setPrintListLoading(true);
    worksheetAjax
      .getPrintList({
        worksheetId,
        viewId,
        rowIds,
      })
      .then(data => {
        setPrintListLoading(false);
        setLoadedTemplateList(
          allowLoadMore
            ? data
                .filter(d => ALL_ROWS_PRINT_TYPES.includes(d.type) && !d.disabled)
                .sort(
                  (a, b) =>
                    PRINT_TEMP[_.findKey(PRINT_TYPE, l => l === a.type)] -
                    PRINT_TEMP[_.findKey(PRINT_TYPE, l => l === b.type)],
                )
            : data
                .filter(d => SELECTED_ROWS_PRINT_TYPES.includes(d.type) && !d.disabled)
                .sort((a, b) => {
                  return (
                    PRINT_TEMP[_.findKey(PRINT_TYPE, l => l === a.type)] -
                    PRINT_TEMP[_.findKey(PRINT_TYPE, l => l === b.type)]
                  );
                }),
        );
      });
  }

  function handlePrintQrCode({
    id,
    name,
    printType = CODE_PRINT_TYPE.QR,
    rows = uniqueSelectedRows,
    precheckError,
    printCount = count,
  } = {}) {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }

    const disablePrint = !window.isChrome && !window.isFirefox && !window.isSafari;

    if (window.isMDClient) {
      alert(_l('客户端不支持此功能，请使用Chrome、Firefox或其他国产浏览器'), 3);
      return;
    }

    if (disablePrint) {
      alert(_l('当前浏览器不支持此功能，请使用Chrome、Firefox或其他国产浏览器'), 3);
      return;
    }

    if (id) {
      generatePdf({
        templateId: id,
        appId,
        worksheetId,
        viewId,
        projectId,
        selectedRows: rows,
        controls,
        count: printCount,
        allowLoadMore,
        filterControls,
        fastFilters,
        navGroupFilters,
        precheckError,
        precheckEnabled: printCountFeatureAvailable,
        name,
        onAllPrecheckFailed: error => {
          setMenuVisible(false);
          setPrecheckError(error);
        },
      });
    } else {
      printQrBarCode({
        isCharge,
        printType,
        appId,
        viewId,
        worksheetId,
        projectId,
        worksheetName: name,
        controls,
        selectedRows: uniqueSelectedRows,
        count,
        allowLoadMore,
        filterControls,
        fastFilters,
        navGroupFilters,
        onClose: () => {
          if (!props.templateList) {
            loadPrintList();
          }
        },
      });
    }
  }

  const getBatchPrintGroup = templateType => {
    const defaultTempList = templateList.filter(it =>
      [PRINT_TYPE.SYS_PRINT, PRINT_TYPE.WORD_PRINT, PRINT_TYPE.EXCEL_PRINT].includes(it.type),
    );
    const codeTempList = templateList.filter(it => CODE_TEMPLATE_TYPES.includes(it.type));
    const cloudTempList = templateList.filter(it => it.type === PRINT_TYPE.CLOUD_PRINT);
    const list =
      templateType === 'defaultPrint' ? defaultTempList : templateType === 'codePrint' ? codeTempList : cloudTempList;

    if (list.length === 0) return null;

    return {
      type: 'group',
      key: templateType,
      label:
        templateType === 'defaultPrint' ? _l('记录打印') : templateType === 'codePrint' ? _l('条码打印') : _l('云打印'),
      children: list.map((template, index) => {
        const disabledCloudPrint =
          printLoading && templateId === template.id && template.type === PRINT_TYPE.CLOUD_PRINT;

        return {
          key: `${templateType}-${template.id || index}`,
          disabled: disabledCloudPrint,
          icon: [PRINT_TYPE.WORD_PRINT, PRINT_TYPE.EXCEL_PRINT].includes(template.type) ? (
            <span style={PRINT_MENU_ICON_STYLE}>
              <span className={`${PRINT_TYPE_STYLE[template.type].fileIcon} fileIcon`} style={PRINT_FILE_ICON_STYLE} />
            </span>
          ) : _.includes([PRINT_TYPE.CLOUD_PRINT], template.type) ? (
            <Icon icon="cloud_printing" className="Font18" />
          ) : (
            <Icon icon={getPrintCardInfoOfTemplate(template).icon} className="Font18" />
          ),
          label: <span className="templateName ellipsis">{template.name || template.formName || _l('未命名')}</span>,
          extra: CODE_TEMPLATE_TYPES.includes(template.type) ? (
            <span className="textTertiary Font12">{getPrintCardInfoOfTemplate(template).text}</span>
          ) : undefined,
          onClick: async () => {
            let printableRowIds = rowIds;
            let currentPrecheckError;
            const hasCompleteRowSet = !allowLoadMore || rowIds.length === count;
            const shouldPrecheck =
              BATCH_PRECHECK_PRINT_TYPES.includes(template.type) ||
              (hasCompleteRowSet && CODE_TEMPLATE_TYPES.includes(template.type));

            if (_.includes([PRINT_TYPE.SYS_PRINT, PRINT_TYPE.CLOUD_PRINT], template.type)) {
              if (rowIds.length > MAX_SYSTEM_PRINT_COUNT || selectedLength > MAX_SYSTEM_PRINT_COUNT) {
                alert(_l('单次最多打印 %0 条', MAX_SYSTEM_PRINT_COUNT), 3);
                return;
              }
            }

            if (printCountFeatureAvailable && shouldPrecheck) {
              try {
                const { successRows, failedRows } = await worksheetAjax.precheckPrint({
                  projectId,
                  worksheetId,
                  printId: template.id,
                  rowIds,
                });

                if (rowIds.length === 1 && failedRows.length) {
                  alert(_l('当前模板已达到打印上限'), 2);
                  return;
                }

                printableRowIds = successRows.map(row => row.rowId);

                if (failedRows.length) {
                  currentPrecheckError = {
                    templateName: template.name || template.formName || _l('未命名'),
                    recordNames: failedRows.map(row => row.rowTitle),
                  };
                }

                if (!printableRowIds.length) {
                  setMenuVisible(false);
                  setPrecheckError(currentPrecheckError);
                  return;
                }

                if (currentPrecheckError && !CODE_TEMPLATE_TYPES.includes(template.type)) {
                  setMenuVisible(false);
                  setPrecheckError(currentPrecheckError);
                }
              } catch {
                return;
              }
            }

            if (CODE_TEMPLATE_TYPES.includes(template.type)) {
              const logType = template.type === PRINT_TYPE.QR_CODE_PRINT ? 'printQRCode' : 'printBarCode';
              addBehaviorLog(logType, worksheetId, {
                printId: template.id,
                msg: [allowLoadMore ? count : printableRowIds.length],
              }); // 埋点
              handlePrintQrCode({
                id: template.id,
                name: template.name || template.formName || _l('未命名'),
                printType: template.type === PRINT_TYPE.QR_CODE_PRINT ? CODE_PRINT_TYPE.QR : CODE_PRINT_TYPE.BAR,
                rows: uniqueSelectedRows.filter(row => printableRowIds.includes(row.rowid)),
                precheckError: currentPrecheckError,
                printCount: hasCompleteRowSet ? printableRowIds.length : count,
              });
            } else if (template.type === PRINT_TYPE.SYS_PRINT) {
              handleTemplateRecordPrint({
                template,
                worksheetId,
                viewId,
                appId,
                projectId,
                rowIds: _.uniq(printableRowIds),
                openGeneratePdf: generatePdf,
              });
            } else if (template.type === PRINT_TYPE.CLOUD_PRINT) {
              if (disabledCloudPrint) {
                return;
              }

              setMenuVisible(false);
              setPrintLoading(true);
              setTemplateId(template.id);
              sendCloudPrint({
                id: template.id,
                projectId,
                appId,
                worksheetId,
                rowIds: printableRowIds,
                finishCallback: () => {
                  setPrintLoading(false);
                  setTemplateId('');
                },
              });
            } else {
              if (featureType === '2') {
                buriedUpgradeVersionDialog(projectId, VersionProductType.wordPrintTemplate);
                return;
              }

              let printId = template.id;
              const uniquePrintableRowIds = _.uniq(printableRowIds);
              let printData = {
                printId,
                isDefault: false, // word模板
                worksheetId,
                projectId,
                rowId: uniquePrintableRowIds.join(','),
                rowIds: uniquePrintableRowIds,
                getType: 1,
                viewId,
                appId,
                name: template.name,
                isBatch: true,
                fileTypeNum: template.type,
                allowDownloadPermission: template.allowDownloadPermission,
                allowEditAfterPrint: template.allowEditAfterPrint,
              };
              let printKey = uuidv4();

              try {
                await webCacheAjax.add({
                  key: `${printKey}`,
                  value: JSON.stringify(printData),
                  moduleType: 1,
                });
              } catch {
                return;
              }

              window.open(pathCompletion(`/printForm/${appId}/worksheet/preview/print/${printKey}`));
              setMenuVisible(false);
            }
          },
        };
      }),
    };
  };

  const templateMenuItems =
    !loading && !!featureType
      ? ['defaultPrint', 'codePrint', 'cloudPrint'].map(getBatchPrintGroup).filter(Boolean)
      : [];
  const systemPrintItems = [
    ...(showSystemPrint
      ? [
          {
            key: 'systemPrint',
            label: _l('系统打印'),
            onClick: () => {
              if (rowIds.length > MAX_SYSTEM_PRINT_COUNT || selectedLength > MAX_SYSTEM_PRINT_COUNT) {
                alert(_l('单次最多打印 %0 条', MAX_SYSTEM_PRINT_COUNT), 3);
                return;
              }

              handleSystemPrintRecord({
                worksheetId,
                viewId,
                appId,
                projectId,
                rowIds: _.uniq(rowIds),
              });
            },
          },
        ]
      : []),
    ...(!showCodePrint
      ? []
      : codePrintList.map(item => ({
          key: item.key,
          label: item.name,
          onClick: () => handlePrintQrCode({ printType: item.printType }),
        }))),
  ];
  const showSystemPrintGroup = !!showCodePrint && !!templateList.length;
  const menuItems = [
    ...(loading
      ? [
          {
            key: 'loading',
            disabled: true,
            style: PRINT_MENU_MESSAGE_STYLE,
            label: <LoadDiv size="small" />,
          },
        ]
      : []),
    ...(!loading && !!featureType && templateList.length === 0 && !showCodePrint
      ? [
          {
            key: 'empty',
            disabled: true,
            style: PRINT_MENU_MESSAGE_STYLE,
            label: <span className="textDisabled Font13">{_l('暂无可用模版')}</span>,
          },
        ]
      : []),
    ...templateMenuItems,
    ...(showSystemPrintGroup
      ? [
          { type: 'divider', key: 'systemPrintDivider' },
          {
            type: 'group',
            key: 'systemDefaultPrint',
            label: _l('系统默认打印'),
            children: systemPrintItems,
          },
        ]
      : systemPrintItems),
  ];

  const handleMenuOpenChange = open => {
    setMenuVisible(open);
    if (open && !props.templateList) {
      loadPrintList();
    }
  };

  return (
    <div>
      {generatePdfHolder}
      {printQrBarCodeHolder}
      <Dropdown
        disabled={disabled}
        open={menuVisible}
        onOpenChange={handleMenuOpenChange}
        trigger={['click']}
        placement="bottomLeft"
        menu={{
          items: menuItems,
          selectable: false,
          style: PRINT_MENU_STYLE,
        }}
      >
        {children || (
          <div>
            <IconText
              dataEvent="print"
              icon="print"
              textCmp={() => (
                <>
                  {_l('打印')}
                  <Icon icon="arrow-down-border" className="printDownIcon" />
                </>
              )}
            />
          </div>
        )}
      </Dropdown>
      {precheckError && (
        <BatchPrintErrorModal
          {...precheckError}
          onClose={() => {
            setPrecheckError(undefined);
          }}
        />
      )}
    </div>
  );
}
