import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import { Drawer } from 'antd';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon, Dialog, Tooltip, Checkbox, Dropdown, Input } from 'ming-ui';
import _ from 'lodash';
import ExternalPortalApi from 'src/api/externalPortal.js';
import ShareUrl from 'worksheet/components/ShareUrl';
import { LOGIN_WAY, REJISTER_WAY } from 'src/pages/Role/config.js';

const Wrap = styled.div`
  overflow: hidden;
  .header {
    padding: 24px 24px 0;
    display: flex;
    & > span {
      flex: 1;
      font-size: 17px;
      font-weight: 500;
    }
  }
  .setBtn {
    padding: 5px 20px;
    background: #2196f3;
    border-radius: 3px 3px 3px 3px;
    color: #fff !important;
  }
  .customUrlCon {
    padding: 0 24px 0;
    overflow: auto;
  }
  .nameCon {
    width: 104px;
    height: 36px;
    line-height: 36px;
    padding: 0 12px;
    background-color: #f1f1f1;
    border-radius: 3px;
  }
  .numCon {
    width: 20px;
    position: relative;
    text-align: center;
    height: 36px;
    .text,
    .icon {
      position: absolute;
      line-height: 36px;
      left: 50%;
      transform: translate(-50%, 0);
    }
    .icon {
      color: #9e9e9e;
      &:hover {
        color: red;
      }
      opacity: 0;
    }
    .text {
      opacity: 1;
    }
    &:hover {
      .text {
        opacity: 0;
      }
      .icon {
        opacity: 1;
      }
    }
  }
  .linkCon {
    &:hover {
      .numCon {
        .text {
          opacity: 0;
        }
        .icon {
          opacity: 1;
        }
      }
    }
  }
`;

const WrapDetail = styled.div`
  .nameInput {
    height: 36px;
    line-height: 36px;
    border-radius: 3px;
    border: 1px solid #ddd;
    padding: 0 12px;
    &:focus {
      border: 1px solid #2196f3;
    }
  }
  .setCheckbox {
    width: 130px;
  }
`;

const CustomUrlSet = styled.div`
  border-radius: 3px;
  height: 36px;
  line-height: 36px;
  background-color: #f1f1f1;
  color: #151515;
  font-size: 14px;
  padding: 0 10px;
  cursor: pointer;
  padding: 0;
  width: 36px;
  color: #757575;
  font-size: 18px;
  text-align: center;
  margin-left: 6px;
  background: #fff;
  border: 1px solid #ddd;
  &:hover {
    border-color: #2196f3;
    color: #2196f3;
  }
`;

function Setting(props) {
  const { show, closeSet, appId } = props;
  const [{ customLink, editData, list, roleList }, setState] = useSetState({
    customLink: '',
    editData: null,
    list: _.get(props, 'baseSetResult.addressExt') || [],
    roleList: props.roleList || [],
  });
  useEffect(() => {
    setState({ roleList: props.roleList, list: _.get(props, 'baseSetResult.addressExt') || [] });
  }, [props]);
  const initUrl = () => {
    ExternalPortalApi.initAddressExt({ appId, customLink }).then(res => {
      const roleInfo = roleList.find(o => o.isDefault) || {};
      setState({
        editData: {
          ext: res.ext,
          roleId: roleInfo.roleId,
          registerMode: {
            phone: true,
            email: true,
          },
          loginMode: {
            phone: true,
            weChat: true,
            password: true,
          },
        },
      });
    });
  };
  const onSave = addressExt => {
    ExternalPortalApi.editCustomAddressExt({
      appId,
      addressExt,
    }).then(res => {
      if (res.resultEnum === 1) {
        props.onChange(res.addressExt);
        alert(_l('保存成功'));
      } else {
        alert(_l('保存失败，请稍后再试'), 3);
      }
    });
  };
  return (
    <Drawer
      width={640}
      onClose={() => closeSet()}
      zIndex={999}
      mask={true}
      className=""
      placement="right"
      visible={show}
      maskClosable={true}
      closable={false}
      bodyStyle={{ padding: 0 }}
    >
      {show ? (
        <Wrap className={'flexColumn h100 Relative'}>
          <div className="header">
            <span className="Bold">{_l('生成地址')}</span>
            <Icon
              icon="close"
              className="Right LineHeight25 Gray_9 Hand Font22 ThemeHoverColor3"
              onClick={() => {
                closeSet();
              }}
            />
          </div>
          <div className="Gray_75 Font13 mTop10 pLeft24 pRight24">
            {_l('外部门户通过配置注册方式、登录方式、角色可生成多个链接，实现外部用户个性化登录。')}
          </div>
          <div className="pLeft24 pRight24">
            <span
              className="setBtn Hand ThemeHoverBGColor3 mTop20 InlineBlock"
              onClick={() => {
                initUrl();
              }}
            >
              {_l('生成地址')}
            </span>
          </div>
          <div className="flex customUrlCon mTop18">
            {list.map((o, i) => {
              return (
                <div className="flexRow mTop6 alignItemsCenter linkCon" key={o.ext}>
                  <span className="numCon InlineBlock ellipsis WordBreak">
                    <span className="text">{i + 1}</span>
                    <Icon
                      type="delete1"
                      className="Hand Font18 delete"
                      onClick={() => {
                        Dialog.confirm({
                          buttonType: 'danger',
                          title: <div className="Red"> {_l('你确认删除？')} </div>,
                          description: _l('删除后，用户不能通过该地址访问'),
                          onOk: () => {
                            const newList = list.filter(a => a.ext !== o.ext);
                            onSave(newList);
                          },
                        });
                      }}
                    />
                  </span>
                  <span className="nameCon ellipsis WordBreak mLeft10">{o.name}</span>
                  <ShareUrl
                    className="mainShareUrl mLeft6 flex"
                    theme="light"
                    url={`${_.get(props, 'baseSetResult.portalUrl')}/${o.ext}`}
                    copyTip={_l('复制')}
                  />
                  <Tooltip popupPlacement="bottom" text={<span>{_l('设置')}</span>}>
                    <CustomUrlSet
                      className="customUrlSet mLeft6"
                      onClick={() => {
                        setState({
                          editData: _.cloneDeep(o),
                        });
                      }}
                    >
                      <Icon type="settings1" className="Hand" />
                    </CustomUrlSet>
                  </Tooltip>
                </div>
              );
            })}
          </div>
        </Wrap>
      ) : null}
      {!!editData && (
        <Dialog
          width={640}
          visible={!!editData}
          title={_l('链接设置')}
          key={Math.random().toString()}
          description={_l('此处配置的注册登录方式需遵循基础设置的配置范围，如超出范围则链接无效')}
          onCancel={() => {
            setState({
              editData: null,
            });
          }}
          onOk={() => {
            if (!(editData.name || '').trim()) {
              alert(_l('名称不能为空'), 3);
              $('.nameInput').focus();
              return;
            }
            if (!editData.roleId || !roleList.find(o => o.roleId === editData.roleId)) {
              alert(_l('请选择有效的默认角色'), 3);
              return;
            }
            if (
              !_.get(editData, 'loginMode.phone') &&
              !_.get(editData, 'loginMode.weChat') &&
              !_.get(editData, 'loginMode.password')
            ) {
              alert(_l('至少选择一种登录方式'), 3);
              return;
            }
            if (!_.get(editData, 'registerMode.phone') && !_.get(editData, 'registerMode.email')) {
              alert(_l('至少选择一种注册方式'), 3);
              return;
            }
            const isNew = !list.find(o => o.ext === editData.ext);
            const newList = isNew
              ? list.concat(editData)
              : list.map(o => {
                  if (o.ext === editData.ext) {
                    return editData;
                  }
                  return o;
                });
            onSave(newList);
            setState({
              editData: null,
            });
          }}
        >
          <WrapDetail className={''}>
            <h6 className="Font13 Gray Bold mBottom0">{_l('名称')}</h6>
            <Input
              type="text"
              className="mTop6 w100 nameInput"
              placeholder={_l('请输入')}
              defaultValue={editData.name}
              onBlur={e => {
                setState({
                  editData: { ...editData, name: e.target.value },
                });
              }}
            />
            <h6 className={cx('Font13 Gray Bold mBottom0 mTop32')}>{_l('注册方式')}</h6>
            <div className="">
              {REJISTER_WAY.map(o => {
                return (
                  <Checkbox
                    className="mTop16 InlineBlock mRight60 setCheckbox"
                    text={o.txt}
                    checked={editData.registerMode[o.key]}
                    onClick={checked => {
                      editData.registerMode[o.key] = !editData.registerMode[o.key];
                      setState({
                        editData: editData,
                      });
                    }}
                  />
                );
              })}
            </div>
            <h6 className={cx('Font13 Gray Bold mBottom0 mTop32')}>{_l('登录方式')}</h6>
            <div className="">
              {LOGIN_WAY.map((o, i) => {
                if (o.key === 'weChat' && md.global.SysSettings.hideWeixin) return;

                return (
                  <Checkbox
                    className="mTop16 InlineBlock mRight60 setCheckbox"
                    text={o.txt}
                    checked={editData.loginMode[o.key]}
                    onClick={checked => {
                      editData.loginMode[o.key] = !editData.loginMode[o.key];
                      setState({
                        editData: editData,
                      });
                    }}
                  />
                );
              })}
            </div>
            <h6 className={cx('Font13 Gray Bold mBottom0 mTop32')}>{_l('默认角色')}</h6>
            <Dropdown
              data={roleList.map(o => {
                return { text: o.name, value: o.roleId };
              })}
              border
              isAppendToBody
              className="mTop6 w100"
              value={editData.roleId}
              onChange={value => {
                setState({
                  editData: { ...editData, roleId: value },
                });
              }}
              {...(!roleList.find(o => o.roleId === editData.roleId)
                ? { renderError: () => <span className="Red">{_l('该角色已删除')}</span> }
                : {})}
            />
          </WrapDetail>
        </Dialog>
      )}
    </Drawer>
  );
}

export default Setting;
