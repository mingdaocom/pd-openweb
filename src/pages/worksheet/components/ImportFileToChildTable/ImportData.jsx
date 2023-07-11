import React, { useState, Fragment } from 'react';
import { getWithToken, postWithToken } from 'worksheet/util';
import { Dropdown } from 'ming-ui';
import PreviewTable from './PreviewTable';
import styled from 'styled-components';
import UploadFile from 'worksheet/components/DialogImportExcelCreate/DialogUpload/UploadFile';
import { arrayOf, func, shape, string } from 'prop-types';
import _ from 'lodash';
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

function parseText(text, splitterType = 1) {
  const splitter = ['\t', ';', '|', ',', '|', ' '][splitterType - 1];
  return text
    .split(/\r\n|\n/)
    .map(line => (line || '').split(splitter))
    .filter(line => !_.isEmpty(line.filter(c => !_.isUndefined(c) && c !== '')));
}

export default function ImportData(props) {
  const { projectId, worksheetId, controls, onParseExcel, onParsePaste } = props;
  const [activeType, setActiveType] = useState(0);
  const [splitCharType, setSplitCharType] = useState(1);
  return (
    <Fragment>
      <Header>
        <span className="title">{_l('导入数据')}</span>
        <div
          className="tabs"
          onPaste={e => {
            if (activeType !== 1) {
              return;
            }
            const clipboardData = e.clipboardData || window.clipboardData;
            const text = clipboardData.getData('text');
            onParsePaste(parseText(text));
          }}
        >
          {Tabs.map((tab, index) => (
            <span
              key={index}
              className={tab.value === activeType ? 'tab active' : 'tab'}
              onClick={() => setActiveType(tab.value)}
            >
              {tab.name}
            </span>
          ))}
        </div>
      </Header>
      <Content>
        {activeType === 0 && (
          <Fragment>
            <UploadFile
              fileUploaded={async file => {
                const res = await getWithToken(
                  `${md.global.Config.WorksheetDownUrl}/Import/PreviewSubtable`,
                  { worksheetId, tokenType: 7 },
                  {
                    worksheetId,
                    filePath: file.url,
                  },
                );
                if (_.get(res, 'data.data.rows')) {
                  onParseExcel(res.data.data, file.url);
                } else {
                  alert(_l('Excel文件解析失败！'), 2);
                }
              }}
            />
          </Fragment>
        )}
        {activeType === 1 && (
          <div>
            <PasteHeader>
              <div className="Font13 Gray_75">
                {_l('已隐藏不可导入字段。使用ctrl+v从excel中粘贴数据，ctr+z撒销上次操作')}
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
                <i className="infoIcon icon icon-info_outline Font14 Gray_bd"></i>
              </div>
            </PasteHeader>
            <div style={{ height: 400 }}>
              <PreviewTable disableYScroll controls={controls} />
            </div>
          </div>
        )}
      </Content>
    </Fragment>
  );
}

ImportData.propTypes = {
  worksheetId: string,
  controls: arrayOf(shape({})),
  onParseExcel: func,
  onParsePaste: func,
};
