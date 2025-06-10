import React, { Fragment, useEffect, useState } from 'react';
import { Input } from 'antd';
import { LoadDiv } from 'ming-ui';
import sheetApi from 'src/api/worksheet';
import { getTranslateInfo } from 'src/utils/app';
import { LANG_DATA_TYPE } from '../config';
import { filterHtmlTag } from '../util';
import EditDescription from './EditDescription';
import EditInput from './EditInput';

export default function Sheet(props) {
  const { app, selectNode, translateData, comparisonLangId, comparisonLangData, onEditAppLang } = props;
  const [loading, setLoading] = useState(true);
  const [sheetInfo, setSheetInfo] = useState({});
  const data = _.find(translateData, { correlationId: selectNode.key }) || {};
  const translateInfo = data.data || {};

  useEffect(() => {
    setLoading(true);
    sheetApi
      .getWorksheetInfo({
        worksheetId: selectNode.key,
      })
      .then(data => {
        setLoading(false);
        setSheetInfo(data);
      });
  }, [selectNode.key]);

  const handleSave = info => {
    onEditAppLang({
      id: data.id,
      parentId: selectNode.parentId,
      correlationId: selectNode.key,
      type: LANG_DATA_TYPE.wrokSheet,
      data: {
        ...translateInfo,
        ...info,
      },
    });
  };

  if (loading) {
    return (
      <div className="flexRow alignItemsCenter justifyContentCenter h100">
        <LoadDiv />
      </div>
    );
  }

  const { desc, entityName, advancedSetting = {} } = sheetInfo;
  const doubleconfirm = JSON.parse(advancedSetting.doubleconfirm || '{}');
  const comparisonLangInfo = getTranslateInfo(app.id, null, selectNode.key, comparisonLangData);
  const formTitle = comparisonLangId ? comparisonLangInfo.formTitle : advancedSetting.title;
  const formSub = comparisonLangId ? comparisonLangInfo.formSub : advancedSetting.sub;
  const formContinue = comparisonLangId ? comparisonLangInfo.formContinue : advancedSetting.continue;
  const confirmMsg = comparisonLangId ? comparisonLangInfo.confirmMsg : doubleconfirm.confirmMsg;
  const confirmContent = comparisonLangId ? comparisonLangInfo.confirmContent : doubleconfirm.confirmContent;
  const sureName = comparisonLangId ? comparisonLangInfo.sureName : doubleconfirm.sureName;
  const cancelName = comparisonLangId ? comparisonLangInfo.cancelName : doubleconfirm.cancelName;
  const recordName = comparisonLangId ? comparisonLangInfo.recordName : entityName;
  const defaultTabName = comparisonLangId ? comparisonLangInfo.defaultTabName : advancedSetting.deftabname;
  const createBtnName = comparisonLangId ? comparisonLangInfo.createBtnName : advancedSetting.btnname;

  return (
    <div className="pAll20">
      <div className="Font14 bold mBottom20">{translateInfo.name || selectNode.originalTitle}</div>
      <div className="flexRow alignItemsCenter nodeItem">
        <div className="Font13 mRight20 label">{_l('工作表名称')}</div>
        <Input
          className="flex mRight20"
          value={comparisonLangId ? comparisonLangInfo.name : selectNode.originalTitle}
          disabled={true}
        />
        <EditInput className="flex" value={translateInfo.name} onChange={value => handleSave({ name: value })} />
      </div>
      <div className="flexRow nodeItem">
        <div className="Font13 mRight20 label">{_l('工作表说明')}</div>
        <Input.TextArea
          style={{ resize: 'none' }}
          className="flex mRight20"
          value={filterHtmlTag(comparisonLangId ? comparisonLangInfo.description : desc)}
          disabled={true}
        />
        <EditDescription
          value={translateInfo.description}
          originalValue={desc}
          onChange={value => handleSave({ description: value })}
        />
      </div>

      {!!(formTitle || formSub || formContinue) && <div className="Font14 bold mTop20 mBottom20">{_l('提交表单')}</div>}

      {formTitle && (
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('表单标题')}</div>
          <Input className="flex mRight20" value={formTitle} disabled={true} />
          <EditInput
            className="flex"
            disabled={!formTitle}
            value={translateInfo.formTitle}
            onChange={value => handleSave({ formTitle: value })}
          />
        </div>
      )}
      {formSub && (
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('提交按钮')}</div>
          <Input className="flex mRight20" value={formSub} disabled={true} />
          <EditInput
            className="flex"
            disabled={!formSub}
            value={translateInfo.formSub}
            onChange={value => handleSave({ formSub: value })}
          />
        </div>
      )}
      {formContinue && (
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('继续创建按钮')}</div>
          <Input className="flex mRight20" value={formContinue} disabled={true} />
          <EditInput
            className="flex"
            disabled={!formContinue}
            value={translateInfo.formContinue}
            onChange={value => handleSave({ formContinue: value })}
          />
        </div>
      )}
      {confirmMsg && (
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('二次确认标题')}</div>
          <Input className="flex mRight20" value={confirmMsg} disabled={true} />
          <EditInput
            className="flex"
            disabled={!confirmMsg}
            value={translateInfo.confirmMsg}
            onChange={value => handleSave({ confirmMsg: value })}
          />
        </div>
      )}
      {confirmContent && (
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('二次确认内容')}</div>
          <Input className="flex mRight20" value={confirmContent} disabled={true} />
          <EditInput
            className="flex"
            disabled={!confirmContent}
            value={translateInfo.confirmContent}
            onChange={value => handleSave({ confirmContent: value })}
          />
        </div>
      )}
      {sureName && (
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('二次确认提交按钮')}</div>
          <Input className="flex mRight20" value={sureName} disabled={true} />
          <EditInput
            className="flex"
            disabled={!sureName}
            value={translateInfo.sureName}
            onChange={value => handleSave({ sureName: value })}
          />
        </div>
      )}
      {cancelName && (
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('二次确认取消按钮')}</div>
          <Input className="flex mRight20" value={cancelName} disabled={true} />
          <EditInput
            className="flex"
            disabled={!cancelName}
            value={translateInfo.cancelName}
            onChange={value => handleSave({ cancelName: value })}
          />
        </div>
      )}

      <div className="Font14 bold mTop20 mBottom20">{_l('记录名称')}</div>
      <div className="flexRow alignItemsCenter nodeItem">
        <div className="Font13 mRight20 label">{_l('记录名称')}</div>
        <Input className="flex mRight20" value={recordName} disabled={true} />
        <EditInput
          className="flex"
          disabled={!recordName}
          value={translateInfo.recordName}
          onChange={value => handleSave({ recordName: value })}
        />
      </div>
      {createBtnName && (
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('新建按钮名称')}</div>
          <Input className="flex mRight20" value={createBtnName} disabled={true} />
          <EditInput
            className="flex"
            disabled={!createBtnName}
            value={translateInfo.createBtnName}
            onChange={value => handleSave({ createBtnName: value })}
          />
        </div>
      )}

      {defaultTabName && (
        <Fragment>
          <div className="Font14 bold mTop20 mBottom20">{_l('其他')}</div>
          <div className="flexRow alignItemsCenter nodeItem">
            <div className="Font13 mRight20 label">{_l('标签页默认分组名称')}</div>
            <Input className="flex mRight20" value={defaultTabName} disabled={true} />
            <EditInput
              className="flex"
              disabled={!defaultTabName}
              value={translateInfo.defaultTabName}
              onChange={value => handleSave({ defaultTabName: value })}
            />
          </div>
        </Fragment>
      )}
    </div>
  );
}
