import React, { useEffect, useRef, useState } from 'react';
import _, { includes } from 'lodash';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import worksheetAjax from 'src/api/worksheet';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { getFilledRequestParams } from 'src/utils/platform/navigation/query';
import BatchPrintErrorModal from '../BatchPrintErrorModal';
import { normalizePrintableRows } from '../printRowUtils';
import { PRINT_TYPE, SOURCE_TYPE, SOURCE_URL_TYPE } from './enum';
import GeneratingPopup from './GeneratingPopup';
import { QrPdf } from './print';
import { getCodeContent, getCodeTexts } from './util';
import { generateLabelPdf } from './vectorLabel';

const PAGE_SIZE = 200;

export default function GeneratingPdf(props) {
  const {
    config,
    appId,
    worksheetId,
    viewId,
    templateId,
    projectId,
    controls,
    zIndex,
    selectedRows,
    count,
    allowLoadMore,
    filterControls,
    fastFilters,
    navGroupFilters,
    precheckError: initialPrecheckError,
    precheckEnabled,
    onAllPrecheckFailed,
    onClose,
  } = props;
  const [printConfig, setPrintConfig] = useState(config && { ...config });
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState();
  const rows = useRef(selectedRows);
  const shouldLoadDataOnOpen = useRef(allowLoadMore && selectedRows.length !== count);
  const [pageIndex, setPageIndex] = useState(1);
  const [embedUrl, setEmbedUrl] = useState();
  const [name, setName] = useState(props.name);
  const [precheckError, setPrecheckError] = useState(initialPrecheckError);

  async function loadData(pageIndex = 1, cb = () => {}) {
    setLoading(true);
    setEmbedUrl(undefined);
    try {
      const res = await worksheetAjax.getFilterRows(
        getFilledRequestParams({
          worksheetId,
          viewId,
          pageSize: PAGE_SIZE,
          pageIndex,
          status: 1,
          appId,
          filterControls,
          fastFilters,
          navGroupFilters,
        }),
      );
      let printableRows = normalizePrintableRows(res.data);

      if (precheckEnabled) {
        const rowIds = printableRows.map(row => row.rowid);
        const { successRows, failedRows } = await worksheetAjax.precheckPrint({
          projectId,
          worksheetId,
          printId: templateId,
          rowIds,
        });

        if (rowIds.length === 1 && failedRows.length) {
          alert(_l('当前模板已达到打印上限'), 2);
          onClose();
          return;
        }

        const successRowIdSet = new Set(successRows.map(row => row.rowId));
        const currentPrecheckError = failedRows.length
          ? {
              templateName: name || _l('未命名'),
              recordNames: failedRows.map(row => row.rowTitle),
            }
          : undefined;

        printableRows = printableRows.filter(row => successRowIdSet.has(row.rowid));
        if (!printableRows.length) {
          onClose();
          onAllPrecheckFailed(currentPrecheckError);
          return;
        }

        setPrecheckError(currentPrecheckError);
      }

      rows.current = printableRows;
      cb();
    } catch {
      onClose();
    }
  }

  async function handlePrint(config) {
    async function execute(urls) {
      const printData = rows.current.map((row, i) => ({
        value: getCodeContent({
          printType: config.printType,
          sourceType: config.sourceType,
          sourceControlId: config.sourceControlId,
          row,
          urls,
          index: i,
          controls,
        }),
        texts: getCodeTexts(
          {
            showTexts: config.showTexts,
            showControlName: config.showControlName,
            controls,
            firstIsBold: config.firstIsBold,
          },
          row,
        ),
      }));
      const usePdfKit = includes([PRINT_TYPE.QR, PRINT_TYPE.BAR], config.printType);

      if (usePdfKit) {
        const blobUrl = await generateLabelPdf({
          ...config,
          printData,
          onProgress: progressText => {
            setLoadingText(progressText);
          },
        });
        setEmbedUrl(blobUrl);
        setLoading(false);
      } else {
        const pdf = new QrPdf({
          printType: config.printType,
          layout: config.layout,
          printData,
          correctLevel: config.codeFaultTolerance || 1,
          config: config,
        });
        await pdf.render();
        setEmbedUrl(pdf.doc.output('bloburl'));
        setLoading(false);
      }
    }

    if (config.sourceType === SOURCE_TYPE.URL && config.sourceUrlType === SOURCE_URL_TYPE.PUBLIC) {
      worksheetAjax
        .getRowsShortUrl({
          appId,
          viewId,
          worksheetId,
          rowIds: rows.current.map(data => data.rowid),
        })
        .then(data => {
          if (data && _.isObject(data)) {
            execute(data);
          }
        });
    } else if (config.sourceType === SOURCE_TYPE.URL && config.sourceUrlType === SOURCE_URL_TYPE.MEMBER) {
      execute(rows.current.map(r => pathCompletion(`/app/${appId}/${worksheetId}/${viewId}/row/${r.rowid}`)));
    } else if (config.sourceType === SOURCE_TYPE.CONTROL) {
      if (config.sourceControlId) {
        execute();
      } else {
        alert(_l('请选择数据来源字段'), 3);
      }
    }
  }

  useEffect(() => {
    function print(config) {
      if (shouldLoadDataOnOpen.current) {
        loadData(1, () => handlePrint(config));
      } else {
        handlePrint(config);
      }
    }

    if (printConfig) {
      print(printConfig);
    } else {
      worksheetAjax
        .getCodePrint({
          id: templateId,
          projectId,
        })
        .then(async data => {
          setPrintConfig(data.config);
          setName(data.name);
          print(data.config);
        });
    }
  }, []);
  return (
    <>
      <GeneratingPopup
        allowLoadMore={allowLoadMore}
        pageIndex={pageIndex}
        pageSize={PAGE_SIZE}
        count={count}
        zIndex={zIndex}
        loading={loading}
        loadingText={loadingText}
        name={name}
        embedUrl={embedUrl}
        onPrev={() => {
          setPageIndex(pageIndex - 1);
          loadData(pageIndex - 1, () => handlePrint(printConfig));
        }}
        onNext={() => {
          setPageIndex(pageIndex + 1);
          loadData(pageIndex + 1, () => handlePrint(printConfig));
        }}
        onClose={onClose}
      />
      {embedUrl && precheckError && (
        <BatchPrintErrorModal
          {...precheckError}
          zIndex={(zIndex || 1000) + 1}
          onClose={() => setPrecheckError(undefined)}
        />
      )}
    </>
  );
}

export function useGeneratePdf() {
  return useFunctionWrapComponent(GeneratingPdf);
}
