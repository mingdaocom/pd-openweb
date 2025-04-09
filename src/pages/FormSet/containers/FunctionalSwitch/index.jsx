import React, { useState, useEffect } from 'react';
import { Icon, ScrollView, Switch, Tooltip, LoadDiv, Dialog } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import './style.less';
import Range from '../../components/functional/Range';
import DeleDialog from '../../components/DeleAutoIdDialog';
import cx from 'classnames';
import {
  worksheetSwitch,
  allSwitch,
  listConfigStr,
  batch,
  statistics,
  statisticsConst,
  noRangeList,
  helfList,
  hasRangeList,
  tipStr,
} from './config';
import _ from 'lodash';
const confirm = Dialog.confirm;

// "state": true,  //开关状态
// "type": 10,  //业务类型枚举
// "roleType": 0 //角色类型   0=所有人 100=管理员

function FunctionalSwitch(props) {
  const { worksheetId, worksheetInfo } = props;
  const { views = [], projectId, appId } = worksheetInfo;
  const [show, setShow] = useState(false);
  const [hideBatch, sethideBatch] = useState(false);
  const [hideStatistics, sethideStatistics] = useState(false);
  const [closeAutoID, setCloseAutoID] = useState(!!worksheetInfo.closeAutoID);
  const [info, setInfo] = useState({
    loading: true,
    worksheetId,
    showDialog: false,
    showData: {},
    showLocation: {},
    key: '',
  });
  const [diaRang, setRang] = useState(false);
  useEffect(() => {
    if (!info.worksheetId) return;
    getSwitchData();
  }, [info.worksheetId]);

  useEffect(() => {
    const { worksheetInfo } = props;
    setCloseAutoID(!!worksheetInfo.closeAutoID);
  }, [props]);

  useEffect(() => {
    sethideBatch(localStorage.getItem('batchIsOpen') === '1');
    sethideStatistics(localStorage.getItem('statisticsIsOpen') === '1');
  }, []);

  const getSwitchData = () => {
    sheetAjax.getSwitch({ worksheetId: info.worksheetId }).then(res => {
      let data = res.concat({
        view: [],
        state: res.filter(o => statistics.includes(o.type) && o.state).length > 0,
        type: statisticsConst, //统计
        roleType: 0,
        viewIds: [],
      });
      setInfo({
        ...info,
        loading: false,
        data,
      });
    });
  };

  const edit = props => {
    const { roleType, type, state, viewIds } = props;
    let switchList = [{ ...props }]; //非批量操作相关，直接操作
    if ([...batch, 25].includes(type)) {
      //批量操作相关数据处理
      if (type === 25) {
        //批量操作关闭，批量下的操作全部关闭
        switchList.push(
          ...info.data
            .filter(o => batch.includes(o.type))
            .map(o => {
              return { ..._.pick(o, ['roleType', 'type', 'state', 'viewIds']), state: state };
            }),
        );
      } else {
        let batchOther = info.data.filter(o => batch.includes(o.type) && type !== o.type);
        switchList.push(...batchOther);
        // let batchNum = switchList.filter(item => item.state).length;
        // let noBatch = batchNum <= 0;
        // if (noBatch) {
        //   //下面批量操作全部关闭，批量操作按钮也关闭
        //   switchList.push(
        //     ...info.data
        //       .filter(o => o.type === 25)
        //       .map(o => {
        //         return { ..._.pick(o, ['roleType', 'type', 'state', 'viewIds']), state: false };
        //       }),
        //   );
        // }
      }
    }
    if ([statisticsConst, ...statistics].includes(type)) {
      if (type === statisticsConst) {
        switchList.push(
          ...info.data
            .filter(o => statistics.includes(o.type))
            .map(o => {
              return { ..._.pick(o, ['roleType', 'type', 'state', 'viewIds']), state: state };
            }),
        );
      } else {
        let batchOther = info.data.filter(o => statistics.includes(o.type) && type !== o.type);
        switchList.push(...batchOther);
        let batchNum = switchList.filter(item => item.state).length;
        let noBatch = batchNum <= 0;
        if (noBatch) {
          //下面批量操作全部关闭，批量操作按钮也关闭
          switchList.push(
            ...info.data
              .filter(o => o.type === statisticsConst)
              .map(o => {
                return { ..._.pick(o, ['roleType', 'type', 'state', 'viewIds']), state: false };
              }),
          );
        }
      }
    }
    sheetAjax
      .batchEditSwitch({
        worksheetId: info.worksheetId,
        switchList: switchList.filter(o => o.type !== statisticsConst),
      })
      .then(data => {
        if (data) {
          let typeList = switchList.map(item => item.type);
          let da = info.data.filter(o => !typeList.includes(o.type));
          da.push(...switchList);
          setInfo({
            ...info,
            data: da,
            showData: props,
          });
        } else {
          alert(_l('修改失败，请稍后再试！'), 2);
        }
      });
  };

  const strRight = (key, data) => {
    const { viewIds = [] } = data;
    let len = viewIds.length;
    let Ids = views.map(o => o.viewId);
    let l = viewIds.filter(o => Ids.includes(o)).length; //有效的视图数量
    switch (key) {
      case '2':
      case '4':
        return len <= 0 ? _l('所有视图') : _l('%0个视图', l);
      case '3':
        return len <= 0 ? _l('所有记录') : _l('%0个视图下的记录', l);
    }
  };

  const closeRangeDiaFn = info => {
    const { viewIds = [], state } = info.showData;
    if (viewIds.length <= 0 && !diaRang && state) {
      alert('至少选中一个视图！', 3);
      return;
    }
    setInfo({
      ...info,
      showData: {},
      showDialog: false,
    });
    setRang(false);
  };
  const renderSwitch = o => {
    return (
      <Switch
        checked={o.state}
        onClick={() => {
          if (info.showDialog) {
            //使用范围未关闭 不可点击其他开关的状态时
            return;
          }
          if ([20, 30].includes(o.type) && o.state) {
            return confirm({
              title: <span className="Red">{_l('关闭%0', listConfigStr[o.type])}</span>,
              description: _l('关闭后，已经分享的链接将会失效无法访问'),
              onOk: () => {
                edit({
                  state: !o.state,
                  type: o.type,
                  roleType: o.roleType,
                });
              },
            });
          } else {
            edit({
              state: !o.state,
              type: o.type,
              roleType: o.roleType,
            });
          }
        }}
        className="mRight18"
      />
    );
  };
  return (
    <React.Fragment>
      {info.loading ? (
        <LoadDiv />
      ) : (
        <ScrollView>
          <div className="switchBox">
            <div className="switchBoxCon">
              <h5>{_l('功能开关')}</h5>
              <p>{_l('设置启用的系统功能和使用范围')}</p>
              {allSwitch.map(o => {
                const key = o.key;
                let batchNum = info.data.filter(
                  item => batch.includes(item.type) && info.data.find(a => a.type === item.type).state,
                ).length;
                let noBatch = batchNum <= 0;
                let statisticsNum = info.data.filter(
                  item => statistics.includes(item.type) && info.data.find(a => a.type === item.type).state,
                ).length;
                let noStatistics = statisticsNum <= 0;
                return (
                  <React.Fragment>
                    <h6 className="Font13 mTop24 Gray Bold">{o.txt}</h6>
                    <ul className="mTop12">
                      {o.list.map(oo => {
                        const o = info.data.find(a => a.type === oo) || {};
                        if (
                          oo === 31 ||
                          (batch.includes(oo) && (!info.data.find(a => a.type === 25).state || hideBatch)) ||
                          (statistics.includes(oo) && (noStatistics || hideStatistics))
                        ) {
                          //排除复制,暂未上线
                          return '';
                        }
                        return (
                          <li className={cx({ current: (info.showData.type || '') === o.type, isOpen: o.state })}>
                            {/* batch,statistics内的操作左侧没有开关*/}
                            {![...batch, ...statistics].includes(oo) ? (
                              renderSwitch(o)
                            ) : (
                              <div className="InlineBlock mRight18 nullBox"></div>
                            )}
                            {/* batch,statistics内的操作 开关缩进 */}
                            {[...batch, ...statistics].includes(oo) && renderSwitch(o)}
                            <span
                              className="con flexRow"
                              onClick={e => {
                                const target = e.target;
                                if (o.state) {
                                  const { viewIds = [] } = o;
                                  setRang(viewIds.length <= 0);
                                  setInfo({
                                    ...info,
                                    key,
                                    showData: o,
                                    showDialog:
                                      info.showData.type && info.showData.type !== oo ? true : !info.showDialog,
                                    showLocation: {
                                      left: e.clientX,
                                      top: !!$(target).closest('li').length
                                        ? $(target).closest('li').position().top
                                        : 0,
                                    },
                                  });
                                }
                              }}
                            >
                              {listConfigStr[oo]}
                              {oo === 21 && (
                                <span
                                  className="Gray_9e InlineBlock overflow_ellipsis WordBreak TxtMiddle"
                                  style={{ maxWidth: 330 }}
                                  title={_l('批量操作中的导出功能需额外设置')}
                                >
                                  （{_l('批量操作中的导出功能需额外设置')}）
                                </span>
                              )}
                              {/* 批量操作显示数量 */}
                              {[25].includes(oo) && !noBatch && (
                                <span className="mLeft5 Gray_9e">
                                  {batchNum}/{batch.length}
                                </span>
                              )}
                              {[statisticsConst].includes(oo) && !noStatistics && (
                                <span className="mLeft5 Gray_9e">
                                  {statisticsNum}/{statistics.length}
                                </span>
                              )}
                              {helfList.includes(oo) && (
                                <Tooltip popupPlacement="bottom" text={<span>{tipStr[oo]}</span>}>
                                  <Icon icon="help" className="Font14 Gray_9e mLeft4" />
                                </Tooltip>
                              )}
                              {o.roleType === 100 && o.state && (
                                <Tooltip
                                  popupPlacement="bottom"
                                  text={<span>{_l('仅系统角色可见（包含管理员、运营者、开发者）')}</span>}
                                >
                                  <Icon icon="visibility_off" className="" />
                                </Tooltip>
                              )}
                              {((25 === oo && info.data.find(a => a.type === 25).state) ||
                                (statisticsConst === oo && !noStatistics)) && (
                                <span
                                  className="batchIsOpen Right Hand ThemeHoverColor3"
                                  onClick={() => {
                                    if (25 === oo) {
                                      safeLocalStorageSetItem('batchIsOpen', hideBatch ? null : '1');
                                      sethideBatch(!hideBatch);
                                    } else {
                                      safeLocalStorageSetItem('statisticsIsOpen', hideStatistics ? null : '1');
                                      sethideStatistics(!hideStatistics);
                                    }
                                  }}
                                >
                                  {(25 === oo && hideBatch) || (hideStatistics && statisticsConst === oo)
                                    ? _l('展开')
                                    : _l('收起')}
                                </span>
                              )}
                              {/* 作用范围 */}
                              {hasRangeList.includes(oo) && o.state && (
                                <Icon icon="navigate_next" className="Gray_c Right Hand Font20" />
                              )}
                              {/* 25没有范围的操作 */}
                              {o.state && !noRangeList.includes(oo) && (
                                <span className="Gray_bd Right text">
                                  {worksheetSwitch.includes(oo)
                                    ? o.roleType === 100
                                      ? _l('仅系统角色')
                                      : _l('所有用户')
                                    : strRight(key, o)}
                                </span>
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </React.Fragment>
                );
              })}
            </div>
            {/* 10, 11, 25, 40 没有范围选择 */}
            {info.showDialog && !noRangeList.includes(info.showData.type || '') && (
              <Range
                showDialog={info.showDialog}
                hasViewRange={![...statistics, 10, 11, 13, 14].includes(info.showData.type || '')} //是否可选视图范围
                text={{
                  allview: ['3'].includes(info.key) ? _l('所有记录') : '',
                  assignview: ['3'].includes(info.key) ? _l('应用于指定的视图下的记录') : '',
                }}
                onClickAwayExceptions={['.switchBox li.isOpen .con']}
                onClickAway={() => {
                  closeRangeDiaFn(info);
                }}
                diaRang={diaRang}
                closeFn={() => {
                  closeRangeDiaFn(info);
                }}
                roleType={info.showData.roleType}
                change={roleType => {
                  edit({
                    ...info.showData,
                    roleType: roleType,
                  });
                }}
                top={info.showLocation.top}
                changeViewRange={data => {
                  edit({
                    ...info.showData,
                    ..._.omit(data, 'diaRang'),
                  });
                  setRang(data.diaRang);
                }}
                views={views.filter(l => l.viewId !== l.worksheetId)}
                data={info.showData}
              />
            )}
            {!closeAutoID && (
              <React.Fragment>
                <h6 className="Font13 mTop24 Gray Bold">{_l('其他')}</h6>
                <div className="">
                  <ul className="mTop12">
                    <li className="autoId pRight16">
                      <div className="">
                        {_l('系统编号')}
                        <Tooltip
                          popupPlacement="bottom"
                          text={
                            <span>
                              {_l(
                                '系统编号为之前创建的工作表中用于生成序号的系统字段，每增加一条记录时自动+1，仅在工作流中可以使用此字段。现在已被自动编号字段代替，新创建的工作表不再包含此字段。如果你未使用过此字段，可以删除以提升在大数据量时的工作表性能',
                              )}
                            </span>
                          }
                        >
                          <Icon icon="help" className="Font14 Gray_9e mLeft4" />
                        </Tooltip>
                      </div>
                      <span
                        className="Hand text dele"
                        onClick={() => {
                          setShow(true);
                        }}
                      >
                        {_l('删除')}
                      </span>
                    </li>
                  </ul>
                </div>
                {show && (
                  <DeleDialog
                    show={show}
                    appId={appId}
                    companyId={projectId}
                    onClose={() => setShow(false)}
                    worksheetId={worksheetId}
                    deleCallback={() => {
                      setCloseAutoID(true);
                    }}
                  />
                )}
              </React.Fragment>
            )}
          </div>
        </ScrollView>
      )}
    </React.Fragment>
  );
}
export default FunctionalSwitch;
