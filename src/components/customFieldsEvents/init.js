import CustomUserList from './js/customUserList';
import CustomGroupList from './js/customGroupList';
import Datetime from './js/datetime';
import DatetimeRange from './js/datetimeRange';
import Sign from './js/sign';
import Dropdown from './js/multipleDropdown';
import FileUploader from './js/fileUploader';
import _ from 'lodash';

import CustomWidgetConfig from 'src/components/customWidget/src/config';
import { SignType } from 'src/components/customWidget/src/component/widgets/datetimeRange/data';

// text to link
const URL_REG = /((?:(https?(?::\/\/)(www\.)?)|(www\.))[a-z0-9-_.]+(?:\.[a-z0-9]{2,})(?:[-a-z0-9:%_+.~#?&//=@]*))/gi;
const linkify = text => {
  return text.replace(URL_REG, url => {
    return `<a href='${url}' target='_blank'>${url}</a>`;
  });
};

let initUserListItem = item => {
  // 启动 选择人员 组件
  let customUserList = new CustomUserList(item);
  customUserList.start();

  $(item).on('mouseover', '.userAvatar', function () {
    var $this = $(this);
    if ($this.data('bind')) return;
    $this.data('bind', true);
    $this.mdBusinessCard();
    $this.triggerHandler('mouseenter');
  });
};

let initGroupListItem = item => {
  // 启动 选择部门 组件
  let customGroupList = new CustomGroupList(item);
  customGroupList.start();
};

let initDatetimeItem = (item, config, postUpdate) => {
  // 启动 时间 组件
  let time = null;
  if (config.value) {
    time = new Date(config.value.replace(/-/g, '/'));
  }
  let datetime = new Datetime(item, config.type, time, postUpdate);
  datetime.start();
};

let initFileUploaderItem = (item, config, postUpdate) => {
  // 启动 文件上传 组件
  let fileUploader = new FileUploader(item, config, postUpdate);
  fileUploader.start();
};

let initDatetimeRangeItem = (item, config, $el, type) => {
  if (!config.dataSource || config.dataSource === SignType.DATETIMERANGE || _.isString(config.value)) {
    // 启动 时间段 组件
    let start = null;
    let end = null;
    if (config.value && config.value.split) {
      let range = config.value.split(',');
      start = new Date(parseInt(range[0], 10));
      end = new Date(parseInt(range[1], 10));
    }
    let datetimeRange = new DatetimeRange(item, config.type, config.enumDefault2, start, end, $el, type);
    datetimeRange.start();
  } else {
    let sign = new Sign(item, config.controlId, config.dataSource, config.value);
    sign.start();
  }
};

let generateOptions = data => {
  let options = [];

  for (let i in data) {
    if (data[i]) {
      let item = data[i];
      if (item.id) {
        let items = [];
        if (item.children && item.children.length) {
          items = generateOptions(item.children);
        }

        options.push({
          label: item.title,
          value: item.id,
          items: items,
        });
      }
    }
  }

  return options;
};

let initMultipleDropdownItem = (item, editMode) => {
  let sourceId = $(item).data('source');
  let companyId = window.localStorage.getItem('plus_projectId');
  if (sourceId && companyId) {
    $(item).empty();
    $(item).addClass('multipleDropdownContainer');
    $(item).removeClass('customDropdownBox');
    if (editMode === false) {
      // 启动 多级下拉菜单 组件
      let dropdown = new Dropdown(item, [], true);
      dropdown.start();
    } else {
      // load dataSource
      $.get(`${CustomWidgetConfig.OARequest()}/system/source/parent/get?companyId=${companyId}&parentId=${sourceId}`).then(data => {
        if (data.status === 1) {
          let defaultOptions = generateOptions(data.data);
          // 启动 多级下拉菜单 组件
          let dropdown = new Dropdown(item, defaultOptions, true);
          dropdown.start();
        }
      });
    }
  }
};

let initControls = config => {
  // data, $el, postUpdate, inDetailed = false, type, index = 0
  let data = config.data;
  let $el = config.$el;
  let postUpdate = config.postUpdate;
  let inDetailed = config.inDetailed || false;
  let type = config.type;
  let index = config.index;
  let editMode = config.editMode;

  for (let i in data) {
    if (data[i]) {
      let row = data[i];

      for (let j in row) {
        if (row[j]) {
          let control = row[j];

          if (control.type === 26) {
            let userListItems = $el.find(`.customUserList[data-id="${control.controlId}"]`);

            userListItems.each((_i, elmt) => {
              initUserListItem(elmt);
            });
          } else if (control.type === 27) {
            let groupListItems = $el.find(`.customGroupList[data-id="${control.controlId}"]`);

            groupListItems.each((_i, elmt) => {
              initGroupListItem(elmt);
            });
          } else if (control.type === 15 || control.type === 16) {
            let datetimeItems = $el.find(`.datetime[data-id="${control.controlId}"]`);

            let _config = {
              value: control.value,
              type: control.type,
            };

            $(datetimeItems).attr('data-config', JSON.stringify(_config));

            datetimeItems.each((_i, elmt) => {
              if (inDetailed) {
                if (_i >= datetimeItems.length - 1) {
                  return;
                } else if (_i === index) {
                  // 初始化指定明细的时间日期组件
                  initDatetimeItem(elmt, _config, postUpdate);
                }
              } else {
                initDatetimeItem(elmt, _config, postUpdate);
              }
            });
          } else if (control.type === 17 || control.type === 18) {
            let datetimeRangeItems = $el.find(`.datetimeRange[data-id="${control.controlId}"]`);

            let _config = {
              controlId: control.controlId,
              value: control.value,
              type: control.type,
              enumDefault2: control.enumDefault2,
              dataSource: control.dataSource,
            };

            $(datetimeRangeItems).attr('data-config', JSON.stringify(_config));

            datetimeRangeItems.each((_i, elmt) => {
              if (inDetailed) {
                if (_i >= datetimeRangeItems.length - 1) {
                  return;
                } else if (_i === index) {
                  // 初始化指定明细的时间日期段组件
                  initDatetimeRangeItem(elmt, _config, $el, type);
                }
              } else {
                initDatetimeRangeItem(elmt, _config, $el, type);
              }
            });
          } else if (control.type === 11 && control.dataSource) {
            // only init control with dataSource
            let multipleDropdownListItems = $el.find(`.multipleDropdown[data-id="${control.controlId}"]`);

            multipleDropdownListItems.each((_i, elmt) => {
              initMultipleDropdownItem(elmt, editMode);
            });
          } else if (control.type === 14) {
            let fileUploaderItems = $el.find(`.customFileUploader[data-id="${control.controlId}"]`);

            fileUploaderItems.each((_i, elmt) => {
              initFileUploaderItem(
                elmt,
                {
                  files: control.value,
                  type,
                },
                postUpdate
              );
            });
          }
        }
      }
    }
  }
};

export { initControls, initUserListItem, initGroupListItem, initDatetimeItem, initDatetimeRangeItem, initMultipleDropdownItem };
