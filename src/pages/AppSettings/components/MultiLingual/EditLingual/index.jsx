import React, { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import { Button, Popover, Radio, Select } from 'ming-ui/antd-components';
import appManagementApi from 'src/api/appManagement';
import worksheetApi from 'src/api/worksheet';
import workflowTranslatorApi from 'src/pages/workflow/api/translator';
import DragMask from 'worksheet/common/DragMask';
import langConfig from 'src/utils/platform/i18n/langConfig';
import Content from './Content';
import Nav from './Nav';
import './index.less';

const PopoverWrap = styled.div`
  width: 450px;
  padding: 15px;
`;

const Drag = styled.div(
  ({ $left }) => `
  position: absolute;
  z-index: 2;
  left: ${$left}px;
  width: 2px;
  height: 100%;
  cursor: ew-resize;
  &:hover {
    border-left: 1px solid var(--color-border-primary);
  }
`,
);

export default function Edit(props) {
  const { app, currentLangKey, langs, allLangList, langInfo, onBack } = props;
  const appId = app.id;
  const appLangId = langInfo.id;
  const [selectNode, setSelectNode] = useState({ ...app, type: 'app' });
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(['app']);
  const [loading, setLoading] = useState(true);
  const [translateData, setTranslateData] = useState([]);
  const [collections, setCollections] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [translateStatus, setTranslateStatus] = useState(false);
  const [machineTranslationLoading, setMachineTranslationLoading] = useState(false);
  const [comparisonLangData, setComparisonLangData] = useState([]);
  const [fillType, setFillType] = useState(1);
  const [comparisonLangId, setComparisonLangId] = useState('');
  const [navWidth, setNavWidth] = useState(Number(localStorage.getItem('multiLingualNavWidth')) || 260);
  const [dragMaskVisible, setDragMaskVisible] = useState(false);
  const appData = useMemo(() => ({ ...app, collections, workflows }), [app, collections, workflows]);

  useEffect(() => {
    Promise.all([
      appManagementApi.getAppLangDetail({
        appId,
        appLangId,
      }),
      worksheetApi.getCollectionsByAppId({
        appId,
        status: 1,
      }),
      workflowTranslatorApi.getProcessTranslatorList({
        apkId: appId,
        all: false,
      }),
    ]).then(([data, collectionsData, workflowData]) => {
      window[`langData-${appId}`] = data.items;
      setTranslateStatus(data.status);
      setTranslateData(data.items);
      setCollections(collectionsData.data);
      setWorkflows(workflowData);
      setLoading(false);
    });
    const { socket } = window.IM || {};

    const checkStatus = data => {
      setTranslateStatus(data.status === 1);
    };

    socket.on('custom', checkStatus);
    return () => {
      delete window[`langData-${appId}`];
      delete window[`langVersion-${appId}`];
      socket.off('custom', checkStatus);
    };
  }, [appId, appLangId]);

  const handleSelectNav = (selectedKeys, info) => {
    const { node } = info;

    if (node.selected) {
      return;
    }

    setSelectNode(node);
    setSelectedKeys(selectedKeys);
  };

  const handleChangeComparisonLangId = id => {
    setComparisonLangId(id);
    if (id) {
      appManagementApi
        .getAppLangDetail({
          projectId: app.projectId,
          appId: app.id,
          appLangId: id,
        })
        .then(data => {
          setComparisonLangData(data.items);
        });
    } else {
      setComparisonLangData([]);
    }
  };

  const handleEditAppLang = data => {
    appManagementApi
      .editAppLang({
        projectId: app.projectId,
        appId: app.id,
        langId: langInfo.id,
        ...data,
      })
      .then(data => {
        window[`langData-${app.id}`] = data;
        setTranslateData(data);
      });
  };

  const handleRunTranslation = () => {
    if (machineTranslationLoading) {
      return;
    }

    setTranslateStatus(true);
    setMachineTranslationLoading(true);
    appManagementApi
      .machineTranslation({
        appId: app.id,
        comparisonLangId,
        targetLangId: langInfo.id,
        fillType,
      })
      .then(data => {
        if (data.message) {
          alert(data.message, 3);
        }
      })
      .catch(() => {
        setTranslateStatus(false);
      })
      .finally(() => {
        setMachineTranslationLoading(false);
      });
    document.querySelector('.translateWrap').click();
  };

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
    const currentLangInfo = _.find(allLangList, { langCode: langInfo.langCode });
    const langInfoText = currentLangInfo ? `${currentLangInfo[currentLangKey]} (${currentLangInfo.localLang})` : '';
    return (
      <div className="header flexRow">
        <div className="flexRow alignItemsCenter Font15">
          <Button className="Font15" color="primary" variant="link" size="small" onClick={onBack}>
            {_l('语言')}
          </Button>
          /<span className="bold mLeft5">{langInfoText}</span>
        </div>
        <div className="flexRow alignItemsCenter">
          {!md.global.SysSettings.hideAIBasicFun && (
            <Popover
              arrow={true}
              disabled={translateStatus}
              trigger="click"
              placement="bottomLeft"
              content={
                <PopoverWrap>
                  <div className="flexRow alignItemsCenter">
                    <Icon className="Font26 colorPrimary mRight5" icon="translate_language" />
                    <div className="Font17 bold">{_l('将本应用的%0翻译为 %1', original, langInfoText)}</div>
                  </div>
                  <div className="mTop40 mBottom40">
                    <div className="mBottom10">{_l('译文填充方式')}</div>
                    <Radio.Group
                      size="middle"
                      options={[
                        {
                          text: _l('仅处理为空的文本'),
                          value: 1,
                        },
                        {
                          text: _l('全部处理（将覆盖已有文本）'),
                          value: 0,
                        },
                      ].map(({ text, ...option }) => ({ ...option, label: text }))}
                      value={fillType}
                      onChange={event => {
                        const value = event.target.value;

                        setFillType(value);
                      }}
                    ></Radio.Group>
                  </div>
                  <Button type="primary" shape="round" onClick={handleRunTranslation}>
                    {_l('执行翻译')}
                  </Button>
                </PopoverWrap>
              }
            >
              <div
                className="flexRow alignItemsCenter mRight20 pointer translateWrap"
                style={{ pointerEvents: translateStatus ? 'none' : undefined }}
              >
                <Icon className="Font20 colorPrimary mRight5" icon="translate_language" />
                <div className="Font13">{translateStatus ? _l('翻译中...') : _l('智能翻译')}</div>
              </div>
            </Popover>
          )}
          <div className="mRight10">{_l('对照语言')}</div>
          <Select
            style={{ width: 260 }}
            value={comparisonLangId}
            suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
            onChange={value => {
              handleChangeComparisonLangId(value);
            }}
            options={[
              { value: '', label: originalText },
              ...langs
                .filter(data => data.langCode !== langInfo.langCode)
                .map(data => {
                  const langItem = _.find(allLangList, { langCode: data.langCode });
                  if (!langItem) return null;
                  return {
                    value: data.id,
                    label: `${langItem[currentLangKey]}(${langItem.localLang})`,
                  };
                })
                .filter(Boolean),
            ]}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="editLingualWrap flexColumn w100 h100">
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
        <Drag $left={navWidth} onMouseDown={() => setDragMaskVisible(true)} />
        <Nav
          style={{ width: navWidth }}
          app={appData}
          translateData={translateData}
          selectedKeys={selectedKeys}
          onSelectedKeys={handleSelectNav}
          expandedKeys={expandedKeys}
          setExpandedKeys={setExpandedKeys}
        />
        <div className="flex contentWrap">
          <Content
            app={appData}
            comparisonLangId={comparisonLangId}
            translateData={translateData}
            comparisonLangData={comparisonLangData}
            selectNode={selectNode}
            onSelectedKeys={handleSelectNav}
            setExpandedKeys={keys => {
              setExpandedKeys(expandedKeys.concat(keys));
            }}
            onEditAppLang={handleEditAppLang}
          />
        </div>
      </div>
    </div>
  );
}
