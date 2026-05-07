import React, { Fragment, memo, useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import chunkAjax from '../../../../api/chunks';
import { openRecordInfo } from 'worksheet/common/recordInfo';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import {
  ATTACHMENT_TYPE,
  ATTACHMENT_TYPE_FILTERS,
  CHUNK_PREVIEW_TABS,
  CHUNK_TYPE,
  TAB_TYPE,
} from '../../../../core/config';
import { useLinkTargetBlank } from '../../../../core/hooks';
import { formatFileSize, getFileIcon } from '../../../../core/utils';
import EnhanceInfo from '../../../EnhanceInfo';
import MarkdownPreview from '../../../MarkdownPreview';
import './index.less';

const CHUNK_LIST_PAGE_SIZE = 50;
const CHUNK_DETAIL_PAGE_SIZE = 20;

const ChunkPreview = props => {
  const { knowledgeDetail, knowledgeCollection, backToList } = props;
  const { worksheet, id: collectionId } = knowledgeCollection;

  const mainContentBoxRef = useLinkTargetBlank();

  const [activeTab, setActiveTab] = useState(TAB_TYPE.RECORD);
  const [chunkType, setChunkType] = useState(CHUNK_TYPE[TAB_TYPE.RECORD]);
  const [inputValue, setInputValue] = useState('');
  const [keywords, setKeywords] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [sideBarLoading, setSideBarLoading] = useState(false);
  const [sideBarList, setSideBarList] = useState([]);
  const [sideBarTotal, setSideBarTotal] = useState(0);
  const [currentSideBarItem, setCurrentSideBarItem] = useState({});
  const [chunkDetailList, setChunkDetailList] = useState([]);
  const [chunkHeader, setChunkHeader] = useState({});
  const [chunkDetailLoading, setChunkDetailLoading] = useState(false);
  const [chunkDetailTotal, setChunkDetailTotal] = useState(0);
  const [chunkDetailPageIndex, setChunkDetailPageIndex] = useState(1);
  const [attachmentTypes, setAttachmentTypes] = useState([]);
  const [showAttachmentTypesFilter, setShowAttachmentTypesFilter] = useState(false);

  const debouncedSearch = useMemo(
    () =>
      _.debounce(value => {
        setKeywords(value);
        resetSideBar();
      }, 500),
    [],
  );

  const resetSideBar = () => {
    // 侧边栏重置
    setPageIndex(1);
    setSideBarList([]);
    setSideBarTotal(0);
    // 侧边栏选中项重置
    setCurrentSideBarItem({});
  };

  const resetChunkDetail = () => {
    // 分块显示重置
    setChunkDetailPageIndex(1);
    setChunkDetailList([]);
    setChunkDetailTotal(0);
    // 分块标题重置
    setChunkHeader({});
  };

  const handleTabChange = value => {
    if (activeTab === value) return;

    setActiveTab(value);
    setChunkType(CHUNK_TYPE[value]);
    resetSideBar();
    resetChunkDetail();
    // 重置附件类型
    setAttachmentTypes([]);
    // 清空输入框
    setInputValue('');
    setKeywords('');
  };

  const getChunkList = () => {
    setSideBarLoading(true);
    const isAttachmentTab = activeTab === TAB_TYPE.ATTACHMENT;
    let types = chunkType;

    if (isAttachmentTab && attachmentTypes?.length) {
      types = attachmentTypes;
    }

    const params = {
      collectionId,
      types,
      pageIndex,
      pageSize: CHUNK_LIST_PAGE_SIZE,
    };

    if (keywords) {
      params.keywords = keywords;
    }

    chunkAjax
      .getChunkList(params)
      .then(res => {
        if (res) {
          const { data, total } = res;
          setSideBarList(prev => (pageIndex === 1 ? data : prev.concat(data)));
          setSideBarTotal(total);
        }
      })
      .finally(() => {
        setSideBarLoading(false);
      });
  };

  const handleSideBarItemClick = item => {
    const isAttachmentTab = activeTab === TAB_TYPE.ATTACHMENT;

    if (
      (isAttachmentTab && currentSideBarItem.fileId === item.fileId) ||
      (!isAttachmentTab && currentSideBarItem.rowId === item.rowId)
    ) {
      return;
    }

    resetChunkDetail();
    setCurrentSideBarItem(item);
  };

  const handleSideBarScrollEnd = () => {
    if (sideBarList.length < sideBarTotal && !sideBarLoading) {
      setPageIndex(prev => prev + 1);
    }
  };

  const handleMainContentScrollEnd = () => {
    if (chunkDetailList.length < chunkDetailTotal && !chunkDetailLoading) {
      setChunkDetailPageIndex(prev => prev + 1);
    }
  };

  const getChunkDetailList = () => {
    const { rowId, fileId } = currentSideBarItem;
    if (!rowId && !fileId) return;

    setChunkDetailLoading(true);
    const params = {
      collectionId,
      types: chunkType,
      pageIndex: chunkDetailPageIndex,
      pageSize: CHUNK_DETAIL_PAGE_SIZE,
    };
    if (activeTab === TAB_TYPE.ATTACHMENT) params.fileId = fileId;
    else params.rowId = rowId;

    chunkAjax
      .getChunkDetail(params)
      .then(res => {
        if (res) {
          const { data, total, header } = res;
          setChunkHeader(header || {});
          setChunkDetailList(prev => (chunkDetailPageIndex === 1 ? data : prev.concat(data)));
          setChunkDetailTotal(total);
        }
      })
      .finally(() => {
        setChunkDetailLoading(false);
      });
  };

  const handlePreview = () => {
    if (activeTab === TAB_TYPE.ATTACHMENT) {
      const { attachment } = chunkHeader;
      if (!attachment) return;
      previewAttachments({
        index: 0,
        callFrom: 'player',
        attachments: [attachment],
        hideFunctions: ['editFileName'],
      });
      return;
    }

    handleOpenRecord();
  };

  const handleOpenRecord = () => {
    if (!chunkHeader.rowId || !worksheet.workSheetId) return;

    openRecordInfo({
      worksheetId: worksheet.workSheetId,
      recordId: chunkHeader.rowId,
    });
  };

  const handleAttachmentTypesFilterClick = value => {
    resetSideBar();
    setAttachmentTypes(prev => (prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]));
  };

  useEffect(() => {
    getChunkList();
  }, [collectionId, keywords, activeTab, pageIndex, attachmentTypes]);

  useEffect(() => {
    getChunkDetailList();
  }, [currentSideBarItem.rowId, currentSideBarItem.fileId, chunkDetailPageIndex]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className="chunkPreviewContainer">
      <div className="chunkPreviewHeader">
        <Icon icon="backspace" onClick={backToList} />
        <span className="knowledgeName">{knowledgeDetail.name}</span>
        <span className="separator">/</span>
        <span className="worksheetName">{worksheet.workSheetName}</span>
      </div>
      <div className="chunkTabs">
        {CHUNK_PREVIEW_TABS.map(tab => (
          <div
            className={cx('chunkTab', {
              active: activeTab === tab.value,
            })}
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
          >
            {tab.text}
          </div>
        ))}
      </div>
      <div className="tabsSeparator"></div>
      <div className="chunkContent">
        <div className="sideBarBox">
          <div className="sideBarHeader">
            {activeTab === TAB_TYPE.ATTACHMENT ? _l('附件列表') : _l('记录列表')}
            {sideBarTotal > 0 && <span className="recordCount">{sideBarTotal}</span>}
          </div>
          <div className="sideBarSearchBox">
            <Icon icon="search" className="searchIcon" />
            <input
              className="searchInput"
              placeholder={activeTab === TAB_TYPE.ATTACHMENT ? _l('附件名称') : _l('记录名称')}
              value={inputValue}
              onChange={e => {
                setInputValue(e.target.value);
                debouncedSearch(e.target.value);
              }}
            />
            {/* 附件筛选器 */}
            {activeTab === TAB_TYPE.ATTACHMENT && (
              <div className={cx('filterBox', { hasFilter: attachmentTypes.length > 0 })}>
                <Trigger
                  popupVisible={showAttachmentTypesFilter}
                  popup={
                    <div className="attachmentTypesFilterPopup">
                      {ATTACHMENT_TYPE_FILTERS.map(item => (
                        <div
                          key={item.value}
                          className={cx('attachmentTypesFilterItem', { active: attachmentTypes.includes(item.value) })}
                          onClick={() => handleAttachmentTypesFilterClick(item.value)}
                        >
                          {item.label}
                          {attachmentTypes.includes(item.value) && <Icon icon="done" />}
                        </div>
                      ))}
                    </div>
                  }
                  action={['click']}
                  popupAlign={{
                    points: ['tr', 'br'],
                    offset: [0, 5],
                    overflow: { adjustX: true, adjustY: true },
                  }}
                  getPopupContainer={() => document.body}
                  onPopupVisibleChange={showDropOption => {
                    setShowAttachmentTypesFilter(showDropOption);
                  }}
                >
                  <div className="triggerBox">
                    <Icon icon="filter" className="filterIcon" />
                    {attachmentTypes.length > 0 && (
                      <div className="attachmentTypesFilterCount">
                        {attachmentTypes.length}
                        {_l('项')}
                        <Icon
                          icon="close"
                          className="clearFilterIcon"
                          onClick={e => {
                            e.stopPropagation();
                            resetSideBar();
                            setAttachmentTypes([]);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </Trigger>
              </div>
            )}
          </div>
          <div className="sideBarContentWrapper">
            <ScrollView onScrollEnd={handleSideBarScrollEnd}>
              <div className="sideBarContentBox">
                {sideBarList.map(item => (
                  <div
                    className={cx('sideBarContentItem', {
                      active:
                        activeTab === TAB_TYPE.ATTACHMENT
                          ? currentSideBarItem.fileId === item.fileId
                          : currentSideBarItem.rowId === item.rowId,
                    })}
                    key={item.rowId || item.fileId}
                    onClick={() => handleSideBarItemClick(item)}
                  >
                    {activeTab === TAB_TYPE.ATTACHMENT && <div className={`fileIcon ${getFileIcon(item.title)}`} />}
                    <div className="title ellipsis">{item.title || _l('未命名')}</div>
                    {activeTab === TAB_TYPE.ATTACHMENT && item.doclingParsed && (
                      <Icon icon="auto_one_star" className="parseEnhancedIcon" />
                    )}
                  </div>
                ))}
              </div>
              {sideBarList.length === 0 && !sideBarLoading && (
                <div className="emptySideBarContent">{_l('暂无相关内容')}</div>
              )}
              {sideBarLoading && (
                <div className="sideBarLoading">
                  <LoadDiv />
                </div>
              )}
            </ScrollView>
          </div>
        </div>
        <div className="mainContentBox" ref={mainContentBoxRef}>
          {_.isEmpty(currentSideBarItem) ? (
            <div className="emptyContent">{_l('当前未选择内容，请点击左侧列表查看')}</div>
          ) : (
            <Fragment>
              <div className="mainContentHeader">
                {currentSideBarItem.title && (
                  <div className="titleBox">
                    <div className="title ellipsis">
                      {activeTab === TAB_TYPE.ATTACHMENT ? `${_l('附件：')}` : `${_l('记录：')}`}
                      {currentSideBarItem.title}
                    </div>
                    {(chunkHeader?.attachment || chunkHeader?.rowId) && (
                      <Tooltip
                        title={activeTab === TAB_TYPE.ATTACHMENT ? _l('打开附件') : _l('打开记录')}
                        placement="bottom"
                      >
                        <Icon icon="launch" className="launchIcon" onClick={handlePreview} />
                      </Tooltip>
                    )}
                  </div>
                )}
                {activeTab === TAB_TYPE.ATTACHMENT && chunkHeader?.type && (
                  <div className="baseInfoBox">
                    {chunkHeader.doclingParsed && (
                      <span className="attachmentParseEnhanced">
                        <Icon icon="filePRO" />
                        {_l('已增强解析')}
                      </span>
                    )}
                    <span>{`${_l('类型')}: ${chunkHeader.type === ATTACHMENT_TYPE.RECORD_ATTACHMENT ? _l('记录附件') : _l('讨论附件')} `}</span>
                    <span>
                      {`${_l('知识源')}：`}
                      <span className="recordTitle" onClick={handleOpenRecord}>
                        {chunkHeader.rowTitle}
                      </span>
                      {chunkHeader.type === ATTACHMENT_TYPE.RECORD_ATTACHMENT && ` > ${chunkHeader.controlName}`}
                    </span>
                    <span>{`${_l('大小')}: ${formatFileSize(chunkHeader.size)} | ${chunkDetailTotal}${_l('个分块')}`}</span>
                  </div>
                )}
              </div>
              <div className="mainContentBodyWrapper">
                <ScrollView onScrollEnd={handleMainContentScrollEnd}>
                  <div className="mainContentBodyBox">
                    {!chunkDetailLoading && chunkDetailList.length === 0 && activeTab === TAB_TYPE.DISCUSSION && (
                      <div className="emptyPlaceholderText">{_l('当前记录，没有讨论内容')}</div>
                    )}
                    {chunkDetailList.map(item => (
                      <div
                        className={cx('chunkDetailItem', { chunkHover: activeTab !== TAB_TYPE.RECORD })}
                        key={item.chunkId}
                      >
                        <MarkdownPreview content={item.text} />
                        {item.enhanceInfo?.enhance && (
                          <Fragment>
                            {activeTab === TAB_TYPE.RECORD ? (
                              <div className="recordEnhanceBox">
                                <div className="recordEnhance mBottom10">
                                  <Icon icon="auto_one_star" />
                                  {_l('增强信息')}
                                </div>
                                <div className="recordEnhanceContent">
                                  {item.enhanceInfo.texts?.map((text, index) => (
                                    <MarkdownPreview key={`${item.chunkId}-${index}`} content={text} />
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <EnhanceInfo className="chunkDetailItemEnhance" content={item.enhanceInfo?.texts} />
                            )}
                          </Fragment>
                        )}
                      </div>
                    ))}
                    {chunkDetailLoading && (
                      <div className="mainContentLoading">
                        <LoadDiv />
                      </div>
                    )}
                  </div>
                </ScrollView>
              </div>
            </Fragment>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ChunkPreview);
