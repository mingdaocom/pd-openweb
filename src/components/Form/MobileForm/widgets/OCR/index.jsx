import React, { useState, useRef, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Icon, QiniuUpload } from 'ming-ui';
import ajax from 'src/api/worksheet';
import { upgradeVersionDialog } from 'src/components/upgradeVersion';
import { getParamsByConfigs, handleUpdateApi } from '../../../core/searchUtils';
import { formatResponseData } from 'src/components/UploadFiles/utils';
import _ from 'lodash';

const OCR = props => {
  const { worksheetId, controlId, advancedSetting, formData, onChange, enumDefault, hint = '' } = props;
  const { requestmap, authaccount } = advancedSetting || {};
  const requestMap = safeParse(advancedSetting.requestmap || '[]');

  const fileRef = useRef(null);
  const postList = useRef(null);
  const cacheFile = useRef([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleClear = up => {
    setIsUploading(false);
    up.splice(0, up.files.length);
    cacheFile.current = [];
    up.disableBrowse(false);
  };

  const handleUpdate = (itemData = {}) => {
    handleUpdateApi(props, itemData, false);
  };

  const handleSearch = (up, file) => {
    if (!dataSource) {
      setIsUploading(false);
      up && up.disableBrowse(false);
      return alert(_l('模版为空或已删除'), 3);
    }
    const requestMap = safeParse(requestmap || '[]');

    // 有配置api和请求参数
    if (postList.current) {
      postList.current.abort();
    }

    const paramsData = getParamsByConfigs(requestMap, formData, file);

    let params = {
      data: !requestMap.length || _.isEmpty(paramsData) ? '' : paramsData,
      projectId,
      workSheetId: worksheetId,
      controlId,
      apkId: appId,
      apiTemplateId: dataSource,
      authId: authaccount,
    };

    if (window.isPublicWorksheet) {
      params.formId = window.publicWorksheetShareId;
    }

    postList.current = ajax.excuteApiQuery(params);

    postList.current.then(res => {
      if (res.code === 20008) {
        setIsUploading(false);
        up && up.disableBrowse(false);
        upgradeVersionDialog({
          projectId,
          okText: _l('立即充值'),
          hint: _l('余额不足，请联系管理员充值'),
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

  const handleUploaded = (up, file, info) => {
    const newVal = formatResponseData(file, JSON.stringify(info));
    cacheFile.current.push({ ...newVal, originalFileName: decodeURIComponent(newVal.originalFileName) });

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
      if (_.get(up, 'files.length') !== cacheFile.current.length) return;
      // 子表数量达到上限
      const subControl = formData.find(f => f.controlId === advancedSetting.ocrcid);
      if (_.get(subControl, 'advancedSetting.enablelimit') === '1') {
        const maxCount = _.get(subControl, 'advancedSetting.max');
        const subNum = _.isNumber(subControl.value)
          ? subControl.value
          : _.get(subControl, 'value.rows.length') || _.get(subControl, 'value.num');
        if ((subNum || 0) + cacheFile.current.length > parseInt(maxCount || 0)) {
          alert(_l('子表数量达到上限'), 3);
          handleClear(up);
          return;
        }
      }
    }

    const data = cacheFile.current.map(i => i.serverName + i.key);

    ajax.ocr({ worksheetId, controlId, data, type: 1 }).then(result => {
      const ocrmap = JSON.parse(advancedSetting.ocrmap || '{}');
      // 批量映射子表
      if (advancedSetting.ocrmaptype === '2') {
        const rows = _.get(result, 'data');
        const errorCount = cacheFile.current.length - rows.length;
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
                attachments: [cacheFile.current[row.index]],
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
              attachments: cacheFile.current,
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
          <Icon icon="loading_button" className="loading" />
        ) : (
          <Fragment>
            <Icon icon={TYPES[enumDefault].icon} />
            <span>{advancedSetting.ocrapitype === '1' ? hint || _l('识别文字') : hint || TYPES[enumDefault].text}</span>
          </Fragment>
        )}
      </Fragment>
    );
  };

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
        className="customFormControlBox customFormButton"
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
      className="customFormControlBox customFormButton"
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
      onAdd={(up, files) => {
        setIsUploading(true);
        up.disableBrowse();
      }}
      onInit={() => {
        if (_.get(props, 'strDefault') === '10') {
          // 是否禁用相册
          const ele = fileRef.current.upload.nextSibling.querySelector('input');

          ele.setAttribute('capture', 'camera');
        }
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
  formData: PropTypes.array,
  hint: PropTypes.string,
};

export default OCR;
