import React, { useEffect, useState } from 'react';
import worksheetAjax from 'src/api/worksheet';
import GeneratingPopup from './GeneratingPopup';
import { getCodeTexts, getCodeContent } from './util';
import { SOURCE_TYPE, SOURCE_URL_TYPE } from './enum';
import { QrPdf } from './print';
import _ from 'lodash';

export default function GeneratingPdf(props) {
  const { config, appId, worksheetId, viewId, templateId, projectId, selectedRows, controls, zIndex, onClose } = props;
  const [loading, setLoading] = useState(true);
  const [embedUrl, setEmbedUrl] = useState();
  const [name, setName] = useState(props.name);
  useEffect(() => {
    function print(config) {
      async function handlePrint() {
        async function execute(urls) {
          const printData = selectedRows.map((row, i) => ({
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

          const pdf = new QrPdf({
            printType: config.printType,
            layout: config.layout,
            printData,
            correctLevel: config.codeFaultTolerance || 1,
            config,
          });
          await pdf.render();
          setEmbedUrl(pdf.doc.output('bloburl'));
          setLoading(false);
        }
        if (config.sourceType === SOURCE_TYPE.URL && config.sourceUrlType === SOURCE_URL_TYPE.PUBLIC) {
          worksheetAjax.getRowsShortUrl({
            appId,
            viewId,
            worksheetId,
            rowIds: selectedRows.map(data => data.rowid),
          }).then(data => {
            if (data && _.isObject(data)) {
              execute(data);
            }
          });
        } else if (config.sourceType === SOURCE_TYPE.URL && config.sourceUrlType === SOURCE_URL_TYPE.MEMBER) {
          execute(selectedRows.map(r => `${location.origin}/app/${appId}/${worksheetId}/${viewId}/row/${r.rowid}`));
        } else if (config.sourceType === SOURCE_TYPE.CONTROL) {
          if (config.sourceControlId) {
            execute();
          } else {
            alert(_l('请选择数据来源字段'), 3);
          }
        }
      }
      handlePrint();
    }
    if (config) {
      print(config);
    } else {
      worksheetAjax.getCodePrint({
        id: templateId,
        projectId,
      }).then(async data => {
        const config = data.config;
        setName(data.name);
        print(config);
      });
    }
  }, []);
  return <GeneratingPopup zIndex={zIndex} loading={loading} name={name} embedUrl={embedUrl} onClose={onClose} />;
}
