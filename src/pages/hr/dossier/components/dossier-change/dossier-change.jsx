import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import moment from 'moment';
import Svg from 'ming-ui/components/Svg';

import { CHANGE_TYPE } from '../../constants/';
import './dossier-change.less';
import EmptyIcon from '../../common/EmptyIcon';

export default class DossierChange extends Component {
  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        account: PropTypes.shape({
          accountId: PropTypes.string,
          avatar: PropTypes.string,
          fullName: PropTypes.string,
        }),
        content: PropTypes.string,
        date: PropTypes.string,
        employeeId: PropTypes.string,
        department: PropTypes.string,
        type: PropTypes.number,
        operateAccount: PropTypes.shape({
          accountId: PropTypes.string,
          avatar: PropTypes.string,
          fullName: PropTypes.string,
        }),
      })
    ),
  };
  static defaultProps = {
    data: [],
    name: '',
  };
  renderDateBox(item, i, isFirst, isLast) {
    return (
      <div className="changeContaienr" key={item.date}>
        {item.changes.map((change, index) => this.renderBox(change, index, index === 0 && isFirst, index === item.changes.length - 1 && isLast, item.date))}
      </div>
    );
  }
  renderBox(change, i, isFirst, isLast, date) {
    return (
      <div className="changeBox" key={change.employeeId + '-' + i}>
        <div className="changeTimeline flexColumn">
          <div className={cx('flex Relative', { changeLineBorder: !isFirst })}>
            {i === 0 && <div className="dossierChangeDate">{date}</div>}
            {i === 0 && <div className="changeCircle ThemeBGColor3" />}
          </div>
          <div className={cx('flex', { changeLineBorder: !isLast })} />
        </div>
        <div className="changeTimelineWall" />
        <div className={cx('changeCard', { mTop8: i === 0 })}>{this.renderChangeCard(change)}</div>
      </div>
    );
  }
  renderChangeCard(change) {
    let svg = '';
    let tip = '';
    switch (change.type) {
      case CHANGE_TYPE.DIMISSION:
        svg = 'hr_dimission';
        tip = _l('工作状态');
        break;
      case CHANGE_TYPE.INDUCTION:
        svg = 'hr_entry';
        tip = _l('入职');
        break;
      case CHANGE_TYPE.OTHER:
        svg = 'hr_date';
        tip = _l('其他');
        break;
      case CHANGE_TYPE.PROMOTE:
        svg = 'hr_promotion';
        tip = _l('晋升');
        break;
      case CHANGE_TYPE.PROMOTION:
        svg = 'hr_official_staff';
        tip = _l('转正');
        break;
      case CHANGE_TYPE.TRANSFER:
        svg = 'hr_shift_jobs';
        tip = _l('调岗');
        break;
      case CHANGE_TYPE.REINDUCTION:
        svg = 'hr_entry';
        tip = _l('重新入职');
        break;
      case CHANGE_TYPE.TOFULL:
        svg = 'hr_official_staff';
        tip = _l('转全职员工');
        break;
    }
    return (
      <div className="flexRow">
        <div className="changeCardIcon">
          <Svg size="48" icon={svg} />
        </div>
        <div className="flexColumn flex">
          <div className="flexMiddle spaceBetween mBottom8">
            <span className="Font16">{tip}</span>
            <span className="Gray_9e Font12">{change.date}</span>
          </div>
          {this.getStatusText(change)}
          <div className="Font12 mTop4">
            <span className="Gray_9e">{_l('办理人') + '：'}</span>
            <span className="Gray_9e">{change.operateAccount.fullName}</span>
          </div>
        </div>
      </div>
    );
  }
  getTextByChangeItemType(type) {
    switch (type) {
      case 0:
        return _l('岗位');
      case 1:
        return _l('职位');
      case 2:
        return _l('职级');
      case 3:
        return _l('工作地');
      case 4:
        return _l('合同');
      case 5:
        return _l('直属上司');
      case 6:
        return _l('重新入职');
      default:
        return '';
    }
  }
  getStatusText(change) {
    if (change.type === CHANGE_TYPE.INDUCTION) {
      return (
        <div className="">
          <div>
            <span className="Gray_9e">{_l('工作状态：')}</span>
            <span>{_l(' “入职” ')}</span>
          </div>
        </div>
      );
    } else if (change.type === CHANGE_TYPE.DIMISSION) {
      return (
        <div className="">
          <div>
            <span className="Gray_9e">{_l('工作状态：')}</span>
            <span>{_l(' “正式” ')}</span>
            <span className="Gray_9e">{_l('变更为')}</span>
            <span>{_l(' “离职” ')}</span>
          </div>
        </div>
      );
    } else if (change.type === CHANGE_TYPE.PROMOTION) {
      return (
        <div className="">
          <div>
            <span className="Gray_9e">{_l('工作状态：')}</span>
            <span>{_l(' “试用” ')}</span>
            <span className="Gray_9e">{_l('变更为')}</span>
            <span>{_l(' “正式” ')}</span>
          </div>
        </div>
      );
    } else if (change.type === CHANGE_TYPE.REINDUCTION) {
      return (
        <div className="">
          <div>
            <span className="Gray_9e">{_l('工作状态：')}</span>
            <span>{_l(' “离职” ')}</span>
            <span className="Gray_9e">{_l('变更为')}</span>
            <span>{_l(' “入职” ')}</span>
          </div>
        </div>
      );
    } else if (change.type === CHANGE_TYPE.TOFULL) {
      return (
        <div className="">
          <div>
            <span className="Gray_9e">{_l('工作状态：')}</span>
            <span>{_l(' “实习人员/兼职人员” ')}</span>
            <span className="Gray_9e">{_l('变更为')}</span>
            <span>{_l(' “全职员工” ')}</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="LineHeight22">
          {change.items
            ? change.items.map(item => (
              <div>
                <span className="Gray_9e">{this.getTextByChangeItemType(item.type) + '：'}</span>
                <span>{` “${item.oldName || ''}” `}</span>
                <span className="Gray_9e">{_l('变更为')}</span>
                <span>{` “${item.newName || ''}” `}</span>
              </div>
              ))
            : null}
        </div>
      );
    }
  }
  render() {
    const data = this.props.data;
    const renderData = []; // 为日期分组
    const dates = [];
    data.sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf()).forEach((change) => {
      let date = '';
      if (moment(change.date).isSame(moment(), 'year')) {
        date = change.date.replace(/^\d\d\d\d-|\s.*$/g, '');
      } else {
        date = change.date.replace(/\s.*$/, '');
      }
      const index = dates.indexOf(date);
      if (index < 0) {
        renderData.push({
          date,
          changes: [change],
        });
        dates.push(date);
      } else {
        renderData[index].changes.push(change);
      }
    });
    return (
      <div className="dossier-user-formgroup dossierChange">
        <h3 className="dossier-user-formgroup-name ThemeAfterBGColor3">
          <span>{this.props.name}</span>
        </h3>
        <div className="mTop16 mBottom16 mLeft10 mRight10 flexRow flexWrap">
          {!renderData.length ? (
            <div className="flexCenter flexMiddle flex">
              <EmptyIcon icon="hr_record" text={_l('暂无人事异动记录')} size="100" width="120" height="120" />
            </div>
          ) : (
            <div className="flexColumn flex">{renderData.map((item, index) => this.renderDateBox(item, index, index === 0, index === data.length - 1))}</div>
          )}
        </div>
      </div>
    );
  }
}
