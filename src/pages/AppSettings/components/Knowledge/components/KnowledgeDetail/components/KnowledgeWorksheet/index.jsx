import React, { Fragment, memo, useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import Trigger from 'rc-trigger';
import { Checkbox, Dialog, Icon, LoadDiv, Menu, MenuItem, ScrollView, Support, Switch } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import knowledgeAjax from '../../../../api/knowledge';
import knowledgeCollectionAjax from '../../../../api/knowledgeCollection';
import knowledgeVectorAjax from '../../../../api/knowledgeVector';
import homeAppAjax from 'src/api/homeApp';
import worksheetAjax from 'src/api/worksheet';
import { formatValuesOfOriginConditions } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { getTranslateInfo } from 'src/utils/app';
import {
  COLLECTION_ACTION_VISIBLE_STATUS,
  FIELD_RULE_TIP_URL,
  KNOWLEDGE_STATUS,
  KNOWLEDGE_STATUS_INITIALIZING,
  SELECT_FIELD_TIP,
  SHOW_KNOWLEDGE_SEARCH_STATUS,
  STATUS_FROM,
} from '../../../../core/config';
import { useKnowledgeUsage } from '../../../../core/hooks';
import {
  fetchFilterData,
  getControlIcon,
  isDisabledKnowledge,
} from '../../../../core/utils';
import Banner from '../../../Banner';
import BasicStatus from '../../../BasicStatus';
import CollapsePanel from '../../../CollapsePanel';
import KnowledgeSearch from '../KnowledgeSearch';
import AddWorksheet from './components/AddWorksheet';
import AsyncTooltip from './components/AsyncTooltip';
import EllipsisText from './components/EllipsisText';
import ErrorDialog from './components/ErrorDialog';
import { useKnowledgeDetail } from './core/hooks';
import { getBannerConfig } from './utils';
import './index.less';

const FORMAT_TIME = 'YYYY-MM-DD HH:mm:ss';

const DIALOG_TYPE_MAP = {
  // 确认向量化入库
  CONFIRM_VECTORIZE: 'confirmVectorize',
  // 调整知识源
  UPDATE_COLLECTION: 'updateCollection',
  // 选择影响范围
  COLLECTION_SCOPE: 'collectionScope',
  // 删除知识源
  DELETE: 'delete',
  // 取消向量化入库
  CANCEL_VECTORIZE: 'cancelVectorize',
  // 重新向量化入库
  RE_VECTORIZE: 'reVectorize',
  // 错误展示
  CHECK_ERROR: 'checkError',
};

const KnowledgeWorksheet = props => {
  const { appId, projectId, knowledgeId, backToList, openChunkPreview } = props;
  const { overLimit, remainingCount, attachmentEnhancedTip } = useKnowledgeUsage(projectId);
  const showAttachmentParseEnhanced = !!attachmentEnhancedTip;
  const disabledKnowledge = isDisabledKnowledge(projectId, true);
  const knowledgeOverLimit = disabledKnowledge ? false : overLimit;

  const [allWorksheetList, setAllWorksheetList] = useState([]);
  const [currentCollection, setCurrentCollection] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [formattedCollection, setFormattedCollection] = useState({});
  const [showKnowledgeSearch, setShowKnowledgeSearch] = useState(false);
  const [filterConditionsMap, setFilterConditionsMap] = useState({});
  const [worksheetControlsMap, setWorksheetControlsMap] = useState({});
  const [chunksStatistics, setChunksStatistics] = useState({});
  const [startVectorizeLoading, setStartVectorizeLoading] = useState(false);
  const [cancelVectorizeLoading, setCancelVectorizeLoading] = useState(false);
  const [dialogState, setDialogState] = useState({
    type: null,
    isChecked: false,
    loading: false,
    // 知识源操作类型: edit/add
    updateType: 'edit',
  });

  const { loading, knowledgeDetail, refresh } = useKnowledgeDetail(knowledgeId, {
    enabled: !showKnowledgeSearch,
    callback: backToList,
  });

  const { selectedWorksheetIdSet, canStartVectorize, hasAvailableCollection } = useMemo(() => {
    const list = knowledgeDetail.knowledgeCollections || [];

    const idSet = new Set();

    let canVectorize = true;
    let hasAvailable = false;

    for (const item of list) {
      if (item.worksheet) {
        idSet.add(item.worksheet?.workSheetId);
      }

      // 是否可以开始向量化
      if (item.taskStatus !== KNOWLEDGE_STATUS.CHUNK_SUCCESS && item.taskStatus !== KNOWLEDGE_STATUS.CHUNK_FAILED) {
        canVectorize = false;
      }

      // 是否有可用的知识源
      if (!item.isDeleted) {
        hasAvailable = true;
      }
    }

    return {
      selectedWorksheetIdSet: idSet,
      canStartVectorize: list.length ? canVectorize : false,
      hasAvailableCollection: hasAvailable,
    };
  }, [knowledgeDetail.knowledgeCollections]);

  const availableList = useMemo(() => {
    return allWorksheetList.filter(item => !selectedWorksheetIdSet.has(item.worksheetId));
  }, [allWorksheetList, selectedWorksheetIdSet]);

  const openDialog = (type, updateType = 'edit') =>
    setDialogState({ type, isChecked: false, loading: false, updateType });

  const closeDialog = () => setDialogState(prev => ({ ...prev, type: null }));

  useEffect(() => {
    homeAppAjax.getWorksheetsByAppId({ appId, type: 0 }).then(data => {
      const worksheetList = data.map(item => ({
        worksheetId: item.workSheetId,
        worksheetName: getTranslateInfo(appId, null, item.workSheetId).name || item.workSheetName,
        worksheet: item,
      }));
      setAllWorksheetList(worksheetList);
    });
  }, []);

  // 打开开始向量化对话框
  const openKnowledgeVector = () => {
    if (!canStartVectorize || isDisabledKnowledge(projectId)) {
      return;
    }

    setStartVectorizeLoading(true);
    knowledgeAjax.getKnowledgeBaseChunksStatistics({ knowledgeId }).then(res => {
      setChunksStatistics(res);
      openDialog(DIALOG_TYPE_MAP.CONFIRM_VECTORIZE);
    });
  };

  // 打开取消向量化对话框
  const openCancelVectorizeDialog = () => {
    if (cancelVectorizeLoading) return;

    openDialog(DIALOG_TYPE_MAP.CANCEL_VECTORIZE);
  };

  // 开始向量化
  const startKnowledgeVector = () => {
    knowledgeVectorAjax
      .startKnowledgeVector({
        knowledgeId,
        knowledgeOrCollectionPresent: true,
      })
      .then(res => {
        if (res) {
          refresh();
        }
      })
      .finally(() => {
        closeDialog();
        setStartVectorizeLoading(false);
      });
  };

  // 取消向量化
  const cancelKnowledgeVector = () => {
    setCancelVectorizeLoading(true);
    knowledgeVectorAjax
      .cancelKnowledgeVector({ knowledgeId })
      .then(() => {
        refresh();
      })
      .finally(() => {
        closeDialog();
        setCancelVectorizeLoading(false);
      });
  };

  // 打开调整知识源对话框
  const openUpdateCollectionScope = async e => {
    e.stopPropagation();

    if (isDisabledKnowledge(projectId, false, () => setActiveId(null))) return;

    const { filterId, worksheet, controls, parseEnhanced, discussionEnabled, attachmentParseEnhanced } =
      currentCollection;

    const worksheetId = worksheet.workSheetId;

    let nextFilterMap = { ...filterConditionsMap };
    let nextControlsMap = { ...worksheetControlsMap };

    let filterConditions = nextFilterMap[filterId];
    let worksheetControls = nextControlsMap[worksheetId];

    if (!filterConditions?.length || !worksheetControls?.length) {
      const res = await fetchFilterData({
        worksheetId,
        filterId,
        setWorksheetControlsMap,
        setFilterConditionsMap,
      });

      filterConditions = res?.filterConditions || [];
      worksheetControls = res?.controls || [];

      nextFilterMap[filterId] = filterConditions;
      nextControlsMap[worksheetId] = worksheetControls;
    }

    // UI 状态
    setActiveId(null);
    openDialog(DIALOG_TYPE_MAP.UPDATE_COLLECTION, 'edit');

    // 数据状态
    setFormattedCollection({
      worksheetId,
      worksheetName: worksheet.workSheetName,
      worksheet,
      fields: controls,
      filterConditions,
      parseEnhanced,
      discussionEnabled,
      attachmentParseEnhanced,
      filterId,
    });

    setFilterConditionsMap(nextFilterMap);
    setWorksheetControlsMap(nextControlsMap);
  };

  // 调整知识源
  const updateCollection = () => {
    if (!formattedCollection.fields?.length) {
      alert(_l('请配置字段'), 3);
      return;
    }

    if (dialogState.updateType === 'add') {
      createKnowledgeCollection();
      return;
    }

    openDialog(DIALOG_TYPE_MAP.COLLECTION_SCOPE);
  };

  const getFilterConditions = async (item, filterId) => {
    const filterItems = formatValuesOfOriginConditions(item.filterConditions);

    const data = await worksheetAjax.saveWorksheetFilter({
      appId,
      worksheetId: item.worksheetId,
      items: filterItems,
      module: 3,
      name: '',
      type: '',
      filterId,
    });
    return data.filterId;
  };

  const deleteFilterConditions = async filterId => {
    await worksheetAjax.deleteWorksheetFilter({
      appId,
      filterId,
    });
  };

  const deleteKeyFromMap = (mapSetter, key) => {
    mapSetter(prev => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // 更新知识范围
  const updateCollectionScope = async () => {
    const { fields, parseEnhanced, discussionEnabled, filterId, filterConditions, attachmentParseEnhanced } =
      formattedCollection;

    try {
      const newFilterId = filterConditions?.length
        ? await getFilterConditions(formattedCollection, filterId)
        : filterId
          ? await deleteFilterConditions(filterId)
          : null;

      await knowledgeCollectionAjax.updateKnowledgeCollection({
        id: currentCollection.id,
        controlIds: fields.map(item => item.controlId),
        parseEnhanced,
        discussionEnabled,
        attachmentParseEnhanced,
        filterId: newFilterId,
        initData:
          [KNOWLEDGE_STATUS.CHUNK_SUCCESS, KNOWLEDGE_STATUS.CHUNK_FAILED].includes(knowledgeDetail.taskStatus) ||
          dialogState.isChecked,
      });

      alert(_l('保存成功'));
      closeDialog();
      setFormattedCollection({});

      deleteKeyFromMap(setFilterConditionsMap, filterId);

      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  // 创建知识源
  const createKnowledgeCollection = async () => {
    const { fields, parseEnhanced, discussionEnabled, worksheetId, filterConditions, attachmentParseEnhanced } =
      formattedCollection;
    let filterId = null;

    try {
      if (filterConditions?.length) {
        filterId = await getFilterConditions(formattedCollection);
      }

      // 创建知识源
      await knowledgeCollectionAjax.createKnowledgeCollection({
        knowledgeId,
        worksheetId,
        controlIds: fields.map(item => item.controlId),
        parseEnhanced,
        discussionEnabled,
        attachmentParseEnhanced,
        filterId,
      });

      // 成功提示 & 清理状态
      alert(_l('创建成功'));
      closeDialog();
      setFormattedCollection({});
      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddSelectedField = ({ control }) => {
    setFormattedCollection(prev => ({ ...prev, fields: [...prev.fields, control] }));
  };

  const handleRemoveSelectedField = ({ control }) => {
    setFormattedCollection(prev => ({
      ...prev,
      fields: prev.fields.filter(item => item.controlId !== control.controlId),
    }));
  };

  const handleSetCollectionDiscuss = () => {
    setFormattedCollection(prev => ({ ...prev, discussionEnabled: !prev.discussionEnabled }));
  };

  const handleSetCollectionEnhance = () => {
    setFormattedCollection(prev => ({ ...prev, parseEnhanced: !prev.parseEnhanced }));
  };

  const handleSetAttachmentParseEnhanced = () => {
    setFormattedCollection(prev => ({ ...prev, attachmentParseEnhanced: !prev.attachmentParseEnhanced }));
  };

  const handleSaveFilterConditions = ({ filter }) => {
    setFormattedCollection(prev => ({ ...prev, filterConditions: filter }));
  };

  const handleOpenChunkPreview = (knowledgeDetail, item) => {
    if (item.isDeleted) {
      return;
    }

    if (!COLLECTION_ACTION_VISIBLE_STATUS.preview.includes(item.taskStatus)) {
      alert(_l('暂时无法查看分块'), 3);
      return;
    }

    openChunkPreview(knowledgeDetail, item);
    setActiveId(null);
  };

  // 打开添加知识范围对话框
  const openAddCollection = worksheet => {
    setFormattedCollection({
      ...worksheet,
      fields: [],
      filterConditions: [],
      filterId: null,
      parseEnhanced: false,
      attachmentParseEnhanced: false,
      discussionEnabled: false,
    });
    openDialog(DIALOG_TYPE_MAP.UPDATE_COLLECTION, 'add');
  };

  // 打开删除对话框
  const openDeleteDialog = e => {
    e.stopPropagation();
    setActiveId(null);
    openDialog(DIALOG_TYPE_MAP.DELETE);
  };

  // 删除工作表
  const deleteWorksheet = () => {
    knowledgeCollectionAjax.deleteKnowledgeCollection({ id: currentCollection.id }).then(() => {
      alert(_l('删除成功'));
      refresh();
      closeDialog();
    });
  };

  const renderWorksheet = () => {
    const { knowledgeCollections = [] } = knowledgeDetail;

    if (!knowledgeCollections.length) return null;

    return (
      <ScrollView className="contentBodyWrapper">
        <div className="contentBody">
          {knowledgeCollections.map(item => {
            const {
              id,
              worksheet,
              controls,
              updateTime,
              updater,
              filterId,
              discussionEnabled,
              attachmentParseEnhanced,
            } = item;
            return (
              <div className="worksheetItem" key={id} onClick={() => handleOpenChunkPreview(knowledgeDetail, item)}>
                {item.isDeleted ? (
                  <div className="worksheetName">
                    <Tooltip title={_l('工作表ID：%0', worksheet?.workSheetId)}>
                      <span>{_l('已删除')}</span>
                    </Tooltip>
                  </div>
                ) : (
                  <div className="worksheetName">{worksheet?.workSheetName}</div>
                )}
                <div className="fields">
                  {controls?.map(control => {
                    return control.controlId && control.controlName ? (
                      <EllipsisText key={control.controlId} text={control.controlName} icon={getControlIcon(control)} />
                    ) : (
                      <Tooltip title={_l('字段ID：%0', control.controlId)}>
                        <span className="fieldItem" key={control.controlId}>
                          {_l('已删除')}
                        </span>
                      </Tooltip>
                    );
                  })}
                  {discussionEnabled && (
                    <div className="fieldItem">
                      <Icon icon="chat-full" />
                      {_l('记录讨论')}
                    </div>
                  )}
                </div>
                <div className={cx('dataFilter', { active: filterId })}>
                  {filterId ? (
                    <AsyncTooltip
                      filterId={filterId}
                      worksheetId={worksheet?.workSheetId}
                      filterConditions={filterConditionsMap[filterId]}
                      setFilterConditionsMap={setFilterConditionsMap}
                      controls={worksheetControlsMap[worksheet?.workSheetId]}
                      setWorksheetControlsMap={setWorksheetControlsMap}
                    >
                      <Icon icon="filter" />
                      {_l('包含')}
                    </AsyncTooltip>
                  ) : (
                    <div className="emptyPlaceholder">-</div>
                  )}
                </div>
                {/* <div className={cx('parseEnhance', { active: parseEnhanced })}>
                  <Icon icon="auto_one_star" />
                  {parseEnhanced ? _l('已开启') : _l('未开启')}
                </div> */}
                {showAttachmentParseEnhanced && (
                  <div className={cx('attachmentParseEnhanced', { active: attachmentParseEnhanced })}>
                    {attachmentParseEnhanced ? (
                      <Fragment>
                        <Icon icon="filePRO" />
                        {_l('已开启')}
                      </Fragment>
                    ) : (
                      <div className="emptyPlaceholder">-</div>
                    )}
                  </div>
                )}
                <div className="updateInfo">
                  <span>{updater?.fullname || ''}</span>
                  <span>{moment(updateTime).format(FORMAT_TIME)}</span>
                </div>
                <div className="status">
                  <BasicStatus
                    item={item}
                    from={STATUS_FROM.COLLECTION}
                    onError={() => openDialog(DIALOG_TYPE_MAP.CHECK_ERROR)}
                  />
                </div>
                <div className="action">
                  <Trigger
                    popupVisible={activeId === item.id}
                    popup={
                      <Menu className="knowledgeMoreActions" style={{ position: 'unset' }}>
                        {COLLECTION_ACTION_VISIBLE_STATUS.preview.includes(item.taskStatus) && !item.isDeleted && (
                          <MenuItem
                            onClick={e => {
                              e.stopPropagation();
                              handleOpenChunkPreview(knowledgeDetail, item);
                            }}
                          >
                            {_l('分块预览')}
                          </MenuItem>
                        )}
                        {COLLECTION_ACTION_VISIBLE_STATUS.changeScope.includes(item.taskStatus) && !item.isDeleted && (
                          <MenuItem onClick={openUpdateCollectionScope}>{_l('调整知识源')}</MenuItem>
                        )}
                        {/* {COLLECTION_ACTION_VISIBLE_STATUS.rePullData.includes(item.taskStatus) && (
                          <MenuItem>{_l('重试')}</MenuItem>
                        )} */}
                        {!KNOWLEDGE_STATUS_INITIALIZING.includes(knowledgeDetail.taskStatus) && (
                          <MenuItem className="delete" onClick={openDeleteDialog}>
                            {_l('删除')}
                          </MenuItem>
                        )}
                      </Menu>
                    }
                    action={['click']}
                    popupAlign={{
                      points: ['tr', 'br'],
                      offset: [0, 5],
                      overflow: { adjustX: true, adjustY: true },
                    }}
                    onPopupVisibleChange={visible => setActiveId(visible ? item.id : null)}
                  >
                    <div
                      className="moreIconWrap"
                      onClick={e => {
                        e.stopPropagation();
                        setCurrentCollection(item);
                      }}
                    >
                      <Icon icon="more_vert" className="moreIcon" />
                    </div>
                  </Trigger>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollView>
    );
  };

  const config = getBannerConfig({
    knowledgeDetail,
    remainingCount,
    hasAvailableCollection,
    canStartVectorize,
    startVectorizeLoading,
    cancelVectorizeLoading,
    onStart: openKnowledgeVector,
    onCancel: openCancelVectorizeDialog,
  });

  if (loading) return <LoadDiv />;

  return (
    <div className="KnowledgeDetailContainer">
      <div className="KnowledgeDetailHeader">
        <div className="left">
          <div className="knowledgeInfo">
            <Icon icon="backspace" onClick={backToList} />
            <span className="knowledgeName ellipsis">{knowledgeDetail.name}</span>
            <Tooltip
              title={
                <div className="knowledgeInfoTooltip">
                  <div>{`${_l('使用模型')}：${knowledgeDetail.modelConfig?.embeddingModel}`}</div>
                  <div>{`${_l('创建时间')}：${knowledgeDetail.creator?.fullname} ${moment(knowledgeDetail.createTime).format('YYYY-MM-DD HH:mm:ss')}`}</div>
                  {knowledgeDetail.description && <div>{`${_l('说明')}：${knowledgeDetail.description}`}</div>}
                </div>
              }
            >
              <Icon icon="info_outline" className="knowledgeDesc" />
            </Tooltip>
            {hasAvailableCollection && !_.isNil(knowledgeDetail?.totalChunks) && (
              <span className="totalChunkCount">{_l('%0 个分块', knowledgeDetail.totalChunks.toLocaleString())}</span>
            )}
          </div>
        </div>
        <div className="right">
          {SHOW_KNOWLEDGE_SEARCH_STATUS.includes(knowledgeDetail.taskStatus) &&
            knowledgeDetail?.knowledgeCollections?.length > 0 && (
              <div
                className="retrieveBtn"
                onClick={() => {
                  if (isDisabledKnowledge(projectId)) return;
                  setShowKnowledgeSearch(true);
                }}
              >
                <Icon icon="a-knowledge_search" />
                {_l('检索测试')}
              </div>
            )}
          <AddWorksheet
            disabled={KNOWLEDGE_STATUS_INITIALIZING.includes(knowledgeDetail.taskStatus) || knowledgeOverLimit}
            appId={appId}
            projectId={projectId}
            availableList={availableList}
            onSelect={openAddCollection}
          />
        </div>
      </div>
      {config && (
        <Banner className="mTop20" type={config.type} icon={config.icon} text={config.text} action={config.action} />
      )}
      {/* <Banner
        type="warning"
        text={_l('知识库模型不可用，知识库无法进行更新和检索。')}
        action={{ text: _l('使用平台模型重新向量化入库') }}
      />
      <Banner type="warning" text={_l('知识库未启用，无法进行检索。')} action={{ text: _l('启用') }} /> */}
      <div className="KnowledgeDetailContent">
        <div className="contentHeader">
          <div className="worksheetName">{_l('工作表名称')}</div>
          <div className="fields">{_l('包含内容')}</div>
          <div className="dataFilter">{_l('数据过滤')}</div>
          {/* <div className="parseEnhance">{_l('解析增强')}</div> */}
          {showAttachmentParseEnhanced && <div className="attachmentParseEnhanced">{_l('附件解析增强')}</div>}
          <div className="updateInfo">{_l('更新信息')}</div>
          <div className="status">{_l('状态')}</div>
          <div className="action"></div>
        </div>
        <div className="contentBox">{renderWorksheet()}</div>
      </div>
      {dialogState.type === DIALOG_TYPE_MAP.CONFIRM_VECTORIZE && (
        <Dialog
          visible
          title={_l('确认是否向量化入库')}
          width={550}
          onCancel={() => {
            closeDialog();
            setStartVectorizeLoading(false);
          }}
          onOk={startKnowledgeVector}
        >
          <div className="confirmVectorizeInfo">
            <div className="description">
              <div>{_l('向量化入库完成可正常使用，入库过程中，无法修改知识库范围')}</div>
            </div>
            <div className="baseInfo">{_l('记录：%0 个分块', chunksStatistics.recordChunkCount.toLocaleString())}</div>
            <div className="baseInfo">
              {_l('讨论：%0 个分块', chunksStatistics.discussionChunkCount.toLocaleString())}
            </div>
            <div className="baseInfo">
              {_l(
                '附件：%0 个分块',
                (
                  chunksStatistics.recordAttachmentChunkCount + chunksStatistics.discussionAttachmentChunkCount
                ).toLocaleString(),
              )}
            </div>
            <div className="totalInfo">{_l('共 %0 个分块', chunksStatistics.totalChunkCount.toLocaleString())}</div>
          </div>
        </Dialog>
      )}
      {dialogState.type === DIALOG_TYPE_MAP.UPDATE_COLLECTION && (
        <Dialog
          visible
          title={dialogState.updateType === 'add' ? _l('添加工作表') : _l('调整知识源')}
          width={1000}
          onCancel={closeDialog}
          onOk={updateCollection}
        >
          <div className="updateCollectionScope">
            <div className="addCollectionInfo">
              {SELECT_FIELD_TIP}
              <Support className="link" type={3} href={FIELD_RULE_TIP_URL} text={_l('查看具体规则')} />
            </div>
            <CollapsePanel
              isSingle
              appId={appId}
              projectId={projectId}
              expanded={true}
              attachmentEnhancedTip={attachmentEnhancedTip}
              selectedWorksheetItem={formattedCollection}
              onAddSelectedField={handleAddSelectedField}
              onRemoveSelectedField={handleRemoveSelectedField}
              onSetWorksheetDiscuss={handleSetCollectionDiscuss}
              onSetWorksheetEnhance={handleSetCollectionEnhance}
              onSetAttachmentParseEnhanced={handleSetAttachmentParseEnhanced}
              onSaveFilterConditions={handleSaveFilterConditions}
            />
          </div>
        </Dialog>
      )}
      {dialogState.type === DIALOG_TYPE_MAP.COLLECTION_SCOPE && (
        <Dialog visible title={_l('调整知识源')} width={580} onCancel={closeDialog} onOk={updateCollectionScope}>
          <div className="collectionScope">
            {[KNOWLEDGE_STATUS.CHUNK_SUCCESS, KNOWLEDGE_STATUS.CHUNK_FAILED].includes(knowledgeDetail.taskStatus) ? (
              _l('知识范围有调整。确认保存后将对已分块数据重新计算分块。')
            ) : (
              <Fragment>
                <div className="collectionScopeSwitch">
                  <Switch
                    checked={dialogState.isChecked}
                    onClick={() => setDialogState(prev => ({ ...prev, isChecked: !prev.isChecked }))}
                  />
                  <span className="switchText">{_l('对已向量化的数据同时生效')}</span>
                </div>
                <div>
                  {dialogState.isChecked
                    ? _l(
                        '知识范围或解析方式有调整。确认保存后将对已向量化的数据重新向量化。重新向量化需要一定时间，此期间该知识源暂无法被检索。',
                      )
                    : _l('知识范围或解析方式有调整，确认保存后将对新变更的数据生效，历史数据不受影响。')}
                </div>
              </Fragment>
            )}
          </div>
        </Dialog>
      )}
      {dialogState.type === DIALOG_TYPE_MAP.RE_VECTORIZE && (
        <Dialog
          visible
          title={<span>{_l('重新向量化入库 %0', knowledgeDetail.name)}</span>}
          width={580}
          okText={_l('确认')}
          onCancel={closeDialog}
          onOk={() => {}}
        >
          <div className="reVectorizeKnowledge">
            <div className="mBottom20">
              {_l('知识库当前模型 %0 已失效。确认后，系统将先删除所有内容，并使用平台默认嵌入模型 %1 重新向量化入库。')}
            </div>
          </div>
        </Dialog>
      )}
      {dialogState.type === DIALOG_TYPE_MAP.DELETE && (
        <Dialog
          visible
          title={
            <span className="Red">
              {currentCollection.isDeleted
                ? _l('删除知识源')
                : _l('删除知识源 “%0”', currentCollection.worksheet?.workSheetName)}
            </span>
          }
          width={580}
          okText={_l('确认删除')}
          buttonType="danger"
          okDisabled={!dialogState.isChecked}
          onCancel={closeDialog}
          onOk={deleteWorksheet}
        >
          <div className="deleteKnowledge">
            <div className="mBottom20">{_l('删除后，工作表中所有向量化内容将被永久清空，且无法被语义检索到。')}</div>
            <Checkbox
              text={_l('我确认删除所有向量化内容')}
              onClick={checked => setDialogState(prev => ({ ...prev, isChecked: checked }))}
            />
          </div>
        </Dialog>
      )}
      {dialogState.type === DIALOG_TYPE_MAP.CANCEL_VECTORIZE && (
        <Dialog
          visible
          title={<span className="Red">{_l('取消向量化入库')}</span>}
          width={580}
          buttonType="danger"
          onCancel={closeDialog}
          onOk={cancelKnowledgeVector}
        >
          <div className="cancelVectorizeInfo">
            <div className="mBottom20">{_l('确认后，系统将删除已向量化的内容，知识库也将回退到分块完成的状态。')}</div>
          </div>
        </Dialog>
      )}
      {dialogState.type === DIALOG_TYPE_MAP.CHECK_ERROR && <ErrorDialog visible onCancel={closeDialog} />}
      {showKnowledgeSearch && (
        <KnowledgeSearch knowledgeDetail={knowledgeDetail} onClose={() => setShowKnowledgeSearch(false)} />
      )}
    </div>
  );
};

export default memo(KnowledgeWorksheet);
