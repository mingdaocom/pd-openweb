import React, { useState, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import { Switch, Dropdown, Icon, ScrollView, Tooltip, LoadDiv, RadioGroup, Checkbox } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { SUBMIT_NEXT_ACTION_LIST } from 'src/pages/FormSet/config';
import _ from 'lodash';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget';
import { Con, Wrap, WrapTxt } from './style';
import DoubleConfirmationDialog from './DoubleConfirmDialog';
import { defaultDoubleConfirm } from './config';

let ajaxPromise = null;
function SubmitFormSetting(props) {
  const { worksheetId } = props;
  const { appId } = _.get(props, 'worksheetInfo') || {};
  const [{ advancedSetting, str, loading, dropDownVisible, index, showDoubleConfirm }, setState] = useSetState({
    advancedSetting: {},
    loading: true,
    dropDownVisible: false,
    str: '',
    index: null,
    showDoubleConfirm: false,
  });
  const btnList = [
    ['subafter', 'sub', 'subview'],
    ['continueafter', 'continue', 'continueview', 'continuestatus'],
  ];

  useEffect(() => {
    if (!appId || !worksheetId) {
      return;
    }
    if (ajaxPromise) {
      ajaxPromise.abort();
    }
    ajaxPromise = sheetAjax.getFormSubmissionSettings({ workSheetId: worksheetId, appId: appId });
    ajaxPromise.then(res => {
      const { advancedSetting = {} } = res;
      setState({
        loading: false,
        advancedSetting,
      });
    });
  }, []);

  const onChangeSetting = data => {
    let newValues = { ...advancedSetting, ...data };
    setState({
      advancedSetting: newValues,
    });
    sheetAjax
      .editWorksheetSetting({
        workSheetId: worksheetId,
        appId: appId,
        advancedSetting: newValues,
      })
      .then(res => {
        if (!res) {
          alert(_l('修改失败，请稍后再试'), 2);
          return;
        }
      });
  };

  const inputRender = n => {
    return (
      <Wrap>
        <p className="Font13">{_l('按钮名称')}</p>
        <input
          type="text"
          className="btnName mTop10"
          defaultValue={str}
          onChange={e => {
            setState({
              ...advancedSetting,
              [btnList[n][1]]: e.target.value,
            });
          }}
          autoFocus={true}
          onBlur={e => {
            const data = e.target.value.trim();
            setState({
              str: '',
              index: null,
            });
            onChangeSetting({
              [btnList[n][1]]: data ? data : str,
            });
          }}
        />
      </Wrap>
    );
  };
  const renderBtnCon = i => {
    let noAction = i === 1 && advancedSetting.continuestatus === '0';
    const btnStr = _.get(advancedSetting, btnList[i][1]) || (i === 0 ? _l('提交') : _l('继续创建'));
    return (
      <React.Fragment>
        <div
          className={cx('con', {
            nextBtn: i === 1,
            mTop10: i !== 0,
            noAction,
          })}
        >
          <div className="btnCon">
            <Trigger
              action={['click']}
              popup={inputRender(i)}
              popupClassName={cx('inputTrigger')}
              popupAlign={{
                points: ['tl', 'bl'],
                overflow: {
                  adjustX: true,
                  adjustY: true,
                },
              }}
            >
              <div className="TxtMiddle">
                <span className="btnStr InlineBlock overflow_ellipsis">
                  {!!str && !!index && index === i ? str : btnStr}
                </span>
                {!noAction && (
                  <Tooltip popupPlacement="bottom" text={<span>{_l('修改按钮名称')}</span>}>
                    <Icon
                      icon="workflow_write"
                      className="Font16 Hand mLeft5 TxtTop LineHeight30"
                      onClick={() => {
                        setState({
                          index: i,
                          str: btnStr,
                        });
                        setTimeout(() => {
                          $('.btnName').focus();
                        }, 300);
                      }}
                    />
                  </Tooltip>
                )}
              </div>
            </Trigger>
          </div>
          <span className="after flex">
            <span className="Gray_75 TxtMiddle">{_l('提交后：')}</span>
            <Dropdown
              menuStyle={{ minWidth: 150, width: 'auto' }}
              currentItemClass="currentMenu"
              data={SUBMIT_NEXT_ACTION_LIST}
              value={_.get(advancedSetting, btnList[i][0]) || (i === 0 ? '1' : '2')}
              className={cx('flex InlineBlock')}
              onChange={newValue => {
                if (newValue === _.get(advancedSetting, btnList[i][0])) {
                  return;
                }
                let param = {};
                if (newValue === '3') {
                  if (!_.get(advancedSetting, btnList[i][2])) {
                    param = {
                      ...param,
                      [btnList[i][2]]: _.get(props, 'worksheetInfo.views[0].viewId'),
                    };
                  }
                }
                onChangeSetting({
                  ...param,
                  [btnList[i][0]]: newValue,
                });
              }}
            />
            {_.get(advancedSetting, btnList[i][0]) === '3' && (
              <span className="viewCon mLeft25">
                <span className="Gray_75 TxtMiddle">{_l('视图：')}</span>
                <Dropdown
                  menuStyle={{ width: 150 }}
                  currentItemClass="currentMenu"
                  data={(_.get(props, 'worksheetInfo.views') || []).map(item => {
                    return { text: item.name, value: item.viewId };
                  })}
                  value={_.get(advancedSetting, btnList[i][2])}
                  placeholder={
                    _.get(advancedSetting, btnList[i][2]) ? (
                      <span className="Red">{_l('视图已删除')}</span>
                    ) : (
                      _l('选择视图')
                    )
                  }
                  className={cx('flex InlineBlock')}
                  onChange={newValue => {
                    if (newValue === _.get(advancedSetting, btnList[i][2])) {
                      return;
                    }
                    onChangeSetting({
                      [btnList[i][2]]: newValue,
                    });
                  }}
                />
              </span>
            )}
          </span>
          {noAction && <div className="cover"></div>}
          {i === 1 && (
            <Switch
              className="Hand switchBtn"
              checked={_.get(advancedSetting, btnList[i][3]) !== '0'}
              onClick={() => {
                onChangeSetting({
                  [btnList[i][3]]: _.get(advancedSetting, btnList[i][3]) === '0' ? '1' : '0',
                });
              }}
            />
          )}
        </div>
      </React.Fragment>
    );
  };
  if (loading) {
    return <LoadDiv />;
  }
  const isReserve = () => {
    return (_.get(advancedSetting, 'reservecontrols') || '').indexOf('[') >= 0;
  };

  const renderTxt = () => {
    const doubleconfirm = safeParse(_.get(advancedSetting, 'doubleconfirm'));
    return (
      advancedSetting.enableconfirm === '1' &&
      !!doubleconfirm.confirmMsg && (
        <WrapTxt className='flexRow w100'>
          <div className="txtFilter flex">
            <p>
              <span className="titleTxt Gray">{_l('提示文字')}</span>
              <span className="txt Gray WordBreak">{_.get(doubleconfirm, 'confirmMsg')}</span>
            </p>
            {!!(_.get(doubleconfirm, 'confirmContent') || '').trim() && (
              <p className="mTop5 flexRow w100">
                <span className="titleTxt Gray">{_l('详细内容')}</span>
                <span className="txt Gray WordBreak overflow_ellipsis flex">{_.get(doubleconfirm, 'confirmContent')}</span>
              </p>
            )}
          </div>
          <Icon
            icon="hr_edit"
            className="Gray_9d Font18 editFilter Hand"
            onClick={() => {
              setState({
                showDoubleConfirm: true,
              });
            }}
          />
        </WrapTxt>
      )
    );
  };
  return (
    <ScrollView>
      <Con className="">
        <h5>{_l('表单标题')}</h5>
        <input
          type="text"
          className="title mTop12"
          placeholder={_l('创建记录')}
          defaultValue={_.get(advancedSetting, 'title')}
          onBlur={e => {
            onChangeSetting({
              title: e.target.value.trim(),
            });
          }}
        />
        <h5>{_l('提交按钮')}</h5>
        {btnList.map((o, i) => {
          return renderBtnCon(i);
        })}
        <h5>{_l('更多设置')}</h5>
        <div className="moreActionCon flexRow mTop12">
          <div className="flex">
            <h6 className="mTop20">{_l('存草稿')}</h6>
            <p className="Gray_9e">{_l('在表单中显示存草稿按钮，草稿数据在下次打开时可以继续编辑并提交')}</p>
          </div>
          <div className="mRight16 mLeft40 Relative">
            <Switch
              checked={advancedSetting.closedrafts !== '1'}
              onClick={() => {
                onChangeSetting({
                  closedrafts: advancedSetting.closedrafts === '1' ? '0' : '1',
                });
              }}
            />
          </div>
        </div>
        <div className="moreActionCon">
          <div className="flexRow alignItemsCenter">
            <div className="flex">
              <h6 className="mTop20">{_l('继续创建时，保留本次提交内容')}</h6>
              <p className="Gray_9e">{_l('启用后，在连续创建数据时可以自动填充上次提交的内容，减少重复输入')}</p>
            </div>
            <div className="mRight16 mLeft40 Relative">
              <Switch
                className={cx('Hand TxtMiddle')}
                checked={advancedSetting.showcontinue !== '0'}
                onClick={() => {
                  onChangeSetting({
                    showcontinue: advancedSetting.showcontinue === '0' ? '1' : '0',
                  });
                }}
              />
            </div>
          </div>
          {advancedSetting.showcontinue !== '0' && (
            <div className="mLeft12">
              <div className="flexRow mTop16 pRight16">
                <Dropdown
                  data={[
                    { text: _l('保留所有提交内容'), value: 'all' },
                    { text: _l('保留指定字段'), value: 'reserve' },
                  ]}
                  value={!isReserve() ? 'all' : 'reserve'}
                  className={cx('act', !isReserve() ? 'flex' : 'w200')}
                  onChange={value => {
                    onChangeSetting({
                      reservecontrols: value === 'all' ? 'all' : '[]',
                    });
                  }}
                  border
                  isAppendToBody
                />
                {isReserve() && (
                  <Dropdown
                    key={worksheetId}
                    data={props.worksheetControls
                      .filter(
                        o =>
                          !ALL_SYS.includes(o.controlId) &&
                          [
                            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 21, 23, 24, 26, 27, 28, 29, 34,
                            35, 36, 40, 41, 42, 44, 46, 48,
                          ].includes(o.type),
                      )
                      .map(o => {
                        return { text: o.controlName, value: o.controlId };
                      })}
                    border
                    value={
                      safeParse(advancedSetting.reservecontrols).length <= 0
                        ? undefined
                        : safeParse(advancedSetting.reservecontrols)
                    }
                    className={cx('flex mLeft10 controlsDropdown')}
                    onChange={value => {
                      if (!value) {
                        onChangeSetting({
                          reservecontrols: JSON.stringify([]),
                        });
                        return;
                      }
                      let data = safeParse(advancedSetting.reservecontrols);
                      if (data.includes(value)) {
                        data = data.filter(o => o !== value);
                      } else {
                        data = [...data, value];
                      }
                      onChangeSetting({
                        reservecontrols: JSON.stringify(data),
                      });
                    }}
                    placeholder={_l('请选择')}
                    renderItem={item => {
                      const reservecontrols = safeParse(advancedSetting.reservecontrols);
                      const isCur = reservecontrols.includes(item.value);
                      return (
                        <div
                          className={cx('itemText flexRow alignItemsCenter', {
                            isCur,
                          })}
                        >
                          <Checkbox className="Hand" checked={isCur} />
                          <span className="mLeft10 flex Gray overflow_ellipsis">{item.text}</span>
                        </div>
                      );
                    }}
                    cancelAble
                    popupVisible={dropDownVisible}
                    onVisibleChange={dropDownVisible => {
                      setState({
                        dropDownVisible,
                      });
                    }}
                    selectClose={false}
                    menuClass={'reserveControlsDropdownMenuSet'}
                    renderTitle={() => {
                      const reservecontrols = safeParse(advancedSetting.reservecontrols);
                      return (
                        <div className="">
                          {reservecontrols.map(it => {
                            const control = props.worksheetControls.find(o => o.controlId === it);
                            return (
                              <div className="itemT flexRow alignItemsCenter">
                                <span className={cx('flex overflow_ellipsis', { Red: !control })}>
                                  {!control ? _l('字段已删除') : control.controlName}
                                </span>
                                <Icon
                                  icon={'close'}
                                  className="Hand mLeft3 ThemeHoverColor3"
                                  onClick={e => {
                                    e.stopPropagation();
                                    let data = reservecontrols.filter(a => a !== it);
                                    onChangeSetting({
                                      reservecontrols: JSON.stringify(data),
                                    });
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      );
                    }}
                    isAppendToBody
                  />
                )}
              </div>
              <div className="mTop12 Gray_75 Font13 Bold">{_l('保留方式')}</div>
              <RadioGroup
                className="autoreserveCon flexColumn"
                data={[
                  { value: '0', text: _l('显示“保留上次提交内容”选项，由用户决定是否保留') },
                  { value: '1', text: _l('无需询问，自动保留') },
                ]}
                checkedValue={advancedSetting.autoreserve === '1' ? '1' : '0'}
                onChange={autoreserve => {
                  onChangeSetting({
                    autoreserve: autoreserve,
                  });
                }}
              />
            </div>
          )}
        </div>
        <div className="moreActionCon">
          <div className="flexRow alignItemsCenter">
            <div className="flex">
              <h6 className="mTop20">{_l('提交记录时二次确认')}</h6>
              <p className="Gray_9e">{_l('在点击表单提交时，弹出二次确认层确认后提交')}</p>
            </div>
            <div className="mRight16 mLeft40 Relative">
              <Switch
                checked={advancedSetting.enableconfirm === '1'}
                onClick={() => {
                  let info;
                  if (advancedSetting.enableconfirm !== '1' && !_.get(advancedSetting, 'doubleconfirm')) {
                    info = { doubleconfirm: JSON.stringify(defaultDoubleConfirm) };
                    setState({
                      showDoubleConfirm: true,
                    });
                  }
                  onChangeSetting({
                    enableconfirm: advancedSetting.enableconfirm === '1' ? '0' : '1',
                    ...info,
                  });
                }}
              />
            </div>
          </div>
          {showDoubleConfirm && (
            <DoubleConfirmationDialog
              visible={showDoubleConfirm}
              onCancel={() => setState({ showDoubleConfirm: false })}
              doubleConfirm={safeParse(advancedSetting.doubleconfirm)}
              onChange={doubleconfirm => {
                onChangeSetting({
                  doubleconfirm: JSON.stringify(doubleconfirm),
                });
                setState({ showDoubleConfirm: false });
              }}
            />
          )}
          {renderTxt()}
        </div>
        <div className="moreActionCon flexRow borderB">
          <div className="flex">
            <h6 className="mTop20">
              {_l('通过提交按钮新增时，立即执行工作流')}
              <i className="icon-beta1 Font16 mLeft5" style={{ color: '#4caf50' }} />
            </h6>
            <p className="Gray_9e">
              {_l(
                '启用后，通过点击表单提交按钮创建的记录，在触发工作流后会立即开始执行（无需系统默认的5s延时等待）。当执行完成或等待时会同时刷新前端数据。',
              )}
            </p>
          </div>
          <div className="mRight16 mLeft40 Relative">
            <Switch
              checked={advancedSetting.executeworkflow === '1'}
              onClick={() => {
                onChangeSetting({
                  executeworkflow: advancedSetting.executeworkflow === '1' ? '0' : '1',
                });
              }}
            />
          </div>
        </div>
      </Con>
    </ScrollView>
  );
}
export default SubmitFormSetting;
