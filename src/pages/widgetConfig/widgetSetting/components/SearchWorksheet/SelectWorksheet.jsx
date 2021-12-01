import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import { Dialog, Button, Dropdown } from 'ming-ui';
import styled from 'styled-components';
import { getWorksheetsByAppId } from 'src/api/homeApp';
import { getAppForManager } from 'src/api/appManagement';
import update from 'immutability-helper';

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
  .footerBtn {
    text-align: right;
    margin-top: 32px;
  }
  .title {
    margin: 24px 0 6px 0;
  }
  .ming.Dropdown,
  .ming.Menu {
    width: 100%;
    &.disabled {
      background-color: #f5f5f5;
      .Dropdown--input {
        &:hover {
          border-color: #ccc;
        }
      }
    }
  }
  .ming.Menu {
    max-height: 160px;
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
    getAppForManager({ projectId, type: 0 }).then(res => {
      const getFormatApps = () => {
        const currentIndex = _.findIndex(res, item => item.appId === globalSheetInfo.appId);
        const currentApp = currentIndex > -1 ? res[currentIndex] : [];
        const appList = [currentApp].concat(update(res, { $splice: [[currentIndex, 1]] }));
        if (appList.length < 1) return [];
        return appList.map(({ appName, appId }) =>
          appId === currentAppId
            ? { text: _l('%0  (本应用)', appName), value: appId }
            : { text: appName, value: appId },
        );
      };
      setData({
        app: getFormatApps(),
      });
    });
  }, []);

  useEffect(() => {
    if (!appId) return;
    getWorksheetsByAppId({ appId, type: 0 }).then(res => {
      setData({
        sheet: res.map(({ workSheetId: value, workSheetName: text }) =>
          value === worksheetId ? { text: _l('%0  (本表)', text), value } : { text, value },
        ),
      });
      setLoading(false);
    });
  }, [appId]);

  return (
    <Dialog
      width={560}
      visible={true}
      title={<span className="Bold">{_l('选择工作表')}</span>}
      footer={null}
      onCancel={onClose}
    >
      <SelectSheetWrap>
        {Config.map(({ text, key, disabled, filter = item => item }) => (
          <div key={key}>
            <div className="title Bold">{text}</div>
            <Dropdown
              value={ids[idContrast[key]] || undefined}
              border
              openSearch
              isAppendToBody
              placeholder={
                isDelete(key) && !loading ? (
                  <span className="Red">{_l('%0已删除', key === 'app' ? '应用' : '工作表')}</span>
                ) : (
                  _l('请选择')
                )
              }
              disabled={disabled}
              data={_.filter(data[key], filter)}
              onChange={value => {
                if (key === 'app') {
                  setIds({
                    appId: value,
                    sheetId: '',
                    appName: _.get(
                      _.find(data.app || [], da => da.value === value),
                      'text',
                    ),
                  });
                } else {
                  setIds({ [idContrast[key]]: value });
                }
              }}
            />
          </div>
        ))}
        <div className="footerBtn">
          <Button type="link" onClick={onClose}>
            {_l('取消')}
          </Button>
          <Button
            type="primary"
            disabled={!sheetId}
            onClick={() => {
              onOk({ sheetId, appId, appName });
              onClose();
            }}
          >
            {_l('确定')}
          </Button>
        </div>
      </SelectSheetWrap>
    </Dialog>
  );
}
