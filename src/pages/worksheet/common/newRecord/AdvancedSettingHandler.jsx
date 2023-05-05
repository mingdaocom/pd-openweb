import React, { useState, useEffect } from 'react';
import worksheetAjax from 'src/api/worksheet';
import _ from 'lodash';

export default function AdvancedSettingHandler(Comp) {
  return function NewRecord(props) {
    const { worksheetId } = props;
    const [loading, setLoading] = useState(_.isEmpty(props.worksheetInfo));
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
            setWorksheetInfo(data);
            setLoading(false);
          });
      }
    }, []);
    const advancedSettingData = worksheetInfo.advancedSetting || {};
    const advancedSetting = advancedSettingData
      ? {
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
        }
      : undefined;
    return <Comp {...props} loading={loading} worksheetInfo={worksheetInfo} advancedSetting={advancedSetting} />;
  };
}
