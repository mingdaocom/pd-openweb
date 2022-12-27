import React, { Component, Fragment } from 'react';
import { Button, Icon } from 'ming-ui';
import Trigger from 'rc-trigger';
import cx from 'classnames';
import './Guidance.less';
import _ from 'lodash';

const maxGuide = 7;

export default class Guidance extends Component {
  constructor(props) {
    super(props);
    const guide = localStorage.getItem('guide');
    this.state = {
      guide: guide ? Number(guide) : 1,
    }
  }
  componentDidMount() {
    this.saveGuide();
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.sheetListVisible !== nextProps.sheetListVisible) {
      setTimeout(() => {
        this.setState({
          guide: this.state.guide,
        });
      }, 500);
    }
  }
  getGuideTextList(guide) {
    const guideTextList = [{
      title: _l('你好，%0！', md.global.Account.fullname),
      info: _l('这里是一个应用，你所有的业务数据、流程和用户都可以在这里进行管理。我们一起来看看一个应用是如何搭建和构成的吧！'),
    }, {
      title: _l('工作表'),
      info: (
        <Fragment>
          <div>{_l('为你的每一个业务对象创建工作表，如：线索表、客户表、订单表。')}</div>
          <div className="mTop10">{_l('你可以根据业务数据自定义工作表字段，并建立数据关联。')}</div>
        </Fragment>
      ),
    }, {
      title: _l('视图'),
      info: (
        <Fragment>
          <div>{_l('添加视图，你可以根据业务需要分组显示工作表数据。如：未生效订单、已生效订单。')}</div>
          <div className="mTop10">{_l('支持：表格、看板、日历、画廊等多种视图呈现方式。')}</div>
        </Fragment>
      ),
    }, {
      title: _l('自定义页面'),
      info: _l('创建自定义页面。自由配置页面按钮、统计图、嵌入链接等，减少繁琐操作，并快速掌握宏观数据情况。'),
    }, {
      title: _l('用户和角色'),
      info: _l('为你的应用添加用户。你可以创建角色来管理用户权限，一条数据，谁能查看，谁能修改，谁能删除，都能自由设定。'),
    }, {
      title: _l('工作流'),
      info: _l('通过工作流，你可以将业务中的重复工作自动化执行，还可以发通知、短信，对接外部系统，彻底打通上下游业务。'),
    }, {
      title: _l('恭喜！你完成了教学'),
      info: _l('现在开始搭建你自己的业务系统吧。'),
    }];
    return guideTextList[guide];
  }
  getElStyle(el, extraWidth = 0, extraHeight = 0, direction = 'left') {
    if (_.isEmpty(el)) return {};
    const { width, height, top, left, right } = el.getBoundingClientRect();
    const base = {
      width: width + extraWidth,
      height: height + extraHeight,
      top: top - (extraHeight / 2),
    }
    if (direction == 'left') {
      return {
        ...base,
        left: left - (extraWidth / 2)
      }
    } else {
      return {
        ...base,
        right: document.documentElement.clientWidth - right
      }
    }
  }
  saveGuide = () => {
    const { guide } = this.state;
    safeLocalStorageSetItem('guide', guide);
    if (guide === 2) {
      const moreOperate = document.querySelector('.worksheetCompHeader .moreOperate ul');
      if (moreOperate) {
        const div = document.createElement('div');
        div.classList.add('guidanceCircle');
        div.classList.add('editSheetGuidanceCircle');
        moreOperate.appendChild(div);
      }
      const createNewMenu = document.querySelector('.createNewMenu');
      if (createNewMenu) {
        const div = document.createElement('div');
        div.classList.add('guidanceCircle');
        div.classList.add('addSheetGuidanceCircle');
        createNewMenu.appendChild(div);
      }
    } else {
      $('.editSheetGuidanceCircle').remove();
      $('.addSheetGuidanceCircle').remove();
    }
    if (guide === 4) {
      const createNewMenu = document.querySelector('.createNewMenu');
      if (createNewMenu) {
        const div = document.createElement('div');
        div.classList.add('guidanceCircle');
        div.classList.add('addPageGuidanceCircle');
        createNewMenu.appendChild(div);
      }
    } else {
      $('.addPageGuidanceCircle').remove();
    }
  }
  handleLaststep = () => {
    const { guide } = this.state;
    if (guide === maxGuide) {
      this.setState({
        guide: 1,
      }, this.saveGuide);
    } else {
      this.setState({
        guide: guide - 1,
      }, this.saveGuide);
    }
  }
  handleContinue = () => {
    const { guide } = this.state;
    this.setState({
      guide: guide + 1,
    }, this.saveGuide);
  }
  renderGuidanceItem() {
    const { guide } = this.state;
    if (guide === 2) {
      const createSheetStyle = this.getElStyle(document.querySelector('#createCustomItem'), -8, -8);
      const sheetEditStyle = this.getElStyle(document.querySelector('.sheetHeader .icon-more_horiz'), 13, 13);
      return (
        <Fragment>
          <div className="guidanceCircle" style={createSheetStyle}></div>
          <div className="guidanceInfo" style={{ top: createSheetStyle.top + createSheetStyle.height, left: createSheetStyle.left + createSheetStyle.width / 2 }}>{_l('创建工作表')}</div>
          <div className="guidanceCircle" style={sheetEditStyle}></div>
          <div className="guidanceInfo" style={{ top: sheetEditStyle.top + sheetEditStyle.height, left: sheetEditStyle.left + sheetEditStyle.width / 2 }}>{_l('在这里，你可以编辑表单字段')}</div>
        </Fragment>
      );
    }
    if (guide === 3) {
      const addViewStyle = this.getElStyle(document.querySelector('.worksheetSheet .addViewIcon'), 13, 13);
      return (
        <Fragment>
          <div className="guidanceCircle" style={addViewStyle}></div>
          <div className="guidanceInfo" style={{ top: addViewStyle.top + addViewStyle.height, left: addViewStyle.left + addViewStyle.width / 2 }}>{_l('添加视图')}</div>
        </Fragment>
      );
    }
    if (guide === 4) {
      const createSheetStyle = this.getElStyle(document.querySelector('#createCustomItem'), -8, -8);
      return (
        <Fragment>
          <div className="guidanceCircle" style={createSheetStyle}></div>
          <div className="guidanceInfo" style={{ top: createSheetStyle.top + createSheetStyle.height, left: createSheetStyle.left + createSheetStyle.width / 2 }}>{_l('添加自定义页面')}</div>
        </Fragment>
      );
    }
    if (guide === 5) {
      const userStyle = this.getElStyle(document.querySelectorAll('.appPkgHeaderWrap .appExtensionWrap .appExtensionItem')[1], 5, -8, 'right');
      return (
        <Fragment>
          <div className="guidanceCircle dark" style={userStyle}></div>
          <div className="guidanceInfo dark" style={{ top: userStyle.top + userStyle.height, right: userStyle.right - userStyle.width / 2 }}>{_l('用户和角色')}</div>
        </Fragment>
      );
    }
    if (guide === 6) {
      const workflowStyle = this.getElStyle(document.querySelectorAll('.appPkgHeaderWrap .appExtensionWrap .appExtensionItem')[0], 5, -8, 'right');
      return (
        <Fragment>
          <div className="guidanceCircle dark" style={workflowStyle}></div>
          <div className="guidanceInfo dark" style={{ top: workflowStyle.top + workflowStyle.height, right: workflowStyle.right - workflowStyle.width / 2 }}>{_l('工作流')}</div>
        </Fragment>
      );
    }
    return <Fragment />;
  }
  render() {
    const { guide } = this.state;
    const guideText = this.getGuideTextList(guide - 1);
    return (
      <Fragment>
        <div className="guidanceWrapper">
          <div className={cx('guideImg', `guide_${guide}`)}></div>
          <div className="mTop25 mBottom50">
            <div className="Font20 mBottom8 Bold breakAll">{guideText.title}</div>
            <div className="Font14">{guideText.info}</div>
          </div>
          <div className="flexRow valignWrapper">
            <div className="flex Font13 Gray_75">{`${guide} / ${maxGuide}`}</div>
            {
              guide === 1 ? (
                <div className="mRIght20 Font13 Gray_75 mRight25 pointer skip" onClick={this.props.onClose}>{_l('跳过')}</div>
              ) : (
                <div className="mRIght20 Font13 Gray_75 mRight25 pointer lastStep" onClick={this.handleLaststep}>{guide === maxGuide ? _l('再看一遍') : _l('上一步')}</div>
              )
            }
            {guide === maxGuide ? (
              <Button className="continue" type="primary" onClick={this.props.onClose}>{_l('完成')}</Button>
            ) : (
              <Button className="continue" type="primary" onClick={this.handleContinue}>{guide === 1 ? _l('开始') : _l('继续')}</Button>
            )}
          </div>
        </div>
        <Trigger
          prefixCls="guidanceTrigger"
          popupVisible={true}
          popupAlign={{ points: ['tl', 'bl'] }}
          popup={this.renderGuidanceItem()}
        >
          <div></div>
        </Trigger>
      </Fragment>
    )
  }
}
