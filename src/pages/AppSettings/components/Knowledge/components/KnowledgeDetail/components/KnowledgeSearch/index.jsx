import React, { Fragment, memo, useState } from 'react';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import knowledgeAjax from '../../../../api/knowledge';
import attachmentAjax from 'src/api/attachment';
import { openRecordInfo } from 'worksheet/common/recordInfo';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import { ATTACHMENT_TYPE_ENUM, CHUNK_TYPE_TEXT, SEARCH_MODE } from '../../../../core/config';
import { useEsc } from '../../../../core/hooks';
import { useLinkTargetBlank } from '../../../../core/hooks';
import EnhanceInfo from '../../../EnhanceInfo';
import MarkdownPreview from '../../../MarkdownPreview';
import ChunkDetail from './components/ChunkDetail';
import PercentSlider from './components/PercentSlider';
import SideBar from './components/SideBar';
import './index.less';

const KnowledgeSearch = ({ knowledgeDetail, onClose }) => {
  const { name: knowledgeName } = knowledgeDetail;

  const contentRef = useLinkTargetBlank();

  const [hasSearched, setHasSearched] = useState(false);
  const [chunksList, setChunksList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({});
  const [activeEsc, setActiveEsc] = useState(true);

  useEsc(() => {
    onClose();
  }, activeEsc);

  const handleSearch = params => {
    console.log({ params });
    setHasSearched(true);
    setLoading(true);
    setParams(params);
    knowledgeAjax
      .getKnowledgeBaseSearch(params)
      .then(data => {
        console.log('data', data);
        if (data) {
          setChunksList(data.chunks || []);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handlePreviewAttachment = async ({ fileId, rowId, worksheet }) => {
    if (!fileId) return;

    const data = await attachmentAjax.getAttachmentDetail({
      fileId,
      worksheetId: worksheet.workSheetId,
      rowId,
    });

    if (data) {
      setActiveEsc(false);
      previewAttachments({
        index: 0,
        callFrom: 'player',
        attachments: [data],
        hideFunctions: ['editFileName'],
        closeCallback: () => {
          setActiveEsc(true);
        },
      });
    }
  };

  return (
    <div className="knowledgeSearchContainer">
      {/* Header */}
      <div className="knowledgeSearchHeader">
        <div className="left">
          <Icon icon="backspace" className="backspaceIcon" onClick={onClose} />
          <Icon icon="a-knowledge_search" className="knowledgeSearchIcon" />
          <div className="knowledgeName ellipsis">{_l('检索测试：%0', knowledgeName)}</div>
        </div>
        <div className="right">
          <Icon icon="close" onClick={onClose} />
        </div>
      </div>

      <div className="knowledgeSearchContent" ref={contentRef}>
        {/* 左侧配置区域 */}
        <ScrollView className="knowledgeSearchLeft">
          <SideBar onSearch={handleSearch} knowledgeDetail={knowledgeDetail} />
        </ScrollView>

        {/* 右侧结果区域 */}
        <div className="knowledgeSearchRight">
          {!hasSearched ? (
            <div className="initBox">{_l('请输入检索内容，进行检索测试')}</div>
          ) : (
            <div className="searchResultContent">
              <Fragment>
                {loading ? (
                  <LoadDiv />
                ) : (
                  <Fragment>
                    <div className="resultTotal">{_l('检索到 %0 个结果', chunksList?.length)}</div>
                    <ScrollView className="flex">
                      <div className="resultContentBox">
                        {chunksList.map((item, index) => {
                          const {
                            type,
                            worksheet,
                            recordTitle,
                            score,
                            content,
                            enhancedContent,
                            chunkId,
                            attachmentId,
                            attachmentName,
                            rowId,
                          } = item;
                          const { icon, workSheetName } = worksheet || {};
                          return (
                            <div className="resultItemBox" key={chunkId}>
                              <div className="resultHeader">
                                <div className="headerLeft">
                                  <span className="resultIndex">#{index + 1}</span>
                                  <span className="resultType">{CHUNK_TYPE_TEXT[type]}</span>
                                  <span className="resultPath">
                                    <Icon icon={icon} />
                                    <span className="worksheetName">{workSheetName}</span>
                                    <span>{'>'}</span>
                                    <span
                                      className="recordTitle"
                                      onClick={() => {
                                        setActiveEsc(false);
                                        openRecordInfo({
                                          worksheetId: worksheet.workSheetId,
                                          recordId: rowId,
                                          onClose: () => {
                                            setActiveEsc(true);
                                          },
                                        });
                                      }}
                                    >
                                      {recordTitle}
                                    </span>
                                    {ATTACHMENT_TYPE_ENUM.includes(type) && attachmentId && (
                                      <Fragment>
                                        <span>{'>'}</span>
                                        <span
                                          className="attachmentTitle"
                                          onClick={() =>
                                            handlePreviewAttachment({ fileId: attachmentId, rowId, worksheet })
                                          }
                                        >
                                          {attachmentName}
                                        </span>
                                      </Fragment>
                                    )}
                                  </span>
                                </div>
                                <div className="headerRight">
                                  {ATTACHMENT_TYPE_ENUM.includes(type) && (
                                    <ChunkDetail {...item} onPreviewAttachment={handlePreviewAttachment} />
                                  )}
                                  {enhancedContent && (
                                    <EnhanceInfo title={_l('增强命中')} content={[enhancedContent]} />
                                  )}
                                  <PercentSlider
                                    percent={score}
                                    dimension={params.searchMode === SEARCH_MODE.KEYWORD ? 1 : 100}
                                  />
                                </div>
                              </div>
                              <div className="resultContent">
                                <MarkdownPreview content={content} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollView>
                  </Fragment>
                )}
              </Fragment>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(KnowledgeSearch);
