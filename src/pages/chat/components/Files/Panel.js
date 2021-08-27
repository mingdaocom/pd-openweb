import React, { Component } from 'react';
import cx from 'classnames';
import config from '../../utils/config';
import * as utils from '../../utils';
import * as ajax from '../../utils/ajax';
import * as socket from '../../utils/socket';
import Constant from '../../utils/constant';
import Dropdown from 'ming-ui/components/Dropdown';
import ScrollView from 'ming-ui/components/ScrollView';
import LoadDiv from 'ming-ui/components/LoadDiv';
import Trigger from 'rc-trigger';
import { FileItem, splitFiles } from './index';
import DatePicker from 'ming-ui/components/DatePicker';
import Tooltip from 'ming-ui/components/Tooltip';
const { RangePicker } = DatePicker;

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
    date: [
      moment()
        .subtract(6, 'days')
        .startOf('day'),
      moment().endOf('day'),
    ],
  },
  {
    text: _l('本月'),
    date: [moment().startOf('month'), moment().endOf('day')],
  },
  {
    text: _l('上月'),
    date: [
      moment()
        .subtract(1, 'month')
        .startOf('month'),
      moment()
        .subtract(1, 'month')
        .endOf('month'),
    ],
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
    ajax.getFileList(param).then((result) => {
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
      }
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
      }
    );
  }
  handleChange(visible) {
    this.setState({
      visible,
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
      }
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
      }
    );
    this.handleChange(false);
  }
  renderToolbar() {
    const { selectedIndex } = this.state;
    const rangePickerProps = {
      offset: {
        left: -542,
        top: -197,
      },
      allowClear: false,
      max: moment(),
      popupParentNode: () => document.querySelector('.ChatPanel-FilesPanel-filterDate'),
      onOk: (selectValue) => {
        this.handleDateChange(selectValue, 4);
      },
    };
    return (
      <div className="ChatPanel-addToolbar-menu ChatPanel-FilesPanel-filterDate">
        {filterDate.map((item, index) => (
          <div className={cx('item', { ThemeBGColor3: index === selectedIndex })} onClick={this.handleDateChange.bind(this, item.date, index)} key={index}>
            {item.text}
          </div>
        ))}
        <RangePicker {...rangePickerProps}>
          <div className={cx('item', { ThemeBGColor3: selectedIndex === 4 })}>{_l('自定义时间')}</div>
        </RangePicker>
        <div className="item" onClick={this.handleClearDate.bind(this)}>
          {_l('清除')}
        </div>
      </div>
    );
  }
  renderFilterDate() {
    const { visible, start, end } = this.state;
    const startDate = moment(start);
    const endDate = moment(end);
    return (
      <div className="filter-data">
        {start && end ? (
          <Tooltip text={<span>{`${startDate.format('YYYY-MM-DD')} ~ ${endDate.format('YYYY-MM-DD')}`}</span>} popupPlacement="top">
            <span>
              {startDate.format('MM-DD')}~{endDate.format('MM-DD')}
            </span>
          </Tooltip>
        ) : (
          undefined
        )}
        <Trigger
          popupVisible={visible}
          onPopupVisibleChange={this.handleChange.bind(this)}
          popupClassName="ChatPanel-Trigger"
          action={['click']}
          popupPlacement="bottom"
          popup={this.renderToolbar()}
          popupAlign={{ offset: [0, 10] }}
          builtinPlacements={config.builtinPlacements}
        >
          <i className="icon-bellSchedule" />
        </Trigger>
      </div>
    );
  }
  render() {
    const { files, loading, fileType, fromUser } = this.state;
    return (
      <div className="ChatPanel-FilesPanel">
        <div className="header">
          <span className="title">{`${_l('文件')}`}</span>
        </div>
        <div className="filter">
          <Dropdown className="dropdown" value={fileType} data={fileTypeData} onChange={this.handleFileTypeChange.bind(this)} />
          <Dropdown className="dropdown" value={fromUser} data={this.fromUserData} onChange={this.handleFromUserChange.bind(this)} />
          {this.renderFilterDate()}
        </div>
        <div className="content">
          <ScrollView onScrollEnd={this.handleScrollEnd.bind(this)}>
            <div className={cx('flex', { 'ChatPanel-Image-list': fileType === 2 })}>
              {files.map((item, index) => <FileItem item={item} key={item.fileId || index} fileType={fileType} />)}
              <LoadDiv className={cx({ Hidden: !loading })} size="small" />
              {!loading && !files.length ? (
                <div className="nodata-wrapper">
                  <div className="nodata-img" />
                  <p>{_l('无匹配结果')}</p>
                </div>
              ) : (
                undefined
              )}
            </div>
          </ScrollView>
        </div>
      </div>
    );
  }
}
