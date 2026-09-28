import React, { Component } from 'react';
import cx from 'classnames';
import moment from 'moment';
import { ScrollView } from 'ming-ui';
import { DatePicker, Dropdown, Tooltip } from 'ming-ui/antd-components';
import LoadDiv from 'ming-ui/components/LoadDiv';
import * as ajax from '../../utils/ajax';
import { FileItem, splitFiles } from './index';

const { RangePicker } = DatePicker;

const RANGE_PICKER_STYLES = {
  root: {
    pointerEvents: 'none',
    opacity: 0,
    position: 'absolute',
    bottom: 0,
    insetInlineStart: 0,
  },
};

const fileTypeData = [
  {
    text: _l('全部'),
    value: -1,
  },
  {
    text: _l('图片'),
    value: 2,
  },
  {
    text: _l('文档'),
    value: 4,
  },
  {
    text: _l('视频'),
    value: 7,
  },
];

const filterDate = [
  {
    text: _l('今天'),
    date: [moment().startOf('day'), moment().endOf('day')],
  },
  {
    text: _l('最近七天'),
    date: [moment().subtract(6, 'days').startOf('day'), moment().endOf('day')],
  },
  {
    text: _l('本月'),
    date: [moment().startOf('month'), moment().endOf('day')],
  },
  {
    text: _l('上月'),
    date: [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
  },
];

export default class FilesPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageIndex: 1,
      loading: false,
      files: [],
      fromUser: -1,
      fileType: -1,
      start: '',
      end: '',
      visible: false,
      datePickerVisible: false,
      selectedIndex: -1,
    };
    this.fromUserData = [
      {
        text: _l('全部文件'),
        value: -1,
      },
      {
        text: _l('我上传的文件'),
        value: md.global.Account.accountId,
      },
    ];
  }
  componentDidMount() {
    this.getFiles();
  }
  handleScrollEnd() {
    this.getFiles();
  }
  getFiles() {
    const { session } = this.props;
    const { fileType, loading, fromUser, pageIndex, files, start, end } = this.state;
    const param = {
      pageIndex,
      pageSize: 10,
      fileType,
      [session.isGroup ? 'groupId' : 'withUser']: session.id,
    };

    if (session.isGroup) {
      param.fromUser = fromUser;
    } else {
      if (fromUser !== -1) {
        param.sendBy = fromUser;
      } else {
        param.fromUser = fromUser;
      }
    }

    if (start || end) {
      param.start = start;
      param.end = end;
    }

    if (loading || !pageIndex) {
      return;
    }

    this.setState({
      loading: true,
    });
    ajax.getFileList(param).then(result => {
      const { list } = result;
      this.setState({
        pageIndex: list && list.length >= 10 ? pageIndex + 1 : 0,
        loading: false,
        files: splitFiles(files.concat(list || [])),
      });
    });
  }
  handleFileTypeChange(value) {
    this.setState(
      {
        pageIndex: 1,
        loading: false,
        files: [],
        fileType: value,
      },
      () => {
        this.getFiles();
      },
    );
  }
  handleFromUserChange(value) {
    this.setState(
      {
        fromUser: value,
        loading: false,
        files: [],
        pageIndex: 1,
      },
      () => {
        this.getFiles();
      },
    );
  }
  handleChange(visible) {
    this.setState({
      visible,
      ...(!visible ? { datePickerVisible: false } : {}),
    });
  }
  handleDateChange(date, index) {
    const [start, end] = date;
    this.setState(
      {
        pageIndex: 1,
        loading: false,
        files: [],
        start: start.format('YYYY-MM-DD 00:00'),
        end: end.format('YYYY-MM-DD 23:59'),
        selectedIndex: index,
      },
      () => {
        this.getFiles();
      },
    );
    this.handleChange(false);
  }
  handleClearDate() {
    this.setState(
      {
        selectedIndex: -1,
        pageIndex: 1,
        loading: false,
        files: [],
        start: '',
        end: '',
      },
      () => {
        this.getFiles();
      },
    );
    this.handleChange(false);
  }
  renderDropdown(data, value, onChange) {
    const selectedItem = data.find(item => item.value === value) || data[0];

    return (
      <Dropdown
        trigger={['click']}
        placement="bottomLeft"
        menu={{
          selectable: true,
          selectedKeys: [String(value)],
          style: { minWidth: 160 },
          items: data.map(item => ({
            key: String(item.value),
            label: item.text,
            onClick: () => onChange(item.value),
          })),
        }}
      >
        <div className="filterDropdownTrigger">
          <span className="ellipsis">{selectedItem.text}</span>
          <i className="icon-arrow-down-border textTertiary" />
        </div>
      </Dropdown>
    );
  }
  renderDateMenuItems() {
    const { start, end, datePickerVisible } = this.state;
    const dateValue = start && end ? [moment(start), moment(end)] : null;

    return [
      ...filterDate.map((item, index) => ({
        key: String(index),
        label: item.text,
        onClick: this.handleDateChange.bind(this, item.date, index),
      })),
      {
        key: 'custom',
        label: (
          <div
            onClick={event => {
              event.stopPropagation();
              this.setState({ datePickerVisible: true });
            }}
          >
            <span>{_l('自定义日期')}</span>
            <div onClick={event => event.stopPropagation()}>
              <RangePicker
                disabledDate={current => current && current.isAfter(moment(), 'day')}
                getPopupContainer={triggerNode => triggerNode.closest('.chatFilesDateDropdown') || document.body}
                open={datePickerVisible}
                placement="bottomRight"
                styles={RANGE_PICKER_STYLES}
                value={dateValue}
                onOpenChange={open => {
                  if (!open) {
                    this.setState({ datePickerVisible: false });
                  }
                }}
                onChange={selectValue => {
                  if (selectValue && selectValue[0] && selectValue[1]) {
                    this.handleDateChange(selectValue, filterDate.length);
                  } else {
                    this.handleClearDate();
                  }
                }}
              />
            </div>
          </div>
        ),
      },
      {
        key: 'clear',
        danger: true,
        label: _l('清除'),
        onClick: this.handleClearDate.bind(this),
      },
    ];
  }
  renderFilterDate() {
    const { visible, start, end, selectedIndex } = this.state;
    const startDate = moment(start);
    const endDate = moment(end);

    return (
      <div className="filter-data">
        {start && end ? (
          <Tooltip title={`${startDate.format('YYYY-MM-DD')} ~ ${endDate.format('YYYY-MM-DD')}`}>
            <span>
              {startDate.format('MM-DD')}~{endDate.format('MM-DD')}
            </span>
          </Tooltip>
        ) : undefined}
        <Dropdown
          classNames={{ root: 'chatFilesDateDropdown' }}
          menu={{
            items: this.renderDateMenuItems(),
            selectable: true,
            style: { width: 250 },
            selectedKeys: selectedIndex >= 0 && selectedIndex < filterDate.length ? [String(selectedIndex)] : [],
          }}
          open={visible}
          placement="bottomRight"
          trigger={['click']}
          onOpenChange={this.handleChange.bind(this)}
        >
          <i className="icon-bellSchedule" />
        </Dropdown>
      </div>
    );
  }
  render() {
    const { files, loading, fileType, fromUser } = this.state;
    return (
      <div className="ChatPanel-FilesPanel">
        <div className="header">
          <span className="title">{_l('文件')}</span>
        </div>
        <div className="filter">
          {this.renderDropdown(fileTypeData, fileType, this.handleFileTypeChange.bind(this))}
          {this.renderDropdown(this.fromUserData, fromUser, this.handleFromUserChange.bind(this))}
          {this.renderFilterDate()}
        </div>
        <div className="content">
          <ScrollView onScrollEnd={this.handleScrollEnd.bind(this)}>
            <div className={cx('flex', { 'ChatPanel-Image-list': fileType === 2 })}>
              {files.map((item, index) => (
                <FileItem
                  item={item}
                  key={item.fileId || index}
                  fileType={fileType}
                  onGotoMessage={this.props.onGotoMessage}
                />
              ))}
              <LoadDiv className={cx({ Hidden: !loading })} size="small" />
              {!loading && !files.length ? (
                <div className="nodata-wrapper">
                  <div className="nodata-img" />
                  <p>{_l('无匹配结果')}</p>
                </div>
              ) : undefined}
            </div>
          </ScrollView>
        </div>
      </div>
    );
  }
}
