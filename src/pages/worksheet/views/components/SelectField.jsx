import React, { Component, Fragment } from 'react';
import { string, number, arrayOf, oneOf, shape, func } from 'prop-types';
import styled from 'styled-components';
import { RadioGroup, Icon, ScrollView } from 'ming-ui';
import { FlexCenter, Text, Button, RevertButton } from 'worksheet/styled';
import ConfigureHierarchyView from './configureHierarchyView';
import _ from 'lodash';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util.js';

const VIEW_TYPE_INFO = {
  1: {
    icon: 'kanban',
    color: '#00BCD4',
    title: _l('看板视图'),
    detail: _l(
      '选择一个字段，数据将按照此字段中的字段值分组显示在看板中。支持字段：单选、多选、等级、人员、部门、组织角色、关联表记录（单条）',
    ),
  },
  2: {
    icon: 'hierarchy',
    color: '#FF3D3D',
    title: _l('层级'),
    detail: _l(
      '选择一组一对多关系的关联本表的“关联表”字段，数据将按照此字段的父级（单条）、子级（多条）关系来从左往右排列构成树状层级',
    ),
  },
  4: {
    icon: 'event',
    color: '#00C345',
    title: _l('日历视图'),
    detail: _l('选择一个日期类型的字段，数据将按照此字段中的日期显示在日历上。'),
  },
  5: {
    icon: 'gantt',
    color: '#8A2AEB',
    title: _l('甘特图'),
    detail: _l('根据任务时间和任务之间建立的依赖关系全局显示任务安排。'),
  },
  7: {
    icon: 'person_three',
    color: '#2F4EEB',
    title: _l('资源视图'),
    detail: _l(
      '选择一个字段作为资源，数据将按照该资源的占用时间显示在时间轴上。支持的字段：选项、等级、人员、部门、组织角色、关联记录（单条、多条）',
    ),
  },
  8: {
    icon: 'location_map',
    color: '#EB2F96',
    title: _l('地图'),
    detail: _l('选择一个定位字段，前200条数据将按照此字段中的位置显示在地图中。'),
  },
};

const SelectFieldWrap = styled.div`
  width: 640px;
  margin: 10px auto;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 1px 4px rgb(0 0 0 / 16%);
  overflow: auto;
  max-height: 100%;
  .hintText {
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9e9e9e;
  }
`;

const BoardTitleWrap = styled(FlexCenter)`
  align-items: end;
  padding: 20px 26px;
  border-bottom: 1px solid #eaeaea;
  h3 {
    margin-top: 0;
    margin-bottom: 6px;
    font-size: 17px;
  }
  p {
    margin: 0;
    color: #151515;
  }
`;
const BoardTitle = styled.div`
  margin-left: 24px;
`;

const DisplayFieldWrap = styled.div`
  padding: 20px 24px;
  h5 {
    margin-top: 0;
    font-size: 14px;
    margin-bottom: 20px;
    margin-top: 8px;
  }
  .empty {
    margin-top: 12px;
    margin-bottom: 32px;
    font-weight: normal;
    color: #757575;
  }

  .Radio {
    margin-bottom: 12px;
  }
  .selectFieldWrap {
    min-height: 50px;
  }
`;
const VerifyButton = styled(Button)`
  margin-top: 12px;
`;

export default class SelectField extends Component {
  static propTypes = {
    fields: arrayOf(shape({ type: number })),
    viewType: oneOf([1, 2, 4, 5, 8]),
    handleSelect: func,
    toCustomWidget: func,
  };
  static defaultProps = {
    viewType: 1,
    handleSelect: _.noop,
    toCustomWidget: _.noop,
  };
  constructor(props) {
    super();
    const { fields } = props;
    this.state = {
      checkedValue: _.get(fields, [0, 'value']),
    };
  }
  componentDidMount() {
    this.removeEvent = this.bindEvent();
    this.computeHeight();
  }

  componentDidUpdate() {
    this.computeHeight();
  }
  componentWillUnmount() {
    this.removeEvent();
  }
  // 绑定事件
  bindEvent = () => {
    document.addEventListener('readystatechange', this.computeHeight);
    return () => {
      document.removeEventListener('readystatechange', this.computeHeight);
    };
  };
  computeHeight = () => {
    const $title = document.querySelector('h5');
    const $content = document.querySelector('.RadioGroup');
    if (!$title) return;
    const { bottom } = $title.getBoundingClientRect();
    const innerHeight = window.innerHeight;
    const $scrollWrap = document.querySelector('.selectFieldWrap');
    if ($scrollWrap) {
      $($scrollWrap).height(Math.min($content.offsetHeight, innerHeight - bottom - 116));
      if (
        $content.offsetHeight < innerHeight - bottom - 116 &&
        !$('.mapViewWrap .selectFieldWrap .nano-pane').attr('style')
      ) {
        $('.mapViewWrap .selectFieldWrap .nano-pane').attr('style', 'display: none;');
      }
    }
  };
  renderContent = () => {
    let { fields, viewType, handleSelect, toCustomWidget, sheetSwitchPermit, ...rest } = this.props;
    const { checkedValue } = this.state;
    const EditButton = viewType === 8 ? VerifyButton : RevertButton;
    if (![4, 5, 7].includes(viewType)) {
      fields = setSysWorkflowTimeControlFormat(fields, sheetSwitchPermit, 'value');
    }
    if ([1, 8].includes(viewType)) {
      return fields.length > 0 ? (
        <DisplayFieldWrap>
          <h5>{viewType === 1 ? _l('选择分组字段') : _l('选择字段')}</h5>
          <ScrollView className="selectFieldWrap">
            <RadioGroup
              data={fields}
              onChange={value => this.setState({ checkedValue: value })}
              checkedValue={checkedValue}
              vertical
            />
          </ScrollView>
          <VerifyButton onClick={() => handleSelect({ viewControl: checkedValue })}>{_l('确认')}</VerifyButton>
        </DisplayFieldWrap>
      ) : (
        <DisplayFieldWrap>
          <h5 className="empty">{_l('当前工作表中没有符合的字段，请先去添加一个')}</h5>
          <EditButton onClick={toCustomWidget}>{_l('编辑表单')}</EditButton>
        </DisplayFieldWrap>
      );
    } else if ([4, 5, 7].includes(viewType)) {
      return <DisplayFieldWrap>{this.props.context}</DisplayFieldWrap>;
    }
    return <ConfigureHierarchyView fields={fields} handleSelect={handleSelect} {...rest} />;
  };
  render() {
    const { isCharge, viewType } = this.props;
    const { title, detail, icon, color } = VIEW_TYPE_INFO[String(viewType)];
    return (
      <SelectFieldWrap>
        {isCharge ? (
          <Fragment>
            <BoardTitleWrap>
              <Icon style={{ color, fontSize: '56px' }} icon={icon} />
              <BoardTitle>
                <h3>{title}</h3>
                <Text color="#757575">{detail}</Text>
              </BoardTitle>
            </BoardTitleWrap>
            {this.renderContent()}
          </Fragment>
        ) : (
          <div className="hintText">{_l('视图配置错误,请联系管理员')}</div>
        )}
      </SelectFieldWrap>
    );
  }
}
