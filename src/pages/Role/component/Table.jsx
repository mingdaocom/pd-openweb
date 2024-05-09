import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Checkbox, LoadDiv, Icon } from 'ming-ui';
import _ from 'lodash';
import url from 'src/pages/worksheet/assets/record.png';
const Wrap = styled.div`
  .opacity0 {
    opacity: 0 !important;
  }
  .Checkbox-box {
    margin-right: 0 !important;
  }
  &:hover {
  }
  overflow-x: auto;
  background: #fff;
  .wrapTr {
    align-items: center;
    display: flex;
    height: 56px;
    padding: 16px 6px;
    min-width: 126px;
    &.nameWrapTr {
      min-width: 240px !important;
      overflow: hidden;
    }
    &.timeTr {
      min-width: 130px !important;
      overflow: hidden;
    }
    &.checkBoxTr {
      min-width: 38px;
      max-width: 38px;
      position: sticky;
      background: #fff;
      left: 0;
      z-index: 1;
    }
    &.isSort {
      &:hover {
        color: #2196f3;
      }
    }
  }
  .emptyCon {
    height: auto;
    width: auto;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    position: absolute;
    background: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .iconBox {
      width: 130px;
      height: 130px;
      display: inline-block;
      border-radius: 50%;
      background: url(${url}) no-repeat;
      background-size: 130px 130px;
      background-color: #f5f5f5;
    }
  }
  .checkBoxTr {
    opacity: 0;
    &:hover {
      opacity: 1;
    }
    &.show {
      opacity: 1;
    }
  }
`;
const WrapHeader = styled.div`
  background: #fff;
  position: sticky;
  top: 0px;
  z-index: 10;
  .wrapTr {
    &.checkBoxTr {
      background: #fff;
    }
    background: #fff;
    &.optionWrapTr {
      min-width: 70px !important;
      max-width: 70px !important;
    }
  }
`;
const WrapList = styled.div`
  &.empty {
    height: 300px;
  }
`;
const WrapLi = styled.div`
  border-radius: 5px 5px 5px 5px;
  .optionWrapTr {
    min-width: 70px !important;
    max-width: 70px !important;
    color: #bdbdbd;
    // opacity: 0;
  }
  &:hover {
    background: #f3faff !important;
    .wrapTr {
      background: #f3faff !important;
      &.checkBoxTr {
        background: #f3faff !important;
      }
    }
    .checkBoxTr,
    .optionWrapTr {
      opacity: 1;
    }
    .optionWrapTr {
      .moreop {
        &:hover {
          color: #2196f3 !important;
        }
      }
    }
  }
  &.checkLi {
    background: #f3faff !important;
    .wrapTr {
      background: #f3faff !important;
      &.checkBoxTr {
        background: #f3faff !important;
      }
    }
    &:hover {
      background: #e0f3ff !important;
      .wrapTr {
        background: #e0f3ff !important;
        &.checkBoxTr {
          background: #e0f3ff !important;
        }
      }
    }
    .checkBoxTr {
      opacity: 1;
    }
  }
`;
const WrapSort = styled.div`
  .icon {
    display: none;
  }
  &:hover {
    color: #2196f3;
  }
  &:hover,
  &.isCue {
    .icon {
      display: block;
    }
  }
`;
const ascList = ['', 'ascend', 'descend'];
function SortToll(props) {
  const [asc, setAsc] = useState(props.item.sorterType || '');
  useEffect(() => {
    setAsc(props.item.sorterType || '');
  }, []);
  return (
    <WrapSort
      className={cx('Hand flex flexRow alignItemsCenter', { isCue: ['ascend', 'descend'].includes(asc) })}
      onClick={() => {
        let i = _.findIndex(ascList, it => it === asc);
        i = i + 1;
        let ascN = ascList[i % 3];
        setAsc(ascN);
        props.handleChangeSortHeader &&
          props.handleChangeSortHeader({ field: props.item.id, column: props.item, order: ascN });
      }}
    >
      <span className="InlineBlock">{props.name}</span>
      {!!asc && <Icon type={asc !== 'descend' ? 'gonext' : 'goprev'} className={cx('Hand mLeft3', { cur: !!asc })} />}
    </WrapSort>
  );
}
export default function PorTalTable(props) {
  const { clickRow, showTips } = props;
  const [listCell, setList] = useState(props.list || []);
  const [columnsCell, setColumns] = useState(props.columns || []);
  const scorllRef = useRef();
  const bottomRef = useRef();
  useEffect(() => {
    () => {
      scorllRef.current && $(scorllRef.current).off('scroll');
    };
  }, []);

  useEffect(() => {
    setList(props.list || []);
    setColumns(props.columns || []);
  }, [props.list, props.columns]);

  const onScroll = _.debounce(() => {
    if (bottomRef.current && window.innerHeight + 40 > $(bottomRef.current).offset().top) {
      !props.loading && props.total > listCell.length && props.onScrollEnd();
    }
  }, 500);

  useEffect(() => {
    scorllRef.current && $(scorllRef.current).off('scroll');
    scorllRef.current &&
      bottomRef.current &&
      $(scorllRef.current).on('scroll', () => {
        onScroll();
      });
  }, [listCell]);

  const customizeRenderEmpty = () => (
    <div className="emptyCon">
      <div className="TxtCenter">
        <i className="iconBox mBottom12"></i>
        <span className="Gray_9e Block mBottom20 TxtCenter Font17 Gray_9e">{props.nullTxt || _l('暂无数据')}</span>
      </div>
    </div>
  );
  return (
    <Wrap className="flex" ref={scorllRef}>
      <WrapHeader className="flexRow alignItemsCenter">
        {props.showCheck && (
          <div
            className={cx('checkBoxTr wrapTr', {
              show: props.selectedIds.length > 0 && !props.loading,
            })}
          >
            <Checkbox
              className="TxtMiddle InlineBlock mRight0 checked_selected checkBox mLeft4"
              checked={(props.selectedIds.length >= listCell.length || !!props.selectedAll) && !props.loading}
              clearselected={
                props.selectedIds.length < listCell.length &&
                props.selectedIds.length > 0 &&
                props.selectedAll !== undefined &&
                !props.selectedAll
              }
              disabled={(listCell.length <= 1 && (listCell[0] || {}).isOwner) || listCell.length <= 0} //只有拥有者的情况下，全选禁用
              onClick={() => {
                props.setSelectedIds(
                  props.selectedIds.length >= listCell.length || !!props.selectedAll
                    ? []
                    : listCell
                        .filter(o => !o.isOwner) //排除拥有者
                        .map(item => {
                          const itemId = [1, 2].includes(item.memberType) ? `${item.id}_${item.memberType}` : item.id;
                          return itemId;
                        }),
                );
                props.setSelectedAll && props.setSelectedAll(!props.selectedAll);
              }}
            ></Checkbox>
          </div>
        )}
        {columnsCell.map(o => {
          let isSort = o.sorter && props.handleChangeSortHeader;
          return (
            <div
              className={cx('wrapTr overflow_ellipsis WordBreak Gray_9e Bold', o.className, {
                isSort: isSort,
                Hand: isSort,
              })}
            >
              {isSort ? (
                <SortToll
                  key={o.id}
                  item={o}
                  name={o.renderHeader ? o.renderHeader(o) : o.name}
                  handleChangeSortHeader={props.handleChangeSortHeader}
                />
              ) : o.renderHeader ? (
                o.renderHeader(o)
              ) : (
                o.name
              )}
            </div>
          );
        })}
      </WrapHeader>
      <WrapList className={cx({ empty: listCell.length <= 0 && !props.loading })}>
        {listCell.length <= 0 && !props.loading && customizeRenderEmpty()}
        {listCell.length > 0 &&
          listCell.map(item => {
            const itemId = [1, 2].includes(item.memberType) ? `${item.id}_${item.memberType}` : item.id;
            let isChecked = props.selectedIds.includes(itemId) || !!props.selectedAll;
            return (
              <WrapLi
                className={cx('flexRow alignItemsCenter Font14', {
                  checkLi: isChecked && !(props.ownerNoOption && item.isOwner),
                  Hand: !!clickRow,
                })}
                onClick={event => {
                  if (
                    event.target.className.indexOf('moreop') >= 0 ||
                    event.target.className.indexOf('checkBox') >= 0 ||
                    event.target.className.indexOf('Checkbox') >= 0 ||
                    event.target.className.indexOf('icon-ok') >= 0
                  ) {
                    return;
                  }
                  clickRow &&
                    clickRow(
                      columnsCell.map(it => {
                        return { ...it, value: item[it.controlId] };
                      }),
                      itemId,
                    );
                }}
              >
                {props.showCheck && (
                  <div
                    className={cx('checkBoxTr wrapTr', {
                      show: props.selectedIds.length > 0,
                      opacity0: props.ownerNoOption && item.isOwner,
                    })}
                  >
                    <Checkbox
                      className="TxtMiddle InlineBlock mRight0 checked_selected checkBox mLeft4"
                      checked={isChecked}
                      onClick={(checked, id) => {
                        if (props.ownerNoOption && item.isOwner) {
                          return;
                        }
                        props.setSelectedIds(
                          isChecked ? props.selectedIds.filter(o => o !== itemId) : props.selectedIds.concat(itemId),
                        );
                        isChecked && !!props.selectedAll && !!props.setSelectedAll && props.setSelectedAll(false);
                      }}
                    ></Checkbox>
                  </div>
                )}
                {columnsCell.map(o => {
                  const pram =
                    showTips && !['option'].includes(o.id) && !o.render
                      ? {
                          title: item[o.id],
                        }
                      : null;

                  return (
                    <div className={cx('wrapTr', o.className)} {...pram}>
                      {o.render ? o.render('', item) : item[o.id]}
                    </div>
                  );
                })}
              </WrapLi>
            );
          })}
        {props.loading && <LoadDiv className="mTop15" size="small" />}
      </WrapList>
      <div className="" ref={bottomRef}></div>
    </Wrap>
  );
}
