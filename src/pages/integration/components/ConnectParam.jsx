import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { Checkbox, Icon, Support } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import flowNodeAjax from 'src/pages/workflow/api/flowNode';
import { formatStr } from 'src/pages/integration/config.js';
import { CardTopWrap } from '../apiIntegration/style';

const Wrap = styled.div`
  p {
    margin: 0;
  }
  .Bold400 {
    font-weight: 400;
  }
  .Green_right {
    color: var(--color-success);
  }
  .iconCon {
    width: 44px;
    height: 44px;
    border: 1px solid var(--color-border-secondary);
    border-radius: 6px;
    position: relative;
    text-align: center;
    line-height: 50px;
  }
  width: 880px;
  margin: 24px auto 0;
  background: var(--color-background-primary);
  // border: 1px solid var(--color-border-primary);
  border-radius: 10px;
  .paramCon {
    border-top: 1px solid var(--color-border-primary);
    padding: 16px;
    .conTr {
      min-height: 34px;
      line-height: 34px;
      &:hover {
        background: rgba(0, 0, 0, 0.02);
      }
    }
    .param,
    .option,
    .des {
      margin-left: 10px;
    }
    .param,
    .option,
    .name,
    .des {
      padding: 0 12px;
      min-height: 36px;
      line-height: 36px;
      & > span {
        line-height: 1.5;
      }
      flex: 3;
      &.name {
        flex: 2;
      }
      &.name,
      &.des {
        color: var(--color-text-secondary);
      }
    }
    .option {
      flex: 1;
      &.required {
        max-width: 54px;
      }
      .del {
        &:hover {
          color: var(--color-error) !important;
        }
      }
    }
    &.isEdit {
      border-top: none;
      padding: 0 24px 24px;
      .conTr {
        margin-bottom: 10px;
        &:hover {
          background: var(--color-background-primary);
        }
        .param,
        .name,
        .des {
          height: 36px;
          line-height: 36px;
          background: var(--color-background-primary);
          border: 1px solid var(--color-border-primary);
          border-radius: 3px;
          overflow: hidden;
          input {
            border: none;
            width: 100%;
            height: 100%;
            &:-ms-input-placeholder,
            &::-ms-input-placeholder,
            &::placeholder {
              color: var(--color-text-tertiary) !important;
            }
            background: transparent;
          }
          &.disable {
            background: var(--color-background-secondary);
            color: var(--color-text-secondary);
            input {
              color: var(--color-text-secondary);
            }
          }
        }
      }
      .saveBtn {
        margin: 24px auto 0px;
        padding: 11px 50px;
        background: rgb(33, 150, 243);
        color: var(--color-white);
        line-height: 1em;
        border-radius: 30px;
        &:hover {
          background: var(--color-link-hover);
        }
      }
    }
  }
  .btn {
    &.disable {
      background: var(--color-background-secondary);
      color: var(--color-text-disabled);
      border: 1px solid var(--color-text-disabled);
    }
  }
`;
const getDefaultParameters = () => {
  return {
    controlId: uuidv4(),
    controlName: '',
    type: 2,
    desc: '',
    hide: false,
    value: '',
  };
};

//连接参数设置
function ConnectParam(props) {
  const [{ node, isEdit, controls, nodeControls }, setState] = useSetState({
    node: props.node,
    isEdit: false,
    isErr: false,
    controls: props.controls || [],
    nodeControls: [],
  });

  useEffect(() => {
    getParam();
  }, []);

  const getParam = () => {
    flowNodeAjax
      .getNodeDetail(
        {
          processId: props.id,
          nodeId: node.id,
          flowNodeType: node.typeId,
        },
        { isIntegration: true },
      )
      .then(res => {
        setState({
          controls: res.controls || [],
          nodeControls: res.controls || [],
        });
      });
  };
  //保存参数
  const update = () => {
    let controlData = controls
      .filter(o => !!o.controlName)
      .map(o => {
        return { ...o, alias: o.controlName };
      });
    if (controlData.filter(o => !o.value && o.required).length > 0) {
      alert(_l('存在必填参数未填'), 3);
      return;
    }
    flowNodeAjax
      .saveNode(
        {
          processId: props.id,
          nodeId: node.id,
          flowNodeType: node.typeId,
          controls: controlData,
          appType: node.appType,
          name: node.name,
        },
        { isIntegration: true },
      )
      .then(() => {
        setState({
          isEdit: false,
        });
        getParam();
      });
  };

  const inputRender = (o, key) => {
    if (isEdit) {
      return (
        <input
          type="text"
          className={cx('textPrimary')}
          placeholder={_l('请输入')}
          defaultValue={o[key]}
          key={JSON.stringify(o)}
          readOnly={props.connectType === 2 && key !== 'value'}
          onBlur={e => {
            setState({
              controls: controls.map(item => {
                if (item.controlId === o.controlId) {
                  return { ...item, [key]: e.target.value };
                } else {
                  return item;
                }
              }),
            });
          }}
        />
      );
    }
    return (
      <span className="WordBreak InlineBlock">
        {o.hide && !!o[key] && key === 'value'
          ? // `${o.value.replaceAll(/./g, '*')}(${_l('隐藏')})`
            o.value.length >= 12
            ? formatStr(o.value)
            : `************`
          : o[key]}
      </span>
    );
  };
  //安装的连接 只能填写参数值和设置隐藏 props.connectType === 2
  return (
    <Wrap className={props.className}>
      <CardTopWrap className="flexRow">
        <div className={cx('iconCon', { isEdit })}>
          {!isEdit
            ? controls.length > 0 && (
                <Icon icon="check_circle" className="Green_right tip" />
                // ) : (
                //   <Icon icon="error1" className="Red tip" />
              )
            : ''}
          <Icon icon="parameter" className="iconParam Font24" />
        </div>
        <div className="flex pLeft16">
          <p className="Font17 Bold">{_l('连接参数')}</p>
          <p className="Font13 textSecondary mTop4">
            <span className="TxtMiddle">{_l('用于配置鉴权时使用，设置为隐藏后，查看时该参数值将以掩码代替')}</span>
            <Support
              href="https://help.mingdao.com/integration/api#connection-parameters"
              type={3}
              text={_l('使用帮助')}
            />
          </p>
        </div>
        {!isEdit && props.canEdit && (
          <div
            className={cx('btn Hand', {
              disable: props.connectType === 2 && controls.length <= 0,
            })}
            onClick={() => {
              if (props.connectType === 2 && controls.length <= 0) {
                return;
              }
              setState({
                isEdit: true,
                controls:
                  controls.length > 0
                    ? controls
                    : [
                        {
                          controlId: uuidv4(),
                          controlName: '',
                          type: 2,
                          desc: '',
                          hide: false,
                          value: '',
                        },
                      ],
              });
            }}
          >
            {controls.length <= 0 ? _l('开始配置') : _l('编辑')}
          </div>
        )}
      </CardTopWrap>
      {(controls.length > 0 || isEdit) && (
        <div className={cx('paramCon', { isEdit })}>
          {isEdit && (
            <div className="par headTr flexRow">
              <div className="name textSecondary">{_l('参数名称')}</div>
              <div className="param textSecondary">{_l('参数值')}</div>
              <div className="des textSecondary">{_l('说明')}</div>
              <div className="option required textSecondary">{_l('必填')}</div>
              <div className="option textSecondary">
                {_l('隐藏')}
                <Tooltip
                  placement="topLeft"
                  align={{ offset: [-15, 0] }}
                  title={<span style={{ color: '#fff' }}>{_l('隐藏参数会加密存储，不可取消隐藏')}</span>}
                >
                  <Icon icon="error_outline" className={cx('mLeft5')} />
                </Tooltip>
              </div>
            </div>
          )}
          {controls.map(o => {
            const disabled = (nodeControls.find(it => o.controlId === it.controlId) || {}).hide;
            return (
              <div className="par conTr flexRow">
                <div className={cx('name WordBreak', { disable: props.connectType === 2 })}>
                  {inputRender(o, 'controlName')}
                </div>
                <div className="param WordBreak">{inputRender(o, 'value')}</div>
                <div className={cx('des WordBreak', { disable: props.connectType === 2 })}>
                  {inputRender(o, 'desc')}
                </div>
                <div className="option required">
                  {isEdit ? (
                    <Checkbox
                      className="mLeft5 flex TxtMiddle"
                      size="small"
                      checked={o.required}
                      disabled={props.connectType === 2}
                      onClick={() => {
                        setState({
                          controls: controls.map(item => {
                            if (item.controlId === o.controlId) {
                              return { ...item, required: !o.required };
                            } else {
                              return item;
                            }
                          }),
                        });
                      }}
                    />
                  ) : o.required ? (
                    <span className="textSecondary">{_l('必填')}</span>
                  ) : (
                    ''
                  )}
                </div>
                {isEdit && (
                  <div className="option flexRow">
                    <Checkbox
                      className="mLeft5 flex TxtMiddle"
                      size="small"
                      checked={o.hide}
                      disabled={disabled} //设置成隐藏后，不可设置成不隐藏
                      onClick={() => {
                        setState({
                          controls: controls.map(item => {
                            if (item.controlId === o.controlId) {
                              return { ...item, hide: !o.hide };
                            } else {
                              return item;
                            }
                          }),
                        });
                      }}
                    />
                    {props.connectType !== 2 && (
                      <Icon
                        className="flex Font18 Hand LineHeight36 InlineBlock textTertiary del"
                        icon="trash"
                        onClick={() => {
                          setState({
                            controls: controls.filter(item => item.controlId !== o.controlId),
                          });
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {isEdit && props.canEdit && (
            <React.Fragment>
              {props.connectType !== 2 && (
                <div className="">
                  <span
                    className="Hand ThemeColor3 mTop12 Bold400"
                    onClick={() => {
                      setState({
                        controls: controls.concat(getDefaultParameters()),
                      });
                    }}
                  >{`+ ${_l('连接参数')}`}</span>
                </div>
              )}
              <div className="TxtCenter">
                <div
                  className="saveBtn Bold InlineBlock Hand"
                  onClick={() => {
                    update();
                  }}
                >
                  {_l('保存并继续')}
                </div>
              </div>
            </React.Fragment>
          )}
        </div>
      )}
    </Wrap>
  );
}

export default ConnectParam;
