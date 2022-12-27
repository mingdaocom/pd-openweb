import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import CustomFields from 'src/components/newCustomFields';
import CSSTransitionGroup from 'react-addons-css-transition-group';

const Wrap = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-flow: column nowrap;
  width: 580px;
  background: #fff;
  .cover {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    right: 580px;
    background: rgba(0, 0, 0, 0.7);
    z-index: -1;
  }
  .headerWrap {
    padding: 24px;
    font-size: 17px;
    font-weight: 600;
    color: #333333;
  }
  .footerWrap {
    padding: 18px 22px;
    .btn {
      padding: 0 32px;
      line-height: 36px;
      border-radius: 3px;
      box-sizing: border-box;
      &.saveBtn {
        color: #fff;
        background: #2196f3;
        &:hover {
          background: #1e88e5;
        }
      }
      &.cancelBtn {
        color: #9e9e9e;
        border: 1px solid #dddddd;
        &:hover {
          color: #2196f3;
          border: 1px solid #2196f3;
        }
      }
    }
    .del {
      line-height: 36px;
      color: #757575;
      &:hover {
        color: red;
      }
    }
  }
`;
const UserInfoDialogWrap = styled.div`
  width: 100%;
  overflow-y: auto;
  .customFieldsContainer {
    width: 100%;
    padding: 0 14px 24px 14px;
    flex: 1;
    margin: 0;
  }
`;
export default function UserInfoWrap(props) {
  const { setShow, title, onDel, currentData } = props;
  const customwidget = useRef(null);
  const [ids, setIds] = useState([]);

  return (
    <CSSTransitionGroup
      component={'div'}
      transitionName={'userInfoSlide'}
      transitionAppearTimeout={500}
      transitionEnterTimeout={500}
      transitionLeaveTimeout={500}
    >
      <Wrap className="flexColumn">
        <span
          className="cover"
          onClick={() => {
            setShow(false);
          }}
        ></span>
        <div className="headerWrap">{title || _l('修改用户信息')}</div>
        <UserInfoDialogWrap className="flex">
          <CustomFields
            disableRules
            ref={customwidget}
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
              className="btn saveBtn Hand"
              onClick={() => {
                let { data, hasError } = customwidget.current.getSubmitData();
                if (hasError) {
                  return;
                }
                props.onOk(data, ids);
                setShow(false);
              }}
            >
              {_l('保存')}
            </div>
            <div
              className="btn cancelBtn Hand mLeft10"
              onClick={() => {
                setShow(false);
              }}
            >
              {_l('取消')}
            </div>
          </div>
          {onDel && (
            <span className="del Hand" onClick={onDel}>
              {_l('注销用户')}
            </span>
          )}
        </div>
      </Wrap>
    </CSSTransitionGroup>
  );
}
