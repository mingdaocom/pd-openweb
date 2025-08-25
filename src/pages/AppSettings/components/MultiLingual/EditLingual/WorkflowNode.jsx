import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Dropdown, Input, Menu } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView, TagTextarea } from 'ming-ui';
import workflowTranslatorApi from 'src/pages/workflow/api/translator';
import { getTranslateInfo } from 'src/utils/app';
import { LANG_DATA_TYPE } from '../config';
import EditInput from './EditInput';

const ControlTag = styled.div`
  line-height: 24px;
  padding: 0 12px;
  border-radius: 16px;
  background: #d8eeff;
  color: #174c76;
  border: 1px solid #bbd6ea;
`;

const ReadonlyTagTextareaWrap = styled.div`
  .CodeMirror-scroll {
    background: #f5f5f5;
  }
`;

const NodeTagTextarea = props => {
  const { value, translateValue, formulaMap, onBlur } = props;
  const [formulaMapVisible, setFormulaMapVisible] = useState(false);
  const formulaMapList = _.map(formulaMap, (value, key) => ({
    id: key,
    ...value,
  }));
  const tagTextareaRef = useRef(null);

  const renderTag = id => {
    const data = formulaMap[id];
    return <ControlTag>{data.name}</ControlTag>;
  };

  return (
    <Fragment>
      <ReadonlyTagTextareaWrap className="flex mRight20">
        <TagTextarea mode={2} defaultValue={value} maxHeight={240} readonly={true} renderTag={renderTag} />
      </ReadonlyTagTextareaWrap>
      <div className="flex flexRow alignItemsCenter">
        <TagTextarea
          className="flex mRight5"
          mode={1}
          defaultValue={translateValue}
          maxHeight={240}
          rightIcon={formulaMapList.length ? true : false}
          getRef={ref => {
            tagTextareaRef.current = ref;
          }}
          renderTag={renderTag}
          onBlur={() => {
            onBlur(tagTextareaRef.current.cmObj.getValue());
          }}
          onAddClick={() => setFormulaMapVisible(true)}
        />
        <Dropdown
          visible={formulaMapVisible}
          onVisibleChange={visible => setFormulaMapVisible(visible)}
          placement="bottomRight"
          overlay={
            <Menu style={{ width: 180, padding: '8px 0' }}>
              {formulaMapList.map(data => (
                <Menu.Item
                  key={data.id}
                  style={{ padding: '7px 12px' }}
                  onClick={() => {
                    if (tagTextareaRef.current) {
                      tagTextareaRef.current.insertColumnTag(data.id);
                      setFormulaMapVisible(false);
                    }
                  }}
                >
                  <div className="flexRow alignItemsCenter">
                    <div>{data.name}</div>
                  </div>
                </Menu.Item>
              ))}
            </Menu>
          }
        >
          <div />
        </Dropdown>
      </div>
    </Fragment>
  );
};

export default function WorkflowNode(props) {
  const { app, selectNode, translateData, comparisonLangId, comparisonLangData, onEditAppLang } = props;
  const [searchValue, setSearchValue] = useState('');
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef();
  const translateDataRef = useRef(translateData);

  useEffect(() => {
    translateDataRef.current = translateData;
  }, [translateData]);

  useEffect(() => {
    setLoading(true);
    workflowTranslatorApi
      .getProcessTranslator({
        processId: selectNode.processId,
      })
      .then(data => {
        setNodes(data.nodes);
        setLoading(false);
      });
  }, [selectNode.processId]);

  if (loading) {
    return (
      <div className="flexRow alignItemsCenter justifyContentCenter h100">
        <LoadDiv />
      </div>
    );
  }

  if (!nodes.length) {
    return (
      <div className="flexRow alignItemsCenter justifyContentCenter h100 Gray_9e Font14">{_l('没有流程节点')}</div>
    );
  }

  const handleSave = (item, info) => {
    const translateData = translateDataRef.current;
    const data = _.find(translateData, { correlationId: item.nodeId }) || {};
    const translateInfo = data.data || {};
    onEditAppLang({
      id: data.id,
      parentId: selectNode.processId,
      correlationId: item.nodeId,
      type: LANG_DATA_TYPE.workflowNode,
      data: {
        ...translateInfo,
        ...info,
      },
    });
  };

  const handlePositionItem = item => {
    const el = document.querySelector(`.navItem-${item.nodeId}`);
    const className = 'highlight';
    const highlightEl = el.querySelector('.itemName');
    $(highlightEl)
      .addClass(className)
      .on('webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend', function () {
        $(this).removeClass(className);
      });
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ top: el.offsetTop });
    }
  };

  const renderNav = item => {
    const data = _.find(translateData, { correlationId: item.nodeId }) || {};
    const translateInfo = data.data || {};
    return (
      <div
        className="navItem flexRow alignItemsCenter pointer"
        key={item.nodeId}
        onClick={() => handlePositionItem(item)}
      >
        <span className="mLeft5 Font13 ellipsis">{translateInfo.nodename || item.nodeName}</span>
      </div>
    );
  };

  const renderContent = item => {
    const data = _.find(translateData, { correlationId: item.nodeId }) || {};
    const translateInfo = data.data || {};
    const comparisonLangInfo = getTranslateInfo(app.id, selectNode.processId, item.nodeId, comparisonLangData);

    const renderBtn = (key, name) => {
      return (
        <div className="flexRow alignItemsCenter nodeItem pLeft0">
          <Input className="flex mRight20" value={comparisonLangId ? comparisonLangInfo[key] : name} disabled={true} />
          <EditInput
            className="flex"
            value={translateInfo[key]}
            onChange={value => handleSave(item, { [key]: value })}
          />
        </div>
      );
    };

    return (
      <div className={cx('flexColumn mBottom30', `navItem-${item.nodeId}`)} key={item.nodeId}>
        <div className="flexRow alignItemsCenter mBottom15 itemName">
          <span className="flex Font14 bold ellipsis">{item.nodeName}</span>
        </div>
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('节点名称')}</div>
          <Input
            className="flex mRight20"
            value={comparisonLangId ? comparisonLangInfo.nodename : item.nodeName}
            disabled={true}
          />
          <EditInput
            className="flex"
            value={translateInfo.nodename}
            onChange={value => handleSave(item, { nodename: value })}
          />
        </div>
        {item.type === 4 && (
          <div className="flexRow nodeItem">
            <div className="Font13 mRight20 label">{_l('审批按钮')}</div>
            <div className="flex">
              {renderBtn('btnmap_4', _.get(item, 'btnMap[4]'))}
              {renderBtn('btnmap_5', _.get(item, 'btnMap[5]'))}
              {renderBtn('btnmap_17', _.get(item, 'btnMap[17]'))}
            </div>
          </div>
        )}
        {item.type === 3 && (
          <div className="flexRow nodeItem">
            <div className="Font13 mRight20 label">{_l('提交按钮')}</div>
            <div className="flex">{renderBtn('btnmap_9', _.get(item, 'btnMap[9]'))}</div>
          </div>
        )}
        {item.type === 17 && item.sendMessage && (
          <Fragment>
            {item.title && (
              <div className="flexRow nodeItem">
                <div className="Font13 mRight20 label">{_l('卡片通知标题')}</div>
                <div className="flex">
                  <div className="flexRow nodeItem pLeft0">
                    <NodeTagTextarea
                      value={item.title}
                      formulaMap={item.formulaMap}
                      translateValue={translateInfo.title || item.title}
                      onBlur={value => {
                        handleSave(item, { title: value });
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            {item.sendMessage && (
              <div className="flexRow nodeItem">
                <div className="Font13 mRight20 label">
                  {item.pushType === 1 && _l('弹出提示描述')}
                  {item.pushType === 7 && _l('卡片提示描述')}
                </div>
                <div className="flex">
                  <div className="flexRow nodeItem pLeft0">
                    <NodeTagTextarea
                      value={item.sendMessage}
                      formulaMap={item.formulaMap}
                      translateValue={translateInfo.sendmessage || item.sendMessage}
                      onBlur={value => {
                        handleSave(item, { sendmessage: value });
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            {item.buttons && (
              <div className="flexRow nodeItem">
                <div className="Font13 mRight20 label">{_l('卡片按钮')}</div>
                <div className="flex">{item.buttons.map(item => renderBtn(`buttons_${item.id}`, item.message))}</div>
              </div>
            )}
          </Fragment>
        )}
        {[3, 4].includes(item.type) && item.explain && (
          <div className="flexRow nodeItem">
            <div className="Font13 mRight20 label">
              {item.type === 4 && _l('审批说明')}
              {item.type === 3 && _l('填写说明')}
            </div>
            <div className="flex">
              <div className="flexRow nodeItem pLeft0">
                <NodeTagTextarea
                  value={item.explain}
                  formulaMap={item.formulaMap}
                  translateValue={translateInfo.explain || item.explain}
                  onBlur={value => {
                    handleSave(item, { explain: value });
                  }}
                />
              </div>
            </div>
          </div>
        )}
        {item.type === 5 && (
          <div className="flexRow nodeItem">
            <div className="Font13 mRight20 label">{_l('通知说明')}</div>
            <div className="flex">
              <div className="flexRow nodeItem pLeft0">
                <NodeTagTextarea
                  value={item.sendMessage}
                  formulaMap={item.formulaMap}
                  translateValue={translateInfo.sendmessage || item.sendMessage}
                  onBlur={value => {
                    handleSave(item, { sendmessage: value });
                  }}
                />
              </div>
            </div>
          </div>
        )}
        {_.get(item, 'schedules') && (
          <div className="flexRow nodeItem">
            <div className="Font13 mRight20 label">{_l('限时处理提醒内容')}</div>
            <div className="flex">{item.schedules.map(item => renderBtn(`schedules_${item.id}`, item.message))}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flexRow pAll10 h100">
      <div className="nav flexColumn">
        <div className="searchWrap flexRow alignItemsCenter mBottom10">
          <Icon className="Gray_9e Font20 mRight5" icon="search" />
          <input
            placeholder={_l('节点名称')}
            className="flex"
            value={searchValue}
            onChange={e => {
              setSearchValue(e.target.value);
            }}
          />
          {searchValue && <Icon className="Gray_9e pointer Font15" icon="cancel" onClick={() => setSearchValue('')} />}
        </div>
        <ScrollView className="h100">
          {nodes.filter(item => item.nodeName.includes(searchValue)).map(item => renderNav(item))}
        </ScrollView>
      </div>
      <ScrollView className="h100" ref={scrollViewRef}>
        <div className="pLeft20 pRight20">
          {nodes.filter(item => item.nodeName.includes(searchValue)).map(item => renderContent(item))}
        </div>
      </ScrollView>
    </div>
  );
}
