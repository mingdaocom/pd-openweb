import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useKey } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { arrayOf, func, number, shape, string } from 'prop-types';
import styled from 'styled-components';
import { Button, Dropdown, Tooltip } from 'ming-ui';
import UploadFile from 'worksheet/components/DialogImportExcelCreate/DialogUpload/UploadFile';
import { usePasteText } from 'worksheet/hooks';
import { getWithToken } from 'src/utils/common';
import { isKeyBoardInputChar } from 'src/utils/common';
import PreviewTable from './PreviewTable';

// ctrl Z 撤销最多支持次数
const CACHE_STACK_LENGTH = 20;

const Tabs = [
  { name: _l('Excel导入'), value: 0 },
  { name: _l('粘贴导入'), value: 1 },
];

const Header = styled.div`
  height: 52px;
  line-height: 52px;
  text-align: center;
  position: relative;
  border-bottom: 1px solid rgba(0, 0, 0, 0.09);
  .title {
    position: absolute;
    font-weight: 500;
    left: 24px;
    font-size: 17px;
    color: #151515;
  }
  .tabs {
    display: inline-block;
    .tab {
      cursor: pointer;
      color: #757575;
      display: inline-block;
      padding: 0 5px;
      line-height: 45px;
      border-bottom: 3px solid transparent;
      &.active {
        border-bottom-color: #2196f3;
        color: #2196f3;
      }
      &:first-child {
        margin-right: 30px;
      }
    }
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 24px;
  .uploadExcel {
    height: 100%;
    > div {
      height: 100%;
    }
  }
  .footer {
    text-align: right;
    margin-top: 20px;
  }
  .editingCellInput {
    border: none;
    padding: 0;
    outline: none;
    width: 100%;
    font-size: 13px;
  }
`;

const PasteHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 17px;
  .splitCharDorpDown {
    margin-left: 14px;
    width: 200px;
  }
  .infoIcon {
    margin-left: 5px;
  }
  .right {
    flex-shrink: 0;
  }
`;

const HiddenInput = styled.input`
  border: none;
  opacity: 0;
  width: 1px;
  height: 1px;
`;

function splitCsvRows(csvData, splitter) {
  let rows = [];
  let currentRow = '';
  let inQuotes = false;
  let newlineRegex = /\r\n|\n|\r/;
  let lastCharWasSplitter = false;

  for (let i = 0; i < csvData.length; i++) {
    let char = csvData[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    }

    if (splitter && char === splitter && !inQuotes) {
      currentRow += char;
      lastCharWasSplitter = true;
    } else if (newlineRegex.test(char) && !inQuotes) {
      if (lastCharWasSplitter) {
        currentRow += splitter;
      }
      rows.push(currentRow);
      currentRow = '';
      lastCharWasSplitter = false;
    } else {
      currentRow += char;
      lastCharWasSplitter = false;
    }
  }

  if (currentRow !== '') {
    if (lastCharWasSplitter) {
      currentRow += splitter;
    }
    rows.push(currentRow);
  }

  return rows;
}

function parseText(text, splitCharType = 1) {
  const splitter = ['\t', ':', '|', ',', ' '][splitCharType - 1];
  return splitCsvRows(text, splitter)
    .map(line =>
      (line || '')
        .split(splitter)
        .map(cellValue =>
          splitCharType === 1 && cellValue.indexOf('\n') > -1 && /^"|"$/.test(cellValue)
            ? cellValue.replace(/^"/, '').replace(/"$/, '')
            : cellValue,
        ),
    )
    .filter(line => !_.isEmpty(line.filter(c => !_.isUndefined(c) && c !== '')));
}

function overrideData({ oldData, columnsCount, startRowIndex, startColumnIndex, isClear, changes = [[]] }) {
  const newData = _.cloneDeep(oldData);
  if (isClear) {
    newData[startRowIndex][startColumnIndex] = '';
    return newData;
  }
  let endRowIndex = startRowIndex + changes.length;
  let endColumnIndex = startColumnIndex + Math.max(...changes.map(row => row && row.length).filter(_.identity));
  if (endColumnIndex > columnsCount) {
    endColumnIndex = columnsCount;
  }
  for (let rowIndex = startRowIndex; rowIndex < endRowIndex; rowIndex++) {
    for (let columnIndex = startColumnIndex; columnIndex < endColumnIndex; columnIndex++) {
      if (!_.isArray(newData[rowIndex])) {
        newData[rowIndex] = new Array(columnsCount).fill(undefined);
      }
      newData[rowIndex][columnIndex] = changes[rowIndex - startRowIndex][columnIndex - startColumnIndex];
    }
  }
  return newData;
}

function Input(props) {
  const { className, defaultValue, onChange = () => {}, onBlur = () => {}, onKeyDown = () => {} } = props;
  const inputRef = useRef();
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  return (
    <input
      className={className}
      ref={inputRef}
      defaultValue={defaultValue}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    />
  );
}

Input.propTypes = {
  className: string,
  defaultValue: string,
  onChange: func,
  onBlur: func,
  onKeyDown: func,
};

function PasteEdit(props) {
  const { dialogHeight, importDataActiveType, controls, onParsePaste } = props;
  const [splitCharType, setSplitCharType] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const cacheStoreStack = useRef([[]]);
  const [data, setData] = useState(new Array(11).fill(undefined).map(() => new Array(controls.length).fill(undefined)));
  const valuedData = data.filter(row => !_.isEmpty(row.filter(_.identity)));
  const ctrlChar = window.isMacOs ? 'Command' : 'Ctrl';
  const updateCellDataByIndex = useCallback(
    (index, value) => {
      const rowIndex = Math.floor(index / controls.length);
      const columnIndex = index % controls.length;
      try {
        const pastedData = parseText(value, splitCharType);
        const newData = overrideData({
          oldData: data,
          startRowIndex: rowIndex,
          startColumnIndex: columnIndex,
          columnsCount: controls.length,
          changes: pastedData,
          isClear: !value,
        });
        if (cacheStoreStack.current) {
          const newStack = cacheStoreStack.current.concat([newData]);
          cacheStoreStack.current = newStack.slice(newStack.length > 20 ? newStack.length - CACHE_STACK_LENGTH : 0);
        }
        setData(newData);
      } catch (err) {
        console.error(err);
      }
    },
    [data, splitCharType],
  );
  usePasteText(
    text => {
      if (
        document.activeElement.tagName.toLowerCase() === 'input' &&
        document.activeElement.className.indexOf('inputHelper') < 0
      )
        return;
      if (importDataActiveType !== 1) {
        return;
      }
      if (!_.isUndefined(activeIndex)) {
        updateCellDataByIndex(activeIndex, text);
      }
    },
    [activeIndex],
  );
  useKey(
    e => _.includes(['Backspace'], e.key),
    e => {
      if (isEditing) {
        return;
      }
      if (!_.isUndefined(activeIndex)) {
        updateCellDataByIndex(activeIndex, '');
      }
    },
  );
  function switchCell(e, { ignoreEditing } = {}) {
    const isRight = e.key === 'ArrowRight' || e.key === 'Tab';
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
      e.preventDefault();
      e.stopPropagation();
      (cacheStoreStack.current || []).pop();
      const newData = _.last(cacheStoreStack.current || []);
      if (newData) {
        setData(newData);
      }
      return;
    }
    if (isEditing && !ignoreEditing) {
      return;
    }
    if (!isEditing && !_.isUndefined(activeIndex) && e.key === 'Enter') {
      setIsEditing(true);
      return;
    }
    if (e.key === 'ArrowLeft' && activeIndex % controls.length === 0) {
      return;
    }
    if (isRight && (activeIndex + 1) % controls.length === 0) {
      return;
    }
    let newActiveIndex =
      activeIndex +
      ({
        ArrowUp: controls.length * -1,
        ArrowDown: controls.length * 1,
        ArrowLeft: -1,
        ArrowRight: 1,
        Tab: 1,
      }[e.key] || 0);
    if ((e.metaKey || e.ctrlKey) && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      const columnCount = controls.length;
      newActiveIndex =
        e.key === 'ArrowLeft'
          ? Math.floor(activeIndex / columnCount) * columnCount
          : Math.ceil((activeIndex + 1) / columnCount) * columnCount - 1;
    }
    if (newActiveIndex < 0) {
      return;
    }
    if (newActiveIndex > controls.length * (data.length + 1) - 1) {
      return;
    }
    setActiveIndex(newActiveIndex);
  }
  useKey(e => _.includes(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'z', 'Tab'], e.key), switchCell);
  return (
    <div>
      <PasteHeader>
        <div className="Font13 Gray_75">
          {_l('已隐藏不可导入字段。使用 %0 + V 从 Excel 中粘贴数据，%0 + Z 撒销上次操作', ctrlChar)}
        </div>
        <div className="right">
          {_l('分隔符')}
          <Dropdown
            className="splitCharDorpDown"
            border
            value={splitCharType}
            data={[
              {
                text: 'Tab',
                value: 1,
              },
              {
                text: _l('分号(:)'),
                value: 2,
              },
              {
                text: _l('竖线(|)'),
                value: 3,
              },
              {
                text: _l('逗号(,)'),
                value: 4,
              },
              {
                text: _l('空格'),
                value: 5,
              },
            ]}
            onChange={setSplitCharType}
          />
          <Tooltip text={_l('切换分隔符，仅针对新粘贴数据有效，已有数据不会产生影响”')}>
            <i className="infoIcon icon icon-info_outline Font18 Gray_bd"></i>
          </Tooltip>
        </div>
      </PasteHeader>
      <div style={{ height: dialogHeight - 210 }}>
        <PreviewTable
          rowCount={data.length + 1}
          activeIndex={activeIndex}
          controls={controls}
          renderCellContent={({ index, rowIndex, columnIndex }) =>
            index === activeIndex && isEditing ? (
              <Input
                className="editingCellInput"
                defaultValue={_.get(data, `${rowIndex}.${columnIndex}`) || ''}
                onBlur={e => {
                  const newValue = e.target.value;
                  setTimeout(() => {
                    setIsEditing(false);
                    updateCellDataByIndex(index, newValue);
                  }, 80);
                }}
                onKeyDown={e => {
                  e.stopPropagation();
                  if (e.key === 'Enter' || e.key === 'Tab') {
                    e.preventDefault();
                    updateCellDataByIndex(index, e.target.value.trim());
                    setIsEditing(false);
                    switchCell({ key: e.key === 'Tab' ? 'ArrowRight' : 'ArrowDown' }, { ignoreEditing: true });
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setIsEditing(false);
                  }
                }}
              />
            ) : (
              <div
                title={_.get(data, `${rowIndex}.${columnIndex}`)}
                className="ellipsis"
                onKeyDown={e => {
                  if (!(e.metaKey || e.ctrlKey) && isKeyBoardInputChar(e.key)) {
                    updateCellDataByIndex(activeIndex, e.key);
                    e.stopPropagation();
                    setTimeout(() => {
                      setIsEditing(true);
                    }, 0);
                  }
                }}
              >
                {_.get(data, `${rowIndex}.${columnIndex}`)}
                {index === activeIndex && (
                  <HiddenInput
                    className="inputHelper"
                    type="text"
                    autoFocus
                    onCompositionEnd={e => {
                      updateCellDataByIndex(activeIndex, e.target.value);
                      setIsEditing(true);
                    }}
                    onKeyDown={e => {
                      if (e.keyCode !== 229) {
                        return;
                      }
                      e.stopPropagation();
                    }}
                  />
                )}
              </div>
            )
          }
          onCellClick={index => {
            if (index === activeIndex) {
              setIsEditing(true);
            } else {
              setIsEditing(false);
              setActiveIndex(index);
            }
          }}
        />
      </div>
      <div className="footer">
        <Button
          type="primary"
          disabled={_.isEmpty(valuedData)}
          onClick={() => {
            if (_.isEmpty(valuedData)) {
              return;
            }
            onParsePaste(valuedData);
          }}
        >
          {_l('下一步')}
        </Button>
      </div>
    </div>
  );
}

PasteEdit.propTypes = {
  dialogHeight: number,
  importDataActiveType: number,
  controls: arrayOf(shape({})),
  onParsePaste: func,
};

export default function ImportData(props) {
  const {
    projectId,
    dialogHeight,
    importDataActiveType,
    worksheetId,
    controls,
    onParseExcel,
    onParsePaste,
    setImportDataActiveType,
  } = props;
  const [loading, setLoading] = useState(false);
  return (
    <Fragment>
      <Header>
        <span className="title">{_l('导入数据')}</span>
        <div className="tabs">
          {Tabs.map((tab, index) => (
            <span
              key={index}
              className={cx('tab', {
                active: tab.value === importDataActiveType,
              })}
              onClick={() => {
                if (loading) {
                  alert(_l('请先完成文件上传'), 3);
                  return;
                }
                setImportDataActiveType(tab.value);
              }}
            >
              {tab.name}
            </span>
          ))}
        </div>
      </Header>
      <Content>
        {importDataActiveType === 0 && (
          <Fragment>
            <UploadFile
              style={{ height: '100%' }}
              onFilesAdded={() => {
                setLoading(true);
              }}
              fileUploaded={async file => {
                const fileUrl = file.serverName + file.key;
                const data = await getWithToken(
                  `${md.global.Config.WorksheetDownUrl}/Import/PreviewSubtable`,
                  { worksheetId, tokenType: 7 },
                  {
                    worksheetId,
                    filePath: fileUrl.replace(/\?.+/, ''),
                  },
                );
                setLoading(false);
                if (_.get(data, 'rows')) {
                  onParseExcel(data, fileUrl);
                } else {
                  alert(_l('文件解析失败！'), 2);
                }
              }}
            />
          </Fragment>
        )}
        {importDataActiveType === 1 && (
          <PasteEdit
            controls={controls}
            dialogHeight={dialogHeight}
            onParsePaste={onParsePaste}
            importDataActiveType={importDataActiveType}
          />
        )}
      </Content>
    </Fragment>
  );
}

ImportData.propTypes = {
  worksheetId: string,
  dialogHeight: number,
  importDataActiveType: number,
  controls: arrayOf(shape({})),
  onParseExcel: func,
  onParsePaste: func,
  setImportDataActiveType: func,
};
