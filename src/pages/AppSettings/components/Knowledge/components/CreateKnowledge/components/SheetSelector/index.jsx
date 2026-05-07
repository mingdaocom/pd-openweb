import React, { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import cx from 'classnames';
import { Icon, ScrollView, SvgIcon } from 'ming-ui';
import { useCreateKnowledgeStore } from '../../index';
import {
  improveKnowledgeBasePlan,
  refreshKnowledgeBasePlan,
  removeSelectedWorksheet,
  setSelectedWorksheetList,
  updateActiveSchemeId,
} from '../../store/actions';
import SelectSheetDropDown from '../SelectSheetDropdown';
import SchemeSkeleton from './SchemeSkeleton';
import './index.less';

const CARD_WIDTH = 200;
const GAP = 20;

const SheetSelector = () => {
  const { state, dispatch } = useCreateKnowledgeStore();
  const { appId, recommendSchemes, activeScheme, selectedWorksheetList, aiLoading, allWorksheetList } = state;
  const aiEnabled = !md.global.SysSettings.hideAIBasicFun;

  const viewportRef = useRef(null);
  const trackRef = useRef(null);

  const [offset, setOffset] = useState(0);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  /** 最大可滚动距离 */
  const getMaxOffset = () => {
    if (!viewportRef.current || !trackRef.current) return 0;
    return Math.max(trackRef.current.scrollWidth - viewportRef.current.clientWidth, 0);
  };

  /** 更新左右按钮显示 */
  const updateButtons = nextOffset => {
    const maxOffset = getMaxOffset();

    // 没有可滚动内容 → 全部隐藏
    if (maxOffset <= 0) {
      setShowLeft(false);
      setShowRight(false);
      return;
    }

    setShowLeft(nextOffset < 0);
    setShowRight(Math.abs(nextOffset) < maxOffset);
  };

  const getStep = () => {
    const track = trackRef.current;
    if (!track) return CARD_WIDTH + GAP;

    const firstCard = track.querySelector('.schemeItem');
    const cardWidth = firstCard?.getBoundingClientRect().width || CARD_WIDTH;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || GAP) || GAP;

    return cardWidth + gap;
  };

  const clampOffset = value => {
    const maxOffset = getMaxOffset();
    return Math.max(-maxOffset, Math.min(value, 0));
  };

  const handleCardClick = (e, scheme) => {
    if (aiLoading && scheme?.id !== 'createKnowledge') return;

    const viewport = viewportRef.current;
    const card = e.currentTarget;

    if (viewport && card) {
      const cardRect = card.getBoundingClientRect();
      const viewportRect = viewport.getBoundingClientRect();

      // 被遮挡时按实际遮挡量滚动，避免需要点第二次
      if (cardRect.left < viewportRect.left) {
        const delta = viewportRect.left - cardRect.left;
        setOffset(prev => clampOffset(prev + delta));
      } else if (cardRect.right > viewportRect.right) {
        const delta = viewportRect.right - cardRect.right;
        setOffset(prev => clampOffset(prev + delta));
      }
    }

    // AI推荐初始化时，需要完善信息
    if (scheme.isInit) {
      improveKnowledgeBasePlan(dispatch, { itemRecommend: scheme, appId });
      return;
    }

    updateActiveSchemeId(dispatch, scheme);
    setSelectedWorksheetList(dispatch, scheme.worksheetList || []);
  };

  const handleRemoveSelectedWorksheet = worksheetId => {
    removeSelectedWorksheet(dispatch, worksheetId);
  };

  const handleRefreshKnowledgeBasePlan = () => {
    if (aiLoading) return;

    refreshKnowledgeBasePlan(dispatch, { appId, allWorksheetList });
  };

  const handleRight = () => {
    setOffset(prev => {
      return clampOffset(prev - getStep());
    });
  };

  const handleLeft = () => {
    setOffset(prev => {
      return clampOffset(prev + getStep());
    });
  };

  useEffect(() => {
    updateButtons(offset);
  }, [offset]);

  useLayoutEffect(() => {
    if (aiLoading || !recommendSchemes.length) return;
    updateButtons(0); // 初始化时设置按钮
  }, [aiLoading, recommendSchemes]);

  return (
    <div className="sheetSelectorContainer">
      <div className="sheetSchemeWrapper">
        <div className="createKnowledgeWrapper">
          <div className="customTitle">{_l('自定义')}</div>
          {/* 创建向量知识库 */}
          <div
            className={cx('schemeItem createKnowledge', {
              active: activeScheme?.id === 'createKnowledge',
            })}
            onClick={e => handleCardClick(e, { id: 'createKnowledge' })}
          >
            <Icon icon="database" />
            <div className="createKnowledgeTitle">{_l('从空白开始创建')}</div>
          </div>
        </div>
        {aiEnabled && (
          <div className="aiRecommendationWrapper">
            <div className="aiRecommendation">
              {_l('AI 推荐')}
              {!aiLoading && <Icon icon="refresh1" onClick={handleRefreshKnowledgeBasePlan} />}
            </div>
            <div className="schemeContainer">
              {aiLoading ? (
                <div className="schemeWrapper">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <SchemeSkeleton key={index} />
                  ))}
                </div>
              ) : (
                <Fragment>
                  {showLeft && (
                    <div className="nav left" onClick={handleLeft}>
                      <Icon icon="arrow-left-border" className="textTertiary Font20 LineHeight32" />
                    </div>
                  )}

                  <div className="schemeViewport" ref={viewportRef}>
                    <div className="schemeWrapper" ref={trackRef} style={{ transform: `translateX(${offset}px)` }}>
                      {/* AI 推荐方案 */}
                      {recommendSchemes.map(scheme => (
                        <div
                          key={scheme.id}
                          className={cx('schemeItem recommendScheme', {
                            active: activeScheme?.id === scheme.id,
                          })}
                          onClick={e => handleCardClick(e, scheme)}
                        >
                          <div>
                            <div className="schemeItemTitle">{scheme.title}</div>
                            <div className="schemeItemDescription">{scheme.description}</div>
                          </div>
                          <div className="schemeItemFooter">{_l('包含 %0 张工作表', scheme.num)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {showRight && (
                    <div className="nav right" onClick={handleRight}>
                      <Icon icon="arrow-right-border" className="textTertiary Font20 LineHeight32" />
                    </div>
                  )}
                </Fragment>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="subTitle">{_l('包含工作表')}</div>
      <div className="sheetListScrollWrapper">
        <ScrollView className="sheetListScroll" options={{ overflow: { x: 'hidden' } }}>
          {selectedWorksheetList?.length > 0 ? (
            <div className="sheetListWrapper">
              {selectedWorksheetList.map(({ worksheetId, worksheetName, worksheet }) => (
                <div key={worksheetId} className="sheetItemBox">
                  <div className="sheetItem">
                    <div className="worksheetIcon">
                      <SvgIcon url={worksheet.iconUrl} fill="var(--color-text-secondary)" size={20} />
                    </div>
                    <div className="worksheetTitle ellipsis">{worksheetName}</div>
                    <div className="worksheetDescription ellipsis">{worksheet.desc}</div>
                    <Icon icon="delete1" onClick={() => handleRemoveSelectedWorksheet(worksheetId)} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="emptySheetList">{_l('请添加作为知识源的工作表')}</div>
          )}
        </ScrollView>
      </div>
      <div className="addSheetButton">
        <SelectSheetDropDown />
      </div>
    </div>
  );
};

export default SheetSelector;
