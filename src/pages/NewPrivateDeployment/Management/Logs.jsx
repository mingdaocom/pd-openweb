import React, { Component, Fragment } from 'react';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { DatePicker, Input, Button, ConfigProvider } from 'antd';
import styled from 'styled-components';
import privateHkLog from 'src/api/privateHkLog';
import { htmlEncodeReg, htmlDecodeReg } from 'src/util';
import moment from 'moment';
import zh_CN from 'antd/es/date-picker/locale/zh_CN';
import zh_TW from 'antd/es/date-picker/locale/zh_TW';
import en_US from 'antd/es/date-picker/locale/en_US';
import ja_JP from 'antd/es/date-picker/locale/ja_JP';
import _ from 'lodash';

const { RangePicker } = DatePicker;

const Header = styled.div`
  padding-bottom: 30px;
  .serverName, .logName, .filterTime {
    width: 15%;
    margin-right: 20px;
  }
  .filterTime {
    width: 380px;
  }
  .ant-btn {
    padding: 4px 25px;
  }
  .input {
    &.ant-input-affix-wrapper:hover, &:hover {
      border-color: #2196F3 !important;
    }
    &.ant-input-affix-wrapper, &.ant-input-affix-wrapper-focused, & {
      border-radius: 2px !important;
      box-shadow: none !important;
    }
  }
`;

const Content = styled.div`
  .header {
    border-bottom: 1px solid #e3e3e3;
  }
  .rightWrapper {
    right: 5px;
    top: -5px;
  }
  .logItem {
    &:hover {
      background-color: #eee;
    }
  }
  .serverName {
    padding-left: 10px;
  }
  .serverName, .time {
    flex: 1;
  }
  .logContent {
    width: 75%;
    word-break: break-word;
  }
  .justifyContentCenter {
    justify-content: center
  }
  .highlig {
    background-color: #F7A943;
  }
`;

const highlightMessageText = (keyword, content) => {
  const original = content;
  content = htmlDecodeReg(content);
  const reg = new RegExp(_.escapeRegExp(keyword), 'gi');
  const exec = reg.exec(content);
  const newKeyword = exec ? exec[0] : '';
  content = htmlEncodeReg(content.replace(new RegExp(newKeyword, 'g'), '*#span1#*' + newKeyword + '*#span2#*'));
  content = content.replace(/\*#span1#\*/g, '<span class="highlig">').replace(/\*#span2#\*/g, '</span>');
  return content;
};

export default class Logs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      serverName: '',
      keywords: '',
      date: [],
      loading: false,
      pageIndex: 1,
      isMore: true,
      logList: []
    }
  }
  componentDidMount() {
    this.getLogs();
  }
  getLogs() {
    const { serverName, keywords, date, loading, pageIndex, isMore } = this.state;

    if (loading || !isMore) {
      return;
    }

    this.setState({ loading: true });

    const pageSize = 50;
    const [ start, end ] = date;
    const startTime = start ? moment(start).format('YYYY-MM-DD HH:mm:ss') : undefined;
    const endTime = end ? moment(end).format('YYYY-MM-DD HH:mm:ss') : undefined;

    privateHkLog.getLogs({
      pageIndex,
      pageSize,
      serviceName: serverName,
      keywords,
      startTime,
      endTime
    }).then(data => {
      const { logList } = this.state;
      const newList = logList.concat(data.list);
      this.setState({
        loading: false,
        logList: newList,
        pageIndex: pageIndex + 1,
        isMore: data.list.length >= pageSize
      });
    });
  }
  handleQuery = () => {
    this.setState({
      pageIndex: 1,
      isMore: true,
      logList: []
    }, this.getLogs);
  }
  handleReset = () => {
    this.setState({
      pageIndex: 1,
      isMore: true,
      logList: [],
      serverName: '',
      keywords: '',
      date: []
    }, this.getLogs);
  }
  handleDownload = () => {
    const { serverName, keywords, date } = this.state;
    const [ start, end ] = date;
    const startTime = start ? moment(start).format('YYYY-MM-DD HH:mm:ss') : '';
    const endTime = end ? moment(end).format('YYYY-MM-DD HH:mm:ss') : '';
    window.open(`${md.global.Config.AjaxApiUrl}PrivateHkLog/DownloadLogs?serviceName=${serverName}&keywords=${keywords}&startTime=${startTime}&endTime=${endTime}`);
  }
  handleScrollEnd = () => {
    this.getLogs();
  }
  renderFilter() {
    const { date, serverName, keywords } = this.state;
    const lang = getCookie('i18n_langtag') || md.global.Config.DefaultLang;
    return (
      <Header className="valignWrapper mTop20">
        <div className="valignWrapper serverName">
          <div className="Gray_75 Bold nowrap mRight5">{_l('服务名')}</div>
          <Input
            className="input"
            placeholder={_l('输入完整的服务名')}
            value={serverName}
            onChange={(event) => {
              this.setState({
                serverName: event.target.value
              });
            }}
            onKeyDown={event => {
              event.which === 13 && this.handleQuery();
            }}
          />
        </div>
        <div className="valignWrapper logName">
          <div className="Gray_75 Bold nowrap mRight5">{_l('日志内容')}</div>
          <Input
            className="input"
            placeholder={_l('输入日志内容')}
            value={keywords}
            onChange={(event) => {
              this.setState({
                keywords: event.target.value
              });
            }}
            onKeyDown={event => {
              event.which === 13 && this.handleQuery();
            }}
          />
        </div>
        <div className="valignWrapper filterTime">
          <div className="Gray_75 Bold nowrap mRight5">{_l('时间')}</div>
          <RangePicker
            className="input"
            locale={lang === 'en' ? en_US : lang === 'ja' ? ja_JP : lang === 'zh-Hant' ? zh_TW : zh_CN}
            value={date}
            showTime={{ format: 'HH:mm:ss' }}
            onChange={(date) => {
              this.setState({
                date: date || []
              });
            }}
          />
        </div>
        <div className="valignWrapper">
          <ConfigProvider autoInsertSpaceInButton={false}>
            <Button className="mRight10" type="primary" onClick={this.handleQuery}>{_l('查询')}</Button>
            <Button onClick={this.handleReset}>{_l('重置')}</Button>
          </ConfigProvider>
        </div>
      </Header>
    );
  }
  renderContent() {
    const { keywords, logList, loading, pageIndex } = this.state;
    return (
      <Content className="flexColumn flex">
        <div className="flexRow header mBottom10 pBottom10 Relative">
          <div className="Gray_75 Bold time">{_l('时间')}</div>
          <div className="Gray_75 Bold serverName">{_l('服务名')}</div>
          <div className="Gray_75 Bold logContent">{_l('日志内容')}</div>
          <div className="valignWrapper Absolute rightWrapper">
            <Button
              type="link"
              icon={<Icon className="mRight5" icon="file_download" />}
              onClick={this.handleDownload}
            >
              {_l('导出前500条日志')}
            </Button>
            <Button
              type="link"
              icon={<Icon className="mRight5" icon="workflow_cycle" />}
              onClick={this.handleQuery}
            >
              {_l('刷新')}
            </Button>
          </div>
        </div>
        <ScrollView className="flex" onScrollEnd={this.handleScrollEnd}>
          {logList.map((item, index) => (
            <div className="flexRow logItem Font14" key={index}>
              <div className="time">{item.time}</div>
              <div className="serverName">{item.serviceName}</div>
              <div className="logContent" dangerouslySetInnerHTML={{ __html: item.message }}></div>
            </div>
          ))}
          {!loading && !logList.length && (
            <div className="valignWrapper h100 justifyContentCenter Gray_75">
              <Icon className="Font18 mRight5 mBottom2" icon="info" />
              {_l('未查询到相关内容')}
            </div>
          )}
          {loading && (
            <div className="valignWrapper">
              <LoadDiv />
            </div>
          )}
        </ScrollView>
      </Content>
    );
  }
  render() {
    return (
      <div className="privateCardWrap big h100 flexColumn flex">
        <div className="Font17 bold mBottom8">{_l('日志')}</div>
        {this.renderFilter()}
        {this.renderContent()}
      </div>
    );
  }
}
