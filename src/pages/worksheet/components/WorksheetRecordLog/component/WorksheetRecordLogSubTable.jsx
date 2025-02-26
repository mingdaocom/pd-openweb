import React, { useState, useEffect } from 'react';
import { Table, ConfigProvider, Empty } from 'antd';
import _ from 'lodash';
import { ScrollView } from 'ming-ui';
import renderText from 'src/pages/worksheet/components/CellControls/renderText.js';
import WorksheetRecordLogThumbnail from './WorksheetRecordLogThumbnail';
import { SYSTEM_CONTROL } from 'src/pages/widgetConfig/config/widget';
import { TEXT_FIELD_SHOWTEXT_TYPE, UPDATA_ITEM_CLASSNAME_BY_TYPE } from '../enum';
import sheetAjax from 'src/api/worksheet';
import { replaceControlsTranslateInfo } from 'worksheet/util';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { getDepartmentName } from '../util';
import '../WorksheetRecordLogValue.less';

function MaskCell(props) {
  const { cell } = props;
  const [forceShowFullValue, setForceShowFullValue] = useState(false);
  const canMask =
    (cell.type === 2 && cell.enumDefault === 2) ||
    (_.includes([6, 8, 3, 5, 7], cell.type) && cell.value && _.get(cell, 'advancedSetting.isdecrypt') === '1');
  let content = renderText(cell, { noMask: forceShowFullValue });
  return canMask ? (
    <span className="canMask" onClick={() => setForceShowFullValue(true)}>
      {content}
    </span>
  ) : (
    content
  );
}

function WorksheetRecordLogSubTable(props) {
  const { control, prop, recordInfo, extendParam } = props;
  const { showControls } = control;
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [loadEnd, setLoadEnd] = useState(false);
  const [log, setLog] = useState(null);

  const getData = param => {
    let _pageIndex = param ? param.pageIndex : pageIndex;
    sheetAjax
      .getDetailTableLog({
        worksheetId: recordInfo.worksheetId,
        rowId: recordInfo.rowId,
        uniqueId: extendParam.uniqueId,
        createTime: extendParam.createTime,
        lastMark: extendParam.createTime,
        requestType: extendParam.requestType,
        objectType: extendParam.objectType,
        pageIndex: _pageIndex,
        pageSize: 20,
        log: param ? param.log : log,
      })
      .then(res => {
        setLoading(false);
        setPageIndex(_pageIndex + 1);
        const { oldRows, newRows } = res;
        let oldList = safeParse(oldRows, 'array');
        let newList = safeParse(newRows, 'array');
        let defaultList = _.intersectionBy(newList, oldList, 'rowid').map(l => {
          return {
            ...l,
            oldValue: oldList.find(m => m.rowid === l.rowid),
            newValue: newList.find(m => m.rowid === l.rowid),
            type: 'update',
          };
        });
        let add = _.differenceBy(newList, oldList, 'rowid').map(l => {
          return { ...l, type: 'add' };
        });
        let remove = _.differenceBy(oldList, newList, 'rowid').map(l => {
          return { ...l, type: 'remove' };
        });
        let _data = data.concat(_.sortBy(defaultList.concat(add, remove), ['ctime']));
        setData(_data);
        if (res.flag) setLoadEnd(true);
        if (!res.flag && _data.length < 10) {
          getData({ pageIndex: _pageIndex + 1, log: param ? param.log : log });
        }
      });
  };

  useEffect(() => {
    setLoading(true);
    sheetAjax
      .getWorksheetInfo({
        getRules: true,
        getTemplate: true,
        worksheetId: control.dataSource,
        relationWorksheetId: recordInfo.worksheetId,
      })
      .then(res => {
        res.template.controls = replaceControlsTranslateInfo(
          recordInfo.appId,
          control.dataSource,
          res.template.controls,
        );
        let _column = showControls.map(key => {
          let _cont = res.template.controls.concat(SYSTEM_CONTROL).find(l => l.controlId === key);
          const visible = _cont ? controlState(_cont).visible : false;

          return visible
            ? {
                title: _cont ? _cont.controlName : '',
                width: 200,
                dataIndex: key,
                key: key,
                render: (value, record) => {
                  if (record.type === 'update') {
                    let oldValue = record.oldValue[key] ? [record.oldValue[key]] : [];
                    let newValue = record.newValue[key] ? [record.newValue[key]] : [];

                    if (_.startsWith(record.oldValue[key], '[')) {
                      oldValue = safeParse(record.oldValue[key], 'array');
                    }

                    if (_.startsWith(record.newValue[key], '[')) {
                      newValue = safeParse(record.newValue[key], 'array');
                    }

                    let deleteValue = _.difference(oldValue, newValue);
                    let addValue = _.difference(newValue, oldValue);
                    let defaultValue = _.intersection(newValue, oldValue);

                    if (_cont && Object.keys(TEXT_FIELD_SHOWTEXT_TYPE).find(l => l == _cont.type)) {
                      deleteValue = _.differenceBy(oldValue, newValue, TEXT_FIELD_SHOWTEXT_TYPE[_cont.type]);
                      addValue = _.differenceBy(newValue, oldValue, TEXT_FIELD_SHOWTEXT_TYPE[_cont.type]);
                      defaultValue = _.intersectionBy(newValue, oldValue, TEXT_FIELD_SHOWTEXT_TYPE[_cont.type]);
                    }

                    return (
                      <React.Fragment>
                        {renderUpdataList(deleteValue, _cont, 'remove')}
                        {renderUpdataList(addValue, _cont, 'add')}
                        {renderUpdataList(defaultValue, _cont, 'update')}
                      </React.Fragment>
                    );
                  }
                  let cell = {
                    ..._cont,
                    value: value,
                    value2: value,
                  };

                  let content = cell.type === 27 ? null : renderText(cell);

                  if (content) {
                    return <MaskCell cell={cell} />;
                  } else {
                    return renderSpecial(cell, record.type);
                  }
                },
              }
            : null;
        });
        setColumns(_column.filter(l => !!l));
        let _dataNew = safeParse(safeParse(prop.newValue).rows, 'array');
        let _dataOld = safeParse(safeParse(prop.oldValue).rows, 'array');
        let _prop = {
          ...prop,
        };
        if (_.startsWith(prop.newValue, '{')) {
          _prop.newValue = JSON.stringify(_dataNew.map(l => l.recordId));
          _prop.oldValue = JSON.stringify(_dataOld.map(l => l.recordId));
        }
        setLog(_prop);
        getData({ pageIndex: 1, log: _prop });
      });
    // 组装columns
  }, []);

  const renderSpecial = (cell, editRowType) => {
    try {
      const { type, value2, value } = cell;
      if (!value2) return null;
      if (value2.length === 0) return null;
      let _value = value2;
      if (typeof value2 === 'string' && _.startsWith(value2, '[')) {
        _value = safeParse(value2);
      }
      if (type === 42) {
        _value =
          _value && _value.hasOwnProperty('server')
            ? [_value]
            : [
                {
                  server: _value,
                },
              ];
        return (
          <WorksheetRecordLogThumbnail
            oldList={editRowType === 'remove' ? _value : []}
            newList={editRowType === 'add' ? _value : []}
            defaultList={editRowType === 'update' ? _value : []}
            type={type}
            recordInfo={recordInfo}
            control={cell}
          />
        );
      }
      if (type === 14) {
        return (
          <WorksheetRecordLogThumbnail
            oldList={editRowType === 'remove' ? _value : []}
            newList={editRowType === 'add' ? _value : []}
            defaultList={editRowType === 'update' ? _value : []}
            type={type}
            recordInfo={recordInfo}
            control={cell}
          />
        );
      }
      if (type === 29 && _.startsWith(value, '{')) {
        const info = safeParse(value);
        let _rows = safeParse(info.rows, 'array');

        return _rows.map(item => {
          let _value = item.name || _l('未命名');

          return (
            <span
              className={`rectTag ${
                editRowType === 'add'
                  ? 'newBackground'
                  : editRowType === 'remove'
                  ? 'oldBackground'
                  : 'defaultBackground'
              }`}
            >
              {cell.dataSource === info.worksheetId
                ? renderText({ ...cell.sourceControl, value: item.name }) || _value
                : _value}
            </span>
          );
        });
      }

      switch (type) {
        case 36:
          _value = String(_value) === '1' ? '☑' : '☐';
          break;
        case 35:
          const titleControl = cell.relationControls.find(l => l.controlId === cell.sourceTitleControlId);
          _value = titleControl
            ? renderText({
                ...titleControl,
                value: [11].includes(titleControl.type) ? JSON.stringify([value]) : value,
              }) || value
            : value;
          break;
        case 27:
          _value = _value.map(l => getDepartmentName(cell, l)).join('、');
          break;
        default:
          break;
      }

      return typeof _value === 'string' ? (
        <span
          className={`rectTag ${
            editRowType === 'add' ? 'newBackground' : editRowType === 'remove' ? 'oldBackground' : 'defaultBackground'
          }`}
        >
          {_value}
        </span>
      ) : null;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const renderUpdataList = (list, control, type) => {
    return list.map((item, index) => {
      let cell = {
        ...control,
        value: typeof item !== 'string' ? JSON.stringify([item]) : item,
        value2: [42, 11, 10].includes(control.type) ? item : [item],
      };
      let content = cell.type === 27 ? null : renderText(cell);

      if (content) {
        return (
          <React.Fragment key={`worksheetRecordLogSubTableUpdataItem-${type}-${control.controlId}-${index}`}>
            <span className={`rectTag ${UPDATA_ITEM_CLASSNAME_BY_TYPE[type]}`}>
              <MaskCell cell={cell} />
            </span>
          </React.Fragment>
        );
      } else {
        return (
          <React.Fragment key={`worksheetRecordLogSubTableUpdataItem-${type}-${control.controlId}-${index}`}>
            {renderSpecial(cell, type)}
          </React.Fragment>
        );
      }
    });
  };

  const handleScrollEnd = _.debounce(() => {
    if (loadEnd) return;
    setLoading(true);

    getData();
  }, 500);

  const renderEmpty = () => (
    <Empty
      imageStyle={{
        height: 40,
      }}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={<span>{columns.length ? _l('无数据，或是移除记录暂不支持查看详情') : _l('暂无权限查看')}</span>}
    ></Empty>
  );

  return (
    <ScrollView className="flex" onScrollEnd={handleScrollEnd}>
      {!columns.length ? (
        renderEmpty()
      ) : (
        <ConfigProvider renderEmpty={renderEmpty}>
          <Table
            loading={loading}
            className="worksheetRecordLogSubTable"
            rowClassName={record => `worksheetRecordLogSubTableRow ${record.type}`}
            rowKey={record => `worksheetRecordLogSubTableRow-${record.rowid}`}
            columns={columns}
            dataSource={data}
            scroll={{ x: 1300 }}
            pagination={false}
            bordered={true}
          />
        </ConfigProvider>
      )}
    </ScrollView>
  );
}
export default WorksheetRecordLogSubTable;
