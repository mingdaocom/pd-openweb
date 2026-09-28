import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import update from 'immutability-helper';
import _ from 'lodash';
import styled from 'styled-components';
import { Modal, Select } from 'ming-ui/antd-components';
import appManagementAjax from 'src/api/appManagement';
import homeAppAjax from 'src/api/homeApp';

const Config = [
  {
    text: _l('应用'),
    key: 'app',
  },
  {
    text: _l('工作表'),
    key: 'sheet',
  },
];

const idContrast = {
  app: 'appId',
  sheet: 'sheetId',
};

const SelectSheetWrap = styled.div`
  .title {
    margin: 24px 0 6px 0;
  }
`;

export default function SelectWorksheetDialog(props) {
  const { onClose, onOk, globalSheetInfo = {} } = props;
  const { appId: currentAppId, projectId, worksheetId } = globalSheetInfo;
  const [data, setData] = useSetState({ app: [], sheet: [] });
  const [loading, setLoading] = useSetState(true);
  const [ids, setIds] = useSetState({
    appId: currentAppId,
    sheetId: '',
    appName: '',
    ..._.pick(props, ['appId', 'sheetId', 'appName']),
  });
  const { appId, sheetId, appName = '' } = ids;

  const isDelete = key => {
    const currentData = data[key] || [];
    return ids[idContrast[key]] && !_.find(currentData, da => da.value === ids[idContrast[key]]);
  };

  useEffect(() => {
    appManagementAjax.getAppForManager({ projectId, type: 0 }).then(res => {
      const getFormatApps = () => {
        const currentIndex = _.findIndex(res, item => item.appId === globalSheetInfo.appId);
        const currentApp = currentIndex > -1 ? res[currentIndex] : [];
        const appList = [currentApp].concat(update(res, { $splice: [[currentIndex, 1]] }));
        if (appList.length < 1) return [];
        return appList.map(({ appName, appId }) =>
          appId === currentAppId
            ? { label: _l('%0  (本应用)', appName), value: appId }
            : { label: appName, value: appId },
        );
      };

      setData({
        app: getFormatApps(),
      });
    });
  }, []);

  useEffect(() => {
    if (!appId) return;
    homeAppAjax.getWorksheetsByAppId({ appId, type: 0 }).then(res => {
      setData({
        sheet: res.map(({ workSheetId: value, workSheetName: label }) =>
          value === worksheetId ? { label: _l('%0  (本表)', label), value } : { label, value },
        ),
      });
      setLoading(false);
    });
  }, [appId]);

  return (
    <Modal
      width={560}
      open={true}
      mask={{ closable: true }}
      keyboard
      title={<span className="Bold">{_l('选择工作表')}</span>}
      onCancel={onClose}
      okButtonProps={{ disabled: !sheetId }}
      onOk={() => {
        onOk({ sheetId, appId, appName });
        onClose();
      }}
    >
      <SelectSheetWrap>
        {Config.map(({ text, key, disabled, filter = item => item }) => (
          <div key={key}>
            <div className="title Bold">{text}</div>
            <Select
              className="w100"
              value={ids[idContrast[key]] || undefined}
              showPopupSearch
              optionFilterProp="label"
              listHeight={160}
              placeholder={
                isDelete(key) && !loading ? (
                  <span className="Red">{_l('%0已删除', key === 'app' ? '应用' : '工作表')}</span>
                ) : (
                  _l('请选择')
                )
              }
              disabled={disabled}
              options={_.filter(data[key], filter)}
              onChange={value => {
                if (key === 'app') {
                  setIds({
                    appId: value,
                    sheetId: '',
                    appName: _.get(
                      _.find(data.app || [], da => da.value === value),
                      'label',
                    ),
                  });
                } else {
                  setIds({ [idContrast[key]]: value });
                }
              }}
            />
          </div>
        ))}
      </SelectSheetWrap>
    </Modal>
  );
}
