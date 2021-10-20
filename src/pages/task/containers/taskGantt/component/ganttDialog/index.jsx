import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import DialogBase from 'ming-ui/components/Dialog/DialogBase';
import Dialog from 'ming-ui/components/Dialog';
import GanttHeader from './GanttHeader';
import GanttSideBar from './GanttSideBar';
import GanttContent from './GanttContent';
import taskReq from 'src/api/taskCenter';
import LoadDiv from 'ming-ui/components/LoadDiv';
import { momentTime, durDays } from './time';
import './index.less';
import config from './config';
import TaskDetail from '../../../taskDetail/taskDetail';
import ErrorState from 'src/components/errorPage/errorState';
import moment from 'moment';
import html2canvas from 'html2canvas';
import qiniuAjax from 'src/api/qiniu';
import { Base64 } from 'js-base64';
import { addToken, getToken } from 'src/util';
import axios from 'axios';

export default class GanttDialog extends Component {
  static propTypes = {
    folderID: PropTypes.string.isRequired,
    closeLayer: PropTypes.func,
  };
  static defaultProps = {
    closeLayer: () => {},
  };
  state = {
    taskID: '',
    name: '',
    beginTime: '',
    endTime: '',
    data: [],
    type: 'day',
    taskDetailVisible: false,
    loading: true,
    refreshLoading: false,
    showExportDialog: false,
    buildImgSuccess: false,
    errorMsg: '',
  };

  componentDidMount() {
    this.getData();
  }

  /**
   * 获取数据并处理之
   */
  getData() {
    const { folderID } = this.props;

    taskReq.getTaskStaticGanttChart({ folderID }).then(res => {
      const { status } = res;
      if (!status) {
        this.setState({
          loading: false,
          refreshLoading: false,
          errorMsg: res.error.msg,
        });
        return;
      }
      const { taskData, maxCompleteTime, minStartTime, folderName } = res.data;
      const data = this.dealWithData(taskData);
      const formatBeginTime = momentTime(minStartTime);
      const formatEndTime = momentTime(maxCompleteTime);
      config.beginTime = formatBeginTime;
      config.endTime = formatEndTime;
      const { beginTime, endTime } = this.handleTime(formatBeginTime.clone(), formatEndTime.clone());
      this.setState({
        loading: false,
        refreshLoading: false,
        data,
        beginTime,
        endTime,
        name: folderName,
      });
    });
  }

  /**
   * 处理时间
   */
  handleTime = (beginTime, endTime) => {
    const { type } = this.state;
    if (type === 'day') {
      beginTime.subtract(7, 'day');
      endTime.add(8, 'day');
    }
    if (type === 'week') {
      beginTime.subtract(1, 'week').startOf('week');
      endTime.add(1, 'week').endOf('week');
    }
    if (type === 'month') {
      beginTime.subtract(1, 'month').startOf('month');
      endTime.add(1, 'month').endOf('month');
    }
    return { beginTime, endTime };
  };

  /**
   * 数据处理 为每个任务添加一个是否显示子项目的标识
   * @param {Array} data
   */
  dealWithData(data) {
    if (!Array.isArray(data)) return;
    data.forEach(item => {
      item.child && (item.childrenVisible = true);
      this.dealWithData(item.child);
    });
    return data;
  }

  /**
   * 切换日期显示形式
   */
  switchDisplayType = type => {
    this.setState({ type }, () => {
      const { beginTime, endTime } = this.handleTime(config.beginTime.clone(), config.endTime.clone());
      this.setState({
        beginTime,
        endTime,
      });
    });
  };

  /**
   * 刷新数据
   */
  refresh = () => {
    this.setState({ refreshLoading: true }, () => {
      this.getData();
    });
  };

  /**
   * 导出数据
   */
  exportData = () => {
    const { name } = this.state;
    const $el = $('.ganttContentBox');
    const width = $el.find('.graphWrap').width();
    const height = $el.find('.graphContent').height() + 70;
    const $box = $el.clone(true);
    $box.css({
      minWidth: width,
      maxWidth: width,
      minHeight: height,
    });

    $('body').append($box);
    html2canvas($('body > .ganttContentBox')[0]).then(canvas => {
      const newCanvas = document.getElementById('ganttCanvas');

      newCanvas.width = width;
      newCanvas.height = height + 51;

      const ctx = newCanvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, 50);
      ctx.font = '20px Microsoft YaHei';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, width / 2, 25);
      ctx.moveTo(0, 51);
      ctx.lineTo(width, 51);
      ctx.strokeStyle = '#e0e0e0';
      ctx.stroke();
      ctx.drawImage(canvas, 0, 51);

      if (newCanvas.toDataURL() === 'data:,') {
        alert(_l('长度过长，请切换"周"或"月"视图后重试'), 2);
      } else {
        this.setState({ showExportDialog: true, buildImgSuccess: false });
        this.putb64(newCanvas.toDataURL());
      }

      $('body > .ganttContentBox').remove();
    });
  };

  /**
   * 上传到七牛
   */
  putb64(base64) {
    getToken([{ bucket: 2, ext: '.png' }]).then(res => {
      if (res.error) {
        alert(res.error);
      } else {
        const url = `${md.global.FileStoreConfig.uploadHost}/putb64/-1/key/${Base64.encode(res[0].key)}`;
        axios
          .post(url, base64.replace('data:image/png;base64,', ''), {
            headers: {
              'Content-Type': 'application/octet-stream',
              Authorization: `UpToken ${res[0].uptoken}`,
            },
          })
          .then(({ data }) => {
            const { key = '' } = data || {};
            this.setState({
              buildImgSuccess: true,
              url: `${md.global.FileStoreConfig.pubHost + key}?attname=${encodeURIComponent(
                this.state.name + moment().format('YYYY-MM-DD'),
              )}.png`,
            });
          })
          .catch(error => {
            console.log(error);
            alert(_l('保存失败!'));
          });
      }
    });
  }

  /**
   * 获取文件key
   */
  getFileKey(length) {
    const randStrArr = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i',
      'j',
      'k',
      'l',
      'm',
      'n',
      'o',
      'p',
      'q',
      'r',
      's',
      't',
      'u',
      'v',
      'w',
      'x',
      'y',
      'z',
    ];

    const randArr = [];
    for (let i = 0; i < length; i++) {
      randArr.push(randStrArr[Math.floor(Math.random() * randStrArr.length)]);
    }

    return randArr.join('');
  }

  /**
   * 关闭弹窗
   */
  closeLayer = () => {
    this.props.closeLayer(false);
  };

  /**
   * 切换子项目的显示隐藏
   */
  toggleTask = args => {
    const { data } = this.state;
    const cloneData = _.cloneDeep(data);

    this.toggleData(cloneData, args);
    this.setState({
      data: cloneData,
    });
  };

  /**
   * 递归改变子数据的属性
   */
  toggleData = (data, args) => {
    if (args.length === 1) {
      data[args[0]].childrenVisible = !data[args[0]].childrenVisible;
    } else {
      this.toggleData(data[args[0]].child, args.slice(1));
    }
  };

  /**
   * 处理子任务hover状态
   */
  handleTaskItemHover = (layerVisible, e) => {
    const activeLayer = document.querySelector('.activeLayer');
    if (layerVisible) {
      const $el = e.currentTarget;
      const top = $el.getBoundingClientRect().top - 51;

      if (top >= 50) {
        activeLayer.style.display = 'block';
        activeLayer.style.top = top + 'px';
      }
    } else {
      activeLayer.style.display = 'none';
    }
  };

  /**
   * 显示任务详情
   */
  showDetail = taskID => {
    this.setState({
      taskID,
      taskDetailVisible: true,
    });
  };

  /**
   * 横向滚动至今天
   */
  scrollToToday = () => {
    const { type, beginTime } = this.state;
    const { TYPE_TO_WIDTH } = config;
    const width = TYPE_TO_WIDTH[type];
    const $el = document.querySelector('.ganttContentBox');
    const elWidth = Math.round($el.getBoundingClientRect().width / 2);
    const durWidth = Math.round(durDays(beginTime, moment()) * width + width / 2 - elWidth);
    $el.scrollLeft = durWidth;
  };

  /**
   * 下载
   */
  onOk = () => {
    const { buildImgSuccess, url } = this.state;

    if (buildImgSuccess) {
      window.open(addToken(url, !window.isDingTalk));
      this.setState({ showExportDialog: false });
    }
  };

  render() {
    const {
      type,
      data,
      loading,
      refreshLoading,
      errorMsg,
      taskID,
      taskDetailVisible,
      name,
      showExportDialog,
      buildImgSuccess,
    } = this.state;
    const {
      switchDisplayType,
      refresh,
      exportData,
      closeLayer,
      toggleTask,
      handleTaskItemHover,
      showDetail,
      scrollToToday,
    } = this;
    let width = 0;
    if (refreshLoading) {
      width =
        $('.timeHeader').width() > $('.ganttContentBox').width()
          ? $('.ganttContentBox').width()
          : $('.timeHeader').width();
    }

    return (
      <DialogBase dialogClasses="flatFishGanttDialog" visible onCancel={this.handleClose}>
        <div className="flatFishGanttWrap flexColumn">
          <GanttHeader {...{ type, name, data, switchDisplayType, refresh, exportData, closeLayer, scrollToToday }} />
          {loading ? (
            <LoadDiv />
          ) : errorMsg ? (
            <ErrorState text={errorMsg} />
          ) : (
            <div className="ganttContentWrap flex flexRow">
              {!data.length ? (
                <div className="emptyGantt">
                  <img src="/images/empty_gantt.png" alt="empty" />
                  <div className="explain">{_l('该甘特图下暂无任务')}</div>
                </div>
              ) : (
                <Fragment>
                  <GanttSideBar {...{ ...this.state, handleTaskItemHover, toggleTask, showDetail }} />
                  <GanttContent {...{ ...this.state, handleTaskItemHover, showDetail }} />
                </Fragment>
              )}
              <div className="activeLayer" />
              {refreshLoading && (
                <div className="refreshLoading" style={{ width }}>
                  <LoadDiv />
                </div>
              )}
            </div>
          )}
          {taskDetailVisible && (
            <TaskDetail
              visible={taskDetailVisible}
              taskId={taskID}
              openType={3}
              closeCallback={() => this.setState({ taskDetailVisible: false })}
            />
          )}
          {showExportDialog && (
            <Dialog
              visible
              title={_l('导出图片')}
              okText={_l('下载')}
              className={buildImgSuccess ? '' : 'saveImgBtnDisabled'}
              onCancel={() => this.setState({ showExportDialog: false })}
              onOk={this.onOk}
            >
              <span className="Gray_9e">
                {buildImgSuccess ? _l('已生成图片') : _l('正在整理要导出的数据，请稍候...')}
              </span>
            </Dialog>
          )}
        </div>
      </DialogBase>
    );
  }
}
