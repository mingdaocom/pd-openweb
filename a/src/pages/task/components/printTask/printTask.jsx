import React, { Component } from 'react';
import cx from 'classnames';
import postAjax from 'src/api/taskCenter';
import LoadDiv from 'ming-ui/components/LoadDiv';
import { htmlDecodeReg } from 'src/util';
import './printTask.less';
import { navigateTo } from 'src/router/navigateTo';
import _ from 'lodash';

export default class PrintTask extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: '',
    };
  }

  componentWillMount() {
    postAjax
      .getTaskDetail4Print({
        taskId: this.props.taskId,
        options: this.props.options,
        cids: this.props.cids,
      })
      .then(source => {
        if (source.status) {
          this.setState({ data: source.data });
        }
      });
  }

  print() {
    window.print();
  }

  /**
   * 返回自定义字段列数
   * @param  {number} type
   */
  returnControlsColumns(type) {
    switch (type) {
      case 1:
      case 2:
      case 9:
      case 10:
      case 14:
      case 21:
      case 28:
      case 10010:
        return 2;
        break;
      case 22:
        return 3;
        break;
      default:
        return 1;
        break;
    }
  }

  /**
   * 返回自定义字段值
   * @param  {object} item
   */
  returnCustonValue(item) {
    // 单选框
    if (item.type === 9) {
      if (item.value && item.value !== '0') {
        return _.find(item.options, ({ key }) => key === item.value).value;
      }
      return '';
    }
    // 复选框
    if (item.type === 10) {
      const key = [];
      for (let i = 0; i < item.value.length; i++) {
        if (item.value.substr(i, 1) !== '0') {
          key.push('1' + item.value.slice(i + 1).replace(/1/g, 0));
        }
      }

      item.value = _.map(item.options, option => {
        return key.indexOf(option.key) >= 0 ? option.value : '';
      });
      _.remove(item.value, option => option === '');
      return item.value.join(',');
    }
    // 下拉框
    if (item.type === 11) {
      if (item.value !== '0') {
        return _.find(item.options, ({ key }) => key === item.value).value;
      }
      return '';
    }
    // 附件
    if (item.type === 14) {
      return _.map(JSON.parse(item.value), att => att.originalFilename).join(',');
    }
    // 评分
    if (item.type === 28) {
      return item.enumDefault === 1 ? item.value + _l('星') : item.value + '/10';
    }
    // 关联
    if (item.type === 21) {
      const list = [];
      JSON.parse(item.value).forEach(item => {
        if (item.name) {
          list.push(<div>{item.name}</div>);
        }
      });

      return list;
    }
    // 数字 金额
    if (item.type === 6 || item.type === 8) {
      const reg = item.value.indexOf('.') > -1 ? /(\d{1,3})(?=(?:\d{3})+\.)/g : /(\d{1,3})(?=(?:\d{3})+$)/g;
      return item.value.replace(reg, '$1,');
    }

    return item.value;
  }

  /**
   * 返回自定义字段单位
   * @param  {object} item
   */
  returnUnit(item) {
    return (item.type === 6 || item.type === 8) && this.returnCustonValue(item) !== '' ? item.unit : '';
  }

  /**
   * 返回任务中心
   */
  returnTaskCenter() {
    navigateTo('/apps/task/center');
  }

  render() {
    const data = this.state.data;
    const href = location.href;
    const hasQRCode = this.props.options.indexOf('qrCode') >= 0;
    let controls;

    // 处理数据
    if (data) {
      data.checklist = data.checklist || [];
      data.subTask = data.subTask || [];
      data.controls = data.controls || [];
      data.member = data.member || [];
      data.tag = data.tag || [];
      controls = _.groupBy(data.controls, 'row');
    }

    let url =
      md.global.Config.AjaxApiUrl +
      'code/CreateQrCodeImage?url=' +
      encodeURIComponent(`${md.global.Config.WebUrl}apps/task/task_${this.props.taskId}`);

    return (
      <div className="printTask">
        <div className="printTaskHead">
          <div className="printTaskMain">
            <span className="printTaskBtn Left" onClick={() => this.returnTaskCenter()}>
              {_l('返回任务中心')}
            </span>
            <span className="printTaskBtn Right" onClick={() => this.print()}>
              {_l('打印任务')}
            </span>
          </div>
        </div>

        {data ? (
          <div className="printTaskMain printTaskContent relative">
            {hasQRCode ? (
              <div className="printTaskQRCode">
                <img src={url} />
                {_l('扫一扫查看')}
              </div>
            ) : undefined}

            <div className={cx('printTaskName', { pRight100: hasQRCode })}>{data.taskName}</div>

            <div className={cx('flexRow', { pRight100: hasQRCode })}>
              <div className="printTaskLabel">{_l('关联项目：')}</div>
              <div className="flex">{data.folder}</div>
            </div>
            <div className={cx('flexRow', { pRight100: hasQRCode })}>
              <div className="printTaskLabel">{_l('母任务：')}</div>
              <div className="flex">{data.parent}</div>
            </div>
            <div className="flexRow borderLine">
              <div className="printTaskLabel">{_l('任务详情：')}</div>
              <div className="flex" dangerouslySetInnerHTML={{ __html: htmlDecodeReg(data.desc) }} />
            </div>

            <div className="flexRow">
              <div className="printTaskLabel">{_l('主负责人：')}</div>
              <div className="flex">{data.charger}</div>
            </div>
            <div className="flexRow">
              <div className="printTaskLabel">{_l('任务参与者：')}</div>
              <div className="flex">{data.member.join('、')}</div>
            </div>
            <div className="flexRow">
              <div className="printTaskLabel">{_l('计划开始 - 计划结束：')}</div>
              <div className="flex">{(data.startTime || '') + ' - ' + (data.deadline || '')}</div>
            </div>
            <div className="flexRow">
              <div className="printTaskLabel">{_l('实际开始 - 实际结束：')}</div>
              <div className="flex">{(data.actualStartTime || '') + ' - ' + (data.completedTime || '')}</div>
            </div>
            <div className="flexRow borderLine">
              <div className="printTaskLabel">{_l('分类标签：')}</div>
              <div className="flex">{data.tag.join('、')}</div>
            </div>

            <div className="flexRow borderLine">
              <div className="printTaskLabel">
                {_l('检查清单：')}
                <br />
                {data.checklist.length ? (
                  <span>
                    {_.filter(data.checklist, 'status', true).length}/{data.checklist.length}
                  </span>
                ) : undefined}
              </div>
              <div className="flex">
                <ul>
                  {_.map(data.checklist, (item, index) => {
                    return (
                      <li key={index} className={cx({ lineThrough: item.status })}>
                        {item.name}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="flexRow">
              <div className="printTaskLabel">
                {_l('子任务：')}
                <br />
                {data.subTask.length ? (
                  <span>
                    {_.filter(data.subTask, 'status', 1).length}/{data.subTask.length}
                  </span>
                ) : undefined}
              </div>
              <div className="flex">
                <ul>
                  {_.map(data.subTask, (item, index) => {
                    return (
                      <li key={index} className={cx({ lineThrough: item.status })}>
                        {item.name}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {data.controls.length ? (
              <table cellPadding="0" cellSpacing="0" className="printTaskTable">
                <tbody>
                  {_.map(controls, (items, index) => {
                    // 2个控件
                    if (items.length === 2) {
                      items = items.sort((a, b) => (a.col > b.col ? 1 : -1));
                      return (
                        <tr key={index}>
                          <td className="printTaskTableW1">{items[0].controlName}</td>
                          <td className="printTaskTableM printTaskTableW2">
                            {this.returnCustonValue(items[0])} {this.returnUnit(items[0])}
                          </td>
                          <td className="printTaskTableW1">{items[1].controlName}</td>
                          <td className="printTaskTableM">
                            {this.returnCustonValue(items[1])} {this.returnUnit(items[1])}
                          </td>
                        </tr>
                      );
                    }

                    // 控件占2格
                    if (this.returnControlsColumns(items[0].type) === 2 && !items[0].half) {
                      return (
                        <tr key={index}>
                          <td className="printTaskTableW1">{items[0].controlName}</td>
                          <td className="printTaskTableM" colSpan="3">
                            {this.returnCustonValue(items[0])}
                          </td>
                        </tr>
                      );
                    }

                    // 分割线
                    if (this.returnControlsColumns(items[0].type) === 3) {
                      return (
                        <tr key={index}>
                          <td colSpan="4">
                            <div className="printTaskTableBurst">
                              <div className="printTaskTableBurstLine" />
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    // 左单控件
                    if (items[0].col === 0) {
                      return (
                        <tr key={index}>
                          <td className="printTaskTableW1">{items[0].controlName}</td>
                          <td className="printTaskTableM printTaskTableW2">
                            {this.returnCustonValue(items[0])} {this.returnUnit(items[0])}
                          </td>
                          <td className="printTaskTableW1" />
                          <td className="printTaskTableM" />
                        </tr>
                      );
                    }

                    // 右单控件
                    return (
                      <tr key={index}>
                        <td className="printTaskTableW1" />
                        <td className="printTaskTableM printTaskTableW2" />
                        <td className="printTaskTableW1">{items[0].controlName}</td>
                        <td className="printTaskTableM">
                          {this.returnCustonValue(items[0])} {this.returnUnit(items[0])}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : undefined}
          </div>
        ) : (
          <LoadDiv />
        )}

        <div className="printTaskFooter">
          <div className="printTaskMain">
            <span className="printTaskBtn" onClick={() => this.print()}>
              {_l('打印任务')}
            </span>
          </div>
        </div>
      </div>
    );
  }
}
