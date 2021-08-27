import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import UiFormContainer from '../form-container';
import UiFormGroup from '../form-group';
import MaterialAttachment from '../../material-attachment/';
import DossierChange from '../../dossier-change/';
import { FORM_VIEW_ID } from '../../../constants/';

class FormView extends Component {
  formElements = {};

  /**
   * 保存表单
   */
  saveForm = (groupId, data) => {
    if (this.props.saveForm) {
      return this.props.saveForm(groupId, data);
    }
  };

  /**
   * 渲染 UiFormContainer 列表
   */
  renderContents = () => {
    const contents = [];

    let groupList = [];

    this.props.data.map((item, i, list) => {
      if (parseInt(item.id, 10) === FORM_VIEW_ID.DOSSIER_CHANGE) {
        groupList.push(
          <DossierChange
            key={`formcontainer-${i}`}
            ref={(el) => {
              this.formElements[item.id] = ReactDOM.findDOMNode(el);
            }}
            {...item}
          />
        );
      } else if (parseInt(item.id, 10) === FORM_VIEW_ID.MATERIAL_ATTACHMENT) {
        // 材料附件
        groupList.push(
          <MaterialAttachment
            key={`formcontainer-${i}`}
            employeeId={this.props.employeeId}
            editable={this.props.editable}
            ref={(el) => {
              this.formElements[item.id] = ReactDOM.findDOMNode(el);
            }}
            {...item}
          />
        );
      } else if (item.type && item.type === 'divider') {
        // divider
        if (groupList.length) {
          contents.push(<UiFormContainer key={`formcontainer-${i}`}>{groupList}</UiFormContainer>);

          groupList = [];
        }
      } else {
        // group
        groupList.push(
          <UiFormGroup
            key={`formgroup-${i}`}
            {...item}
            editable={this.props.editable}
            ref={(el) => {
              this.formElements[item.id] = ReactDOM.findDOMNode(el);
            }}
            saveForm={(groupId, data) => {
              return this.saveForm(groupId, data);
            }}
          />
        );
      }
      return null;
    });

    if (groupList.length) {
      contents.push(<UiFormContainer key="formcontainer-0">{groupList}</UiFormContainer>);

      groupList = [];
    }

    return contents;
  };

  render() {
    let contents = [];
    if (this.props.data && this.props.data.length) {
      contents = this.renderContents();
    }

    return <div>{contents}</div>;
  }
}

FormView.propTypes = {
  /**
   * 员工 ID
   */
  employeeId: PropTypes.string,
  /**
   * 分组数据
   */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      /**
       * 类型
       * divider - 分组分隔
       */
      type: PropTypes.oneOf(['divider']),
      /**
       * 分组 ID
       */
      id: PropTypes.string,
      /**
       * 分组名称
       */
      name: PropTypes.string,
      /**
       * 表单数据
       */
      data: PropTypes.any,
      /**
       * 子分组
       */
      groups: PropTypes.any,
    })
  ),
  /**
   * 是否可编辑
   */
  editable: PropTypes.bool,
  /**
   * 保存表单
   */
  saveForm: PropTypes.func,
  /**
   * 改变activeType
   */
  changeActiveType: PropTypes.func,
};

FormView.defaultProps = {
  employeeId: '',
  data: [],
  editable: true,
  saveForm: () => {
    //
  },
};

export default FormView;
