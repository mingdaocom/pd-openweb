import React, { useRef, useEffect, useState } from 'react';
import { Button, Checkbox } from 'ming-ui';
import styled from 'styled-components';
import worksheetAjax from 'src/api/worksheet';
import Skeleton from 'src/router/Application/Skeleton';
import saveTemplateConfirm from 'src/pages/Print/components/saveTemplateConfirm';
import FilterDetailName from 'worksheet/common/WorkSheetFilter/components/FilterDetailName';
import Sider from './Sider';
import Preview from './Preview';
import {
  A4_LAYOUT,
  BAR_LAYOUT,
  CODE_FAULT_TOLERANCE,
  PRINT_TYPE,
  QR_LAYOUT,
  SOURCE_TYPE,
  SOURCE_URL_TYPE,
} from './enum';
import { FILTER } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import {
  createQrLabeObjectFromConfig,
  createBarLabeObjectFromConfig,
  getCodeTexts,
  getCodeContent,
  getDefaultText,
} from './util';
import { generatePdf } from '.';
import _ from 'lodash';
import { addBehaviorLog } from 'src/util';

const Con = styled.div`
  height: 100vh
  display: flex;
  flex-direction: column;
  background: #f1f1f1;
`;

const Header = styled.div`
  padding: 0 24px 0 3px;
  height: 50px;
  background: #fff;
  box-shadow: 0px 1px 4px 1px rgba(0, 0, 0, 0.1608);
  z-index: 2;
  display: flex;
  align-items: center;
  .spacer {
    flex: 1;
  }
  .backIcon {
    display: inline-block;
    cursor: pointer;
    font-size: 16px;
    color: #757575;
    width: 50px;
    text-align: center;
    &:hover {
      color: #333;
    }
  }
`;

const TemplateName = styled.div`
  display: inline;
  input {
    padding-left: 0px;
    text-align: left;
  }
`;

const Main = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

function getDefaultConfig(printType) {
  return {
    sourceType: 1,
    sourceUrlType: md.global.Account.isPortal ? SOURCE_URL_TYPE.PUBLIC : SOURCE_URL_TYPE.MEMBER,
    printType: 1,
    codeFaultTolerance: CODE_FAULT_TOLERANCE.L,
    showControlName: true,
    firstIsBold: true,
    layout:
      {
        [PRINT_TYPE.A4]: A4_LAYOUT.A1x1,
        [PRINT_TYPE.QR]: QR_LAYOUT.PORTRAIT,
        [PRINT_TYPE.BAR]: BAR_LAYOUT.LANDSCAPE,
      }[printType] || 1,
    labelSize: 2,
    codeSize: 1,
    position: 1,
  };
}

export default function PrintQrBarCode(props) {
  const {
    isCharge,
    mode,
    printType = 1,
    appId,
    projectId,
    worksheetId,
    viewId,
    worksheetName,
    selectedRows = [],
    controls,
    count,
    allowLoadMore,
    filterControls,
    fastFilters,
    navGroupFilters,
    onClose = () => {},
  } = props;
  const [base, setBase] = useState({
    id: props.id,
    name: props.id ? '' : printType === PRINT_TYPE.BAR ? _l('打印条形码') : _l('打印二维码'),
    range: 1,
    views: [],
  });
  const { id, name } = base;
  const sourceType = printType === PRINT_TYPE.BAR ? 2 : 1;
  const [loading, setLoading] = useState(!!id);
  const [previewRow, setPreviewRow] = useState(selectedRows[0] || {});
  const [previewRowPublicUrl, setPreviewRowPublicUrl] = useState({});
  const [changed, setChanged] = useState();
  const [config, setConfig] = useState({
    ...getDefaultConfig(printType),
    sourceType: sourceType,
    sourceControlId:
      printType === PRINT_TYPE.BAR && sourceType === SOURCE_TYPE.CONTROL ? controls[0].controlId : undefined,
    printType,
    showTexts: [
      getDefaultText({
        printType,
        sourceType,
        sourceControlId:
          printType === PRINT_TYPE.BAR && sourceType === SOURCE_TYPE.CONTROL ? controls[0].controlId : undefined,
        controls,
      }),
    ].filter(_.identity),
  });
  let labelObject;
  if (printType === PRINT_TYPE.QR) {
    labelObject = createQrLabeObjectFromConfig(
      config,
      getCodeContent({
        printType: config.printType,
        sourceType: config.sourceType,
        sourceControlId: config.sourceControlId,
        row: previewRow,
        controls,
        urls: [
          config.sourceUrlType === SOURCE_URL_TYPE.MEMBER
            ? `${location.origin}/app/${appId}/${worksheetId}/${viewId}/row/${previewRow.rowid}`
            : previewRowPublicUrl || 'https://mingdao.com',
        ],
        index: 0,
      }),
      getCodeTexts(
        {
          showTexts: config.showTexts,
          showControlName: config.showControlName,
          firstIsBold: config.firstIsBold,
          controls,
          emptySetAsSample: _.isEmpty(selectedRows),
        },
        previewRow,
      ),
      {
        isPreview: true,
      },
    );
  } else if (printType === PRINT_TYPE.BAR) {
    labelObject = createBarLabeObjectFromConfig(
      config,
      getCodeContent({
        printType: config.printType,
        sourceType: config.sourceType,
        sourceControlId: config.sourceControlId,
        row: previewRow,
        controls,
      }),
      getCodeTexts(
        {
          showTexts: config.showTexts,
          showControlName: config.showControlName,
          firstIsBold: config.firstIsBold,
          controls,
          emptySetAsSample: _.isEmpty(selectedRows),
        },
        previewRow,
      ),
      {
        isPreview: true,
      },
    );
  }
  const maxLineNumber = (labelObject || {}).maxLineNumber || 0;
  function handlePrint() {
    const printTypeObj = { 1: 'printQRCode', 3: 'printBarCode' };
    addBehaviorLog(printTypeObj[config.printType], worksheetId, { msg: [allowLoadMore ? count : selectedRows.length] }); // 埋点

    generatePdf({
      config,
      name: base.name,
      appId,
      worksheetId,
      viewId,
      projectId,
      selectedRows,
      controls,
      count,
      allowLoadMore,
      filterControls,
      fastFilters,
      navGroupFilters,
    });
  }
  function handleKeyDown(e) {
    if (e.keyCode === 27) {
      onClose();
    }
  }
  function updatePreviewRowShareUrl(recordId) {
    if (viewId) {
      worksheetAjax
        .getRowsShortUrl({
          appId,
          viewId,
          worksheetId,
          rowIds: [recordId],
        })
        .then(data => {
          setPreviewRowPublicUrl(data[recordId]);
        });
    }
  }
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    (async () => {
      if (id) {
        const data = await worksheetAjax.getCodePrint({
          id,
          projectId,
        });
        setConfig({ ...config, ...data.config });
        setBase(_.omit(data, 'config'));
        setLoading(false);
      }
      if (_.isEmpty(previewRow)) {
        const resData = await worksheetAjax.getFilterRows({
          worksheetId,
          pageSize: 1,
          pageIndex: 1,
          status: 1,
          notGetTotal: true,
          searchType: 1,
        });
        if (!_.isEmpty(resData.data)) {
          setPreviewRow(resData.data[0]);
          updatePreviewRowShareUrl(resData.data[0].rowid);
        }
      }
    })();
    if (!_.isEmpty(previewRow)) {
      updatePreviewRowShareUrl(previewRow.rowid);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  return (
    <Con className="doNotTriggerClickAway">
      <Header>
        <span className="backIcon" onClick={onClose}>
          <i className="icon icon-knowledge-return"></i>
        </span>
        {mode === 'newTemplate' && <span className="Font16 Bold mRight6">{_l('新建模板')}</span>}
        {mode === 'editTemplate' && <span className="Font16 Bold mRight6">{_l('编辑模板')}</span>}
        <TemplateName className="title Font16 Bold">
          {(id || mode === 'newTemplate') && mode !== 'preview' ? (
            <FilterDetailName
              editable
              name={name}
              onChange={value => {
                if (value.trim() === '') {
                  alert(_l('名称不能为空'), 3);
                  return;
                }
                setChanged(true);
                setBase({ ...base, name: value });
              }}
            />
          ) : (
            <span>{mode === 'preview' ? _l('预览: %0', name) : name}</span>
          )}
        </TemplateName>
        <div className="spacer"></div>
        {isCharge && (
          <Button
            size="mdnormal"
            type={mode === 'editTemplate' || mode === 'newTemplate' ? 'primary' : 'ghostgray'}
            onClick={() => {
              let args = {
                id: id || '',
                projectId,
                worksheetId,
                type: printType === PRINT_TYPE.BAR ? 4 : 3,
                config: {
                  ...config,
                  sourceControlId: config.sourceControlId || '',
                },
              };
              function update(cb = () => {}) {
                worksheetAjax.saveRecordCodePrintConfig(args).then(data => {
                  alert(_l('保存成功'));
                  setChanged(false);
                  if (!id) {
                    setBase({ ...base, id: data });
                  }
                  cb();
                });
              }
              if (id) {
                args = Object.assign(args, base);
                update();
              } else {
                saveTemplateConfirm({
                  className: 'doNotTriggerClickAway',
                  worksheetId,
                  viewId,
                  printData: {
                    name: base.name,
                    range: 1,
                    views: [],
                  },
                  setValue: data => {
                    args = Object.assign(args, {
                      name: data.name,
                      range: data.range,
                      views: data.views.map(v => v.viewId),
                    });
                    update(onClose);
                  },
                });
              }
            }}
          >
            {mode === 'editTemplate' || mode === 'newTemplate' ? _l('保存') : _l('保存为打印模板')}
          </Button>
        )}
        {!_.includes(['newTemplate', 'editTemplate', 'preview'], mode) && (
          <Button size="mdnormal" type="primary" className="mLeft10" onClick={handlePrint}>
            {_l('打印')}
          </Button>
        )}
      </Header>
      <Main>
        {mode !== 'preview' &&
          (loading ? (
            <Skeleton
              style={{
                width: 320,
              }}
              direction="column"
              widths={['30%', '40%', '90%', '60%']}
              active
              itemStyle={{ marginBottom: '10px' }}
            />
          ) : (
            <Sider
              config={config}
              maxLineNumber={maxLineNumber}
              controls={controls.filter(c => FILTER[2](c) || _.includes([37], c.type))}
              onUpdate={changes => {
                setChanged(true);
                setConfig(oldConfig => ({ ...oldConfig, ...changes }));
              }}
            />
          ))}
        <Preview style={loading ? { visibility: 'hidden' } : {}} config={config} labelObject={labelObject} />
      </Main>
    </Con>
  );
}

/**
 * TODO 待处理
 * 条形码条码大小逻辑
 * 自定义大小切换横版竖版
 * 横向显示大小不合理
 * 预览分辨率
 * 待定
 * 标签样式优化
 * 重写 qr 逻辑
 */
