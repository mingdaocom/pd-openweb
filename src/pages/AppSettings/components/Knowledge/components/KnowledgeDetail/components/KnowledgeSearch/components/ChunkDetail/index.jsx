import React, { Fragment, memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, Icon, LoadDiv, ScrollView } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import chunkAjax from 'src/pages/AppSettings/components/Knowledge/api/chunks';
import EnhanceInfo from 'src/pages/AppSettings/components/Knowledge/components/EnhanceInfo';
import MarkdownPreview from 'src/pages/AppSettings/components/Knowledge/components/MarkdownPreview';
import { ATTACHMENT_TYPE } from 'src/pages/AppSettings/components/Knowledge/core/config';
import { useLinkTargetBlank } from 'src/pages/AppSettings/components/Knowledge/core/hooks';
import { formatFileSize } from 'src/pages/AppSettings/components/Knowledge/core/utils';
import Pagination from '../Pagination';

const Container = styled.div`
  display: flex;
  padding: 5px;
  border-radius: 3px;
  font-size: 16px;
  cursor: pointer;
  color: var(--color-text-secondary);
  &:hover {
    color: var(--color-primary);
    background-color: var(--color-background-tertiary);
  }
`;

const ChunkDetailContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  .baseInfoBox {
    display: flex;
    gap: 8px;
    margin: 8px 0 20px;
    font-size: 12px;
    color: var(--color-text-secondary);
  }
  .chunkDetailContent {
    flex: 1;
    min-height: 0;
    margin: 0 -20px;
    .chunkDetailItem {
      position: relative;
      padding: 0 10px;
      margin: 0 10px;
      border-radius: 3px;
      &.active {
        background-color: var(--color-primary-transparent) !important;
      }
      &:hover {
        background-color: var(--color-background-tertiary);
        .chunkDetailItemEnhance {
          visibility: visible;
        }
      }
      .chunkDetailItemEnhance {
        position: absolute;
        top: 10px;
        padding: 5px 10px;
        background-color: var(--color-background-card);
        border-radius: 3px;
        box-shadow: var(--shadow-sm);
        font-size: 13px;
        visibility: hidden;
      }
    }
  }
  .paginationBox {
    display: flex;
    justify-content: center;
  }
`;

const LaunchIcon = styled(Icon)`
  padding: 2px;
  margin-left: 8px;
  font-size: 16px;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 3px;
  &:hover {
    background-color: var(--color-background-tertiary);
    color: var(--color-primary);
  }
`;

const PAGE_SIZE = 100;

const ChunkDetail = props => {
  const { knowledgeId, rowId, chunkIndex, type, attachmentId, attachmentName, worksheet, onPreviewAttachment } = props;

  const didScrollRef = useRef(false);
  const hasScrolledRef = useRef(false);
  const scrollRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [chunkDetail, setChunkDetail] = useState([]);
  const [chunkHeader, setChunkHeader] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(Math.ceil((chunkIndex + 1) / PAGE_SIZE));
  const [total, setTotal] = useState(0);

  useLinkTargetBlank({ selector: '.chunkDetailContent' });

  const getChunkDetail = () => {
    setLoading(true);
    return chunkAjax
      .getChunkDetail({
        types: [type],
        fileId: attachmentId,
        pageSize: PAGE_SIZE,
        pageIndex,
        worksheetId: worksheet.workSheetId,
        knowledgeId,
      })
      .then(res => {
        if (res) {
          const { data, header, total } = res;
          setChunkDetail(data || []);
          setChunkHeader(header || {});
          setTotal(total || 0);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleChangePage = page => {
    setPageIndex(page);
  };

  useEffect(() => {
    if (visible) {
      hasScrolledRef.current = false;
      getChunkDetail();
    }
  }, [visible, pageIndex]);

  useLayoutEffect(() => {
    if (!visible || loading || didScrollRef.current || !scrollRef.current) return;

    const target = chunkDetail.find(i => i.chunkIndex === chunkIndex);
    if (!target) return;

    const el = document.querySelector(`[data-chunk-id="${target.chunkId}"]`);
    if (!el) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToElement(el);
        didScrollRef.current = true;
      });
    });
  }, [visible, loading, chunkDetail, chunkIndex]);

  return (
    <Fragment>
      <Tooltip title={_l('查看分块位置')} placement="top">
        <Container onClick={() => setVisible(true)}>
          <Icon icon="gps_fixed" />
        </Container>
      </Tooltip>

      {visible && (
        <Dialog
          className="chunkDetailDialog"
          visible={visible}
          title={
            <div>
              <span>{attachmentName}</span>
              <LaunchIcon
                icon="launch"
                onClick={() => onPreviewAttachment({ fileId: attachmentId, rowId, worksheet })}
              />
            </div>
          }
          onCancel={() => setVisible(false)}
          width={1000}
          footer={null}
        >
          <ChunkDetailContent>
            {!_.isEmpty(chunkHeader) && (
              <div className="baseInfoBox">
                <span>{`${_l('类型')}: ${chunkHeader.type === ATTACHMENT_TYPE.RECORD_ATTACHMENT ? _l('记录附件') : _l('讨论附件')} `}</span>
                <span>
                  {`${_l('知识源')}: ${chunkHeader.rowTitle}`}
                  {chunkHeader.type === ATTACHMENT_TYPE.RECORD_ATTACHMENT &&
                    chunkHeader.controlName &&
                    ` > ${chunkHeader.controlName}`}
                </span>
                <span>{`${_l('大小')}: ${formatFileSize(chunkHeader.size)} | ${total}${_l('个分块')}`}</span>
              </div>
            )}
            <div className="chunkDetailContent">
              <ScrollView ref={scrollRef}>
                {loading ? (
                  <LoadDiv />
                ) : (
                  chunkDetail.map(item => (
                    <div
                      className={cx('chunkDetailItem', { active: item.chunkIndex === chunkIndex })}
                      key={item.chunkId}
                      data-chunk-id={item.chunkId}
                    >
                      <MarkdownPreview content={item.text} />
                      {item.enhanceInfo?.enhance && (
                        <EnhanceInfo className="chunkDetailItemEnhance" content={item.enhanceInfo?.texts} />
                      )}
                    </div>
                  ))
                )}
              </ScrollView>
            </div>
            {total > PAGE_SIZE && (
              <div className="paginationBox">
                <Pagination total={total} pageSize={PAGE_SIZE} pageIndex={pageIndex} onChange={handleChangePage} />
              </div>
            )}
          </ChunkDetailContent>
        </Dialog>
      )}
    </Fragment>
  );
};

export default memo(ChunkDetail);
