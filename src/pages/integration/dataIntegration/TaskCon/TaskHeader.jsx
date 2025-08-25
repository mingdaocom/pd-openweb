import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon, Input } from 'ming-ui';
import { taskTabList } from 'src/pages/integration/config.js';
import 'src/pages/workflow/components/Switch/index.less';
import { navigateTo } from 'src/router/navigateTo';

const STATUS2TEXT = {
  active: _l('运行中'),
  close: _l('已关闭'),
};
const Wrap = styled.div`
  display: flex;
  width: 100%;
  box-sizing: border-box;
  padding: 0 20px;
  height: 55px;
  box-shadow: 0 3px 6px rgb(0 0 0 / 16%);
  align-items: center;
  background: #fff;
  z-index: 1;
  .back{
    cursor: pointer;
    margin-right: 15px;
    width: 20px;
    display: block;
    color: #757575
    &:hover{
      color: #1e88e5;
    }
  }
  .title {
    font-size: 16px;
    font-weight: 400;
    color: #151515;
  }
  .tabCon {
    display: flex;
    li {
      padding: 0 5px;
      margin: 0 10px;
      height: 55px;
      font-weight: 400;
      color: #9e9e9e;
      line-height: 54px;
      &.isCur,&:hover {
        font-weight: 600;
        color: #1677ff;
        border-bottom: 3px solid #1677ff;
      }
    }
  }
  .publishBtn {
    box-sizing: border-box;
    padding: 0 22px;
    line-height: 36px;
    margin-right: 16px;
    border: 1px solid #1677ff;
    color: #1677ff;
    cursor: pointer;
    border-radius: 3px;
    text-align: center;
    font-weight: 600;
    &:hover{
      background: #1677ff;
      color:#fff;
    }
  }
  .disable,.disable:hover {
    background: #bdbdbd;
    background-color: #bdbdbd!important;
    border: 1px solid #bdbdbd;
    border-color: #bdbdbd;
    cursor: not-allowed!important;
    color:#fff;
  }
  .workflowStatusWrap{
    .disable,.disable:hover {
      .iconWrap .workflowSwitchIcon-active{
        color:#bdbdbd!important;
      }
    }
  }
`;
export default function Header(props) {
  const { onBack, onChangeTab, tab, flowData = {}, publishTask, isNew, isUpdate, changeTask, updating } = props;
  const { taskStatus } = flowData;
  const [{ showInput, title, status }, setState] = useSetState({
    showInput: false,
    title: props.title || _l('数据同步任务'),
    status: taskStatus === 'RUNNING' ? 'active' : 'close',
  });
  useEffect(() => {
    const { flowData = {} } = props;
    const { taskStatus } = flowData;
    setState({
      title: props.title || _l('数据同步任务'),
      status: taskStatus === 'RUNNING' ? 'active' : 'close',
    });
  }, [props]);
  return (
    <Wrap className="alignItemsCenter flexRow">
      <div className="flex flexRow alignItemsCenter">
        {/* <ActWrap
          className="act InlineBlock TxtMiddle TxtCenter mLeft0 mRight32 Hand LineHeight36"
          onClick={() => {
            onBack();
          }}
        >
          <Icon icon="backspace" className="Font16" />
        </ActWrap> */}
        <i
          className="icon-backspace Font20 back"
          onClick={() => {
            onBack && onBack();
            navigateTo('/integration/task');
          }}
        />
        {showInput ? (
          <Input
            autoFocus
            className="flex mRight20"
            defaultValue={title}
            onBlur={e => {
              props.onChangeTitle(e.target.value.trim());
              setState({
                showInput: false,
              });
            }}
            onKeyDown={event => {
              if (event.which === 13) {
                setState({
                  title: event.target.value,
                });
              }
            }}
          />
        ) : (
          <span
            className="title ellipsis"
            onClick={() => {
              setState({
                showInput: true,
              });
            }}
          >
            {title}
          </span>
        )}
      </div>
      <ul className="tabCon">
        {taskTabList.map(o => {
          return (
            <li
              className={cx('Hand Font16', { isCur: tab === o.type })}
              onClick={() => {
                if (tab === o.type) {
                  return;
                }
                onChangeTab(o.type);
              }}
            >
              {o.txt}
            </li>
          );
        })}
      </ul>
      <div
        className="flex flexRow"
        style={{
          'justify-content': 'flex-end',
        }}
      >
        {(isNew || isUpdate) && (
          <span
            className={cx('publishBtn InlineBlock Hand', { disable: updating })}
            onClick={() => {
              if (updating) {
                return;
              }
              publishTask();
            }}
          >
            {isNew ? _l('发布') : isUpdate ? _l('更新发布') : ''}
          </span>
        )}
        {!isNew && (
          <div className="workflowStatusWrap">
            <div
              className={cx('switchWrap', `switchWrap-${status}`, { disable: updating })}
              onClick={() => {
                if (updating) {
                  return;
                }
                changeTask(taskStatus === 'RUNNING' ? 'STOP' : 'RUNNING');
              }}
            >
              <div className={cx('contentWrap', `contentWrap-${status}`)}>
                <div>{STATUS2TEXT[status]}</div>
              </div>
              <div className={cx('iconWrap', `iconWrap-${status}`)}>
                <Icon icon="hr_ok" className={cx('Font20 Gray_bd', `workflowSwitchIcon-${status}`)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </Wrap>
  );
}
