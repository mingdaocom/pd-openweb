import React, { Fragment, memo, useRef, useState } from 'react';
import copy from 'copy-to-clipboard';
import moment from 'moment';
import Trigger from 'rc-trigger';
import { Checkbox, Dialog, Icon, LoadDiv, Menu, MenuItem, ScrollView, SvgIcon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import knowledgeAjax from '../../api/knowledge';
import { KNOWLEDGE_ACTION_VISIBLE_STATUS, STATUS_FROM } from '../../core/config';
import { useAutoFocus, useKnowledgeUsage } from '../../core/hooks';
import { isDisabledKnowledge } from '../../core/utils';
import Banner from '../Banner';
import BasicStatus from '../BasicStatus';
import CreateKnowledgeEntry from '../CreateKnowledgeEntry';
import DialogFooter from '../DialogFooter';
import Guide from '../Guide';
import { useKnowledgeList } from './hooks';
import './index.less';

const DIALOG_TYPE_MAP = {
  UPDATE: 'update',
  DELETE: 'delete',
  RESET: 'reset',
};

const KnowledgeList = props => {
  const { appId, projectId, openKnowledgeDetail } = props;
  const disabledKnowledge = isDisabledKnowledge(projectId, true);
  const { loading, list, refresh, updateItem, removeItem } = useKnowledgeList(appId);
  const { overLimit, attachmentEnhancedTip } = useKnowledgeUsage(projectId);
  const knowledgeOverLimit = disabledKnowledge ? false : overLimit;

  const inputRef = useRef(null);

  const [currentKnowledge, setCurrentKnowledge] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [dialogState, setDialogState] = useState({
    type: null,
    isChecked: false,
    loading: false,
  });

  useAutoFocus(inputRef, dialogState.type === DIALOG_TYPE_MAP.UPDATE);

  const openDialog = type => {
    setDialogState({
      type,
      isChecked: false,
      loading: false,
    });
  };

  // 关闭对话框
  const closeDialog = () => setDialogState(prev => ({ ...prev, type: null }));

  // 打开编辑知识库信息对话框
  const openUpdateKnowledgeDialog = e => {
    e.stopPropagation();
    setActiveId(null);
    openDialog(DIALOG_TYPE_MAP.UPDATE);
  };

  // 打开删除知识库对话框
  const openDeleteKnowledge = e => {
    e.stopPropagation();
    setActiveId(null);
    openDialog(DIALOG_TYPE_MAP.DELETE);
  };

  // 重置知识库
  const openResetKnowledge = e => {
    e.stopPropagation();
    setActiveId(null);
    openDialog(DIALOG_TYPE_MAP.RESET);
  };

  // 保存知识库信息
  const saveKnowledge = async () => {
    if (!currentKnowledge.name) {
      alert(_l('请输入名称'), 3);
      return;
    }

    try {
      const res = await knowledgeAjax.updateKnowledgeBase({
        id: currentKnowledge.id,
        name: currentKnowledge.name,
        description: currentKnowledge.description,
      });

      if (!res) {
        alert(_l('更新失败'), 2);
        return;
      }

      alert(_l('更新成功'));
      updateItem(currentKnowledge);
      closeDialog();
      setCurrentKnowledge({});
    } catch (err) {
      console.error(err);
      alert(_l('更新失败'), 2);
    }
  };

  // 删除知识库
  const deleteKnowledgeBase = async () => {
    const { id } = currentKnowledge;

    try {
      setDialogState(prev => ({ ...prev, loading: true }));
      await knowledgeAjax.deleteKnowledgeBase({ id });
      removeItem(id);
      closeDialog();
      alert(_l('删除成功'));
    } catch (err) {
      console.error(err);
      alert(_l('删除失败'), 2);
    } finally {
      setDialogState(prev => ({ ...prev, loading: false }));
    }
  };

  // 复制知识库ID
  const copyKnowledgeId = e => {
    e.stopPropagation();
    copy(currentKnowledge.id);
    alert(_l('复制成功'));
    setActiveId(null);
  };

  // 重置知识库
  const resetKnowledge = async () => {
    const { id } = currentKnowledge;

    try {
      setDialogState(prev => ({ ...prev, loading: true }));
      await knowledgeAjax.resetData({ id });
      closeDialog();
      refresh(true);
    } catch (err) {
      console.error(err);
    } finally {
      setDialogState(prev => ({ ...prev, loading: false }));
    }
  };

  const renderKnowledgeWorksheet = () => {
    return (
      <div className="knowledgeList">
        {list.map(item => (
          <div className="knowledgeItem" key={item.id} onClick={() => openKnowledgeDetail(item.id)}>
            <div className="knowledgeItemHeader">
              <div className="left">
                <div className="title ellipsis">{item.name}</div>
                <Tooltip
                  title={
                    <div className="knowledgeInfoTooltip">
                      <div>{`${_l('使用模型')}：${item.embeddingModel}`}</div>
                      <div>{`${_l('创建时间')}：${item.creator?.fullname} ${moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}`}</div>
                      {item.description && <div>{`${_l('说明')}：${item.description}`}</div>}
                    </div>
                  }
                >
                  <Icon icon="info_outline" className="modelInfo" />
                </Tooltip>
              </div>
              <div className="right">
                <Trigger
                  popupVisible={activeId === item.id}
                  popup={
                    <Menu className="knowledgeMoreActions" style={{ position: 'unset' }}>
                      {KNOWLEDGE_ACTION_VISIBLE_STATUS.cancelVector.includes(item.taskStatus) && (
                        <MenuItem>{_l('取消向量化入库')}</MenuItem>
                      )}
                      <MenuItem onClick={openUpdateKnowledgeDialog}>{_l('编辑信息')}</MenuItem>
                      <MenuItem onClick={copyKnowledgeId}>{_l('复制 ID')}</MenuItem>
                      {KNOWLEDGE_ACTION_VISIBLE_STATUS.reset.includes(item.taskStatus) && (
                        <MenuItem onClick={openResetKnowledge}>{_l('重置知识库')}</MenuItem>
                      )}
                      <MenuItem className="delete" onClick={openDeleteKnowledge}>
                        {_l('删除')}
                      </MenuItem>
                    </Menu>
                  }
                  action={['click']}
                  popupAlign={{
                    points: ['tr', 'br'],
                    offset: [0, 5],
                    overflow: { adjustX: true, adjustY: true },
                  }}
                  onPopupVisibleChange={visible => {
                    setActiveId(visible ? item.id : null);
                  }}
                >
                  <div
                    className="moreIconWrap"
                    onClick={e => {
                      e.stopPropagation();
                      setCurrentKnowledge(item);
                      setActiveId(item.id);
                    }}
                  >
                    <Icon icon="more_vert" className="moreIcon" />
                  </div>
                </Trigger>
              </div>
            </div>
            <div className="knowledgeInfo">
              <div className="knowledgeWorksheet">
                {item.worksheets?.map(({ workSheetId, workSheetName, iconUrl }) => (
                  <Fragment key={workSheetId}>
                    {workSheetId && workSheetName ? (
                      <div className="worksheetItem" key={`${item.id}-${workSheetId}`}>
                        {iconUrl && <SvgIcon url={iconUrl} fill="var(--color-text-tertiary)" size={20} />}
                        <div className="title ellipsis">{workSheetName}</div>
                      </div>
                    ) : (
                      <Tooltip title={_l('工作表ID：%0', workSheetId)}>
                        <div className="worksheetItem" key={`${item.id}-${workSheetId}`}>
                          <div className="title">{_l('已删除')}</div>
                        </div>
                      </Tooltip>
                    )}
                  </Fragment>
                ))}
              </div>
              <BasicStatus from={STATUS_FROM.KNOWLEDGE} item={item} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <LoadDiv />;

  if (list.length === 0)
    return (
      <Guide
        appId={appId}
        projectId={projectId}
        refreshKnowledgeList={refresh}
        overLimit={knowledgeOverLimit}
        attachmentEnhancedTip={attachmentEnhancedTip}
      />
    );

  return (
    <div className="knowledgeListContainer">
      <div className="header">
        <div className="headerLeft">
          <div className="headerLeftTitle">{_l('向量知识库')}</div>
          <div className="description">{_l('创建并管理应用下的向量知识库')}</div>
        </div>
        <div className="headerRight">
          <CreateKnowledgeEntry
            appId={appId}
            projectId={projectId}
            refreshKnowledgeList={refresh}
            overLimit={knowledgeOverLimit}
            attachmentEnhancedTip={attachmentEnhancedTip}
          />
        </div>
      </div>
      {disabledKnowledge && (
        <Banner
          type="error"
          icon="info1"
          text={
            !window.platformENV.isOverseas && !window.platformENV.isLocal
              ? _l('组织授权到期，知识库暂不可用。知识库内数据将保留30天，到期后自动清空')
              : _l('组织授权到期，知识库暂不可用')
          }
        />
      )}
      {!disabledKnowledge && overLimit && (
        <Banner
          type="warning"
          icon="info1"
          text={_l(
            '组织知识库用量已超限。新增数据将暂停向量化入库，但不影响已有内容的检索。如需恢复同步，请联系管理员增购额度',
          )}
        />
      )}
      <div className="content">
        <ScrollView>{renderKnowledgeWorksheet()}</ScrollView>
      </div>
      {dialogState.type === DIALOG_TYPE_MAP.UPDATE && (
        <Dialog visible title={_l('编辑信息')} width={550} onCancel={closeDialog} onOk={saveKnowledge}>
          <div className="updateKnowledgeForm">
            <div className="formLabel">{_l('名称')}</div>
            <input
              ref={inputRef}
              className="knowledgeInput"
              value={currentKnowledge.name}
              placeholder={_l('请输入')}
              onChange={e => setCurrentKnowledge({ ...currentKnowledge, name: e.target.value })}
            />
            <div className="formLabel">{_l('说明')}</div>
            <textarea
              className="knowledgeTextarea"
              value={currentKnowledge.description}
              placeholder={_l('请输入')}
              onChange={e => setCurrentKnowledge({ ...currentKnowledge, description: e.target.value })}
            />
          </div>
        </Dialog>
      )}
      {dialogState.type === DIALOG_TYPE_MAP.DELETE && (
        <Dialog
          visible
          title={<span className="Red">{_l('删除知识库 “%0”', currentKnowledge.name)}</span>}
          width={580}
          onCancel={closeDialog}
          footer={
            <DialogFooter
              okLoading={dialogState.loading}
              okType="danger"
              okDisabled={!dialogState.isChecked}
              okText={_l('确认删除')}
              onCancel={closeDialog}
              onOk={deleteKnowledgeBase}
            />
          }
        >
          <div className="openDeleteKnowledge">
            <div className="mBottom3">{_l('删除后，知识库内容会被清空，相关工作流节点将无法检索此知识库')}</div>
            <div className="mBottom20">{_l('注：并不会删除原始工作表')}</div>
            <Checkbox
              text={_l('我确认删除知识库')}
              onClick={checked => setDialogState(prev => ({ ...prev, isChecked: checked }))}
            />
          </div>
        </Dialog>
      )}
      {dialogState.type === DIALOG_TYPE_MAP.RESET && (
        <Dialog
          visible
          title={<span className="Red">{_l('重置知识库')}</span>}
          width={580}
          onCancel={closeDialog}
          footer={
            <DialogFooter
              okLoading={dialogState.loading}
              okType="danger"
              okDisabled={!dialogState.isChecked}
              okText={_l('确认')}
              onCancel={closeDialog}
              onOk={resetKnowledge}
            />
          }
        >
          <div className="openDeleteKnowledge">
            <div className="mBottom20">
              {_l('确认后将清空数据并重新分块（期间不可检索），分块完成后需您再次确认以开始向量数据入库。')}
            </div>
            <Checkbox
              text={_l('我确认重置知识库')}
              onClick={checked => setDialogState(prev => ({ ...prev, isChecked: checked }))}
            />
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default memo(KnowledgeList);
