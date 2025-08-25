import React from 'react';
import { useSetState } from 'react-use';
import { Popover } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
// import SysBtn from './SysBtn'; 暂时先隐藏
import styled from 'styled-components';
import { Checkbox, Dropdown, Icon } from 'ming-ui';
import { VIEW_CONFIG_RECORD_CLICK_ACTION } from 'worksheet/constants/enum';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget';
import NumInput from 'src/pages/worksheet/common/ViewConfig/components/NumInput.jsx';
import { BTN_TYPE, maxNum } from './config';
import CustomBtnCon from './CustomBtnCon';
import RowBtn from './RowBtn';

const Wrap = styled.div`
  .line {
    border-top: 1px solid #eaeaea;
    margin-top: 24px;
  }
`;
const AnimationWrap = styled.div`
  display: flex;
  padding: 2px;
  background: #f0f0f0;
  border-radius: 3px;
  .animaItem {
    height: 32px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-weight: bold;
    color: #757575;
    flex: 1;
    margin-left: 2px;
    &:first-child {
      margin-left: 0;
    }
    &:hover {
      color: #1677ff;
      i {
        color: #1677ff;
      }
    }
    i {
      color: #757575;
    }
    &.active {
      background: #ffffff;
      color: #1677ff;
      i {
        color: #1677ff;
      }
    }
    &.disabled {
      color: #bdbdbd !important;
      cursor: not-allowed;
    }
  }
`;
const WrapCount = styled.div`
  .showCount {
    width: 80px;
    .text {
      right: 10px;
      top: 0px;
      line-height: 36px;
    }
  }
`;

const WrapPopover = styled.div`
  width: 437px;
  font-weight: 400;
  padding: 12px 6px;
  .btn {
    padding: 0 16px;
    height: 36px;
    line-height: 36px;
    border-radius: 3px 3px 3px 3px;
    border: 1px solid #eaeaea;
    color: #333;
    &.first {
      color: #fff;
      background: #4caf50;
      border: 1px solid #4caf50;
    }
    i {
      color: #757575;
      &.del {
        color: #e82828;
      }
      &.first {
        color: #fff;
      }
    }
  }
`;
export default function ActionSet(props) {
  const {
    refreshFn = () => {},
    worksheetId,
    appId,
    rowId,
    updateCurrentView = () => {},
    btnList = [],
    view = {},
    isSheetView,
    worksheetControls = [],
    viewId,
  } = props;

  const [{ openList }, setState] = useSetState({
    openList: ['clickAction', 'recordAction', 'bathAction', 'rowAction'],
  });

  const fetchBtnByAll = () => {
    refreshFn(worksheetId, appId, '', rowId);
  };

  const updateViewSet = data => {
    updateCurrentView(
      Object.assign(view, {
        advancedSetting: data,
        editAdKeys: Object.keys(data),
        editAttrs: ['advancedSetting'],
      }),
    );
  };

  const { hidebtn, clicktype = '0', clickcid, listbtns, detailbtns } = _.get(view, 'advancedSetting') || {};
  const acstyle = safeParse(_.get(view, 'advancedSetting.acstyle'));
  const getBtnBySort = (list, ids) => {
    let dataList = [];
    let others = list.filter(o => !ids.includes(o.btnId));
    dataList = ids
      .map(it => {
        return list.find(o => o.btnId === it);
      })
      .filter(o => !!o);
    return [...dataList, ...others];
  };
  const listBtns = getBtnBySort(
    btnList.filter(
      o => safeParse(_.get(o, 'advancedSetting.listviews'), 'array').includes(viewId) || o.isAllView === 1,
    ),
    safeParse(listbtns, 'array'),
  );
  const detailBtns = getBtnBySort(
    btnList.filter(
      o => safeParse(_.get(o, 'advancedSetting.detailviews'), 'array').includes(viewId) || o.isAllView === 1,
    ),
    safeParse(detailbtns, 'array'),
  );

  const showClickDetail = !['6'].includes(_.get(view, 'viewType') + '');

  const onChangeAcStyle = data => {
    updateCurrentView({
      ...view,
      advancedSetting: {
        acstyle: JSON.stringify({ ...acstyle, ...data }),
      },
      editAttrs: ['advancedSetting'],
      editAdKeys: ['acstyle'],
    });
  };

  return (
    <Wrap>
      <div className="viewSetTitle">{_l('记录操作')}</div>
      {showClickDetail && (
        <div
          className="headerCon mTop24 Hand"
          onClick={() => {
            setState({
              openList: openList.includes('clickAction')
                ? openList.filter(o => o !== 'clickAction')
                : openList.concat('clickAction'),
            });
          }}
        >
          <Icon icon={openList.includes('clickAction') ? 'arrow-down' : 'arrow-right-tip'} className="Font14 Gray_9e" />
          <span className="Font15 Bold mLeft10">{_l('点击记录时')}</span>
        </div>
      )}
      {openList.includes('clickAction') && showClickDetail && (
        <React.Fragment>
          <Dropdown
            value={clicktype}
            className="w100 mTop24"
            onChange={clicktype => {
              updateViewSet({
                clicktype,
              });
            }}
            border
            isAppendToBody
            data={[
              { text: _l('打开记录详情'), value: VIEW_CONFIG_RECORD_CLICK_ACTION.OPEN_RECORD },
              { text: _l('打开链接'), value: VIEW_CONFIG_RECORD_CLICK_ACTION.OPEN_LINK },
              { text: _l('无'), value: VIEW_CONFIG_RECORD_CLICK_ACTION.NONE },
            ]}
          />
          {clicktype === '1' && (
            <React.Fragment>
              <p className="Bold Gray_75 Font13 mTop25 mBottom0">{_l('链接字段')}</p>
              <Dropdown
                placeholder={_l('选择记录中的文本字段')}
                value={clickcid}
                className="mTop10 w100"
                onChange={clickcid => {
                  updateViewSet({
                    clickcid,
                  });
                }}
                border
                isAppendToBody
                data={(worksheetControls || [])
                  .filter(o => [1, 2].includes(o.type) && !ALL_SYS.includes(o.controlId))
                  .map(o => {
                    return { value: o.controlId, text: o.controlName };
                  })}
              />
            </React.Fragment>
          )}
        </React.Fragment>
      )}
      {showClickDetail && <div className="line"></div>}
      <div
        className="headerCon mTop24 Hand"
        onClick={() => {
          setState({
            openList: openList.includes('recordAction')
              ? openList.filter(o => o !== 'recordAction')
              : openList.concat('recordAction'),
          });
        }}
      >
        <Icon icon={openList.includes('recordAction') ? 'arrow-down' : 'arrow-right-tip'} className="Font14 Gray_9e" />
        <span className="Font15 Bold mLeft10">{_l('详情操作')}</span>
        {detailBtns.length > 0 && <span className="num Bold Font15 Gray_75 mLeft8">{detailBtns.length}</span>}
      </div>
      {openList.includes('recordAction') && (
        <React.Fragment>
          {/* <SysBtn
              data={safeParse(detaildisable, 'array')}
              onChange={detaildisable => {
                updateViewSet({
                  detaildisable,
                });
              }}
            /> */}
          {/* 记录详情的自定义动作 单条 */}
          <div className="customBtnBox">
            <div className="flexRow mTop25 alignItemsCenter">
              <p className="Bold Gray_75 Font13 mAll0 flex">{_l('自定义动作')}</p>
              {detailBtns.length > 0 && (
                <Checkbox
                  className="hideBtn"
                  text={_l('隐藏不可用的动作')}
                  checked={hidebtn === '1'}
                  onClick={() => {
                    updateViewSet({
                      hidebtn: hidebtn === '1' ? '' : '1', //是否隐藏无用按钮
                    });
                  }}
                />
              )}
            </div>
            <CustomBtnCon
              {...props}
              isListOption={false}
              onFresh={() => fetchBtnByAll()}
              btnData={detailBtns}
              btnList={btnList}
              onSortBtns={detailbtns => {
                updateViewSet({
                  detailbtns,
                });
              }}
            />
          </div>
        </React.Fragment>
      )}
      {isSheetView && (
        <React.Fragment>
          <div className="line"></div>
          <div
            className="headerCon mTop24 Hand"
            onClick={() => {
              setState({
                openList: openList.includes('bathAction')
                  ? openList.filter(o => o !== 'bathAction')
                  : openList.concat('bathAction'),
              });
            }}
          >
            <Icon
              icon={openList.includes('bathAction') ? 'arrow-down' : 'arrow-right-tip'}
              className="Font14 Gray_9e"
            />
            <span className="Font15 Bold mLeft10">{_l('批量操作')}</span>
            {listBtns.length > 0 && <span className="num Bold Font15 Gray_75 mLeft8">{listBtns.length}</span>}
          </div>
          {openList.includes('bathAction') && (
            <React.Fragment>
              {/* <SysBtn
                  isListOption={true}
                  data={safeParse(listdisable, 'array')}
                  onChange={listdisable => {
                    updateViewSet({ listdisable });
                  }}
                /> */}
              {/* 批量操作的自定义动作 */}
              <div className="customBtnBox">
                <p className="Bold Gray_75 Font13 mTop25 mBottom0">{_l('自定义动作')}</p>
                <CustomBtnCon
                  {...props}
                  isListOption={true}
                  onFresh={() => fetchBtnByAll()}
                  btnData={listBtns}
                  btnList={btnList.filter(o => !((o.writeObject === 2 || o.writeType === 2) && o.clickType === 3))} //填写且配置了关联=>不能设置成批量按钮
                  onSortBtns={listbtns => {
                    updateViewSet({
                      listbtns,
                    });
                  }}
                />
              </div>
            </React.Fragment>
          )}
        </React.Fragment>
      )}
      {!['21', '6', '7'].includes(_.get(view, 'viewType') + '') && (
        <React.Fragment>
          <div className="line"></div>
          <div
            className="headerCon mTop24 Hand"
            onClick={() => {
              setState({
                openList: openList.includes('rowAction')
                  ? openList.filter(o => o !== 'rowAction')
                  : openList.concat('rowAction'),
              });
            }}
          >
            <Icon icon={openList.includes('rowAction') ? 'arrow-down' : 'arrow-right-tip'} className="Font14 Gray_9e" />
            <span className="Font15 Bold mLeft10">
              {/* 表格类视图 */}
              {isSheetView ||
              (['2'].includes(_.get(view, 'viewType') + '') && _.get(view, 'advancedSetting.hierarchyViewType') === '3')
                ? _l('行内操作')
                : _l('卡片操作')}
            </span>
            {/* {detailBtns.length > 0 && <span className="num Bold Font15 Gray_75 mLeft8">{detailBtns.length}</span>} */}
          </div>
          {openList.includes('rowAction') && (
            <React.Fragment>
              {/* 批量操作的自定义动作 */}
              <div className="customBtnBox">
                <p className="Bold Font13 mTop25 Gray_75">
                  {isSheetView ||
                  (['2'].includes(_.get(view, 'viewType') + '') &&
                    _.get(view, 'advancedSetting.hierarchyViewType') === '3')
                    ? _l('在表格右侧显示操作列，可以对每行记录进行快速操作')
                    : _l('在记录卡片上显示操作按钮，可以对单条记录快速操作')}
                </p>
                <p className="Bold Gray_75 Font13 mTop20  mBottom0">{_l('按钮')}</p>
                <RowBtn
                  {...props}
                  isListOption={true}
                  // btnData={listBtns}
                  btnList={btnList}
                  onChange={actioncolumn => {
                    updateCurrentView({
                      ...view,
                      advancedSetting: {
                        actioncolumn: JSON.stringify(actioncolumn),
                      },
                      editAttrs: ['advancedSetting'],
                      editAdKeys: ['actioncolumn'],
                    });
                  }}
                />
              </div>
              <p className="Bold Gray_75 Font13 mTop20  mBottom0 flexRow">
                <span className="flex">{_l('按钮样式')}</span>
                {acstyle.style !== 3 && (
                  <Checkbox
                    className="hideBtn InlineFlex"
                    text={_l('显示图标')}
                    checked={(acstyle || {}).icon !== 0}
                    onClick={() => {
                      onChangeAcStyle({ icon: (acstyle || {}).icon !== 0 ? 0 : 1 });
                    }}
                  />
                )}
              </p>
              <AnimationWrap className="mTop10">
                {BTN_TYPE.map(item => {
                  const { style = 1 } = acstyle || {};
                  return (
                    <div
                      className={cx('animaItem overflow_ellipsis', { active: style === item.value })}
                      onClick={() => {
                        onChangeAcStyle({ style: item.value });
                      }}
                    >
                      {item.txt}
                    </div>
                  );
                })}
              </AnimationWrap>
              <WrapCount className="flexRow alignItemsCenter mTop25">
                <span className="">{_l('显示按钮数量')}</span>
                <div className="mLeft12 showCount flexRow alignItemsCenter">
                  <NumInput
                    className="flex"
                    minNum={0}
                    maxNum={maxNum}
                    value={Number(acstyle.btncount > maxNum ? maxNum : acstyle.btncount || maxNum)}
                    onChange={value => {
                      let btncount = JSON.stringify(maxNum >= value ? value : maxNum);
                      if (btncount === (acstyle.btncount || maxNum)) {
                        return;
                      }
                      onChangeAcStyle({ btncount });
                    }}
                  />
                </div>
                <span className="pLeft10">，{_l('超出后放在更多菜单中')}</span>
              </WrapCount>
              {![2, 3].includes(acstyle.style) && (
                <WrapCount className="flexRow alignItemsCenter mTop15">
                  <span className="">{_l('首要按钮数量')}</span>
                  <div className="mLeft12 showCount flexRow alignItemsCenter">
                    <NumInput
                      className="flex"
                      minNum={0}
                      maxNum={maxNum}
                      value={Number(acstyle.primarycount || 1)}
                      onChange={value => {
                        let primarycount = JSON.stringify(maxNum >= value ? value : maxNum);
                        if (primarycount === (acstyle.primarycount || maxNum)) {
                          return;
                        }
                        if (primarycount === (acstyle.primarycount || 1)) {
                          return;
                        }
                        onChangeAcStyle({ primarycount });
                      }}
                    />
                  </div>
                  <Popover
                    content={
                      <WrapPopover className="Font13">
                        <div className="">
                          {_l(
                            '通过首要按钮来强调主要操作。如：设置1个首要按钮，则第一个按钮显示为实心颜色。其他按钮则被显示为空心线框',
                          )}
                        </div>
                        <div className="Gray_9e Bold Font13 mTop16">{_l('示例：')}</div>
                        <div className="btns mTop12">
                          <div className="btn first">
                            <Icon type="send_8" className="first" />
                            <span className="mLeft2 Bold">{_l('创建订单')}</span>
                          </div>
                          <div className="btn mLeft8">
                            <Icon type="print" />
                            <span className="mLeft2 Bold">{_l('打印')}</span>
                          </div>
                          <div className="btn mLeft8">
                            <Icon type="trash" className="del" />
                            <span className="mLeft2 Bold">{_l('删除')}</span>
                          </div>
                        </div>
                      </WrapPopover>
                    }
                    trigger="hover"
                  >
                    <i className="icon-help Font16 Gray_9e mLeft8 TxtMiddle" />
                  </Popover>
                </WrapCount>
              )}
            </React.Fragment>
          )}
        </React.Fragment>
      )}
    </Wrap>
  );
}
