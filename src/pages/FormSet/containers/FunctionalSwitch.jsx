import React, { useState, useEffect } from 'react';
import * as actions from '../redux/actions/action';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Icon, ScrollView, Switch, Tooltip, LoadDiv, Dialog } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import './functionalSwitch.less';
import Range from '../components/functional/Range';
import cx from 'classnames';
const confirm = Dialog.confirm;
import { listConfigStr, listPermit } from '../config';

const tipStr = {
  10: _l('在工作表右上方显示的创建记录按钮。关闭后，则无法直接在工作表中创建记录，只能通过关联记录等其他位置创建'),
  22: _l('表格视图可以单元格直接编辑，看板、层级、画廊视图可以在卡片上直接修改文本类标题字段'),
  32: _l('仅控制系统默认提供的打印方式，不包含打印模版'),
  33: _l('可以控制附件的下载、分享、保存到知识（不包含用户自行上传的附件）'),
};
// "state": true,  //开关状态
// "type": 10,  //业务类型枚举
// "roleType": 0 //角色类型   0=所有人 100=管理员

function FunctionalSwitch(props) {
  const { formSet } = props;
  const { worksheetId, worksheetInfo } = formSet;
  const { views = [] } = worksheetInfo;
  const [info, setInfo] = useState({
    loading: true,
    worksheetId,
    // change: false,
    showDialog: false,
    showData: {},
    showLocation: {},
  });
  const [diaRang, setRang] = useState(false);
  useEffect(() => {
    if (!info.worksheetId) return;
    getdata();
  }, [info.worksheetId]);

  const getdata = () => {
    sheetAjax.getSwitch({ worksheetId: info.worksheetId }).then(data => {
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
    sheetAjax.editSwitch({ worksheetId: info.worksheetId, roleType, type, state, viewIds }).then(data => {
      if (data) {
        let da = info.data.map(it => {
          if (it.type === type) {
            return props;
          }
          return it;
        });
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
      default:
        str = '';
        break;
    }
    return str;
  };

  const strRight = (key, data) => {
    const { viewIds = [] } = data;
    switch (key) {
      case '2':
        return viewIds.length <= 0 ? _l('所有视图') : _l('%0个视图', viewIds.length);
      case '3':
        return viewIds.length <= 0 ? _l('所有记录') : _l('%0个视图下的记录', viewIds.length);
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
                return (
                  <React.Fragment>
                    <h6 className="Font13 mTop24 Gray Bold">{strFn(key)}</h6>
                    <ul className="mTop12">
                      {item.map(o => {
                        if (o.type === 31) {
                          return '';
                        }
                        return (
                          <li className={cx({ current: (info.showData.type || '') === o.type, isOpen: o.state })}>
                            {![12, 13, 34].includes(o.type) ? (
                              <Switch
                                checked={o.state}
                                onClick={e => {
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
                            ) : (
                              <div className="InlineBlock mRight18 nullBox"></div>
                            )}
                            <span
                              className="con"
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
                                      top: $(target)
                                        .closest('li')
                                        .position().top,
                                    },
                                  });
                                }
                              }}
                            >
                              {listConfigStr[o.type]}
                              {[10, 22, 33, 32].includes(o.type) && (
                                <Tooltip popupPlacement="bottom" text={<span>{tipStr[o.type]}</span>}>
                                  <Icon icon="help" className="Font14 Gray_9e mLeft4" />
                                </Tooltip>
                              )}
                              {o.roleType === 100 && o.state && (
                                <Tooltip popupPlacement="bottom" text={<span>{_l('仅管理员可见')}</span>}>
                                  <Icon icon="visibility_off" className="" />
                                </Tooltip>
                              )}
                              {[12, 13, 20, 21, 22, 23, 30, 31, 32, 33, 34, 35, 36].includes(o.type) && o.state && (
                                <Icon icon="navigate_next" className="Gray_c Right Hand Font20" />
                              )}
                              {o.state && ![10, 11].includes(o.type) && (
                                <span className="Gray_bd Right text">
                                  {key === '1'
                                    ? o.roleType === 100
                                      ? _l('仅管理员')
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
            {info.showDialog && ![10, 11].includes(info.showData.type || '') && (
              <Range
                showDialog={info.showDialog}
                hasViewRange={![12, 13].includes(info.showData.type || '')} //是否可选视图范围
                text={{
                  allview: info.showData.type / 10 >= 3 ? _l('所有记录') : '',
                  assignview: info.showData.type / 10 >= 3 ? _l('应用于指定的视图下的记录') : '',
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
          </div>
        </ScrollView>
      )}
    </React.Fragment>
  );
}
const mapStateToProps = state => ({
  formSet: state.formSet,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(FunctionalSwitch);
