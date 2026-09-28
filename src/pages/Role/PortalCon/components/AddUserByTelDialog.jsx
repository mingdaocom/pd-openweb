import React, { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, PriceTip } from 'ming-ui';
import { Button, Checkbox, Modal, Radio, Select } from 'ming-ui/antd-components';
import externalPortalAjax from 'src/api/externalPortal';
import { getTranslateInfo } from 'src/utils/services/app';
import * as actions from '../redux/actions';
import EmailInput from './Email';
import Tel from './Tel';

const Wrap = styled.div`
  .hap-radio-wrapper .hap-radio-inner {
    margin-right: 8px;
  }
  .hap-radio-wrapper {
    margin-right: 40px;
  }
  .sendMes {
    position: absolute;
    bottom: 28px;
    left: 24px;
  }
  .row {
    margin-top: 10px;
    display: flex;
    .rowTel {
      width: 200px;
      height: 36px;
      background: var(--color-background-primary);
      border: 1px solid var(--color-border-secondary);
      opacity: 1;
      border-radius: 3px;
      &.err {
        border: 1px solid red;
      }
    }
    .name {
      height: 36px;
      background: var(--color-background-primary);
      border: 1px solid var(--color-border-secondary);
      opacity: 1;
      border-radius: 3px;
      flex: 1;
      margin-left: 16px;
      padding: 0 12px;
    }
    .role {
      width: 90px;
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
const TYPELIST = [_l('手机邀请'), _l('邮箱邀请')];

function AddUserByTelDialog(props) {
  const { appId, show, setAddUserByTelDialog, getUserList, roleList, registerMode = {} } = props;
  const roleId = props.roleId || (roleList.find(o => o.isDefault) || roleList[0])?.roleId;
  const [loading, setLoading] = useState(false); //
  const [list, setList] = useState([{ phone: '', name: '', roleId: roleId }]);
  const [isSendMsgs, setIsSend] = useState(true); //
  const [type, setType] = useState(() => (registerMode.phone && md.global.SysSettings?.enableSmsCustomContent ? 0 : 1)); //
  const effectiveType = md.global.SysSettings?.enableSmsCustomContent ? type : 1; // enableSmsCustomContent 为 true 时才能用手机号邀请

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
    const effectiveType = md.global.SysSettings?.enableSmsCustomContent ? type : 1;

    if (data.length <= 0 || list.filter(o => o.isErr || (!!o.phone && !o.name)).length > 0) {
      setLoading(false);
      return alert(effectiveType === 0 ? _l('请填写正确的手机号或姓名') : _l('请填写正确的邮箱或姓名'), 3);
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
    <Modal
      width={680}
      open={show}
      title={_l('邀请用户')}
      okText={_l('确认邀请')}
      confirmLoading={loading}
      mask={{ closable: true }}
      keyboard
      onCancel={() => {
        setAddUserByTelDialog(false);
      }}
      onOk={() => {
        update();
      }}
    >
      <Wrap>
        {md.global.SysSettings?.enableSmsCustomContent &&
          registerMode.phone &&
          registerMode.email &&
          TYPELIST.map((o, i) => (
            <Radio key={i} checked={type === i} onChange={() => setType(i)} title={o}>
              {o}
            </Radio>
          ))}
        {window.platformENV.isPlatform && (
          <p
            className={
              md.global.SysSettings?.enableSmsCustomContent && registerMode.phone && registerMode.email ? 'mTop16' : ''
            }
          >
            <PriceTip
              text={_l('发送邀请的费用自动从组织信用点中扣除（其中，发送至港澳台/国际短信，需组织集成国际短信服务）')}
            />
          </p>
        )}
        <div className="list">
          {list.map((o, i) => {
            return (
              <div className="row" key={i}>
                {effectiveType === 0 ? (
                  <Tel
                    data={o}
                    allowDropdown={true}
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
                    clickCallback={() => {
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
                    clickCallback={() => {
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
                <Select
                  options={roleList.map(o => {
                    return { ...o, value: o.roleId, label: getTranslateInfo(appId, null, o.roleId).name || o.name };
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
        <Button
          color="primary"
          variant="filled"
          className="mTop10"
          icon={<Icon icon="add" />}
          onClick={() => {
            addNew();
          }}
        >
          {_l('添加')}
        </Button>
        <Checkbox
          className="TxtCenter Hand textSecondary sendMes"
          checked={isSendMsgs}
          onChange={() => {
            setIsSend(!isSendMsgs);
          }}
        >
          {effectiveType === 0 ? _l('发送短信通知') : _l('发送邮件通知')}
        </Checkbox>
      </Wrap>
    </Modal>
  );
}

const mapStateToProps = state => ({
  portal: state.portal,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AddUserByTelDialog);
