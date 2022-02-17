import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../redux/actions';
import { Icon, Dialog, Checkbox, LoadDiv } from 'ming-ui';
import 'uploadAttachment';
import cx from 'classnames';
import { addExAccounts } from 'src/api/externalPortal';
import Tel from '../components/Tel';
import 'src/pages/Roles/Portal/list/AddUserByTelDialog.less';

const Wrap = styled.div`
  .sendMes {
    position: absolute;
    bottom: 28px;
  }
  .row {
    margin-top: 10px;
    display: flex;
    .rowTel {
      width: 300px;
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
function AddUserByTelDialog(props) {
  const { appId, show, setAddUserByTelDialog, getUserList } = props;
  const [loading, setLoading] = useState(false); //
  const [list, setList] = useState([{ phone: '', name: '' }]);
  const [isSendMsgs, setIsSend] = useState(true); //
  const update = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    let data = list
      .filter(o => !!o.phone && !!o.name && !o.isErr)
      .map(o => {
        return { ..._.pick(o, ['phone', 'name']) };
      });
    if (data.length <= 0 || list.filter(o => o.isErr || (!!o.phone && !o.name)).length > 0) {
      setLoading(false);
      return alert(_l('请填写正确的手机号或姓名'), 3);
    }
    addExAccounts({
      isSendMsgs,
      appId,
      addExAccountInfos: data,
    }).then(
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
        <div className="list">
          {list.map((o, i) => {
            return (
              <div className="row">
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
                      setList(list.concat({ phone: '', name: '' }));
                    }
                  }}
                />
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
        <Checkbox
          className="TxtCenter InlineBlock Hand Gray_75 sendMes"
          text={_l('发送短信通知')}
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
