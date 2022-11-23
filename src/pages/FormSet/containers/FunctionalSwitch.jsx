import React, { useState, useEffect } from 'react';
import * as actions from '../redux/actions/action';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Icon, ScrollView, Switch, Tooltip, LoadDiv, Dialog } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import './functionalSwitch.less';
import Range from '../components/functional/Range';
import DeleDialog from '../components/DeleAutoIdDialog';
import cx from 'classnames';
const confirm = Dialog.confirm;
import { listConfigStr, listPermit, batch } from '../config';

const tipStr = {
  10: _l('在工作表右上方显示的创建记录按钮。关闭后，则无法直接在工作表中创建记录，只能通过关联记录等其他位置创建'),
  22: _l('表格视图可以单元格直接编辑，看板、层级、画廊视图可以在卡片上直接修改文本类标题和检查框'),
  23: _l('仅控制系统默认的条形码/二维码打印功能。不包含配置的打印模板'),
  32: _l('仅控制系统默认提供的打印方式，不包含打印模版'),
  33: _l('可以控制附件的下载、分享、保存到知识（不包含用户自行上传的附件）'),
  40: _l('在视图上呈现流程名称、状态、节点负责人、节点开始、剩余时间、发起人、发起时间'),
};
// "state": true,  //开关状态
// "type": 10,  //业务类型枚举
// "roleType": 0 //角色类型   0=所有人 100=管理员

function FunctionalSwitch(props) {
  const { formSet } = props;
  const { worksheetId, worksheetInfo } = formSet;
  const { views = [], projectId, appId } = worksheetInfo;
  const [show, setShow] = useState(false);
  const [hideBatch, sethideBatch] = useState(false);
  const [closeAutoID, setCloseAutoID] = useState(!!worksheetInfo.closeAutoID);
  const [info, setInfo] = useState({
    loading: true,
    worksheetId,
    showDialog: false,
    showData: {},
    showLocation: {},
  });
  const [diaRang, setRang] = useState(false);
  useEffect(() => {
    if (!info.worksheetId) return;
    getSwitchData();
  }, [info.worksheetId]);

  useEffect(() => {
    sethideBatch(localStorage.getItem('batchIsOpen') === '1');
  }, []);

  const getSwitchData = () => {
    sheetAjax.getSwitch({ worksheetId: info.worksheetId }).then(res => {
      let data = res;
      // //测试
      // data.push(
      //   ...[//25, 26, 27, 28,
      //      29
      //   ].map(o => {
      //     return {
      //       view: [],
      //       state: true,
      //       type: o,
      //       roleType: 0,
      //       viewIds: [],
      //     };
      //   }),
      // );
      // console.log(data);
      setInfo({
        ...info,
        loading: false,
        data,
        list: _.groupBy(data, item => Math.floor(item.type / 10)),
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
        let batchNum = switchList.filter(item => item.state).length;
        let noBatch = batchNum <= 0;
        if (noBatch) {
          //下面批量操作全部关闭，批量操作按钮也关闭
          switchList.push(
            ...info.data
              .filter(o => o.type === 25)
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
        switchList,
      })
      .then(data => {
        if (data) {
          let typeList = switchList.map(item => item.type);
          let da = info.data.filter(o => !typeList.includes(o.type));
          da.push(...switchList);
          setInfo({
            ...info,
            data: da,
            list: _.groupBy(da, m => Math.floor(m.type / 10)),
            showData: props,
          });
        } else {
          alert(_l('修改失败，请稍后再试！'), 2);
        }
      });
  };
  const strFn = key => {
    let str = '';
    switch (key) {
      case '1':
        str = _l('工作表');
        break;
      case '2':
        str = _l('视图');
        break;
      case '3':
        str = _l('记录');
        break;
      case '4':
        str = _l('审批');
        break;
      default:
        str = '';
        break;
    }
    return str;
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
      alert('至少选中一个视图！');
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
              {Object.keys(info.list).map(key => {
                let item = info.list[key];
                item = item.sort((prev, next) => {
                  return listPermit.indexOf(prev.type) - listPermit.indexOf(next.type);
                });
                let batchNum = info.data.filter(item => batch.includes(item.type) && item.state).length;
                let noBatch = batchNum <= 0;
                return (
                  <React.Fragment>
                    <h6 className="Font13 mTop24 Gray Bold">{strFn(key)}</h6>
                    <ul className="mTop12">
                      {item.map(o => {
                        if (o.type === 31 || (batch.includes(o.type) && (noBatch || hideBatch))) {
                          //排除复制,暂未上线
                          return '';
                        }
                        return (
                          <li className={cx({ current: (info.showData.type || '') === o.type, isOpen: o.state })}>
                            {/* 12, 13, 34不能关闭  batch内的操作左侧没有开关*/}
                            {![12, 13, 34].concat(batch).includes(o.type) ? (
                              renderSwitch(o)
                            ) : (
                              <div className="InlineBlock mRight18 nullBox"></div>
                            )}
                            {/* batch内的操作 开关缩进 */}
                            {batch.includes(o.type) && renderSwitch(o)}
                            <span
                              className="con flexRow"
                              onClick={e => {
                                const target = e.target;
                                if (o.state) {
                                  const { viewIds = [] } = o;
                                  setRang(viewIds.length <= 0);
                                  setInfo({
                                    ...info,
                                    showData: o,
                                    showDialog:
                                      info.showData.type && info.showData.type !== o.type ? true : !info.showDialog,
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
                              {listConfigStr[o.type]}
                              {o.type === 21 && (
                                <span
                                  className="Gray_9e InlineBlock overflow_ellipsis WordBreak TxtMiddle"
                                  style={{ maxWidth: 330 }}
                                  title={_l('批量操作中的导出功能需额外设置')}
                                >
                                  （{_l('批量操作中的导出功能需额外设置')}）
                                </span>
                              )}
                              {/* 批量操作显示数量 */}
                              {[25].includes(o.type) && !noBatch && (
                                <span className="mLeft5 Gray_9e">
                                  {batchNum}/{batch.length}
                                </span>
                              )}
                              {[10, 22, 23, 33, 32, 40].includes(o.type) && (
                                <Tooltip popupPlacement="bottom" text={<span>{tipStr[o.type]}</span>}>
                                  <Icon icon="help" className="Font14 Gray_9e mLeft4" />
                                </Tooltip>
                              )}
                              {o.roleType === 100 && o.state && (
                                <Tooltip popupPlacement="bottom" text={<span>{_l('仅管理员可见')}</span>}>
                                  <Icon icon="visibility_off" className="" />
                                </Tooltip>
                              )}
                              {/* 批量操作下有开启的选项，否则隐藏 */}
                              {[25].includes(o.type) && !noBatch && (
                                <span
                                  className="batchIsOpen Right Hand ThemeHoverColor3"
                                  onClick={() => {
                                    safeLocalStorageSetItem('batchIsOpen', hideBatch ? null : '1');
                                    sethideBatch(!hideBatch);
                                  }}
                                >
                                  {hideBatch ? _l('展开') : _l('收起')}
                                </span>
                              )}
                              {/* 作用范围 */}
                              {[...batch, 12, 13, 20, 21, 22, 30, 31, 32, 33, 34, 35, 36, 41].includes(o.type) &&
                                o.state && <Icon icon="navigate_next" className="Gray_c Right Hand Font20" />}
                              {/* 10, 11, 25没有范围的操作 */}
                              {o.state && ![10, 11, 25, 40].includes(o.type) && (
                                <span className="Gray_bd Right text">
                                  {key === '1'
                                    ? o.roleType === 100
                                      ? _l('仅管理员')
                                      : _l('所有用户')
                                    : strRight(key, o)}
                                </span>
                              )}
                              {[40].includes(o.type) && (
                                <span
                                  className="Gray_bd Right text overflow_ellipsis WordBreak TxtMiddle"
                                  style={{ cursor: 'default', maxWidth: 420 }}
                                  title={_l('Beta版可用于表格显示，筛选、统计等正在开发中...')}
                                >
                                  {_l('Beta版可用于表格显示，筛选、统计等正在开发中...')}
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
            {info.showDialog && ![10, 11, 25, 40].includes(info.showData.type || '') && (
              <Range
                showDialog={info.showDialog}
                hasViewRange={![12, 13].includes(info.showData.type || '')} //是否可选视图范围
                text={{
                  allview: info.showData.type / 10 >= 4 ? _l('所有记录') : '',
                  assignview: info.showData.type / 10 >= 4 ? _l('应用于指定的视图下的记录') : '',
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
                views={views}
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
const mapStateToProps = state => ({
  formSet: state.formSet,
  sheet: state.sheet,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(FunctionalSwitch);
