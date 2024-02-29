import './css/addOldTask.css';
import { htmlEncodeReg } from 'src/util';
import ajaxRequest from 'src/api/taskCenter';
import React, { useState } from 'react';
import Trigger from 'rc-trigger';
import cx from 'classnames';
import styled from 'styled-components';
import { LoadDiv, Dialog } from 'ming-ui';
import _ from 'lodash';

const SearchTaskCon = styled.ul`
  background: #fff;
  display: block;
  padding: 6px 0;
  -webkit-box-shadow: 0 4px 20px rgba(0, 0, 0, 0.13), 0 2px 6px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: scroll;
  li {
    cursor: pointer;
    height: 40px;
    line-height: 40px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 15px;
    &.active {
      color: #fff;
      background-color: #1e88e5;
    }
    &:hover {
      color: #fff;
      background-color: #1e88e5;
    }
    &.noData {
      color: #333 !important;
      background-color: #fff !important;
    }
  }
`;

function SearchTask(props) {
  const { onSelect } = props;
  const [options, setOptions] = useState([]);
  const [value, setValue] = useState({});
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchFetch = (value = '') => {
    setValue({});
    setLoading(true);
    ajaxRequest
      .getMyTaskList({
        keywords: value.trim(),
        projectId: 'all',
        pageIndex: 1,
      })
      .then(res => {
        setLoading(false);
        setOptions(res.data || []);
        setVisible(true);
      });
  };

  const handleSearch = _.debounce(searchFetch, 500);

  return (
    <Trigger
      popup={
        <SearchTaskCon>
          {loading ? (
            <LoadDiv size="middle" />
          ) : (
            <React.Fragment>
              {options.map(l => (
                <li
                  key={l.taskID}
                  className={cx({ active: l.taskID === value.taskID })}
                  onClick={() => {
                    setValue(l);
                    onSelect(l);
                    setVisible(false);
                    $('#txtOldTaskName').val(l.taskName);
                  }}
                >{`${htmlEncodeReg(l.taskName)}(${htmlEncodeReg(l.userName)})`}</li>
              ))}
              {!loading && options.length === 0 && <li className="noData">{_l('没有搜索到结果')}</li>}
            </React.Fragment>
          )}
        </SearchTaskCon>
      }
      popupStyle={{ width: 374 }}
      popupVisible={visible}
      onPopupVisibleChange={visible => {
        if (visible && options.length === 0) return;
        setVisible(visible);
      }}
      action={['click']}
      popupAlign={{
        points: ['tr', 'br'],
        offset: [0, 5],
        overflow: { adjustX: true, adjustY: true },
      }}
    >
      <input
        type="text"
        id="txtOldTaskName"
        placeholder={_l('请输入任务名称...')}
        className="TextBox mTop5 task_title_icon"
        onChange={e => handleSearch(e.target.value)}
      />
    </Trigger>
  );
}

var AddOldTask = function (opts) {
  var defaults = {
    frameid: 'divaddtask',
    TaskID: '',
    PostID: '',
    ProjectID: 'all',
  };
  this.settings = $.extend(defaults, opts);
  this.settings.$el = $(this);
  this.init();
};

$.extend(AddOldTask.prototype, {
  init: function () {
    var _this = this;
    var settings = this.settings;

    Dialog.confirm({
      dialogClasses: `${settings.frameid} addOldTaskConfirm`,
      width: 460,
      title: _l('加入任务'),
      okText: _l('确认'),
      children: (
        <div class="pAll10">
          <div class="Gray_a">{_l('注：将动态更新作为讨论的内容加入到已有任务（包括文档、图片等）')}</div>
          <div class="mTop5 oldTaskContainer">
            <SearchTask
              onSelect={item => {
                settings.TaskID = item.taskID;
              }}
            />
            <span id="spnTaskNameMessage" class="ShowMsg Hidden"></span>
          </div>
        </div>
      ),
      onOk: () => {
        _this.send();
      },
    });
    $('#txtOldTaskName').focus();
  },
  send: function () {
    var settings = this.settings;
    var taskID = settings.TaskID;
    var postID = settings.PostID;
    if (!taskID) {
      alert(_l('请输入并选择一个要加入的任务名称'), 3);
      $('#txtOldTaskName').focus();
      return false;
    }

    ajaxRequest
      .addTaskTopicFromPost({
        taskID: taskID,
        postID: postID,
      })
      .then(function (source) {
        if (source.status) {
          window.location = 'apps/task/task_' + taskID;
        }
      })
      .fail(function () {
        alert(_l('操作失败，请稍后再试'), 2);
      });
  },
});

export default function (opts) {
  return new AddOldTask(opts);
}
