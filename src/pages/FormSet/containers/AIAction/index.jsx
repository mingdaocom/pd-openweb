import React, { Fragment, useEffect } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Button, Icon, Input, LoadDiv, SortableList } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import worksheetAjax from 'src/api/worksheet';
import { redefineComplexControl } from 'worksheet/common/WorkSheetFilter/util';
import BtnRangeDrop from 'src/pages/FormSet/components/BtnRangeDrop';
import MoreOption from 'src/pages/FormSet/components/MoreOption';
import TrashDialog from 'src/pages/FormSet/components/Trash';
import { renderViewScopeText } from 'src/pages/FormSet/util';
import CreateAIActionDialog from './CreateAIActionDialog';
import EditAIActionDrawer from './EditAIActionDrawer';

const Con = styled.div`
  width: 100%;
  height: 100%;
  background: var(--color-background-primary);
  padding: 35px 40px 0 32px;
  overflow: hidden;
  .noDataIcon {
    border-radius: 50%;
    background-color: var(--color-background-secondary);
    width: 130px;
    height: 130px;
    text-align: center;
    margin: 60px auto 24px;
    .icon {
      line-height: 130px;
      font-size: 60px;
      color: var(--color-text-tertiary);
    }
  }
  .aiActionHeader,
  .aiActionItem {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: var(--color-text-secondary);
    font-weight: 600;
    padding: 3px 0 11px 10px;
    border-bottom: 1px solid var(--color-border-primary);
  }
  .aiActionHeader {
    padding-left: 31px;
  }
  .aiActionItem {
    min-height: 68px;
    padding-bottom: 0;
    border-bottom: 1px solid var(--color-border-secondary);
    &:hover {
      background: var(--color-background-hover);
    }
    .icon-drag:hover {
      cursor: move;
    }
  }
  .aiActionList {
    overflow: auto;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  .action {
    width: 200px;
  }
  .activeCon {
    color: var(--color-primary);
    &:hover {
      opacity: 0.8;
    }
  }
  // 兼容 配置AI Agent显示
  .ant-drawer .ant-drawer-content-wrapper {
    padding-top: 50px !important;
  }
`;

export default function AIAction(props) {
  const { worksheetInfo = {}, worksheetControls, worksheetId } = props;
  const { views = [] } = worksheetInfo;

  const [
    {
      loading,
      list,
      showDropOption,
      showMoreOption,
      isRename,
      currentActionItem,
      showTrash,
      createAIActionDialogVisible,
      editAIActionDrawerVisible,
      saveLoading,
      canDrag,
    },
    setState,
  ] = useSetState({
    list: [],
    showDropOption: false,
    showMoreOption: false,
    isRename: false,
    currentActionItem: {},
    showTrash: false,
    createAIActionDialogVisible: false,
    editAIActionDrawerVisible: false,
    loading: true,
    saveLoading: false,
    canDrag: true,
  });
  let ajaxFn = null;

  const getAIActionList = ({ isCreate, btnId } = {}) => {
    if (ajaxFn) {
      ajaxFn.abort();
    }
    ajaxFn = worksheetAjax.getWorksheetBtns({
      worksheetId,
      btnType: 1,
    });
    ajaxFn
      .then(list => {
        const actionSortIds = JSON.parse(_.get(worksheetInfo, 'advancedSetting.actionsort', '[]'));
        setState({
          list: list.sort((a, b) => actionSortIds.indexOf(a.btnId) - actionSortIds.indexOf(b.btnId)),
          loading: false,
          currentActionItem: isCreate && btnId ? list.find(item => item.btnId === btnId) : currentActionItem,
          editAIActionDrawerVisible: isCreate && btnId,
        });
      })
      .catch(() => {
        setState({ loading: false });
      });
  };

  const handleDelete = () => {
    setState({ showMoreOption: false });
    worksheetAjax
      .optionWorksheetBtn({
        appId: worksheetInfo.appId,
        viewId: '',
        btnId: currentActionItem.btnId,
        worksheetId,
        optionType: 9, // * @param { integer } args.optionType 操作类型 1：视图添加按钮 2：视图删除按钮 9：删除按钮
      })
      .then(data => {
        if (data) {
          alert(_l('删除成功'));
          setState({ currentActionItem: {}, list: list.filter(item => item.btnId !== currentActionItem.btnId) });
        } else {
          alert(_l('删除失败'), 2);
        }
      });
  };

  const updateScope = (item, data) => {
    const tempData = { ...data, displayViews: [] }; // 清除老数据
    worksheetAjax
      .saveWorksheetBtn({
        ...tempData,
        btnId: item.btnId,
        worksheetId,
      })
      .then(() => {
        let tempList = list.map(v => (v.btnId === item.btnId ? tempData : v));
        setState({ list: tempList });
      });
  };

  const handleSave = (params, isCreate, callback = () => {}, newCurrentActionItem = {}) => {
    if (saveLoading) {
      return;
    }
    if (!_.trim(params.name)) {
      return;
    }
    setState({ saveLoading: true });

    worksheetAjax
      .saveWorksheetBtn({
        btnType: 1,
        appId: worksheetInfo.appId,
        worksheetId,
        workflowType: 1,
        showType: 1,
        ...params,
      })
      .then(data => {
        callback();
        setState({
          saveLoading: false,
          currentActionItem: !_.isEmpty(newCurrentActionItem) ? newCurrentActionItem : currentActionItem,
        });
        _.isEmpty(newCurrentActionItem) && getAIActionList({ isCreate, btnId: data }); // noUpdate: 不更新列表
      });
  };

  const updateSorts = actionSortIds => {
    worksheetAjax
      .editWorksheetSetting({
        worksheetId,
        appId: worksheetInfo.appId,
        advancedSetting: { actionsort: JSON.stringify(actionSortIds) },
        editAdKeys: ['actionsort'],
        editAttrs: ['advancedSetting'],
      })
      .then(res => {
        if (res) {
          setState({ list: list.sort((a, b) => actionSortIds.indexOf(a.btnId) - actionSortIds.indexOf(b.btnId)) });
        } else {
          alert(_l('操作失败，请稍后再试'), 2);
        }
      });
  };

  useEffect(() => {
    if (!worksheetId) return;
    getAIActionList();
  }, [worksheetId]);

  const renderEmpty = () => {
    return (
      <Fragment>
        <div className="flexRow alignItemsCenter">
          <div className="textPrimary Font17 Bold mBottom10 flex">{_l('AI 动作')}</div>
          <div className="trash mRight20 Hand" onClick={() => setState({ showTrash: true })}>
            <Icon icon="knowledge-recycle" className="Font18 textTertiary TxtMiddle" />
            <div className="InlineBlock Hand mLeft5 textSecondary TxtMiddle">{_l('回收站')}</div>
          </div>
        </div>
        <div className="noDataIcon">
          <Icon icon="auto_awesome" />
        </div>
        <div className="TxtCenter mTop20 pTop40 Font15">
          {_l('基于上下文提供智能操作，支持内容生成与工具调用，高效处理任务')}
        </div>
        <div className="TxtCenter Font15">{_l('添加后将显示在记录详情页，支持一键触发')}</div>
        <div className="divCenter mTop20">
          <Button radius onClick={() => setState({ createAIActionDialogVisible: true })}>
            <Icon icon="plus" className="mRight3 TxtMiddle" />
            <span className="TxtMiddle">{_l('添加')}</span>
          </Button>
        </div>
      </Fragment>
    );
  };

  if (loading) {
    return (
      <Con className="flexColumn alignItemsCenter justifyContentCenter">
        <LoadDiv />
      </Con>
    );
  }

  return (
    <Con className="flexColumn">
      {list.length === 0 ? (
        renderEmpty()
      ) : (
        <Fragment>
          <div className="flexRow alignItemsCenter">
            <div className="flex mRight10">
              <div className="textPrimary Font17 Bold mBottom10">{_l('AI 动作')}</div>
              <div className="Font13 textTertiary mBottom10">
                {_l('为记录提供上下文感知的智能操作，支持内容生成与工具调用。添加后将显示在记录详情页，供用户一键触发')}
              </div>
            </div>
            <div className="trash mRight20 Hand" onClick={() => setState({ showTrash: true })}>
              <Icon icon="knowledge-recycle" className="Font18 textTertiary TxtMiddle" />
              <div className="InlineBlock Hand mLeft5 textSecondary TxtMiddle">{_l('回收站')}</div>
            </div>
            <Button radius onClick={() => setState({ createAIActionDialogVisible: true })}>
              <Icon icon="plus" className="mRight3 TxtMiddle" />
              <span className="TxtMiddle">{_l('添加')}</span>
            </Button>
          </div>
          <div className="flex minHeight0 overflowHidden flexColumn">
            <div className="aiActionHeader">
              <div className="flex pRight20">{_l('名称')}</div>
              <div className="flex">{_l('使用范围')}</div>
              <div className="action">{_l('操作')}</div>
            </div>
            <div className="aiActionList flex minHeight0">
              <SortableList
                items={list}
                itemKey="btnId"
                useDragHandle
                canDrag={canDrag}
                renderItem={({ item, DragHandle }) => {
                  return (
                    <div className="aiActionItem">
                      <DragHandle>
                        <Icon icon="drag" className="textTertiary Font15 pointer mRight10 TxtMiddle" />
                      </DragHandle>
                      {isRename && currentActionItem.btnId === item.btnId ? (
                        <div className="flex">
                          <Input
                            defaultValue={item.name}
                            autoFocus
                            onFocus={() => setState({ canDrag: false })}
                            onBlur={e => {
                              setState({ canDrag: true });
                              handleSave(
                                { EditAttrs: ['name'], name: e.target.value, btnId: item.btnId, worksheetId },
                                false,
                                () => setState({ isRename: false, currentActionItem: {} }),
                              );
                            }}
                            onChange={e => {
                              setState({
                                list: list.map(item =>
                                  item.btnId === item.btnId ? { ...item, name: e.target.value } : item,
                                ),
                              });
                            }}
                          />
                        </div>
                      ) : (
                        <Tooltip title={item.name}>
                          <div className="flex ellipsis pRight20">{item.name}</div>
                        </Tooltip>
                      )}
                      <div className="flex">
                        <span className="viewText textPrimary">{renderViewScopeText({ item, views })}</span>
                      </div>
                      <div className="action">
                        <Trigger
                          popupVisible={showDropOption && currentActionItem.btnId === item.btnId}
                          action={['click']}
                          popupAlign={{
                            offset: [0, 10],
                            points: ['tl', 'bl'],
                            overflow: { adjustX: true, adjustY: true },
                          }}
                          onPopupVisibleChange={visible =>
                            setState({ showDropOption: visible, currentActionItem: visible ? item : {} })
                          }
                          popup={
                            <BtnRangeDrop
                              data={item}
                              views={views}
                              noBatch={true}
                              onClose={() => setState({ showDropOption: false, currentActionItem: {} })}
                              onChange={data => updateScope(item, data)}
                            />
                          }
                        >
                          <span
                            className="Hand Bold activeCon"
                            onClick={() => setState({ showDropOption: true, currentActionItem: item })}
                          >
                            {_l('使用范围')}
                          </span>
                        </Trigger>
                        <span
                          className="Hand mLeft30 Bold activeCon"
                          onClick={() => setState({ editAIActionDrawerVisible: true, currentActionItem: item })}
                        >
                          {_l('编辑')}
                        </span>
                        <Trigger
                          action={['click']}
                          popupAlign={{
                            points: ['tl', 'bl'],
                            overflow: { adjustX: true, adjustY: true },
                          }}
                          getPopupContainer={() => document.body}
                          onPopupVisibleChange={showMoreOption => setState({ showMoreOption })}
                          popupVisible={showMoreOption && currentActionItem.btnId === item.btnId}
                          popup={
                            <MoreOption
                              showCopy={false}
                              delTxt={_l('删除')}
                              description={_l('动作将被删除，请确认执行此操作')}
                              showMoreOption={showMoreOption}
                              onClickAwayExceptions={[]}
                              onClickAway={() => setState({ showMoreOption: false })}
                              setFn={data => setState(data)}
                              deleteFn={handleDelete}
                            />
                          }
                        >
                          <Icon
                            icon="more_horiz"
                            className="moreActive Hand Font18 textTertiary hoverColorPrimary mLeft30"
                            onClick={() => setState({ showMoreOption: true, currentActionItem: item })}
                          />
                        </Trigger>
                      </div>
                    </div>
                  );
                }}
                onSortEnd={newItems => updateSorts(newItems.map(item => item.btnId))}
              />
            </div>
          </div>
        </Fragment>
      )}

      {showTrash && (
        <TrashDialog
          projectId={worksheetInfo.projectId}
          appId={worksheetInfo.appId}
          worksheetId={worksheetId}
          views={worksheetInfo.views || []}
          btnType={1}
          onCancel={() => {
            setState({
              showTrash: false,
            });
          }}
          onChange={getAIActionList}
        />
      )}

      {createAIActionDialogVisible && (
        <CreateAIActionDialog
          appId={worksheetInfo.appId}
          worksheetId={worksheetId}
          onCancel={() => setState({ createAIActionDialogVisible: false })}
          onSuccess={data => {
            handleSave(
              { ...data, isAllView: 1, desc: data?.description || '', advancedSetting: { prompt: data.prompt || '' } },
              true,
            );
          }}
        />
      )}

      {editAIActionDrawerVisible && (
        <EditAIActionDrawer
          appId={worksheetInfo.appId}
          worksheetId={worksheetId}
          projectId={worksheetInfo.projectId}
          currentActionItem={currentActionItem}
          columns={worksheetControls
            .filter(item => {
              return item.viewDisplay || !('viewDisplay' in item);
            })
            .map(control => redefineComplexControl(control))}
          sheetSwitchPermit={worksheetInfo.switches}
          saveLoading={saveLoading}
          getAIActionList={getAIActionList}
          onClose={() => setState({ editAIActionDrawerVisible: false })}
          handleSave={handleSave}
        />
      )}
    </Con>
  );
}
