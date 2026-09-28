import React, { useCallback, useEffect, useRef, useState } from 'react';
import debounce from 'lodash/debounce';
import { LoadDiv } from 'ming-ui';
import { Modal, Select } from 'ming-ui/antd-components';
import ajaxRequest from 'src/api/taskCenter';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';

const formatTaskOptions = tasks =>
  tasks.map(task => ({
    value: task.taskID,
    label: task.taskName || '',
    userName: task.userName || '',
    task,
  }));

const SearchTask = React.forwardRef(function SearchTask({ onSelect }, ref) {
  const [options, setOptions] = useState([]);
  const [value, setValue] = useState();
  const [loading, setLoading] = useState(false);
  const requestIdRef = useRef(0);
  const searchTasksRef = useRef(null);

  const fetchTasks = useCallback((keywords, requestId) => {
    ajaxRequest
      .getMyTaskList({
        keywords: keywords.trim(),
        projectId: 'all',
        pageIndex: 1,
      })
      .then(
        res => {
          if (requestId !== requestIdRef.current) return;

          setOptions(formatTaskOptions(res.data || []));
          setLoading(false);
        },
        () => {
          if (requestId !== requestIdRef.current) return;

          setOptions([]);
          setLoading(false);
        },
      );
  }, []);

  useEffect(() => {
    const searchTasks = debounce(fetchTasks, 500);
    searchTasksRef.current = searchTasks;

    return () => {
      requestIdRef.current += 1;
      searchTasks.cancel();
      searchTasksRef.current = null;
    };
  }, [fetchTasks]);

  const handleSearch = useCallback(keywords => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setOptions([]);
    setLoading(true);
    searchTasksRef.current?.(keywords, requestId);
  }, []);

  const handleSelect = useCallback(
    (nextValue, option) => {
      setValue(nextValue);
      onSelect(option.task);
    },
    [onSelect],
  );

  const handleOpenChange = useCallback(
    open => {
      if (open && !loading && options.length === 0) {
        handleSearch('');
      }
    },
    [handleSearch, loading, options.length],
  );

  return (
    <Select
      ref={ref}
      className="w100"
      filterOption={false}
      labelInValue
      listHeight={300}
      loading={loading}
      notFoundContent={loading ? <LoadDiv size="middle" /> : _l('没有搜索到结果')}
      optionRender={({ data }) => `${data.label}(${data.userName})`}
      options={options}
      placeholder={_l('请输入任务名称...')}
      showSearch
      value={value}
      onOpenChange={handleOpenChange}
      onSearch={handleSearch}
      onSelect={handleSelect}
    />
  );
});

var AddOldTask = function (opts) {
  var defaults = {
    frameid: 'divaddtask',
    TaskID: '',
    PostID: '',
    ProjectID: 'all',
  };
  this.settings = $.extend(defaults, opts);
  this.settings.$el = $(this);
  this.taskSelectRef = React.createRef();
  this.init();
};

$.extend(AddOldTask.prototype, {
  init: function () {
    var _this = this;
    var settings = this.settings;

    Modal.confirm({
      wrapClassName: `${settings.frameid} addOldTaskConfirm`,
      width: 460,
      title: _l('加入任务'),
      okText: _l('确认'),
      styles: { body: { overflow: 'visible' } },
      content: (
        <div>
          <div className="textTertiary">{_l('注：将动态更新作为讨论的内容加入到已有任务（包括文档、图片等）')}</div>
          <div className="mTop10 oldTaskContainer">
            <SearchTask
              ref={this.taskSelectRef}
              onSelect={item => {
                settings.TaskID = item.taskID;
              }}
            />
          </div>
        </div>
      ),
      onOk: () => {
        _this.send();
      },
    });

    setTimeout(() => {
      this.taskSelectRef.current?.focus();
    }, 200);
  },
  send: function () {
    var settings = this.settings;
    var taskID = settings.TaskID;
    var postID = settings.PostID;
    if (!taskID) {
      alert(_l('请输入并选择一个要加入的任务名称'), 3);
      this.taskSelectRef.current?.focus();
      return false;
    }

    ajaxRequest
      .addTaskTopicFromPost({
        taskID: taskID,
        postID: postID,
      })
      .then(function (source) {
        if (source.status) {
          window.location.href = pathCompletion('/apps/task/task_' + taskID);
        }
      })
      .catch(function (_requestError) {
        alertIfNotUnauthorized(_requestError, _l('操作失败，请稍后再试'), 2);
      });
  },
});

export default function (opts) {
  return new AddOldTask(opts);
}
