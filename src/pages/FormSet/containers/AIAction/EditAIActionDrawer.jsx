import React, { Fragment, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import { Drawer } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, Input, LoadDiv, RadioGroup, TagTextarea } from 'ming-ui';
import flowNode from 'src/pages/workflow/api/flowNode';
import processAjax from 'src/pages/workflow/api/process';
import AiActionChatBot from 'src/components/Mingo/modules/AiActionChatBot';
import { selectRecords } from 'src/components/SelectRecords';
import { filterData } from 'src/pages/FormSet/components/columnRules/config.js';
import DrawerFooter from 'src/pages/FormSet/components/DrawerFooter';
import FilterItemTexts from 'src/pages/widgetConfig/widgetSetting/components/FilterData/FilterItemTexts';
import Detail from 'src/pages/workflow/WorkflowSettings/Detail';
import Tag from 'src/pages/workflow/WorkflowSettings/Detail/components/Tag/index.jsx';
import { AGENT_TOOLS } from 'src/pages/workflow/WorkflowSettings/enum';
import logDialog from 'src/pages/workflow/WorkflowSettings/History/components/logDialog';
import { handleGlobalVariableName } from 'src/pages/workflow/WorkflowSettings/utils';
import ShowBtnFilterDialog from 'src/pages/worksheet/common/CreateCustomBtn/components/ShowBtnFilterDialog.jsx';
import { formatValuesOfCondition } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { navigateTo } from 'src/router/navigateTo';

const DrawerWrapper = styled(Drawer)`
  & > .ant-drawer-content-wrapper {
    padding-top: 50px;
  }
  @media screen and (max-width: 1200px) {
    &.ant-drawer {
      width: ${({ showChatbotDialog }) => (showChatbotDialog ? 1000 : 800)}px!important;
    }
  }
`;

const Wrapper = styled.div`
  color: var(--color-text-primary);
  overflow: hidden;
  position: relative;
  .settingDrawer {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
  }
  .header {
    padding: 0 24px;
    height: 50px;
  }
  .history {
    padding: 0 15px;
    height: 30px;
    line-height: 30px;
    cursor: pointer;
    border-radius: 6px;
    margin-right: 5px;
    &:hover {
      background: var(--color-background-disabled);
    }
    .icon-article {
      color: #707070;
    }
  }
  .content {
    overflow: auto;
    padding: 0 24px 32px;
    input {
      margin-bottom: 28px;
    }
  }
  .title {
    font-weight: 600;
    margin-bottom: 10px;
  }
  .actionWrap {
    border: 1px solid var(--color-border-primary);
    border-radius: 8px;
    padding: 20px 32px 30px 24px;
    margin-bottom: 35px;
  }
  .agentIconWrap {
    width: 44px;
    height: 44px;
    border-radius: 4px;
    border: 1px solid var(--color-border-primary);
    text-align: center;
    line-height: 44px;
    .icon-AI_Agent {
      color: #8a8a8a;
      line-height: 44px;
    }
  }
  .actionBtn {
    padding: 0 32px;
    border-radius: 30px;
    line-height: 28px;
    cursor: pointer;
    &.testBtn {
      color: #50ae54;
      border: 1px solid #50ae54;
    }
    &.settingBtn {
      color: var(--color-primary);
      border: 1px solid var(--color-primary);
    }
  }
  .toolTxtColor {
    color: var(--color-text-tertiary);
  }
  .label {
    width: 130px;
    color: #707070;
  }
  .promptWrap {
    .tagInputareaIuput,
    .tagInputareaIuput:not(.active) {
      border-color: transparent !important;
    }
    .CodeMirror .CodeMirror-lines,
    .CodeMirror .CodeMirror-line {
      padding: 0 !important;
    }
    .CodeMirror .columnTagCon {
      padding: 2px 4px 2px 0 !important;
    }
  }
`;

const BotBox = styled.div`
  overflow: hidden;
`;

export default function EditAIActionDrawer(props) {
  const {
    appId,
    worksheetId,
    projectId,
    columns,
    sheetSwitchPermit,
    saveLoading,
    onClose,
    currentActionItem = {},
    handleSave = () => {},
  } = props;
  const [state, setState] = useSetState({
    loadingProcess: false,
    name: currentActionItem.name || '',
    desc: currentActionItem.desc || '',
    showType: currentActionItem.showType || 1,
    filters: currentActionItem.filters || [],
    isShowBtnFilterDialog: false,
    showSettingDrawer: false,
    saveLoading: false,
    filterItemTexts: filterData(columns, currentActionItem.filters || []),
    info: {},
    nodeDetail: {},
    worksheetInfo: {},
    recordInfo: {},
    initParams: _.pick(currentActionItem, ['name', 'desc', 'showType', 'filters']),
    params: _.pick(currentActionItem, ['name', 'desc', 'showType', 'filters']), // initParams/params 用于区分是否有数据变更，有数据变更则激活保存按钮
  });
  const { btnId } = currentActionItem;
  const {
    loadingProcess,
    name,
    desc,
    showType,
    filters,
    filterItemTexts,
    isShowBtnFilterDialog,
    showSettingDrawer,
    info,
    showChatbotDialog,
    nodeDetail,
    recordInfo,
    worksheetInfo,
    initParams,
    params,
  } = state;
  const tools = (nodeDetail?.tools || []).filter(
    o => (_.includes([1, 2, 3, 4], o.type) && o.enabled) || !_.includes([1, 2, 3, 4], o.type),
  );

  const promptRef = useRef(null);

  const getProcessInfo = async () => {
    if (loadingProcess || !btnId || !worksheetId) {
      return;
    }

    setState({ loadingProcess: true });
    const data = await processAjax.getProcessByTriggerId({
      appId: worksheetId,
      triggerId: btnId,
    });

    const info = data[0] || {};

    if (_.isEmpty(info)) {
      setState({ info, loadingProcess: false });
      return;
    }

    const nodeDetail = await flowNode.getNodeDetail({
      processId: info.id,
      nodeId: info?.flowNodeMap?.[info.startEventId]?.nextId,
      flowNodeType: 33,
    });

    setState({ info, nodeDetail, loadingProcess: false });
  };

  /**
   * 选择记录
   */
  const selectRecord = () => {
    selectRecords({
      canSelectAll: false,
      pageSize: 25,
      multiple: false,
      singleConfirm: true,
      worksheetId,
      onText: _l('开始测试'),
      allowNewRecord: true,
      allowAdd: true,
      showMoreControls: true,
      onOk: (records, worksheetInfo) => {
        setState({ showChatbotDialog: true, worksheetInfo, recordInfo: records[0] });
      },
    });
  };

  useEffect(() => {
    getProcessInfo();
  }, [btnId]);

  useEffect(() => {
    if (promptRef && promptRef.current) {
      promptRef.current.setValue(nodeDetail.prompt);
    }
  }, [nodeDetail.prompt]);

  /**
   * 渲染对话机器人对话框
   */
  const renderChatbotDialog = () => {
    return (
      <BotBox>
        <AiActionChatBot
          defaultActiveButtonId={btnId}
          worksheetId={worksheetId}
          recordId={recordInfo?.rowid}
          processId={info.id}
          buttonName={name}
          conversationId={'test-' + _.get(md, 'global.Account.accountId')}
          isTest
          showOperateHeader
          worksheetInfo={worksheetInfo}
          recordData={recordInfo}
          onClose={() => setState({ showChatbotDialog: false })}
          onOpenMessageLog={({ instanceId }) => {
            logDialog({
              processId: info.id,
              nodeId: info?.flowNodeMap?.[info.startEventId]?.nextId,
              instanceId,
            });
          }}
        />
      </BotBox>
    );
  };

  return (
    <Fragment>
      <DrawerWrapper
        className="Absolute editAIActionDrawer"
        showChatbotDialog={showChatbotDialog}
        width={showChatbotDialog ? 1200 : 800}
        visible
        mask={false}
        placement="right"
        closable={false}
        maskClosable={false}
        zIndex={2}
        getContainer={false}
        bodyStyle={{ padding: 0 }}
        maskStyle={{ background: 'rgba(0, 0, 0, 0.32)' }}
        style={{ transform: 'translateX(1px)' }}
        onClose={onClose}
      >
        <div className="flexRow h100">
          <div className="flex">
            {loadingProcess ? (
              <Wrapper className="h100 flexColumn alignItemsCenter justifyContentCenter">
                <LoadDiv />
              </Wrapper>
            ) : (
              <Wrapper className="h100 flexColumn Relative">
                <div className="header flexRow alignItemsCenter">
                  <span className="Font22 bold flex">{_l('AI 动作')}</span>
                  <div
                    className="history flexRow alignItemsCenter"
                    onClick={() => navigateTo(`/workflowedit/${info.id}/2`)}
                  >
                    <Icon icon="article" className="Font16 mRight5" />
                    <span>{_l('执行历史')}</span>
                  </div>
                  <Icon icon="close" className="textTertiary Font20 Hand" onClick={onClose} />
                </div>
                <div className="content flex minHeight0">
                  <div className="title">{_l('名称')}</div>
                  <Input
                    className="w100"
                    value={name}
                    onChange={val => setState({ name: val, params: { ...params, name: val } })}
                  />
                  <div className="title">{_l('说明')}</div>
                  <Input
                    className="w100"
                    value={desc}
                    onChange={val => setState({ desc: val, params: { ...params, desc: val } })}
                  />
                  <div className="title">{_l('动作')}</div>
                  <div className="actionWrap">
                    <div className="flexRow alignItemsCenter mBottom30">
                      <div className="agentIconWrap mRight16">
                        <Icon icon="AI_Agent" className="Font22" />
                      </div>
                      <div className="flex Font17 bold">{_l('执行AI Agent')}</div>
                      <div className="actionBtn mRight20 testBtn" onClick={selectRecord}>
                        {_l('测试')}
                      </div>
                      <div className="actionBtn settingBtn" onClick={() => setState({ showSettingDrawer: true })}>
                        {_l('配置')}
                      </div>
                    </div>
                    <div className="flexRow">
                      <div className="label">{_l('模型')}</div>
                      <div className="flex">{_l(nodeDetail?.model || '自动选择模型')}</div>
                    </div>
                    <div className="flexRow mTop20">
                      <div className="label">{_l('提示词')}</div>
                      {/* <div className="flex">{_.get(currentActionItem, 'advancedSetting.prompt', '')}</div> */}
                      <TagTextarea
                        className="flex promptWrap"
                        ref={promptRef}
                        readonly={true}
                        defaultValue={_.get(currentActionItem, 'advancedSetting.prompt', '')}
                        renderTag={tag => {
                          const ids = tag.split(/([a-zA-Z0-9#]{24,32})-/).filter(item => item);
                          const nodeObj = nodeDetail?.formulaMap?.[ids[0]] || {};
                          const controlObj = nodeDetail?.formulaMap?.[ids.join('-')] || {};

                          return (
                            <Tag
                              flowNodeType={nodeObj.type}
                              appType={nodeObj.appType}
                              actionId={nodeObj.actionId}
                              nodeName={handleGlobalVariableName(ids[0], controlObj.sourceType, nodeObj.name)}
                              controlId={ids[1]}
                              controlName={controlObj.name || ''}
                            />
                          );
                        }}
                      />
                    </div>
                    {!_.isEmpty(tools) && (
                      <div className="flexRow mTop30">
                        <div className="label">{_l('工具')}</div>
                        <div className="flex">
                          {tools.map(v => {
                            return (
                              <div className="flexRow alignItemsCenter LineHeight30">
                                <i className={`toolTxtColor Font16 mRight5 ${AGENT_TOOLS[v.type].icon}`} />
                                <span className="bold">{AGENT_TOOLS[v.type].displayName}</span>
                                <span className="toolTxtColor">
                                  ({!_.isEmpty(v.configs) ? v.configs.map(o => o.appName).join('、') : _l('全部')})
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="title">{_l('启用按钮')}</div>
                  <RadioGroup
                    data={[
                      { value: 1, text: _l('一直') },
                      { value: 2, text: _l('满足筛选条件') },
                    ]}
                    size="small"
                    onChange={value => {
                      setState({
                        showType: value,
                        isShowBtnFilterDialog: value === 2 && filters.length <= 0,
                        params: { ...params, showType: value },
                      });
                    }}
                    checkedValue={showType}
                  />
                  {filterItemTexts.length > 0 && showType === 2 && (
                    <FilterItemTexts
                      filterItemTexts={filterItemTexts}
                      loading={false}
                      editFn={() => setState({ isShowBtnFilterDialog: true })}
                    />
                  )}
                </div>
                <DrawerFooter
                  disabled={saveLoading || !_.trim(name) || _.isEqual(initParams, params)}
                  handleSave={() =>
                    handleSave(
                      {
                        btnType: 1,
                        btnId: currentActionItem.btnId || '',
                        name: name,
                        desc: _.trim(desc),
                        appId,
                        worksheetId,
                        advancedSetting: currentActionItem.advancedSetting || {},
                        filters: filters.map(formatValuesOfCondition),
                        showType,
                        isAllView: currentActionItem.isAllView,
                      },
                      false,
                      onClose,
                    )
                  }
                  onCancel={onClose}
                />
              </Wrapper>
            )}

            {isShowBtnFilterDialog && (
              <ShowBtnFilterDialog
                sheetSwitchPermit={sheetSwitchPermit}
                projectId={projectId}
                appId={appId}
                columns={columns}
                filters={filters}
                isShowBtnFilterDialog={isShowBtnFilterDialog}
                showType={showType}
                setValue={value => {
                  setState({
                    filters: value.filters,
                    isShowBtnFilterDialog: value.isShowBtnFilterDialog,
                    showType: value.showType,
                    filterItemTexts: filterData(columns, value.filters),
                    params: { ...params, filters: value.filters, showType: value.showType },
                  });
                }}
              />
            )}
          </div>
          {showChatbotDialog && renderChatbotDialog()}
        </div>
      </DrawerWrapper>
      {showSettingDrawer && (
        <Detail
          companyId={info.companyId}
          processId={info.id}
          relationId={appId}
          relationType={2}
          isAIActions
          selectNodeId={info?.flowNodeMap?.[info.startEventId]?.nextId} //gengxindonghua
          selectNodeType={33}
          closeDetail={() => setState({ showSettingDrawer: false })}
          customNodeName={_l('AI Agent')}
          updateNodeData={data => {
            flowNode
              .getNodeDetail({
                processId: info.id,
                nodeId: data.id,
                flowNodeType: 33,
              })
              .then(res => {
                setState({ nodeDetail: res });
                if (res.prompt !== currentActionItem.advancedSetting.prompt) {
                  handleSave(
                    {
                      EditAttrs: ['advancedSetting'],
                      advancedSetting: { prompt: res.prompt },
                      btnId: currentActionItem.btnId || '',
                      worksheetId,
                      name: currentActionItem.name,
                    },
                    false,
                    undefined,
                    { ...currentActionItem, advancedSetting: { prompt: res.prompt } },
                  );
                }
              });
          }}
        />
      )}
    </Fragment>
  );
}
