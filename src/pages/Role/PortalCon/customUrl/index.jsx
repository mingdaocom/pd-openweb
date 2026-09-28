import React, { useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Button, Checkbox, Drawer, Input, Modal, Select, Tooltip } from 'ming-ui/antd-components';
import ExternalPortalApi from 'src/api/externalPortal.js';
import ShareUrl from 'worksheet/components/ShareUrl';
import { LOGIN_WAY, REJISTER_WAY } from 'src/pages/Role/config.js';
import { getTranslateInfo } from 'src/utils/services/app';

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
  .customUrlCon {
    padding: 0 24px 0;
    overflow: auto;
  }
  .nameCon {
    width: 104px;
    height: 36px;
    line-height: 36px;
    padding: 0 12px;
    background-color: var(--color-background-disabled);
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
      color: var(--color-text-tertiary);
      &:hover {
        color: var(--color-error);
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
  .setCheckbox {
    width: 130px;
  }
`;

function Setting(props) {
  const { show, closeSet, appId } = props;
  const requestPending = useRef(false);
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
    if (requestPending.current) return;

    requestPending.current = true;
    return ExternalPortalApi.editCustomAddressExt({
      appId,
      addressExt,
    })
      .then(res => {
        if (res.resultEnum === 1) {
          props.onChange(res.addressExt);
          alert(_l('保存成功'));
        } else {
          alert(_l('保存失败，请稍后再试'), 3);
        }
      })
      .finally(() => {
        requestPending.current = false;
      });
  };

  return (
    <Drawer
      size={640}
      onClose={() => closeSet()}
      mask={{ enabled: true, closable: true }}
      rootClassName=""
      placement="right"
      open={show}
      closable={false}
      styles={{ body: { padding: 0 } }}
    >
      {show ? (
        <Wrap className={'flexColumn h100 Relative'}>
          <div className="header">
            <span className="Bold">{_l('生成地址')}</span>
            <Icon
              icon="close"
              className="Right LineHeight25 textTertiary Hand Font22 hoverColorPrimary"
              onClick={() => {
                closeSet();
              }}
            />
          </div>
          <div className="textSecondary Font13 mTop10 pLeft24 pRight24">
            {_l('外部门户通过配置注册方式、登录方式、角色可生成多个链接，实现外部用户个性化登录。')}
          </div>
          <div className="pLeft24 pRight24">
            <Button
              type="primary"
              style={{ height: 30, paddingInline: 20 }}
              className="mTop20"
              onClick={() => {
                initUrl();
              }}
            >
              {_l('生成地址')}
            </Button>
          </div>
          <div className="flex customUrlCon mTop18">
            {list.map((o, i) => {
              return (
                <div className="flexRow mTop6 alignItemsCenter linkCon" key={o.ext}>
                  <span className="numCon InlineBlock ellipsis WordBreak">
                    <span className="text">{i + 1}</span>
                    <Icon
                      type="trash"
                      className="Hand Font18 delete"
                      onClick={() => {
                        Modal.confirm({
                          okButtonProps: {
                            danger: true,
                          },
                          title: <div className="Red textError"> {_l('你确认删除？')} </div>,
                          content: _l('删除后，用户不能通过该地址访问'),
                          onOk: () => {
                            const newList = list.filter(a => a.ext !== o.ext);
                            return onSave(newList);
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
                  <Tooltip placement="bottom" title={_l('设置')}>
                    <Button
                      className="mLeft6 textSecondary hoverColorPrimary"
                      icon={<Icon type="settings" className="Font18" />}
                      onClick={() => {
                        setState({
                          editData: _.cloneDeep(o),
                        });
                      }}
                    />
                  </Tooltip>
                </div>
              );
            })}
          </div>
        </Wrap>
      ) : null}
      {!!editData && (
        <Modal
          width={640}
          open={!!editData}
          title={_l('链接设置')}
          mask={{ closable: true }}
          keyboard
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
          <div className="textSecondary mBottom20">
            {_l('此处配置的注册登录方式需遵循基础设置的配置范围，如超出范围则链接无效')}
          </div>
          <WrapDetail>
            <h6 className="Font13 textPrimary Bold mBottom0">{_l('名称')}</h6>
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
            <h6 className={cx('Font13 textPrimary Bold mBottom0 mTop32')}>{_l('注册方式')}</h6>
            <div>
              {REJISTER_WAY.map(o => {
                return (
                  <Checkbox
                    key={o.key}
                    className="mTop16 mRight60 setCheckbox"
                    checked={editData.registerMode[o.key]}
                    onChange={() => {
                      setState({
                        editData: {
                          ...editData,
                          registerMode: {
                            ...editData.registerMode,
                            [o.key]: !editData.registerMode[o.key],
                          },
                        },
                      });
                    }}
                  >
                    {o.txt}
                  </Checkbox>
                );
              })}
            </div>
            <h6 className={cx('Font13 textPrimary Bold mBottom0 mTop32')}>{_l('登录方式')}</h6>
            <div>
              {LOGIN_WAY.map(o => {
                if (o.key === 'weChat' && md.global.SysSettings.hideWeixin) return;
                return (
                  <Checkbox
                    key={o.key}
                    className="mTop16 mRight60 setCheckbox"
                    checked={editData.loginMode[o.key]}
                    onChange={() => {
                      setState({
                        editData: {
                          ...editData,
                          loginMode: {
                            ...editData.loginMode,
                            [o.key]: !editData.loginMode[o.key],
                          },
                        },
                      });
                    }}
                  >
                    {o.txt}
                  </Checkbox>
                );
              })}
            </div>
            <h6 className={cx('Font13 textPrimary Bold mBottom0 mTop32')}>{_l('默认角色')}</h6>
            <Select
              options={roleList.map(o => {
                return { label: getTranslateInfo(appId, null, o.roleId).name || o.name, value: o.roleId };
              })}
              className="mTop6 w100"
              value={editData.roleId}
              onChange={value => {
                setState({
                  editData: { ...editData, roleId: value },
                });
              }}
              labelRender={({ label }) =>
                roleList.find(o => o.roleId === editData.roleId) ? (
                  label
                ) : (
                  <span className="Red">{_l('该角色已删除')}</span>
                )
              }
            />
          </WrapDetail>
        </Modal>
      )}
    </Drawer>
  );
}

export default Setting;
