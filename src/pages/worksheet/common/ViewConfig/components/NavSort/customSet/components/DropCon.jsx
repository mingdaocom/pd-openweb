import React, { useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import { ScrollView, LoadDiv, Icon } from 'ming-ui';
import styled from 'styled-components';
import sheetAjax from 'src/api/worksheet';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import Option from './Options';
import Trigger from 'rc-trigger';
import cx from 'classnames';
import { isSameType } from 'src/pages/worksheet/common/ViewConfig/util.js';

const Wrap = styled.div`
  .customInput {
    width: 100%;
    height: 36px;
    line-height: 36px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 3px 3px 3px 3px;
    opacity: 1;
    border: 1px solid #2196f3;
    padding: 0 12px;
  }
  .cover {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 100;
  }
`;
const WrapS = styled.div`
  .dropScrollView {
    width: 430px;
    min-height: 100px;
    max-height: 300px;
    padding: 5px 0;
    border-radius: 3px;
    background: white;
    z-index: 11;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.13), 0 2px 6px rgba(0, 0, 0, 0.1);
    .recordItem {
      cursor: pointer;
      height: 36px;
      line-height: 36px;
      vertical-align: middle;
      box-sizing: border-box;
      width: 100%;
      padding: 0 12px;
      &:hover {
        background: #f5f5f5;
      }
      &.isCur {
        background: #e3f3ff;
      }
    }
  }
`;

const TxtCenter = styled.div`
  min-height: 100px;
  text-align: center;
  padding-top: 30px;
`;
let Ajax = null;
export default function (props) {
  const trigger = useRef(null);
  const inputRef = useRef(null);
  const { controlInfo, onChange, onDelete, currentList = [] } = props;
  const [{ list, pageIndex, keyWords, controls, count, loading, showMenu }, setState] = useSetState({
    list: [],
    pageIndex: 1,
    keyWords: '',
    controls: [], //字段信息
    count: 0,
    loading: true,
    showMenu: true,
  });
  useEffect(() => {
    getColumns({});
  }, []);

  const getColumns = ({ pageIndex = 1, keyWords = '' }) => {
    setState({
      loading: true,
    });
    if (isSameType([9, 10, 11], controlInfo)) {
      setState({
        list: controlInfo.options
          .filter(o => !o.isDeleted)
          .filter(o => o.value.toLowerCase().indexOf(keyWords.toLowerCase()) >= 0),
        loading: false,
        count: controlInfo.options.length,
      });
    } else if (isSameType([28], controlInfo)) {
      const list = Array.from(
        { length: parseInt(_.get(controlInfo, ['advancedSetting', 'max']) || '1', 10) },
        (_, index) => JSON.stringify(index + 1),
      );
      const newlist = list.filter(o => o.toLowerCase().indexOf(keyWords.toLowerCase()) >= 0);
      setState({
        list: newlist,
        loading: false,
        count: list.length,
      });
    } else if (controlInfo.type === 29) {
      const worksheetId = controlInfo.dataSource;
      const args = {
        worksheetId,
        viewId: controlInfo.viewId,
        searchType: 1,
        pageSize: 50,
        pageIndex,
        status: 1,
        keyWords,
        isGetWorksheet: true,
        getType: 7,
        filterControls: [],
      };
      if (Ajax) {
        Ajax.abort();
      }
      Ajax = sheetAjax.getFilterRows(args);
      Ajax.then(res => {
        setState({
          list: pageIndex > 1 ? list.concat(res.data) : res.data,
          pageIndex,
          controls: res.template ? res.template.controls : [],
          count: res.count,
          loading: false,
        });
      });
    }
  };

  const renderItemCon = record => {
    if (isSameType([9, 10, 11], controlInfo)) {
      return <Option controlInfo={props.controlInfo} item={record.key} />;
    }
    if (isSameType([28], controlInfo)) {
      return <span className="flex">{_l('%0 级', parseInt(record, 10))}</span>;
    }
    if (29 === controlInfo.type) {
      const control = controls.find(o => o.attribute === 1);
      return renderCellText({ ...control, value: record[control.controlId] }) || _l('未命名');
    }
  };

  return (
    <Wrap className="flexColumn">
      <Trigger
        ref={trigger}
        popup={
          <WrapS>
            <ScrollView
              className="flex dropScrollView"
              onScrollEnd={() => {
                if (!loading && list.length < count) {
                  getColumns({ pageIndex: pageIndex + 1, keyWords: keyWords });
                }
              }}
            >
              {!list.length && keyWords && !loading && (
                <TxtCenter style={{ color: '#9e9e9e' }}>{_l('无匹配结果')}</TxtCenter>
              )}
              {!list.length && !keyWords && !loading && (
                <TxtCenter style={{ color: '#9e9e9e' }}>
                  <i className="icon Icon icon-ic-line Font56 Gray_bd mTop20"></i>
                  <div className="mTop10">{_l('暂无数据')}</div>
                </TxtCenter>
              )}
              {!!list.length && (
                <div className="pTop6 pBottom6">
                  {list.map((record, index) => {
                    const ids = isSameType([9, 10, 11, 28], controlInfo)
                      ? currentList
                      : currentList.map(it => it.rowid);
                    const isHas = ids.includes(
                      isSameType([9, 10, 11], controlInfo)
                        ? record.key
                        : isSameType([28], controlInfo)
                        ? record
                        : record.rowid,
                    );
                    return (
                      <div
                        className={cx('recordItem flexRow alignItemsCenter', {
                          isCur: isHas,
                        })}
                        onClick={() => {
                          if (isHas) {
                            // onDelete(record);
                          } else {
                            onChange(record);
                          }
                        }}
                      >
                        <div className="flex WordBreak overflow_ellipsis">{renderItemCon(record)}</div>
                        {isHas && <Icon className="ThemeColor3 Font18" icon="ok" />}
                      </div>
                    );
                  })}
                </div>
              )}
              {loading && (
                <div className="loadingCon">
                  <LoadDiv />
                </div>
              )}
            </ScrollView>
          </WrapS>
        }
        popupClassName={cx('dropdownTrigger')}
        action={['focus']}
        popupVisible={showMenu}
        onPopupVisibleChange={showMenu => {
          // setState({
          //   showMenu,
          // });
          // !showMenu && onChange();
        }}
        popupAlign={{
          points: ['tl', 'bl'],
          offset: [0, 1],
          overflow: {
            adjustX: true,
            adjustY: true,
          },
        }}
      >
        <div className="w100 Height36">
          {showMenu && (
            <div
              className="cover"
              onClick={() => {
                setState({ showMenu: false });
                onChange();
              }}
            ></div>
          )}
          <input
            type="text"
            className="customInput"
            ref={inputRef}
            onFocus={() => {
              setState({ showMenu: true });
            }}
            autoFocus
            onChange={_.debounce(() => {
              getColumns({ pageIndex: 1, keyWords: inputRef.current.value.trim() });
            }, 500)}
          />
        </div>
      </Trigger>
    </Wrap>
  );
}
