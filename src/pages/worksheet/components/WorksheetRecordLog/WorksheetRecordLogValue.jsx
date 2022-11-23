import React, { useState, useEffect, useRef } from 'react';
import { Dialog, Icon } from 'ming-ui';
import { Table } from 'antd';
import Trigger from 'rc-trigger';
import { getClassNameByExt, formatFileSize, browserIsMobile } from 'src/util';
import cx from 'classnames';
import './WorksheetRecordLogValue.less';
import RecordInfoWrapper from 'src/pages/worksheet/common/recordInfo/RecordInfoWrapper';
import _ from 'lodash';
import sheetAjax from 'src/api/worksheet';
import renderText from 'src/pages/worksheet/components/CellControls/renderText.js';
import { SYSTEM_CONTROL } from 'src/pages/widgetConfig/config/widget';
import { diffChars } from 'diff';

const TEXT_FIELD = {
  26: 'accountId',
  48: 'departmentId',
  27: 'departmentId',
  42: 'key',
  30: 'SHEET_FIELD',
};

// type: 默认cicrle 带border-raduis ； rect 矩形
function WorksheetRecordLogSelectTags(props) {
  const {
    oldValue,
    newValue,
    defaultValue = [],
    type = 'circle',
    needPreview,
    data,
    control,
    onlyNew = false,
    isChangeValue = false,
  } = props;
  const [preview, setPreview] = useState(false);
  const [preType, setPreType] = useState(undefined);
  const [recordInfo, setRecordInfo] = useState(undefined);
  const clickHandle = (type, index) => {
    if (browserIsMobile()) return;
    setPreview(true);
    setPreType({
      type: type,
      index: index,
    });
  };

  useEffect(() => {
    if (needPreview) {
      let oldObj = data.oldValue ? JSON.parse(data.oldValue) : {};
      let newObj = data.newValue ? JSON.parse(data.newValue) : {};
      let Record = {
        appId: oldObj.appId || newObj.appId,
        worksheetId: oldObj.worksheetId || newObj.worksheetId,
        viewId: oldObj.viewId || newObj.viewId,
        delList: [],
        addList: [],
        defList: [],
      };
      let oldList = oldObj.rows ? JSON.parse(oldObj.rows) : [];
      let newList = newObj.rows ? JSON.parse(newObj.rows) : [];
      if (onlyNew) {
        Record.delList = newList;
        Record.addList = newList;
        Record.defList = newList;
      } else {
        Record.delList = _.differenceBy(oldList, newList, 'recordId');
        Record.addList = _.differenceBy(newList, oldList, 'recordId');
        Record.defList = _.intersectionBy(oldList, newList, 'recordId');
      }
      setRecordInfo(Record);
    }
  }, []);

  const renderText = item => {
    if (control) {
      const { type, enumDefault } = control;
      if (type === 3) {
        return enumDefault === 1 ? item.replace(/\+86/, '') : item;
      }
    }
    return item;
  };

  return (
    <React.Fragment>
      <div className={`WorksheetRocordLogSelectTags paddingLeft27 ${isChangeValue ? 'flexDirectionRever' : ''}`}>
        {oldValue.map((item, index) => {
          return item ? (
            <span
              key={`WorksheetRocordLogSelectTag-oldValue-${item}-${index}`}
              className={`WorksheetRocordLogSelectTag oldValue ${isChangeValue ? 'noneTextLineThrough' : ''} ${
                needPreview && !browserIsMobile() ? 'hoverHighline' : ''
              }`}
              style={type === 'circle' ? { borderRadius: '10px' } : {}}
              onClick={needPreview ? () => clickHandle('old', index) : () => {}}
            >
              {isChangeValue ? '-' + renderText(item) : renderText(item)}
            </span>
          ) : null;
        })}
        {newValue.map((item, index) => {
          return item ? (
            <span
              key={`WorksheetRocordLogSelectTag-newValue-${item}-${index}`}
              className={`WorksheetRocordLogSelectTag newValue ${needPreview && !browserIsMobile() ? 'hoverHighline' : ''}`}
              style={type === 'circle' ? { borderRadius: '10px' } : {}}
              onClick={needPreview ? () => clickHandle('new', index) : () => {}}
            >
              {isChangeValue ? '+' + renderText(item) : renderText(item)}
            </span>
          ) : null;
        })}
        {defaultValue.map((item, index) => {
          return item ? (
            <span
              key={`WorksheetRocordLogSelectTag-defaultValue-${item}-${index}`}
              className={`WorksheetRocordLogSelectTag defaultValue ${needPreview && !browserIsMobile() ? 'hoverHighline' : ''}`}
              style={type === 'circle' ? { borderRadius: '10px' } : {}}
              onClick={needPreview ? () => clickHandle('default', index) : () => {}}
            >
              {renderText(item)}
            </span>
          ) : null;
        })}
      </div>
      {preview && preType && recordInfo && (
        <RecordInfoWrapper
          visible
          allowAdd={false}
          appId={recordInfo.appId}
          viewId={recordInfo.viewId}
          from={1}
          hideRecordInfo={() => {
            setPreview(false);
          }}
          recordId={
            preType.type === 'old'
              ? recordInfo.delList[0].recordId
              : preType.type === 'new'
              ? recordInfo.addList[0].recordId
              : recordInfo.defList[0].recordId
          }
          worksheetId={recordInfo.worksheetId}
        />
      )}
    </React.Fragment>
  );
}

const renderDiffText = props => {
  if (props.added) {
    return (
      <span key={`renderDiffText-${props.value}`} className="added">
        {props.value}
      </span>
    );
  } else if (props.removed) {
    return (
      <span key={`renderDiffText-${props.value}`} className="removed">
        {props.value}
      </span>
    );
  } else {
    return props.value;
  }
};

function WorksheetRecordLogDiffText(props) {
  const { oldValue, newValue, type = 'text', control } = props;
  const [open, setOpen] = useState(false);
  const [needOpen, setNeedOpen] = useState(false);
  const [dialog, setDialog] = useState(false);
  const textRef = useRef(null);
  let diff = null;
  if (control && control.enumDefault === 2) {
    return (
      <WorksheetRecordLogSelectTags
        type="rect"
        oldValue={[oldValue]}
        newValue={[newValue]}
        needPreview={false}
        control={control}
      />
    );
  }
  if (type === 'rich_text') {
    diff = diffChars(oldValue.replace(/<[^>]+>|&[^>]+;/g, '').trim(), newValue.replace(/<[^>]+>|&[^>]+;/g, '').trim());
  } else {
    diff = diffChars(oldValue, newValue);
  }

  useEffect(() => {
    let textComputeStyle = getComputedStyle(textRef.current);
    let textHeight = Number(textComputeStyle.height.replace('px', ''));
    let lineHeight = Number(textComputeStyle.lineHeight.replace('px', ''));
    if (textHeight > lineHeight * 5) {
      setNeedOpen(true);
    }
  }, []);

  const clickHandle = () => {
    setOpen(!open);
  };

  const closeDialog = () => setDialog(false);

  return (
    <React.Fragment>
      <div
        ref={textRef}
        className={cx(`WorksheetRecordLogDiffText paddingLeft27`, {
          mobileLogDiffText: browserIsMobile(),
          height100: browserIsMobile() && needOpen && !open,
          noHeight: browserIsMobile() && needOpen && open,
          ellipsis5: needOpen && !open,
        })}
      >
        {diff && diff.map(item => renderDiffText(item))}
      </div>
      {(needOpen || type === 'rich_text') && (
        <div className="WorksheetRecordLogDiffTextBottomButtons paddingLeft27">
          {needOpen ? (
            <span className="WorksheetRecordLogOpen" onClick={clickHandle}>
              {open ? _l('收起') : _l('展开')}
            </span>
          ) : (
            <span></span>
          )}
          {type === 'rich_text' ? (
            <span className={cx('WorksheetRecordLogOpen', { hideEle: browserIsMobile() })} onClick={() => setDialog(true)}>
              {_l('以富文本查看')}
            </span>
          ) : (
            <span></span>
          )}
        </div>
      )}
      {type === 'rich_text' && (
        <Dialog
          title={
            <div className="richTextHeader">
              <div className="leftCon">
                <div className="title">{_l('修改前')}</div>
              </div>
              <div className="rightCon">
                <div className="title">{_l('修改后')}</div>
              </div>
            </div>
          }
          style={{ width: '90%', height: '90%', minHeight: '90%' }}
          className="richTextDiffDialog"
          visible={dialog}
          onCancel={closeDialog}
        >
          <div className="richTextContent flexRow flex">
            <div className="leftCon">
              <div className="contentCon" dangerouslySetInnerHTML={{ __html: oldValue }} />
            </div>
            <div className="rightCon">
              <div className="contentCon" dangerouslySetInnerHTML={{ __html: newValue }} />
            </div>
          </div>
        </Dialog>
      )}
    </React.Fragment>
  );
}

function PicturePreview(props) {
  const { url, name, filesize, isPicture } = props;
  return (
    <div className="picturePreview">
      {isPicture && (
        <div className="imgCon">
          <img src={url} className="picturePreviewImg" />
        </div>
      )}
      <div className="fileDetail">
        <p className="filename">{name}</p>
        {filesize && <p className="fileSize">{formatFileSize(filesize)}</p>}
      </div>
    </div>
  );
}

function WorksheetRecordLogThumbnail(props) {
  const { oldList = [], newList = [], defaultList = [], type, recordInfo, control } = props;
  const [open, setOpen] = useState(false);
  let count = oldList.length + newList.length + defaultList.length;
  if (md.global.Config.isLocal) {
    return (
      <React.Fragment>
        <WorksheetRecordLogSelectTags
          type="rect"
          oldValue={oldList
            .filter((m, index) => open || index < 8)
            .map(l => (type === 14 ? l.originalFilename + l.ext : _l('签名.jpg')))}
          newValue={newList
            .filter((m, index) => open || index < 8 - oldList.length)
            .map(l => (type === 14 ? l.originalFilename + l.ext : _l('签名.jpg')))}
          defaultValue={defaultList
            .filter((m, index) => open || index < 8 - oldList.length - newList.length)
            .map(l => (type === 14 ? l.originalFilename + l.ext : _l('签名.jpg')))}
        />
        {count > 8 && (
          <div>
            <span onClick={() => setOpen(!open)} className="WorksheetRecordLogOpen paddingLeft27">
              {open ? _l('收起') : _l('展开')}
            </span>
          </div>
        )}
      </React.Fragment>
    );
  }

  const renderList = (list, bgColor) => {
    if (browserIsMobile()) {
      return list.map(item => (
        <span
          key={`WorksheetRecordLogThumbnailItem-type-${type === 14 ? item.fileID : item.key}`}
          className={`WorksheetRecordLogThumbnailItem ${bgColor}`}
        >
          {type === 42 || File.isPicture(item.ext) ? (
            <span className="itemImgCon">
              <img
                className="itemImg"
                src={(item.previewUrl || item.server || '').replace(
                  /imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/,
                  'imageView2/2/h/20',
                )}
              />
            </span>
          ) : (
            <span
              className={`itemImgCon itemImg fileIcon ${getClassNameByExt(item.ext)}`}
              title={item.originalFilename + (item.ext || '')}
              style={{ width: '20px' }}
            />
          )}

          <span className="filename overflow_ellipsis">{type === 14 ? item.originalFilename : _l('签名')}</span>
          {type === 14 ? item.ext : '.jpg'}
        </span>
      ));
    }
    return list.map((item, index) => (
      <Trigger
        action={['hover']}
        getPopupContainer={() => document.body}
        destroyPopupOnHide
        mouseEnterDelay={0.4}
        popupAlign={{
          points: ['tl', 'bl'],
          offset: [0, 4],
          overflow: {
            adjustY: true,
            adjustX: true,
          },
        }}
        popup={
          <PicturePreview
            url={
              type === 14
                ? item.previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/2/h/160')
                : item.server.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/2/h/160')
            }
            name={type === 14 ? item.originalFilename + item.ext : _l('签名.jpg')}
            filesize={type === 14 ? item.filesize : undefined}
            isPicture={type === 14 ? File.isPicture(item.ext) : true}
          />
        }
      >
        <span
          key={`WorksheetRecordLogThumbnailItem-type-${type === 14 ? item.fileID : item.key}`}
          className={`WorksheetRecordLogThumbnailItem ${bgColor}`}
        >
          {type === 42 || File.isPicture(item.ext) ? (
            <span className="itemImgCon">
              <img
                className="itemImg"
                src={(item.previewUrl || item.server || '').replace(
                  /imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/,
                  'imageView2/2/h/20',
                )}
              />
            </span>
          ) : (
            <span
              className={`itemImgCon itemImg fileIcon ${getClassNameByExt(item.ext)}`}
              title={item.originalFilename + (item.ext || '')}
              style={{ width: '20px' }}
            />
          )}

          <span className="filename overflow_ellipsis">{type === 14 ? item.originalFilename : _l('签名')}</span>
          {type === 14 ? item.ext : '.jpg'}
        </span>
      </Trigger>
    ));
  };

  return (
    <div className="WorksheetRecordLogThumbnail paddingLeft27">
      {renderList(
        oldList.filter((m, index) => open || index < 8),
        'oldBackground',
      )}
      {renderList(
        newList.filter((m, index) => open || index < 8 - oldList.length),
        'newBackground',
      )}
      {renderList(
        defaultList.filter((m, index) => open || index < 8 - oldList.length - newList.length),
        'defaultBackground',
      )}
      {count > 8 && (
        <div>
          <span onClick={() => setOpen(!open)} className="WorksheetRecordLogOpen">
            {open ? _l('收起') : _l('展开')}
          </span>
        </div>
      )}
    </div>
  );
}

function WorksheetRecordLogSubTable(props) {
  const { control, prop, recordInfo, extendParam } = props;
  const { relationControls, showControls } = control;
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  useEffect(() => {
    setLoading(true);
    sheetAjax
      .getWorksheetInfo({
        getRules: true,
        getTemplate: true,
        worksheetId: control.dataSource,
      })
      .then(res => {
        let _column = showControls.map(key => {
          let _cont = res.template.controls.concat(SYSTEM_CONTROL).find(l => l.controlId === key);
          return {
            title: _cont ? _cont.controlName : '',
            width: 200,
            dataIndex: key,
            key: key,
            render: (value, record) => {
              if (record.type === 'update') {
                let oldValue = record.oldValue[key] ? [record.oldValue[key]] : [];
                let newValue = record.newValue[key] ? [record.newValue[key]] : [];
                if (_.startsWith(record.oldValue[key], '[')) {
                  oldValue = JSON.parse(record.oldValue[key]);
                }
                if (_.startsWith(record.newValue[key], '[')) {
                  newValue = JSON.parse(record.newValue[key]);
                }
                let deleteValue = _.difference(oldValue, newValue);
                let addValue = _.difference(newValue, oldValue);
                let defaultValue = _.intersection(newValue, oldValue);
                if (_cont && Object.keys(TEXT_FIELD).find(l => l == _cont.type)) {
                  deleteValue = _.differenceBy(oldValue, newValue, TEXT_FIELD[_cont.type]);
                  addValue = _.differenceBy(newValue, oldValue, TEXT_FIELD[_cont.type]);
                  defaultValue = _.intersectionBy(newValue, oldValue, TEXT_FIELD[_cont.type]);
                }
                return (
                  <React.Fragment>
                    {deleteValue.map(item => {
                      let cell = {
                        ..._cont,
                        value: typeof item !== 'string' ? JSON.stringify([item]) : item,
                        value2: [item],
                      };
                      let content = renderText(cell);
                      if (content) {
                        return <span className="rectTag oldBackground">{content}</span>;
                      } else {
                        return renderSpecial(cell, 'remove');
                      }
                    })}
                    {addValue.map(item => {
                      let cell = {
                        ..._cont,
                        value: typeof item !== 'string' ? JSON.stringify([item]) : item,
                        value2: [item],
                      };
                      let content = renderText(cell);
                      if (content) {
                        return <span className="rectTag newBackground">{content}</span>;
                      } else {
                        return renderSpecial(cell, 'add');
                      }
                    })}
                    {defaultValue.map(item => {
                      let cell = {
                        ..._cont,
                        value: typeof item !== 'string' ? JSON.stringify([item]) : item,
                        value2: [item],
                      };
                      let content = renderText(cell);
                      if (content) {
                        return <span className="rectTag defaultBackground">{content}</span>;
                      } else {
                        return renderSpecial(cell, 'update');
                      }
                    })}
                  </React.Fragment>
                );
              }
              let cell = {
                ..._cont,
                value: value,
                value2: value,
              };
              let content = renderText(cell);
              if (content) {
                return content;
              } else {
                return renderSpecial(cell, record.type);
              }
            },
          };
        });
        setColumns(_column);
        let _dataNew = JSON.parse(prop.newValue || '{}').rows ? JSON.parse(JSON.parse(prop.newValue || '{}').rows) : [];
        let _dataOld = JSON.parse(prop.oldValue || '{}').rows ? JSON.parse(JSON.parse(prop.oldValue || '{}').rows) : [];
        let _prop = {
          ...prop,
        };
        if (_.startsWith(prop.newValue, '{')) {
          _prop.newValue = JSON.stringify(_dataNew.map(l => l.recordId));
          _prop.oldValue = JSON.stringify(_dataOld.map(l => l.recordId));
        }
        sheetAjax
          .getDetailTableLog({
            worksheetId: recordInfo.worksheetId,
            rowId: recordInfo.rowId,
            uniqueId: extendParam.uniqueId,
            createTime: extendParam.createTime,
            lastMark: extendParam.createTime,
            requestType: extendParam.requestType,
            objectType: extendParam.objectType,
            log: {
              ..._prop,
            },
          })
          .then(data => {
            setLoading(false);
            const { oldRows, newRows } = data;
            let oldList = JSON.parse(oldRows);
            let newList = JSON.parse(newRows);
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
            setData(_.sortBy(defaultList.concat(add, remove), ['ctime']));
          });
      });
    // 组装columns
  }, []);

  const renderSpecial = (cell, editRowType) => {
    const { type, value2, value } = cell;
    if (!value2) return null;
    if (value2.length === 0) return null;
    let _value = value2;
    if (typeof value2 === 'string' && _.startsWith(value2, '[')) {
      _value = JSON.parse(value2);
    }
    if (type === 42) {
      _value = [
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
      let _rows = JSON.parse(value).rows ? JSON.parse(JSON.parse(value).rows) : [];
      return _rows.map(item => {
        let _value = item.name;
        return (
          <span
            className={`rectTag ${
              editRowType === 'add' ? 'newBackground' : editRowType === 'remove' ? 'oldBackground' : 'defaultBackground'
            }`}
          >
            {_value}
          </span>
        );
      });
    }
    return (
      <span
        className={`rectTag ${
          editRowType === 'add' ? 'newBackground' : editRowType === 'remove' ? 'oldBackground' : 'defaultBackground'
        }`}
      >
        {_value}
      </span>
    );
  };

  return (
    <Table
      loading={loading}
      className="worksheetRecordLogSubTable"
      rowClassName={record => {
        return `worksheetRecordLogSubTableRow ${record.type}`;
      }}
      columns={columns}
      dataSource={data}
      scroll={{ x: 1300 }}
      pagination={false}
      bordered={true}
      locale={{
        Empty: {
          description: _l('暂无数据'),
        },
      }}
    />
  );
}

function WorksheetRecordLogSubList(props) {
  const { control, prop } = props;
  const { newValue, oldValue, name } = prop;
  const newData = newValue ? JSON.parse(newValue) : [];
  const oldData = oldValue ? JSON.parse(oldValue) : [];
  const [dialog, setDialog] = useState(false);
  const [listCount, setListCount] = useState({
    add: [],
    update: [],
    remove: [],
  });
  useEffect(() => {
    setListCount({
      add: _.difference(newData, oldData),
      update: _.intersection(newData, oldData),
      remove: _.difference(oldData, newData),
    });
  }, []);
  return (
    <div className="worksheetRecordLogSubList">
      {listCount.add.length !== 0 && (
        <p className="worksheetRecordLogSubListItem">{_l('新增了%0条', listCount.add.length)}</p>
      )}
      {listCount.update.length !== 0 && (
        <p className="worksheetRecordLogSubListItem">{_l('更新了%0条', listCount.update.length)}</p>
      )}
      {listCount.remove.length !== 0 && (
        <p className="worksheetRecordLogSubListItem">{_l('移除了%0条', listCount.remove.length)}</p>
      )}
      <span className={cx('WorksheetRecordLogOpen', { hideEle: browserIsMobile() })} onClick={() => setDialog(true)}>
        {_l('查看详情')}
      </span>
      <Dialog
        className="worksheetRecordLogSubDialog"
        style={{ width: '90%', height: '90%', minHeight: '90%', maxWidth: '1600px' }}
        visible={dialog}
        onCancel={() => setDialog(false)}
      >
        <h3 className="tableTitle">{name}</h3>
        <WorksheetRecordLogSubTable {...props} />
      </Dialog>
    </div>
  );
}

function TriggerSelect(props) {
  const { text, childNode, onSelect } = props;
  const [visible, setVisible] = useState(false);
  return (
    <Trigger
      popupVisible={visible}
      onPopupVisibleChange={visible => {
        setVisible(visible);
      }}
      action={['click']}
      popupAlign={{ points: ['tl', 'bl'] }}
      popup={
        <span
          onClick={() => {
            onSelect();
            setVisible(false);
          }}
          className="triggerSelectPopup"
        >
          {text}
        </span>
      }
    >
      {childNode}
    </Trigger>
  );
}

export {
  WorksheetRecordLogSelectTags,
  WorksheetRecordLogDiffText,
  WorksheetRecordLogThumbnail,
  WorksheetRecordLogSubList,
  TriggerSelect,
};
