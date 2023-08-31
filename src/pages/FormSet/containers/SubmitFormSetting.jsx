import React, { useState, useEffect, useRef } from 'react';
import * as actions from '../redux/actions/action';
import { connect } from 'react-redux';
import { Switch, Dropdown, Icon, ScrollView, Tooltip, LoadDiv } from 'ming-ui';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import sheetAjax from 'src/api/worksheet';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { SUBMIT_NEXT_ACTION_LIST } from 'src/pages/FormSet/config';
import _ from 'lodash';
const Con = styled.div`
  p {
    margin: 0;
  }
  max-width: 800px;
  margin: 0 40px;
  padding-bottom: 100px;
  h5,
  h6 {
    font-size: 14px;
    font-weight: 600;
    color: #333333;
    margin-top: 38px;
  }
  .title {
    width: 100%;
    padding: 0px 9px;
    line-height: 36px;
    border-radius: 3px;
    border: 1px solid #dddddd;
    box-sizing: border-box;
    &:-ms-input-placeholder {
      color: #9e9e9e !important;
    }
    &::-ms-input-placeholder {
      color: #9e9e9e;
    }
    &::placeholder {
      color: #9e9e9e;
    }
    &:focus {
      border: 1px solid #2196f3;
    }
  }
  .con {
    width: 100%;
    padding: 24px 16px;
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid #eaeaea;
    display: flex;
    align-items: center;
    justify-content: center;
    .ming.Dropdown {
      .Dropdown--input {
        padding-left: 0px;
      }
      .currentMenu {
        color: #2196f3;
      }
    }
    .ming.MenuItem .Item-content:not(.disabled):hover {
      background-color: #f5f5f5 !important;
      color: #333 !important;
    }

    .btnCon {
      width: 180px;
      margin-right: 34px;
      & > div {
        height: 32px;
      }
      .btnStr {
        color: #fff;
        line-height: 32px;
        min-height: 32px;
        padding: 0 20px;
        background: #2196f3;
        border-radius: 4px;
        max-width: 155px;
        box-sizing: border-box;
      }
      i {
        color: #bdbdbd;
        opacity: 0;
        &:hover {
          color: #2196f3;
        }
      }
    }
    &:hover {
      border: 1px solid #ccc;
      i {
        opacity: 1;
      }
    }
    &.nextBtn {
      .btnCon {
        .btnStr {
          background: #ffffff;
          border: 1px solid #e0e0e0;
          color: #333;
        }
      }
      &.noAction {
        opacity: 0.5;
        position: relative;
      }
    }
    .cover {
      position: absolute;
      z-index: 1;
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
    }
    .switchBtn {
      z-index: 2;
    }
  }
  .moreActionCon {
    border-top: 1px solid #eaeaea;
    padding-bottom: 20px;
    align-items: center;
    justify-content: center;
    .SwitchDisable {
      position: absolute;
      right: 0;
      width: 48px;
      height: 24px;
      cursor: not-allowed;
    }
    &.borderB {
      border-bottom: 1px solid #eaeaea;
    }
  }
`;
const Wrap = styled.div`
  width: 340px;
  background: #ffffff;
  box-shadow: 0px 3px 12px 1px rgba(0, 0, 0, 0.1607843137254902);
  border-radius: 3px;
  padding: 16px;
  p {
    margin: 0;
  }
  .btnName {
    width: 100%;
    line-height: 36px;
    border-radius: 3px;
    border: 1px solid #dddddd;
    padding: 0 12px;
    &:focus {
      border: 1px solid #2196f3;
    }
  }
`;
let ajaxPromise = null;
function SubmitFormSetting(props) {
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [formSetting, setFormSetting] = useState();
  const [name, SetName] = useState(''); //临时存放
  const [isSaveIData, SetIsSaveIData] = useState(true);
  const [openDraft, setOpenDraft] = useState(false);
  const { worksheetInfo = {}, worksheetId } = props;
  const { views = [] } = worksheetInfo;
  const [btnList, setBtnList] = useState([]);
  useEffect(() => {
    setTimeout(() => {
      $('.btnName').focus();
    }, 300);
  }, [name]);
  useEffect(() => {
    const { appId } = worksheetInfo;
    if (!appId || !worksheetId || !!formSetting) {
      return;
    }
    if (ajaxPromise) {
      ajaxPromise.abort();
    }
    ajaxPromise = sheetAjax.getFormSubmissionSettings({ workSheetId: worksheetId, appId: appId });
    ajaxPromise.then(res => {
      const { advancedSetting = {} } = res;
      const {
        title = '',
        sub = '',
        subafter = '1',
        continueafter = '2',
        continuestatus = '1',
        continueview = '',
        subview = '',
        showcontinue = '1',
        closedrafts = '',
      } = advancedSetting;
      const data = {
        ...advancedSetting,
        title,
        subview, //提交按钮 打开刚刚创建的记录对应的视图id
        sub, //创建按钮文案
        subafter, //创建按钮提交后
        continue: advancedSetting.continue || '', //继续创建按钮文案
        continueafter, //继续创建按钮提交后
        continuestatus, //创建按钮开闭状态
        continueview, //继续创建视图下拉款
        showcontinue, //更多设置是否显示继续创建,保留上次提交的内容
        closedrafts, // 关闭存草稿
      };
      setFormSetting(data);
      updateSet(data);
      setLoading(false);
    });
  }, [props.worksheetInfo]);

  const updateSet = formSetting => {
    setBtnList(
      [
        {
          after: formSetting.subafter, //下一步操作
          text: formSetting.sub || _l('提交'), //按钮文案
          viewId: formSetting.subview,
        },
        {
          after: formSetting.continueafter,
          text: formSetting.continue || _l('继续创建'),
          status: formSetting.continuestatus === '1',
          viewId: formSetting.continueview,
        },
      ], //两个按钮 提交 继续创建
    );
    setTitle(formSetting.title);
    let status =
      (formSetting.continueafter === '2' || formSetting.subafter === '2') && formSetting.showcontinue === '1';
    SetIsSaveIData(status);
    setOpenDraft(formSetting.closedrafts !== '1');
  };

  const inputRender = (cb, n) => {
    return (
      <Wrap>
        <p className="Font13">{_l('按钮名称')}</p>
        <input
          type="text"
          className="btnName mTop10"
          value={(btnList.find((o, i) => i === n) || {}).text}
          onChange={e => {
            setBtnList(
              btnList.map((o, i) => {
                if (i === n) {
                  return { ...o, text: e.target.value };
                } else {
                  return o;
                }
              }),
            );
          }}
          onBlur={e => {
            SetName('');
            if (!e.target.value.trim()) {
              setBtnList(
                btnList.map((o, i) => {
                  if (i === n) {
                    return { ...o, text: name };
                  } else {
                    return o;
                  }
                }),
              );
            } else {
              cb();
            }
          }}
        />
      </Wrap>
    );
  };
  const updateData = (value, key) => {
    let options = _.cloneDeep(formSetting);
    options[key] = value;
    if (['continueafter', 'subafter'].includes(key) && options.continueafter !== '2' && options.subafter !== '2') {
      options.showcontinue = '0';
    }
    if (['continueafter', 'subafter'].includes(key) && options[key] === '3') {
      let viewId = views.length > 0 ? views[0].viewId : '';
      if ('continueafter' === key && !options.continueview) {
        options.continueview = viewId;
      }
      if ('subafter' === key && !options.subview) {
        options.subview = viewId;
      }
    }
    const { appId } = worksheetInfo;
    sheetAjax
      .editWorksheetSetting({
        workSheetId: worksheetId,
        appId: appId,
        advancedSetting: options,
      })
      .then(res => {
        if (res) {
          setFormSetting(options);
          updateSet(options);
        } else {
          alert(_l('修改失败，请稍后再试'), 2);
        }
      });
  };
  const renderBtnCon = (data, i) => {
    let isNotSubmit = i !== 0;
    let isContinueCreat = i === 1;
    let noAction = isContinueCreat && formSetting.continuestatus !== '1';
    const defaultId = views.length > 0 ? views[0].viewId : '';
    return (
      <React.Fragment>
        <div
          className={cx('con', {
            nextBtn: isContinueCreat,
            mTop10: isNotSubmit,
            noAction,
          })}
        >
          <div className="btnCon">
            <Trigger
              action={['click']}
              popup={inputRender(() => {
                if (name.trim() !== data.text.trim()) {
                  updateData(data.text.trim(), isContinueCreat ? 'continue' : 'sub');
                }
              }, i)}
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
                <span className="btnStr InlineBlock overflow_ellipsis">{data.text || ' '}</span>
                {!noAction && (
                  <Tooltip popupPlacement="bottom" text={<span>{_l('修改按钮名称')}</span>}>
                    <Icon
                      icon="workflow_write"
                      className="Font16 Hand mLeft5 TxtTop LineHeight30"
                      onClick={() => {
                        SetName(data.text.trim());
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
              value={data.after}
              className={cx('flex InlineBlock')}
              onChange={newValue => {
                if (newValue === data.after) {
                  return;
                }
                updateData(newValue, isContinueCreat ? 'continueafter' : 'subafter');
              }}
            />
            {data.after === '3' && (
              <span className="viewCon mLeft25">
                <span className="Gray_75 TxtMiddle">{_l('视图：')}</span>
                <Dropdown
                  menuStyle={{ width: 150 }}
                  currentItemClass="currentMenu"
                  data={views.map(item => {
                    return { text: item.name, value: item.viewId };
                  })}
                  value={
                    data.viewId ? (!views.find(o => o.viewId === data.viewId) ? undefined : data.viewId) : defaultId
                  }
                  placeholder={data.viewId ? <span className="Red">{_l('视图已删除')}</span> : _l('选择视图')}
                  className={cx('flex InlineBlock')}
                  onChange={newValue => {
                    if (newValue === data.viewId) {
                      return;
                    }
                    updateData(newValue, isContinueCreat ? 'continueview' : 'subview');
                  }}
                />
              </span>
            )}
          </span>
          {noAction && <div className="cover"></div>}
          {isContinueCreat && (
            <Switch
              className="Hand switchBtn"
              checked={data.status}
              onClick={() => {
                updateData(data.status ? '0' : '1', 'continuestatus');
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

  return (
    <ScrollView>
      <Con className="">
        <h5>{_l('表单标题')}</h5>
        <input
          type="text"
          className="title mTop12"
          placeholder={_l('创建记录')}
          value={title}
          onChange={e => {
            setTitle(e.target.value);
          }}
          onBlur={e => {
            updateData(e.target.value.trim(), 'title');
          }}
        />
        <h5>{_l('提交按钮')}</h5>
        {btnList.map((o, i) => {
          return renderBtnCon(o, i);
        })}
        <h5>{_l('更多设置')}</h5>
        <div className="moreActionCon flexRow mTop12">
          <div className="flex">
            <h6 className="mTop20">{_l('存草稿')}</h6>
            <p className="Gray_9e">{_l('在表单中显示存草稿按钮，草稿数据在下次打开时可以继续编辑并提交')}</p>
          </div>
          <div className="mRight16 mLeft40 Relative">
            <Switch
              checked={openDraft}
              onClick={() => {
                updateData(!openDraft ? '0' : '1', 'closedrafts');
              }}
            />
          </div>
        </div>
        <div className="moreActionCon flexRow borderB">
          <div className="flex">
            <h6 className="mTop20">{_l('显示“继续创建时，保留上次提交内容”选项')}</h6>
            <p className="Gray_9e">
              {_l(
                '启用后，当按钮的提交方式为“提交后继续创建下一条”时，可以在提交记录时选择自动填充上次提交的内容。适合需要连续填报相似数据时的场景',
              )}
            </p>
          </div>
          <div className="mRight16 mLeft40 Relative">
            <Switch
              className={cx('Hand TxtMiddle', {
                Alpha5: formSetting.continueafter !== '2' && formSetting.subafter !== '2',
              })}
              disabled={formSetting.continueafter !== '2' && formSetting.subafter !== '2'}
              checked={isSaveIData}
              onClick={() => {
                updateData(!isSaveIData ? '1' : '0', 'showcontinue');
              }}
            />
            {formSetting.continueafter !== '2' && formSetting.subafter !== '2' && !isSaveIData && (
              <Tooltip popupPlacement="bottom" text={<span>{_l('需要先设置一个“提交后继续创建下一条”的按钮')}</span>}>
                <span className="SwitchDisable"></span>
              </Tooltip>
            )}
          </div>
        </div>
      </Con>
    </ScrollView>
  );
}
const mapStateToProps = state => state.formSet;
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(SubmitFormSetting);
