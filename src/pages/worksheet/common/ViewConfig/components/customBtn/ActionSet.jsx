import React, { Component } from 'react';
import { Checkbox, Dropdown, Icon } from 'ming-ui';
import _ from 'lodash';
import { VIEW_CONFIG_RECORD_CLICK_ACTION } from 'worksheet/constants/enum';
import CustomBtnCon from './CustomBtnCon';
// import SysBtn from './SysBtn'; 暂时先隐藏
import styled from 'styled-components';
import { updateViewAdvancedSetting } from 'src/pages/worksheet/common/ViewConfig/util';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget';

const Wrap = styled.div`
  .line {
    border-top: 1px solid #eaeaea;
    margin-top: 30px;
  }
`;
class ActionSet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openList: ['clickAction', 'recordAction', 'bathAction'],
    };
  }

  componentDidMount() {
    this.fetchBtnByAll();
  }

  fetchBtnByAll = () => {
    const { worksheetId, appId, rowId } = this.props;
    this.props.refreshFn(worksheetId, appId, '', rowId);
  };

  // fresh = isAll => {
  //   const { worksheetId, appId, viewId, rowId } = this.props;
  //   this.props.refreshFn(worksheetId, appId, viewId, rowId);
  //   if (isAll) {
  //     this.fetchBtnByAll();
  //   }
  // };

  updateViewSet = data => {
    this.props.updateCurrentView(
      Object.assign(this.props.view, {
        advancedSetting: updateViewAdvancedSetting(this.props.view, {
          ...data,
        }),
        editAttrs: ['advancedSetting'],
      }),
    );
  };

  render() {
    const { openList } = this.state;
    const {
      detaildisable,
      listdisable,
      hidebtn,
      clicktype = '0',
      clickcid,
      listbtns,
      detailbtns,
    } = _.get(this.props.view, 'advancedSetting') || {};
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
      this.props.btnList.filter(
        o => safeParse(_.get(o, 'advancedSetting.listviews'), 'array').includes(this.props.viewId) || o.isAllView === 1,
      ),
      safeParse(listbtns, 'array'),
    );
    const detailBtns = getBtnBySort(
      this.props.btnList.filter(
        o =>
          safeParse(_.get(o, 'advancedSetting.detailviews'), 'array').includes(this.props.viewId) || o.isAllView === 1,
      ),
      safeParse(detailbtns, 'array'),
    );
    const showClickDetial = !['6'].includes(_.get(this.props, 'view.viewType') + '');
    return (
      <Wrap>
        {showClickDetial && (
          <div
            className="headerCon mTop30 Hand"
            onClick={() => {
              this.setState({
                openList: openList.includes('clickAction')
                  ? openList.filter(o => o !== 'clickAction')
                  : openList.concat('clickAction'),
              });
            }}
          >
            <Icon
              icon={openList.includes('clickAction') ? 'arrow-down' : 'arrow-right-tip'}
              className="Font14 Gray_9e"
            />
            <span className="Font15 Bold mLeft10">{_l('点击记录时')}</span>
          </div>
        )}
        {openList.includes('clickAction') && showClickDetial && (
          <React.Fragment>
            <Dropdown
              value={clicktype}
              className="w100 mTop24"
              onChange={clicktype => {
                this.updateViewSet({
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
                    this.updateViewSet({
                      clickcid,
                    });
                  }}
                  border
                  isAppendToBody
                  data={(this.props.worksheetControls || [])
                    .filter(o => [1, 2].includes(o.type) && !ALL_SYS.includes(o.controlId))
                    .map(o => {
                      return { value: o.controlId, text: o.controlName };
                    })}
                />
              </React.Fragment>
            )}
          </React.Fragment>
        )}
        {showClickDetial && <div className="line"></div>}
        <div
          className="headerCon mTop30 Hand"
          onClick={() => {
            this.setState({
              openList: openList.includes('recordAction')
                ? openList.filter(o => o !== 'recordAction')
                : openList.concat('recordAction'),
            });
          }}
        >
          <Icon
            icon={openList.includes('recordAction') ? 'arrow-down' : 'arrow-right-tip'}
            className="Font14 Gray_9e"
          />
          <span className="Font15 Bold mLeft10">{_l('记录详情')}</span>
        </div>
        {openList.includes('recordAction') && (
          <React.Fragment>
            {/* <SysBtn
              data={safeParse(detaildisable, 'array')}
              onChange={detaildisable => {
                this.updateViewSet({
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
                    text={_l('隐藏不可用的按钮')}
                    checked={hidebtn === '1'}
                    onClick={() => {
                      this.updateViewSet({
                        hidebtn: hidebtn === '1' ? '' : '1', //是否隐藏无用按钮
                      });
                    }}
                  />
                )}
              </div>
              <CustomBtnCon
                {...this.props}
                isListOption={false}
                onFresh={() => this.fetchBtnByAll()}
                btnData={detailBtns}
                btnList={this.props.btnList}
                onSortBtns={detailbtns => {
                  this.updateViewSet({
                    detailbtns,
                  });
                }}
              />
            </div>
          </React.Fragment>
        )}
        {this.props.isSheetView && (
          <React.Fragment>
            <div className="line"></div>
            <div
              className="headerCon mTop30 Hand"
              onClick={() => {
                this.setState({
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
            </div>
            {openList.includes('bathAction') && (
              <React.Fragment>
                {/* <SysBtn
                  isListOption={true}
                  data={safeParse(listdisable, 'array')}
                  onChange={listdisable => {
                    this.updateViewSet({ listdisable });
                  }}
                /> */}
                {/* 批量操作的自定义动作 */}
                <div className="customBtnBox">
                  <p className="Bold Gray_75 Font13 mTop25 mBottom0">{_l('自定义动作')}</p>
                  <CustomBtnCon
                    {...this.props}
                    isListOption={true}
                    onFresh={() => this.fetchBtnByAll()}
                    btnData={listBtns}
                    btnList={this.props.btnList.filter(
                      o => !((o.writeObject === 2 || o.writeType === 2) && o.clickType === 3),
                    )} //填写且配置了关联=>不能设置成批量按钮
                    onSortBtns={listbtns => {
                      this.updateViewSet({
                        listbtns,
                      });
                    }}
                  />
                </div>
              </React.Fragment>
            )}
          </React.Fragment>
        )}
      </Wrap>
    );
  }
}

export default ActionSet;
