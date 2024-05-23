import React, { Fragment, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Icon, Button, RadioGroup, LoadDiv } from 'ming-ui';
import { Select, Popover } from 'antd';
import DragMask from 'worksheet/common/DragMask';
import Nav from './Nav';
import Content from './Content';
import langConfig from 'src/common/langConfig';
import appManagementApi from 'src/api/appManagement';

const Wrap = styled.div`
  .header {
    height: 57px;
    padding: 0 20px;
    border-bottom: 1px solid #DDDDDD;
    justify-content: space-between;
    .backHome {
      margin-top: 1px;
      border-bottom: 1px solid transparent;
      &:hover {
        border-color: currentColor;
      }
    }
    .translateWrap {
      padding: 3px 5px;
      border-radius: 3px;
      &:hover {
        background-color: #F5F5F5;
      }
    }
  }
  .content {
    min-height: 0;
  }
  .searchWrap {
    padding: 10px 0;
    border-bottom: 1px solid #f5f5f5;
    margin-right: 15px;
    input {
      padding: 3px;
      border: none;
      min-width: 0;
    }
  }
  .ant-select-selector {
    border-radius: 4px !important;
    box-shadow: none !important;
  }
`;

const PopoverWrap = styled.div`
  width: 450px;
  padding: 15px;
`;

const ContentWrap = styled.div`
  .nodeItem {
    margin-bottom: 15px;
    &:last-child {
      margin-bottom: 0;
    }
    .label {
      width: 120px;
    }
  }
  textarea.ant-input {
    height: 120px;
  }
  .ant-input {
    border-radius: 3px !important;
    box-shadow: none !important;
    &[disabled] {
      color: #333;
    }
  }

  .highlight {
    border-radius: 3px;
    animation-name: shining;
    animation-timing-function: linear;
    animation-duration: 0.3s;
    animation-direction: alternate;
    animation-iteration-count: 1;
    animation-fill-mode: forwards;
  }

  @keyframes shining {
    from {
      background-color: #fff;
    }
    to {
      background-color: #DBEEFD;
    }
  }
`;

const Drag = styled.div(({ left }) => `
  position: absolute;
  z-index: 2;
  left: ${left}px;
  width: 2px;
  height: 100%;
  cursor: ew-resize;
  &:hover {
    border-left: 1px solid #ddd;
  }
`,
);

export default function Edit(props) {
  const { app, langs, langInfo, onBack } = props;
  const [selectNode, setSelectNode] = useState({ ...app, type: 'app' });
  const [selectedKeys, setSelectedKeys] = useState(['app']);
  const [loading, setLoading] = useState(true);
  const [translateData, setTranslateData] = useState([]);
  const [translateStatus, setTranslateStatus] = useState(false);
  const [comparisonLangData, setComparisonLangData] = useState([]);
  const [fillType, setFillType] = useState(1);
  const [comparisonLangId, setComparisonLangId] = useState('');
  const [navWidth, setNavWidth] = useState(Number(localStorage.getItem('multiLingualNavWidth')) || 260);
  const [dragMaskVisible, setDragMaskVisible] = useState(false);

  useEffect(() => {
    appManagementApi.getAppLangDetail({
      appId: app.id,
      appLangId: langInfo.id
    }).then(data => {
      window[`langData-${app.id}`] = data.items;
      setTranslateStatus(data.status);
      setTranslateData(data.items);
      setLoading(false);
    });
    const { socket } = window.IM || {};
    const checkStatus = data => {
      setTranslateStatus(data.status === 1);
    }
    socket.on('custom', checkStatus);
    return () => {
      delete window[`langData-${app.id}`];
      delete window[`langVersion-${app.id}`];
      socket.off('custom', checkStatus);
    }
  }, []);

  const handleSelectNav = (selectedKeys, info) => {
    const { node } = info;
    if (node.selected) {
      return;
    }
    setSelectNode(node);
    setSelectedKeys(selectedKeys);
  }

  const handleChangeComparisonLangId = id => {
    setComparisonLangId(id);
    if (id) {
      appManagementApi.getAppLangDetail({
        projectId: app.projectId,
        appId: app.id,
        appLangId: id,
      }).then(data => {
        setComparisonLangData(data.items);
      });
    } else {
      setComparisonLangData([]);
    }
  }

  const handleEditAppLang = data => {
    appManagementApi.editAppLang({
      projectId: app.projectId,
      appId: app.id,
      langId: langInfo.id,
      ...data
    }).then(data => {
      window[`langData-${app.id}`] = data;
      setTranslateData(data);
    });
  }

  const handleRunTranslation = () => {
    appManagementApi.machineTranslation({
      appId: app.id,
      comparisonLangId,
      targetLangId: langInfo.id,
      fillType
    }).then(data => {
      if (data.message) {
        alert(data.message, 3);
      }
      document.querySelector('.translateWrap').click();
    });
  }

  if (loading) {
    return (
      <div className="flexRow alignItemsCenter justifyContentCenter h100">
        <LoadDiv />
      </div>
    );
  }

  const renderHeader = () => {
    const originalText = _l('原始文本');
    const comparisonLang = _.find(langs, { id: comparisonLangId });
    const original = comparisonLangId ? _.find(langConfig, { code: comparisonLang.type }).value : originalText;
    return (
      <div className="header flexRow">
        <div className="flexRow alignItemsCenter Font15">
          <span className="bold mRight5 pointer ThemeColor backHome" onClick={onBack}>{_l('多语言')}</span>/
          <span className="bold mLeft5">{_.find(langConfig, { code: langInfo.type }).value}</span>
        </div>
        <div className="flexRow alignItemsCenter">
          {md.global.Config.EnableAI && (
            <Popover
              disabled={true}
              trigger="click"
              placement="bottomLeft"
              content={(
                <PopoverWrap>
                  <div className="flexRow alignItemsCenter">
                    <Icon className="Font26 ThemeColor mRight5" icon="translate_language" />
                    <div className="Font17 bold">{_l('将本应用的%0翻译为 %1', original, _.find(langConfig, { code: langInfo.type }).value)}</div>
                  </div>
                  <div className="mTop40 mBottom40">
                    <div className="mBottom10">{_l('译文填充方式')}</div>
                    <RadioGroup
                      size="middle"
                      data={[
                        {
                          text: _l('仅处理为空的文本'),
                          value: 1,
                        },
                        {
                          text: _l('全部处理（将覆盖已有文本）'),
                          value: 0,
                        },
                      ]}
                      checkedValue={fillType}
                      onChange={value => {
                        setFillType(value);
                      }}
                    ></RadioGroup>
                  </div>
                  <Button
                    type="primary"
                    size="small"
                    radius={true}
                    onClick={handleRunTranslation}
                  >
                    <span>{_l('执行翻译')}</span>
                  </Button>
                </PopoverWrap>
              )}
            >
              <div className="flexRow alignItemsCenter mRight20 pointer translateWrap" style={{ pointerEvents: translateStatus ? 'none' : undefined }}>
                <Icon className="Font20 ThemeColor mRight5" icon="translate_language" />
                <div className="Font13">{translateStatus ? _l('翻译中...') : _l('智能翻译')}</div>
              </div>
            </Popover>
          )}
          <div className="mRight10">{_l('对照语言')}</div>
          <Select
            style={{ width: 180 }}
            value={comparisonLangId}
            suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
            onChange={value => {
              handleChangeComparisonLangId(value);
            }}
          >
            <Select.Option key={''} value={''}>
              {originalText}
            </Select.Option>
            {langs.filter(data => data.type !== langInfo.type).map(data => (
              <Select.Option key={data.id} value={data.id}>
                {_.find(langConfig, { code: data.type }).value}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>
    );
  }

  return (
    <Wrap className="flexColumn w100 h100">
      {renderHeader()}
      <div className="content flexRow flex Relative">
        {dragMaskVisible && (
          <DragMask
            value={navWidth}
            min={210}
            max={500}
            onChange={value => {
              setNavWidth(value);
              localStorage.setItem('multiLingualNavWidth', value);
              setDragMaskVisible(false);
            }}
          />
        )}
        <Drag left={navWidth} onMouseDown={() => setDragMaskVisible(true)} />
        <Nav
          style={{ width: navWidth }}
          app={app}
          translateData={translateData}
          selectedKeys={selectedKeys}
          onSelectedKeys={handleSelectNav}
        />
        <ContentWrap className="flex">
          <Content
            app={app}
            comparisonLangId={comparisonLangId}
            translateData={translateData}
            comparisonLangData={comparisonLangData}
            selectNode={selectNode}
            onEditAppLang={handleEditAppLang}
          />
        </ContentWrap>
      </div>
    </Wrap>
  );
}
