import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import ScrollView from 'ming-ui/components/ScrollView';
import DragMask from 'worksheet/common/DragMask';
import RecordInfoWrapper from 'src/pages/worksheet/common/recordInfo/RecordInfoWrapper';
import * as baseAction from 'src/pages/worksheet/redux/actions';
import * as detailActions from 'src/pages/worksheet/redux/actions/detailView';
import { getAdvanceSetting } from 'src/utils/control';
import { getCardWidth } from 'src/utils/worksheet';
import ViewEmpty from '../components/ViewEmpty';
import DetailItem from './DetaiIItem';
import './index.less';

const LeftListWrapper = styled.div(
  ({ width }) => `
  display: flex;
  flex-direction: column;
  transition: width 0.2s;
  position: relative;
  z-index: 3;
  border-right: 1px solid #ddd;

  .searchBar {
    width: ${width}px;
    padding: 0 12px;
    height: 51px;
    .icon {
      line-height: 51px;
      font-size: 20px;
      color: #bdbdbd;
      &.icon-close {
        cursor: pointer;
      }
      &.icon-search{
        &:hover{
          color:#bdbdbd;
        }
      }
      &:hover{
        color: #2196f3;
      }
    }
    input {
      width: 100%;
      height: 51px;
      border: none;
      padding-left: 6px;
      font-size: 13px;
    }
    .expandIcon{
      height: 51px;
    }
  }
  `,
);

const Drag = styled.div(
  ({ left }) => `
  position: absolute;
  z-index: 2;
  left: ${left}px;
  width: 10px;
  height: 100%;
  cursor: ew-resize;
  border-left: 1px solid #e0e0e0;
  &:hover{
    border-left: 1px solid #2196f3;
  }
`,
);

let preViewId = '';
function DetailView(props) {
  const {
    viewId,
    appId,
    worksheetId,
    views,
    fetchRows,
    detailView,
    sheetSwitchPermit,
    worksheetInfo,
    filters,
    updateRow,
    deleteRow,
    isCharge,
    quickFilter,
    clearData,
    controls,
    updateWorksheetSomeControls,
  } = props;
  const { detailViewRows = [], detailViewLoading, detailPageIndex, detailKeyWords, noMoreRows } = detailView;
  const currentView = views.find(o => o.viewId === viewId) || {};
  const coverCid = currentView.coverCid || _.get(worksheetInfo, ['advancedSetting', 'coverid']);
  const { showtoolbar, showtitle } = getAdvanceSetting(currentView);
  const inputRef = useRef();
  const cardWidth = getCardWidth(currentView);

  const [currentRecord, setCurrentRecord] = useState({});
  const [isOpenGroup, setIsOpenGroup] = useState(true);
  const [dragMaskVisible, setDragMaskVisible] = useState(false);
  const [groupFilterWidth, setGroupFilterWidth] = useState(
    isOpenGroup ? cardWidth || window.localStorage.getItem(`detailGroupWidth_${viewId}`) || (coverCid ? 335 : 240) : 32,
  );
  const [flag, setFlag] = useState(+new Date());
  const isLoading = (detailViewLoading && detailPageIndex === 1) || worksheetInfo.isRequestingRelationControls;

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  useEffect(() => {
    return () => {
      clearData();
    };
  }, []);

  useEffect(() => {
    setGroupFilterWidth(
      isOpenGroup
        ? cardWidth || window.localStorage.getItem(`detailGroupWidth_${viewId}`) || (coverCid ? 335 : 240)
        : 32,
    );
  }, [viewId, cardWidth]);

  useEffect(() => {
    if (preViewId !== currentView.viewId) {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      fetchRows(1, '');
    } else {
      setTimeout(() => {
        fetchRows(1, detailKeyWords);
      }, 200);
    }
  }, [currentView.viewId, currentView.moreSort, currentView.sortCid, currentView.sortType]);

  useEffect(() => {
    if (
      currentRecord.rowid &&
      !!detailViewRows.filter(item => item.rowid === currentRecord.rowid).length &&
      currentView.childType !== 1 &&
      preViewId === viewId
    ) {
      return;
    }
    setCurrentRecord(detailViewRows[0] || {});
    preViewId = viewId;
  }, [detailViewRows]);

  const onScrollEnd = () => {
    if (!noMoreRows && !detailViewLoading) {
      fetchRows(detailPageIndex + 1, detailKeyWords);
    }
  };

  const changeGroupStatus = isOpen => {
    setIsOpenGroup(isOpen);
    setGroupFilterWidth(
      isOpen ? cardWidth || window.localStorage.getItem(`detailGroupWidth_${viewId}`) || (coverCid ? 335 : 240) : 32,
    );
  };

  const onSearch = useCallback(
    _.debounce(value => {
      fetchRows(1, value);
    }, 500),
    [],
  );

  const handleKeyDown = e => {
    const editingElements = document.getElementsByClassName('editingBar');
    const isEditing = !![...editingElements].filter(el => el.style.overflow === '').length;
    if (!!detailViewRows.length && _.get(e, 'target.parentNode.id') === 'detailNavList') {
      const currentIndex = _.findIndex(detailViewRows, item => item.rowid === currentRecord.rowid);
      if (e.keyCode === 38) {
        if (isEditing) {
          return;
        }
        currentIndex > 0 && setCurrentRecord(detailViewRows[currentIndex - 1]);
      } else if (e.keyCode === 40) {
        if (isEditing) {
          return;
        }
        currentIndex < detailViewRows.length - 1 && setCurrentRecord(detailViewRows[currentIndex + 1]);
      }
    }
  };

  const renderLeftList = () => {
    const getEmptyStatus = () => {
      if (detailKeyWords || filters.keyWords) return 'search';
      if (!_.isEmpty(filters.filterControls) || !_.isEmpty(currentView.filters) || !_.isEmpty(quickFilter))
        return 'filter';
      return 'empty';
    };
    if (!isOpenGroup) {
      return (
        <span
          className="pLeft8 InlineBlock w100 pRight8 WordBreak Gray_9e TxtCenter Bold h100 Hand"
          onClick={() => changeGroupStatus(!isOpenGroup)}
        ></span>
      );
    }

    return detailViewLoading && detailPageIndex === 1 ? (
      <LoadDiv className="mTop10" />
    ) : !detailViewRows.length ? (
      getEmptyStatus() !== 'empty' ? (
        <div className="mTop36 Gray_9e TxtCenter">
          {getEmptyStatus() === 'search' ? _l('没有搜索结果') : _l('没有符合条件的记录')}
        </div>
      ) : (
        <div className="empty">{_l('暂未添加记录')}</div>
      )
    ) : (
      <ScrollView id="detailNavList" className="flex" onScrollEnd={onScrollEnd}>
        {detailViewRows.map(item => {
          return (
            <DetailItem
              {...props}
              itemData={item}
              currentRecordId={currentRecord.rowid}
              onClick={() => {
                const editingElements = document.getElementsByClassName('editingBar');
                const isEditing = !![...editingElements].filter(el => el.style.overflow === '').length;
                if (isEditing) {
                  alert(_l('请先保存或取消当前更改'), 3);
                  return;
                }
                setCurrentRecord(item);
              }}
              onUpdateFn={(updated, item) => {
                updateRow(item);
                if (item.rowid === currentRecord.rowid) {
                  setFlag(+new Date());
                }
              }}
            />
          );
        })}
      </ScrollView>
    );
  };

  return (
    <div className="detailViewWrapper">
      {dragMaskVisible && (
        <DragMask
          value={groupFilterWidth}
          min={200}
          max={420}
          onChange={value => {
            setDragMaskVisible(false);
            setGroupFilterWidth(value);
            safeLocalStorageSetItem(`detailGroupWidth_${viewId}`, value);
          }}
        />
      )}

      {currentView.childType === 2 && (
        <div className="leftList">
          <LeftListWrapper width={groupFilterWidth}>
            <div
              className={cx('searchBar flexRow', {
                pAll0: !isOpenGroup,
                TxtCenter: !isOpenGroup,
              })}
            >
              {isOpenGroup && (
                <React.Fragment>
                  <i className="icon icon-search"></i>
                  <input
                    type="text"
                    placeholder={_l('搜索')}
                    ref={inputRef}
                    className={cx('flex', { placeholderColor: !detailKeyWords })}
                    onChange={e => onSearch(e.target.value)}
                  />
                </React.Fragment>
              )}
              {detailKeyWords && (
                <i
                  className="icon icon-cancel1 Hand"
                  onClick={() => {
                    fetchRows(1, '');
                    inputRef.current.value = '';
                  }}
                ></i>
              )}
              {!detailKeyWords && (
                <i
                  className={cx(`icon Font12 icon-${!isOpenGroup ? 'next-02' : 'back-02'} Hand expandIcon`, {
                    pLeft9: !isOpenGroup,
                  })}
                  onClick={() => changeGroupStatus(!isOpenGroup)}
                ></i>
              )}
            </div>
            {renderLeftList()}
          </LeftListWrapper>
          <Drag className="detailNavDrag" left={groupFilterWidth} onMouseDown={() => setDragMaskVisible(true)} />
        </div>
      )}
      <div
        className={cx('rightRecord', {
          isSingle: currentView.childType === 1,
          hideToolbar: showtoolbar === '0',
          hideFormHeader: showtitle === '0',
        })}
        style={{ width: `calc(100% - ${groupFilterWidth}px)` }}
      >
        {isLoading && <LoadDiv className="mTop10" />}

        {!isLoading && !detailViewRows.length && currentView.childType === 1 && (
          <ViewEmpty filters={filters} viewFilter={currentView.filters || []} />
        )}

        {!isLoading &&
          currentRecord.rowid &&
          !!detailViewRows.filter(item => item.rowid === currentRecord.rowid).length && (
            <RecordInfoWrapper
              enablePayment={worksheetInfo.enablePayment}
              notDialog
              flag={flag}
              controls={controls}
              handleSwitchRecord={newRecord => setCurrentRecord(newRecord)}
              sheetSwitchPermit={sheetSwitchPermit} // 表单权限
              allowAdd={worksheetInfo.allowAdd}
              projectId={worksheetInfo.projectId}
              currentSheetRows={detailViewRows}
              showPrevNext={currentView.childType === 2}
              appId={appId}
              viewId={viewId}
              from={1}
              view={currentView}
              recordId={currentRecord.rowid}
              worksheetId={worksheetId}
              rules={worksheetInfo.rules}
              isWorksheetQuery={worksheetInfo.isWorksheetQuery}
              updateSuccess={(ids, updated, data) => updateRow(data)}
              onDeleteSuccess={() => deleteRow(currentRecord.rowid)}
              handleAddSheetRow={data => {
                updateRow(data);
                setCurrentRecord(data);
              }}
              hideRows={recordIds => {
                setTimeout(() => {
                  recordIds.forEach(deleteRow);
                }, 100);
              }}
              isCharge={isCharge}
              updateWorksheetControls={updateWorksheetSomeControls}
              customBtnTriggerCb={() => {
                setTimeout(() => {
                  fetchRows(1, detailKeyWords);
                }, 100);
              }}
            />
          )}
      </div>
    </div>
  );
}

export default connect(
  state =>
    _.pick(state.sheet, [
      'detailView',
      'worksheetInfo',
      'filters',
      'controls',
      'sheetSwitchPermit',
      'sheetButtons',
      'navGroupFilters',
      'updateRow',
      'deleteRow',
      'views',
      'quickFilter',
    ]),
  dispatch => bindActionCreators({ ...detailActions, ...baseAction }, dispatch),
)(DetailView);
