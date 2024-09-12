import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../redux/actions';
import { Icon, Dialog, Checkbox, Radio, Dropdown } from 'ming-ui';
import cx from 'classnames';
import externalPortalAjax from 'src/api/externalPortal';
import Tel from './Tel';
import EmailInput from './Email';
import './AddUserByTelDialog.less';
import _ from 'lodash';

const Wrap = styled.div`
  .ming.Radio .Radio-box {
    margin-right: 8px;
  }
  .ming.Radio {
    margin-right: 40px;
  }
  .sendMes {
    position: absolute;
    bottom: 28px;
    left: 24px;
  }
  .add {
    width: 77px;
    height: 36px;
    line-height: 36px;
    background: #f8f8f8;
    border-radius: 3px;
    color: #2196f3;
    i {
      color: #2196f3;
      line-height: 36px;
    }
    &:hover {
      background: #f5f5f5;
    }
  }
  .row {
    margin-top: 10px;
    display: flex;
    .rowTel {
      width: 200px;
      height: 36px;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      opacity: 1;
      border-radius: 3px;
      &.err {
        border: 1px solid red;
      }
    }
    .name {
      height: 36px;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      opacity: 1;
      border-radius: 3px;
      flex: 1;
      margin-left: 16px;
      padding: 0 12px;
    }
    .role {
      width: 90px;
      height: 36px;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      opacity: 1;
      border-radius: 3px;
      .Dropdown--input {
        display: flex;
        .value {
          flex: 1;
        }
        span.value,
        i {
          line-height: 26px;
        }
      }
    }
    .del {
      opacity: 0;
      margin-left: 16px;
      line-height: 36px;
      &.op0 {
        opacity: 0 !important;
      }
    }
    &:hover {
      .del {
        opacity: 1;
      }
    }
  }
`;
const TYPELIST = !md.global.SysSettings.enableSmsCustomContent ? [_l('邮箱邀请')] : [_l('手机邀请'), _l('邮箱邀请')];
function AddUserByTelDialog(props) {
  const { appId, show, setAddUserByTelDialog, getUserList, roleList, registerMode = {} } = props;
  const roleId = props.roleId || roleList.find(o => o.isDefault).roleId;
  const [loading, setLoading] = useState(false); //
  const [list, setList] = useState([{ phone: '', name: '', roleId: roleId }]);
  const [isSendMsgs, setIsSend] = useState(true); //
  const [type, setType] = useState(registerMode.phone && md.global.SysSettings.enableSmsCustomContent ? 0 : 1); //
  const update = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    let data = list
      .filter(o => !!o.phone && !!o.name && !o.isErr)
      .map(o => {
        return { ..._.pick(o, ['phone', 'name', 'roleId']) };
      });
    if (data.length <= 0 || list.filter(o => o.isErr || (!!o.phone && !o.name)).length > 0) {
      setLoading(false);
      return alert(type === 0 ? _l('请填写正确的手机号或姓名') : _l('请填写正确的邮箱或姓名'), 3);
    }
    externalPortalAjax
      .addExAccounts({
        isSendMsgs,
        appId,
        addExAccountInfos: data,
      })
      .then(
        res => {
          const { existedData = [], success } = res;
          setAddUserByTelDialog(false);
          if (success) {
            getUserList();
          }
          if (existedData.length > 0) {
            return alert(_l('有%0个用户不能重复邀请', existedData.length), 3);
          } else if (success) {
            return alert(_l('邀请成功'));
          } else if (!success) {
            return alert(_l('邀请失败，请稍后再试'), 3);
          }
          setLoading(false);
        },
        () => {
          setLoading(false);
        },
      );
  };
  const addNew = () => {
    setList(list.concat({ phone: '', name: '', roleId: list[list.length - 1].roleId || roleId }));
  };
  return (
    <Dialog
      className="addUserByTelDialog"
      width="580"
      visible={show}
      title={<span className="Font17 Bold">{_l('邀请用户')}</span>}
      okText={loading ? _l('确认邀请...') : _l('确认邀请')}
      onCancel={() => {
        setAddUserByTelDialog(false);
      }}
      onOk={() => {
        update();
      }}
    >
      <Wrap>
        {TYPELIST.map((o, i) => {
          const index = md.global.SysSettings.enableSmsCustomContent ? i : i + 1;
          if (!registerMode.phone || !registerMode.email) {
            return '';
          }
          return (
            <Radio
              className=""
              text={o}
              checked={type === index}
              onClick={() => {
                setType(index);
              }}
            />
          );
        })}
        {(!_.get(md, 'global.Config.IsLocal') || _.get(md, 'global.Config.IsPlatformLocal') || true) && (
          <p className="mTop16">
            {type === 1
              ? _l('邮件%0/封，', _.get(md, 'global.PriceConfig.EmailPrice'))
              : _l('短信%0/条，', _.get(md, 'global.PriceConfig.SmsPrice'))}
            {_l('将自动从企业账户扣除，请确保账户余额充足。')}
            {!_.get(md, 'global.Config.IsLocal') && _l('目前仅支持中国大陆手机号。')}
          </p>
        )}
        <div className="list">
          {list.map((o, i) => {
            return (
              <div className="row">
                {type === 0 ? (
                  <Tel
                    data={o}
                    inputClassName="rowTel"
                    onChange={data => {
                      setList(
                        list.map((o, item) => {
                          if (item === i) {
                            return { ...o, phone: data.value, isErr: !!data.isErr };
                          } else {
                            return o;
                          }
                        }),
                      );
                    }}
                    clickCallback={e => {
                      if (
                        i === list.length - 1 && //点击最后一行
                        list.filter(o => !o.phone).length < 3 //最多三个未填
                      ) {
                        addNew();
                      }
                    }}
                  />
                ) : (
                  <EmailInput
                    data={o}
                    inputClassName="rowTel pLeft8"
                    onChange={data => {
                      setList(
                        list.map((o, item) => {
                          if (item === i) {
                            return { ...o, phone: data.value, isErr: !!data.isErr };
                          } else {
                            return o;
                          }
                        }),
                      );
                    }}
                    clickCallback={e => {
                      if (
                        i === list.length - 1 && //点击最后一行
                        list.filter(o => !o.phone).length < 3 //最多三个未填
                      ) {
                        addNew();
                      }
                    }}
                  />
                )}
                <input
                  className={cx('name InlineBlock mLeft10 mRight10', { noName: !o.name })}
                  value={o.name}
                  placeholder={_l('姓名')}
                  onChange={e => {
                    let value = e.target.value.trim();
                    setList(
                      list.map((o, item) => {
                        if (item === i) {
                          return { ...o, name: value };
                        } else {
                          return o;
                        }
                      }),
                    );
                  }}
                />
                <Dropdown
                  isAppendToBody
                  data={roleList.map(o => {
                    return { ...o, value: o.roleId, text: o.name };
                  })}
                  value={o.roleId || roleId} //成员
                  className={cx('flex role')}
                  onChange={newValue => {
                    setList(
                      list.map((o, item) => {
                        if (item === i) {
                          return { ...o, roleId: newValue };
                        } else {
                          return o;
                        }
                      }),
                    );
                  }}
                />
                <Icon
                  className={cx('Font16  del Red', { op0: i === 0, Hand: i !== 0 })}
                  icon="trash"
                  onClick={() => {
                    if (i !== 0) {
                      setList(list.filter((o, index) => index !== i));
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
        <span
          className="add mTop10 InlineBlock Hand TxtCenter Bold"
          onClick={() => {
            addNew();
          }}
        >
          <Icon icon="add Bold" />
          {_l('添加')}
        </span>
        <Checkbox
          className="TxtCenter InlineBlock Hand Gray_75 sendMes"
          text={type === 0 ? _l('发送短信通知') : _l('发送邮件通知')}
          checked={isSendMsgs}
          onClick={checked => {
            setIsSend(!isSendMsgs);
          }}
        />
      </Wrap>
    </Dialog>
  );
}
const mapStateToProps = state => ({
  portal: state.portal,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AddUserByTelDialog);
