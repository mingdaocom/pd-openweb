import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import worksheetAjax from 'src/api/worksheet';
import { getTranslateInfo } from 'src/utils/app';
import { replaceControlsTranslateInfo } from 'src/utils/translate';

const ErrorWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 14px;
  color: #aaaaaa;
`;

export default function AdvancedSettingHandler(Comp) {
  return function NewRecord(props) {
    const { worksheetId } = props;
    const [loading, setLoading] = useState(_.isEmpty(props.worksheetInfo));
    const [error, setError] = useState(false);
    const [worksheetInfo, setWorksheetInfo] = useState(props.worksheetInfo || {});
    useEffect(() => {
      if (loading) {
        worksheetAjax
          .getWorksheetInfo({
            handleDefault: true,
            getTemplate: true,
            getRules: true,
            worksheetId,
          })
          .then(data => {
            if (!data.worksheetId) {
              setError(true);
              return;
            }
            const translateInfo = getTranslateInfo(data.appId, null, worksheetId);
            if (data.advancedSetting) {
              data.advancedSetting.title = translateInfo.formTitle || data.advancedSetting.title;
              data.advancedSetting.sub = translateInfo.formSub || data.advancedSetting.sub;
              data.advancedSetting.continue = translateInfo.formContinue || data.advancedSetting.continue;
            }
            data.entityName = translateInfo.recordName || data.entityName;
            data.template.controls = replaceControlsTranslateInfo(data.appId, worksheetId, data.template.controls);
            setWorksheetInfo(data);
            setLoading(false);
          });
      }
    }, []);
    const advancedSettingData = worksheetInfo.advancedSetting || {};
    const advancedSetting = advancedSettingData
      ? {
          ...advancedSettingData,
          title: advancedSettingData.title,
          submitBtnText: advancedSettingData.sub,
          submitEndAction: Number(advancedSettingData.subafter || 1), // 1-关闭弹层 2-继续创建下一条 3-打开刚刚创建的记录
          continueBtnText: advancedSettingData.continue,
          continueEndAction: Number(advancedSettingData.continueafter || 2), // 1-关闭弹层 2-继续创建下一条 3-打开刚刚创建的记录
          continueBtnVisible: _.includes(
            ['true', '1'],
            _.isUndefined(advancedSettingData.continuestatus) ? '1' : advancedSettingData.continuestatus,
          ),
          submitOpenRecordViewId: advancedSettingData.subview,
          continueOpenRecordViewId: advancedSettingData.continueview,
          autoFillVisible: _.includes(
            ['true', '1'],
            _.isUndefined(advancedSettingData.showcontinue) ? '1' : advancedSettingData.showcontinue,
          ), // 是否显示保留数据继续提交选项
          closedrafts: advancedSettingData.closedrafts,
          autoreserve: advancedSettingData.autoreserve,
          reservecontrols: advancedSettingData.reservecontrols !== 'all' ? advancedSettingData.reservecontrols : '',
        }
      : undefined;
    if (error) {
      return (
        <ErrorWrapper>
          <span>{_l('应用项无权限或已删除')}</span>
        </ErrorWrapper>
      );
    }
    return <Comp {...props} loading={loading} worksheetInfo={worksheetInfo} advancedSetting={advancedSetting} />;
  };
}
