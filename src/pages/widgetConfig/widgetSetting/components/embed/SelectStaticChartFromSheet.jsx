import React, { useEffect } from 'react';
import { Dropdown, Dialog } from 'ming-ui';
import styled from 'styled-components';
import { useSetState } from 'react-use';
import reportApi from 'statistics/api/report.js';
import homeAppAjax from 'src/api/homeApp';
import 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/inputTypes/SubSheet/style.less'
import _ from 'lodash';

const SelectItem = styled.div`
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

const initialConfig = [
  {
    text: _l('应用项'),
    key: 'sheetId',
    listKey: 'sheets',
    placeholder: _l('选择工作表/自定义页面'),
  },
  {
    text: _l('统计图表'),
    key: 'reportId',
    listKey: 'reports',
    placeholder: _l('选择统计图表'),
  },
];

export default function SelectStaticChartFromSheet(props) {
  const {
    sheetId: originSheetId,
    reportId: originReportId,
    onOk,
    onCancel,
    globalSheetInfo: { appId },
  } = props;
  const [data, setData] = useSetState({ sheets: [], reports: [] });
  const [ids, setIds] = useSetState({
    sheetId: '',
    reportId: '',
  });
  const { sheetId, reportId } = ids;

  useEffect(() => {
    homeAppAjax.getAppInfo({ appId }).then(({ appSectionDetail = [] }) => {
      const workSheetInfo = appSectionDetail.reduce((total, cur) => {
        return total.concat(cur.workSheetInfo);
      }, []);
      setData({ sheets: workSheetInfo });
      setIds({ sheetId: originSheetId, reportId: originReportId });
    });
  }, []);

  useEffect(() => {
    if (!sheetId) return;

    const currentSheet = _.find(data.sheets, item => item.workSheetId === sheetId);
    if (!currentSheet) return;

    // 自定义页面
    if (currentSheet.type === 1) {
      reportApi.listByPageId({ appId: sheetId }).then(data => {
        setData({ reports: data });
      });
    } else {
      reportApi
        .list({
          appId: sheetId,
          isOwner: false,
          pageIndex: 1,
          pageSize: 10000,
        })
        .then(({ reports = [] }) => {
          setData({ reports });
        });
    }
  }, [sheetId]);

  const handleOk = () => {
    if (!sheetId) {
      alert('请选择应用项', 3);
      return;
    }
    if (!reportId) {
      alert('请选择统计图表', 3);
      return;
    }

    const currentSheet = _.find(data.sheets, item => item.workSheetId === sheetId);
    const currentReport = _.find(data.reports, item => item.id === reportId);

    const newChartInfo = {
      sheetId,
      reportId,
      pageName: currentSheet.workSheetName,
      type: currentSheet.type,
      reportName: _.get(currentReport, 'name'),
    };
    const worksheetId = currentSheet.type === 1 ? _.get(currentReport, 'appId') : sheetId;

    onOk(newChartInfo, worksheetId);
  };

  const formatData = list => {
    return list.map(item => ({ value: item.id || item.workSheetId, text: item.name || item.workSheetName }));
  };

  return (
    <Dialog
      width={560}
      visible={true}
      title={_l('选择统计图表')}
      className='SelectStaticChartFromSheet'
      onOk={handleOk}
      onCancel={() => onCancel()}
    >
      {initialConfig.map(({ text, key, listKey, placeholder }) => (
        <SelectItem key={key}>
          <div className="title Bold">{text}</div>
          <Dropdown
            value={ids[key] || undefined}
            border
            openSearch
            isAppendToBody
            placeholder={placeholder}
            data={formatData(data[listKey])}
            onChange={value => {
              if (key === 'sheetId') {
                setIds({
                  sheetId: value,
                  reportId: '',
                });
              }
              if (key === 'reportId') {
                setIds({
                  reportId: value,
                });
              }
            }}
          />
        </SelectItem>
      ))}
    </Dialog>
  );
}
