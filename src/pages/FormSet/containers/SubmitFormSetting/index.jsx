import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { LoadDiv, ScrollView } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import OtherSettings from './OtherSettings';
import { Con } from './style';
import SubmitButtonSettings from './SubmitButtonSettings';

let ajaxPromise = null;
function SubmitFormSetting(props) {
  const { worksheetId } = props;
  const { appId } = _.get(props, 'worksheetInfo') || {};
  const [{ advancedSetting, loading }, setState] = useSetState({
    advancedSetting: {},
    loading: true,
  });

  useEffect(() => {
    if (!appId || !worksheetId) {
      return;
    }
    if (ajaxPromise) {
      ajaxPromise.abort();
    }
    ajaxPromise = sheetAjax.getFormSubmissionSettings({ workSheetId: worksheetId, appId: appId });
    ajaxPromise.then(res => {
      const { advancedSetting = {} } = res;
      setState({
        loading: false,
        advancedSetting,
      });
    });
  }, []);

  const onChangeSetting = data => {
    setState({ advancedSetting: { ...advancedSetting, ...data } });
    sheetAjax
      .editWorksheetSetting({
        workSheetId: worksheetId,
        appId: appId,
        advancedSetting: data,
        editAdKeys: Object.keys(data),
      })
      .then(res => {
        if (!res) {
          alert(_l('修改失败，请稍后再试'), 2);
          return;
        }
      });
  };

  if (loading) {
    return <LoadDiv />;
  }

  return (
    <ScrollView>
      <Con className="">
        <h5>{_l('表单标题')}</h5>
        <input
          type="text"
          className="title mTop12"
          placeholder={_l('创建记录')}
          defaultValue={_.get(advancedSetting, 'title')}
          onBlur={e => {
            onChangeSetting({
              title: e.target.value.trim(),
            });
          }}
        />

        <SubmitButtonSettings {...props} advancedSetting={advancedSetting} onChangeSetting={onChangeSetting} />

        <OtherSettings {...props} advancedSetting={advancedSetting} onChangeSetting={onChangeSetting} />
      </Con>
    </ScrollView>
  );
}
export default SubmitFormSetting;
