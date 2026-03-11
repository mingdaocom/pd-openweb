import React, { useRef, useState } from 'react';
import { Drawer } from 'antd';
import cx from 'classnames';
import styled from 'styled-components';
import Icon from 'ming-ui/components/Icon';
import CustomFields from 'src/components/Form';

const Wrap = styled.div(
  ({ width }) => `
  .disable {
    opacity: 0.5;
    cursor: not-allowed !important;
  }
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-flow: column nowrap;
  width: ${width || '580px'};
  background: var(--color-background-primary);
  .headerWrap {
    padding: 24px;
    font-size: 17px;
    font-weight: 600;
    color: var(--color-text-title);
  }
  .footerWrap {
    padding: 18px 22px;
    .btn {
      padding: 0 32px;
      line-height: 36px;
      border-radius: 3px;
      box-sizing: border-box;
      &.saveBtn {
        color: var(--color-white);
        background: var(--color-primary);
        &:hover {
          background: var(--color-primary);
        }
      }
      &.cancelBtn {
        color: var(--color-text-tertiary);
        border: 1px solid var(--color-border-primary);
        &:hover {
          color: var(--color-primary);
          border: 1px solid var(--color-primary);
        }
      }
    }
    .del {
      line-height: 36px;
      color: var(--color-text-secondary);
      &:hover {
        color: var(--color-error);
      }
    }
  }
`,
);
const UserInfoDialogWrap = styled.div`
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  .customFieldsContainer {
    width: 100%;
    padding: 0 14px 24px 14px;
    flex: 1;
    margin: 0;
  }
  .recordsCon {
    > div {
      margin-bottom: 10px;
    }
  }
`;
export default function UserInfoWrap(props) {
  const { setShow, title, onDel, currentData, renderCancel, okText, isPage, disable, width, showClose, show, appId } =
    props;
  const customwidget = useRef(null);
  const [ids, setIds] = useState([]);
  const renderCon = () => {
    return (
      <Wrap className="flexColumn" width={width}>
        <div className="headerWrap flexRow">
          <span className="flex">{title || _l('修改用户信息')}</span>
          {showClose && (
            <Icon className="textTertiary Font22 Hand ThemeHoverColor3" icon="close" onClick={() => setShow(false)} />
          )}
        </div>
        <UserInfoDialogWrap className="flex userInfoCon">
          <CustomFields
            disableRules
            ref={customwidget}
            appId={appId}
            data={currentData
              .map(o => {
                return { ...o, size: 12 }; //全部按整行显示
              })
              .filter(o => !['avatar'].includes(o.alias))}
            onChange={(data, ids) => {
              setIds(ids);
            }}
          />
        </UserInfoDialogWrap>
        <div className="footerWrap flexRow">
          <div className="flex">
            <div
              className={cx('btn saveBtn Hand', { disable })}
              onClick={() => {
                if (disable) {
                  return;
                }
                let { data, hasError } = customwidget.current.getSubmitData();
                if (hasError) {
                  return;
                }
                if (data.find(o => o.type === 29 && safeParse(o.value, 'array').length > 5)) {
                  alert(_l('最多只能关联 5 条记录'), 3);
                  return;
                }
                props.onOk(data, ids);
                setShow(false);
              }}
            >
              {okText ? okText : _l('保存')}
            </div>
            {renderCancel ? (
              renderCancel(currentData)
            ) : (
              <div
                className={cx('btn cancelBtn Hand mLeft10', { disable })}
                onClick={() => {
                  if (disable) {
                    return;
                  }
                  setShow(false);
                }}
              >
                {_l('取消')}
              </div>
            )}
          </div>
          {onDel && (
            <span className={cx('del Hand', { disable })} onClick={disable ? null : onDel}>
              {_l('注销用户')}
            </span>
          )}
        </div>
      </Wrap>
    );
  };
  if (isPage) {
    return renderCon();
  }
  return (
    <Drawer
      width={640}
      onClose={() => setShow(false)}
      mask={true}
      placement="right"
      visible={show}
      maskClosable={true}
      closable={false}
    >
      {renderCon()}
    </Drawer>
  );
}
