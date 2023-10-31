import React, { useState, Fragment, useRef, useCallback, useEffect } from 'react';
import _ from 'lodash';
import { getWithToken } from 'worksheet/util';
import { usePasteText } from 'worksheet/hooks';
import { Dropdown, Button, Tooltip } from 'ming-ui';
import { useKey } from 'react-use';
import PreviewTable from './PreviewTable';
import styled from 'styled-components';
import UploadFile from 'worksheet/components/DialogImportExcelCreate/DialogUpload/UploadFile';
import { arrayOf, func, number, shape, string } from 'prop-types';

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
    color: #333;
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
    font-size: 14px;
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
`;

function parseText(text, splitCharType = 1) {
  const splitter = ['\t', ':', '|', ',', ' '][splitCharType - 1];
  return text
    .split(/\r\n|\n/)
    .map(line =>
      (line || '')
        .split(splitter)
        .map(cellValue =>
          splitCharType === 1 && cellValue.indexOf('\n') > -1 && /^"(.|\n)*"$/.test(cellValue)
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
  const isMac = navigator.userAgent.indexOf('Mac OS') > 0;
  const ctrlChar = isMac ? 'Command' : 'Ctrl';
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
  useKey(
    e => _.includes(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'z', 'Tab'], e.key),
    e => {
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
      if (isEditing) {
        return;
      }
      if (!isEditing && !_.isUndefined(activeIndex) && e.key === 'Enter') {
        setIsEditing(true);
        return;
      }
      if (e.key === 'ArrowLeft' && activeIndex % controls.length === 0) {
        return;
      }
      if (e.key === 'ArrowRight' && (activeIndex + 1) % controls.length === 0) {
        return;
      }
      let newActiveIndex =
        activeIndex +
        ({
          ArrowUp: controls.length * -1,
          ArrowDown: controls.length * 1,
          ArrowLeft: -1,
          ArrowRight: 1,
        }[e.key] || 0);
      if (newActiveIndex < 0) {
        return;
      }
      if (newActiveIndex > controls.length * (data.length + 1) - 1) {
        return;
      }
      setActiveIndex(newActiveIndex);
    },
  );
  return (
    <div>
      <PasteHeader>
        <div className="Font13 Gray_75">
          {_l(`已隐藏不可导入字段。使用 ${ctrlChar} + V 从 Excel 中粘贴数据，${ctrlChar} + Z 撒销上次操作`)}
        </div>
        <div>
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
                  if (e.key === 'Tab') {
                    e.preventDefault();
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    updateCellDataByIndex(index, e.target.value.trim());
                    setIsEditing(false);
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setIsEditing(false);
                  }
                }}
              />
            ) : (
              <div title={_.get(data, `${rowIndex}.${columnIndex}`)} className="ellipsis">
                {_.get(data, `${rowIndex}.${columnIndex}`)}
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
  return (
    <Fragment>
      <Header>
        <span className="title">{_l('导入数据')}</span>
        <div className="tabs">
          {Tabs.map((tab, index) => (
            <span
              key={index}
              className={tab.value === importDataActiveType ? 'tab active' : 'tab'}
              onClick={() => setImportDataActiveType(tab.value)}
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
              fileUploaded={async file => {
                const res = await getWithToken(
                  `${md.global.Config.WorksheetDownUrl}/Import/PreviewSubtable`,
                  { worksheetId, tokenType: 7 },
                  {
                    worksheetId,
                    filePath: file.url.replace(/\?.+/, ''),
                  },
                );
                if (_.get(res, 'data.data.rows')) {
                  onParseExcel(res.data.data, file.url);
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
