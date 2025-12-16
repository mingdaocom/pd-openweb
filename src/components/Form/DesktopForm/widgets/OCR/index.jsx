import React, { Fragment, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Icon, QiniuUpload } from 'ming-ui';
import ajax from 'src/api/worksheet';
import { upgradeVersionDialog } from 'src/components/upgradeVersion';
import { formatResponseData } from 'src/components/UploadFiles/utils.js';
import { dealAuthAccount, getParamsByConfigs, handleUpdateApi } from '../../../core/searchUtils';

const OCR = props => {
  const {
    enumDefault,
    advancedSetting = {},
    hint = '',
    worksheetId,
    controlId,
    formData,
    onChange,
    dataSource,
    projectId,
    appId,
    recordId,
  } = props;
  const [isUploading, setIsUploading] = useState(false);
  const [width, setWidth] = useState(0);
  const fileRef = useRef(null);
  const postListRef = useRef(null);
  const cacheFileRef = useRef([]);

  useEffect(() => {
    if (fileRef.current && fileRef.current.upload) {
      setWidth(fileRef.current.upload.offsetWidth);
    }
  }, []);

  const handleClear = up => {
    setIsUploading(false);
    up.splice(0, up.files.length);
    cacheFileRef.current = [];
    up.disableBrowse(false);
  };

  const handleUploaded = (up, file, info) => {
    const newVal = formatResponseData(file, JSON.stringify(info));
    const newCacheFile = [
      ...cacheFileRef.current,
      { ...newVal, originalFileName: decodeURIComponent(newVal.originalFileName) },
    ];
    cacheFileRef.current = newCacheFile;

    // api集成
    if (advancedSetting.ocrapitype === '1') {
      // 保存识别源文件
      if (advancedSetting.ocroriginal) {
        onChange(
          JSON.stringify({ attachments: [newVal], knowledgeAtts: [], attachmentData: [] }),
          advancedSetting.ocroriginal,
        );
      }
      handleSearch(up, newVal);
      return;
    }

    if (advancedSetting.ocrmaptype === '2') {
      // 批量没有配置子表，不执行
      if (!advancedSetting.ocrcid) return;
      // 批量,附件信息都收集完了在请求
      if (_.get(up, 'files.length') !== cacheFileRef.current.length) return;
      // 子表数量达到上限
      const subControl = formData.find(f => f.controlId === advancedSetting.ocrcid);
      if (_.get(subControl, 'advancedSetting.enablelimit') === '1') {
        const maxCount = _.get(subControl, 'advancedSetting.max');
        const subNum = _.isNumber(subControl.value)
          ? subControl.value
          : _.get(subControl, 'value.rows.length') || _.get(subControl, 'value.num');
        if ((subNum || 0) + cacheFileRef.current.length > parseInt(maxCount || 0)) {
          alert(_l('子表数量达到上限'), 3);
          handleClear(up);
          return;
        }
      }
    }

    const data = cacheFileRef.current.map(i => i.serverName + i.key);

    ajax
      .ocr({ worksheetId, controlId, data, type: 1 })
      .then(result => {
        const ocrmap = JSON.parse(advancedSetting.ocrmap || '{}');
        // 批量映射子表
        if (advancedSetting.ocrmaptype === '2') {
          const rows = _.get(result, 'data');
          const errorCount = cacheFileRef.current.length - rows.length;
          if (errorCount) {
            alert(_l(`${errorCount}个文件识别错误`), 3);
          }

          const childRows = [];
          rows.forEach(row => {
            let newRow = {};
            (row.data || []).map(i => {
              const currentItem = ocrmap.find(o => o.cid === i.controlId);
              // 附件
              if (_.includes([1, 1001, 2001], parseInt(currentItem.type))) {
                newRow[i.controlId] = JSON.stringify({
                  attachments: [cacheFileRef.current[row.index]],
                  knowledgeAtts: [],
                  attachmentData: [],
                });
              } else {
                newRow[i.controlId] = i.value;
              }
            });
            if (!_.isEmpty(newRow)) {
              childRows.push(newRow);
            }
          });

          const subValue = {
            action: 'append',
            rows: childRows,
          };
          onChange(subValue, advancedSetting.ocrcid);
          handleClear(up);
          return;
        }

        if (result.code === 1) {
          result.data.forEach(item => {
            const currentItem = ocrmap.find(o => o.cid === item.controlId);
            let newValue;

            // 附件
            if (_.includes([1, 1001, 2001], parseInt(currentItem.type))) {
              newValue = JSON.stringify({
                attachments: cacheFileRef.current,
                knowledgeAtts: [],
                attachmentData: [],
              });
            } else if (currentItem.subCid) {
              // 子表
              newValue = {
                action: 'clearAndSet',
                rows: item.childs,
              };
            } else {
              newValue = item.value;
            }

            onChange(newValue, item.controlId);
          });
        } else {
          alert(result.errorMsg, 2);
        }

        handleClear(up);
      })
      .finally(() => {
        handleClear(up);
      });
  };

  // api查询
  const handleSearch = (up, file) => {
    const { requestmap, authaccount } = advancedSetting;

    if (!dataSource) {
      setIsUploading(false);
      up && up.disableBrowse(false);
      return alert(_l('模版为空或已删除'), 3);
    }
    const requestMap = safeParse(requestmap || '[]');

    // 有配置api和请求参数
    if (postListRef.current) {
      postListRef.current.abort();
    }

    const paramsData = getParamsByConfigs(recordId, requestMap, formData, file);

    let params = {
      data: !requestMap.length || _.isEmpty(paramsData) ? '' : paramsData,
      projectId,
      workSheetId: worksheetId,
      controlId,
      apkId: appId,
      apiTemplateId: dataSource,
      authId: dealAuthAccount(authaccount, formData),
      pushUniqueId: md.global.Config.pushUniqueId,
    };

    if (window.isPublicWorksheet) {
      params.formId = window.publicWorksheetShareId;
    }

    postListRef.current = ajax.excuteApiQuery(params);

    postListRef.current.then(res => {
      if (res.code === 20008) {
        setIsUploading(false);
        up && up.disableBrowse(false);
        upgradeVersionDialog({
          projectId,
          okText: _l('立即充值'),
          hint: _l('信用点不足，请联系管理员充值'),
          explainText: <div></div>,
          onOk: () => {
            location.href = `/admin/valueaddservice/${projectId}`;
          },
        });
        return;
      }

      if (res.message) {
        alert(res.message, 3);
        setIsUploading(false);
        up && up.disableBrowse(false);
        return;
      }

      setIsUploading(false);
      up && up.disableBrowse(false);
      handleUpdate(res.apiQueryData);
    });
  };

  const handleUpdate = (itemData = {}) => {
    handleUpdateApi(props, itemData, false, () => {
      // 清理状态
    });
  };

  const renderContent = () => {
    const TYPES = [
      {},
      { text: _l('文字识别'), icon: 'ocr' },
      { text: _l('身份证识别'), icon: 'ocr_id_card' },
      { text: _l('增值税发票识别'), icon: 'ocr_invoice' },
    ];

    return (
      <Fragment>
        {isUploading ? (
          <span style={{ width: width - 50, textAlign: 'center' }}>
            <Icon icon="loading_button" className="Font16 customOCRLoading" />
          </span>
        ) : (
          <Fragment>
            <Icon icon={TYPES[enumDefault].icon} className="Font20 mRight5 Gray_9e" />
            <span className="overflow_ellipsis Bold">
              {advancedSetting.ocrapitype === '1' ? hint || _l('识别文字') : hint || TYPES[enumDefault].text}
            </span>
          </Fragment>
        )}
      </Fragment>
    );
  };

  const requestMap = safeParse(advancedSetting.requestmap || '[]');

  if (
    advancedSetting.ocrapitype === '1' &&
    requestMap.length > 0 &&
    _.every(
      requestMap,
      i => !_.find(safeParse(i.defsource || '[]'), c => _.includes(['ocr-file', 'ocr-file-url'], c.cid)),
    )
  ) {
    return (
      <div
        className="customFormControlBox customFormControlOCR"
        onClick={() => {
          setIsUploading(true);
          handleSearch();
        }}
      >
        {renderContent()}
      </div>
    );
  }

  return (
    <QiniuUpload
      className="customFormControlBox customFormControlOCR"
      ref={fileRef}
      options={{
        ...(advancedSetting.ocrmaptype === '2'
          ? {
              multi_selection: true,
              max_file_count: 10,
              error_callback: () => {
                alert(_l('批量识别仅支持10个附件'), 3);
                return;
              },
            }
          : { multi_selection: false }),
        chunk_size: 0,
        filters: {
          mime_types: [
            {
              title: 'image',
              extensions: advancedSetting.ocrapitype === '1' || enumDefault === 3 ? 'jpg,jpeg,png,pdf' : 'jpg,jpeg,png',
            },
          ],
        },
      }}
      onUploaded={handleUploaded}
      onAdd={up => {
        setIsUploading(true);
        up.disableBrowse();
      }}
    >
      {renderContent()}
    </QiniuUpload>
  );
};

OCR.propTypes = {
  worksheetId: PropTypes.string,
  controlId: PropTypes.string,
  enumDefault: PropTypes.number,
  onChange: PropTypes.func,
  advancedSetting: PropTypes.object,
};

export default OCR;
