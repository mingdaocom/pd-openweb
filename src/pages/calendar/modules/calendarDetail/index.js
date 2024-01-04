import ReactDom from 'react-dom';
import React, { Component } from 'react';
import CalendarDetail from './root';
import { getParamsFromUrl, getCalendarDetail } from './common';
import MdDialog from 'src/components/mdDialog/dialog';
import LoadDiv from 'ming-ui/components/LoadDiv';
import ErrorState from 'src/components/errorPage/errorState';
import DocumentTitle from 'react-document-title';
import { htmlDecodeReg, getAppFeaturesPath } from 'src/util';

export let Config = {};

class Container extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      noAuth: false,
      data: null,
    };
  }

  componentWillMount() {
    this.fetchData(true);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.calendarId !== this.props.calendarId || nextProps.recurTime !== this.props.recurTime) {
      this.fetchData(true, nextProps);
    }
  }

  componentDidMount() {
    const { exitCallback, saveCallback, deleteCallback } = Config;
    const dialog = this.dialog;
    if (dialog) {
      // dialogCenter func
      Config.dialogCenter = dialog.dialogCenter.bind(dialog);

      Config.exitCallback = function() {
        dialog.closeDialog();
        exitCallback();
      };

      Config.deleteCallback = function() {
        dialog.closeDialog();
        deleteCallback();
      };

      Config.saveCallback = function() {
        // dialog.closeDialog();
        if ($.isFunction(saveCallback)) saveCallback();
      };

      Config.cancelCallback = Config.closeDialog = function() {
        dialog.closeDialog();
      };
    }
  }

  fetchData(isShowLoading, props) {
    const { calendarId, recurTime } = props || this.props;
    const dfd = $.Deferred();
    if (isShowLoading) {
      this.setState({
        isLoading: true,
        noAuth: false,
      });
    }
    getCalendarDetail(calendarId, recurTime).then(
      ({ data }) => {
        data.calendar.title = htmlDecodeReg(data.calendar.title);
        this.setState({
          isLoading: false,
          data,
        });
      },
      () => {
        this.setState({
          isLoading: false,
          noAuth: true,
        });
      },
    );
  }

  renderContent() {
    const { isLoading, data, noAuth } = this.state;

    // 加载中
    if (isLoading) {
      return <LoadDiv className="pTop30 pBottom30" />;
    }

    // 无权限
    if (noAuth) {
      return <ErrorState text={_l('您的权限不足或此日程已被删除，无法查看')} className="h100 pTop30 pBottom30" />;
    }

    return <CalendarDetail data={data} reFetchData={this.fetchData.bind(this)} />;
  }

  render() {
    const { data } = this.state;
    let title = _l('日程详情');
    if (data) {
      title = data.calendar.title;
    }
    if (Config.isDetailPage) {
      return <DocumentTitle title={title}>{this.renderContent()}</DocumentTitle>;
    } else {
      const dialogProps = {
        dialogBoxID: 'calendarEdit',
        className: 'calendarEdit',
        width: 570,
        container: {
          header: '',
          noText: '',
          yesText: '',
        },
        overlayClosable: true,
      };
      return (
        <MdDialog
          {...dialogProps}
          callback={this.props.handleClose}
          ref={el => {
            this.dialog = el;
          }}
        >
          {this.renderContent()}
        </MdDialog>
      );
    }
  }
}

export default function(options) {
  const defaults = {
    container: '',
    isDetailPage: false,

    calendarId: '',
    recurTime: '',

    exitCallback: null,
    deleteCallback: null,
    saveCallback: null,
  };

  Config = Object.assign(Config, defaults, options);

  if (Config.isDetailPage && Config.container) {
    Config = Object.assign({}, Config, getParamsFromUrl());
    Config.exitCallback = Config.deleteCallback = function() {
      window.location.href = '/apps/calendar/home' + '?' + getAppFeaturesPath();
    };
  } else {
    const { saveCallback } = Config;
    Config.exitCallback = function() {
      // 日程首页的一些操作
      if (location.href.indexOf('/apps/calendar/home') !== -1) {
        $('.showActiveTitleMessage').remove();
        $('#calendar').fullCalendar('refetchEvents');
        if (window.localStorage.getItem === 'list' && $.isFunction(saveCallback)) {
          saveCallback();
        }
      } else if ($.isFunction(saveCallback)) {
        saveCallback();
      }
    };

    Config.deleteCallback = function() {
      // 日程首页的一些操作
      if (location.href.indexOf('/apps/calendar/home') !== -1) {
        $('.showActiveTitleMessage').remove();
        $('#calendar').fullCalendar('refetchEvents');
        if (window.localStorage.getItem === 'list' && $.isFunction(saveCallback)) {
          saveCallback();
        }
      } else if ($.isFunction(saveCallback)) {
        saveCallback();
      }
    };
  }

  const { isDetailPage, container, calendarId, recurTime, handleClose } = Config;

  ReactDom.render(
    <Container calendarId={calendarId} recurTime={recurTime} handleClose={handleClose} />,
    isDetailPage ? container : document.createElement('div'),
  );
}
