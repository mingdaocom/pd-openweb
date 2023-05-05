import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Icon, Tooltip } from 'ming-ui';
import { fieldPropType } from 'src/pages/Role/config.js';
import styled from 'styled-components';
import { getIconByType } from 'src/pages/widgetConfig/util';
import cx from 'classnames';
import lookPng from './img/s.png';
import _ from 'lodash';

const Wrap = styled.div`
  text-align: left;
  .title {
    font-weight: 400;
  }
  .filedName {
    flex: 2;
  }
  .fieldsHeader {
    position: sticky;
    top: 0;
    padding: 13px;
    background: #fff;
    z-index: 1;
    border-bottom: 1px solid #eaeaea;
  }
  .fieldItem {
    border-bottom: 1px solid #eaeaea;
    padding: 13px;
    .isDecrypt {
      padding: 3px 5px;
      background: #ffe49b;
      border-radius: 3px 3px 3px 3px;
    }
  }
`;
const getFunction = function (keyName) {
  return function (fields) {
    const isAll = _.every(fields, ({ [keyName]: value }) => !value);
    const isPart = !isAll && _.some(fields, ({ [keyName]: value }) => !value);
    return { isAll, isPart };
  };
};

export default class extends React.PureComponent {
  static propTypes = {
    // showEdit: PropTypes.bool,
    // showAdd: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    fields: PropTypes.arrayOf(fieldPropType),
  };

  constructor(props) {
    super(props);

    this.state = {
      fields: this.props.fields,
    };

    this.getAddCheckboxProps = getFunction('notAdd');
    this.getEditCheckboxProps = getFunction('notEdit');
    this.getReadCheckboxProps = getFunction('notRead');
  }

  componentWillReceiveProps(nextProps) {
    if (_.isEqual(nextProps.fields, this.props.fields)) {
      this.setState({
        fields: nextProps.fields,
      });
    }
  }

  getDecryptCheckboxProps = () => {
    const { fields = [] } = this.state;
    let fieldData = fields.filter(o => o.dataMask === '1');
    const isAll = _.every(fieldData, o => o.isDecrypt);
    const isPart = !isAll && _.some(fieldData, o => o.isDecrypt);
    return { isAll, isPart };
  };

  changeFields = (checked, fieldId, key) => {
    const { onChange } = this.props;
    const { fields } = this.state;
    const changeField = field => {
      if (key === 'notEdit' && !checked) {
        return {
          ...field,
          [key]: checked,
          notRead: checked,
        };
      }
      if (key === 'notRead' && checked) {
        return {
          ...field,
          notRead: true,
          notEdit: true,
          isDecrypt: false, //取消查看，同时取消解密
        };
      }
      //勾选解密时，同时勾选查看
      if (key === 'isDecrypt' && checked && field.dataMask === '1') {
        return {
          ...field,
          isDecrypt: true,
          notRead: false,
        };
      }
      return {
        ...field,
        [key]: checked,
      };
    };
    let fieldsN = _.map(fields, field => {
      // 全选切换
      if (fieldId === undefined) {
        return changeField(field);
      }
      // 单选切换
      if (field.fieldId === fieldId) {
        return changeField(field);
      }
      return field;
    });
    this.setState(
      {
        fields: fieldsN,
      },
      () => {
        onChange({
          fields: fieldsN,
        });
      },
    );
  };

  changeFieldReadAuth = (checked, fieldId) => {
    this.changeFields(checked, fieldId, 'notRead');
  };

  changeFieldEditAuth = (checked, fieldId) => {
    this.changeFields(checked, fieldId, 'notEdit');
  };

  changeFieldAddAuth = (checked, fieldId) => {
    this.changeFields(checked, fieldId, 'notAdd');
  };

  changeFieldDecryptAuth = (checked, fieldId) => {
    this.changeFields(!checked, fieldId, 'isDecrypt');
  };

  renderList = () => {
    const { formatViews, sheet } = this.props;
    const { showEdit, showRead } = formatViews(sheet.views);
    const showAdd = sheet.canAdd;
    const { fields } = this.state;
    const showDecrypt = fields.filter(o => o.dataMask === '1').length > 0;
    return (
      <div className="">
        {_.map(
          fields,
          ({ fieldName, fieldId, type, notAdd, notEdit, notRead, isDecrypt, isReadField, hideWhenAdded, dataMask }) => {
            const isDecryptField = dataMask === '1';
            return (
              <div className={'fieldItem flexRow alignItemsCenter'} key={fieldId}>
                <div className={'filedName flexRow alignItemsCenter'}>
                  {<i className={cx('icon Gray_9e mRight6 Font16', 'icon-' + getIconByType(type))}></i>}
                  <span className="flex">
                    {fieldName || (type === 22 ? _l('分割线') : _l('备注'))}
                    {isDecryptField && <span className="isDecrypt mLeft3">{_l('脱敏')}</span>}
                  </span>
                </div>
                <div className={'filedSetting flex'}>
                  {!hideWhenAdded && (
                    <Checkbox
                      checked={showAdd ? !notAdd : false}
                      disabled={!showAdd}
                      value={fieldId}
                      onClick={this.changeFieldAddAuth}
                    />
                  )}
                </div>
                <div className={'filedSetting flex'}>
                  <Checkbox checked={!notRead} value={fieldId} onClick={this.changeFieldReadAuth} />
                </div>
                <div className={'filedSetting flex'}>
                  {!isReadField && (
                    <Checkbox
                      checked={showEdit ? !notEdit : false}
                      disabled={!showEdit}
                      value={fieldId}
                      onClick={this.changeFieldEditAuth}
                    />
                  )}
                </div>
                {/* 解密 */}
                {showDecrypt && (
                  <div className={'filedSetting flex'}>
                    {isDecryptField && (
                      <Checkbox checked={isDecrypt} value={fieldId} onClick={this.changeFieldDecryptAuth} />
                    )}
                  </div>
                )}
              </div>
            );
          },
        )}
      </div>
    );
  };

  renderContent() {
    const { formatViews, sheet } = this.props;
    const { showEdit, showRead } = formatViews(sheet.views);
    const showAdd = sheet.canAdd;
    const { fields } = this.state;

    const addProps = this.getAddCheckboxProps(fields);
    const readProps = this.getReadCheckboxProps(fields);
    const editProps = this.getEditCheckboxProps(fields);
    const decryptProps = this.getDecryptCheckboxProps();
    const showDecrypt = fields.filter(o => o.dataMask === '1').length > 0;

    return (
      <Wrap>
        <div className="mTop30 Font16 title LineHeight26">
          <img src={lookPng} height={26} className="mRight5 TxtMiddle" />
          {_l('可新增、查看、编辑哪些字段？')}
        </div>
        <div className={'fieldsHeader Gray flexRow alignItemsCenter mTop20'}>
          <div className={'filedName bold'}>{_l('名称')}</div>
          <div className={'filedSetting flex Bold flexRow alignItemsCenter'}>
            <Checkbox
              checked={showAdd ? addProps.isAll : false}
              disabled={!showAdd}
              clearselected={showAdd ? addProps.isPart : false}
              onClick={this.changeFieldAddAuth}
            >
              {_l('新增')}
            </Checkbox>
            <Tooltip text={<span>{_l('指“新增记录”时，可查看的字段')} </span>} popupPlacement="top">
              <i className="icon-info_outline Font16 Gray_9e mLeft3 TxtMiddle" />
            </Tooltip>
          </div>
          <div className={'filedSetting flex Bold'}>
            <Checkbox checked={readProps.isAll} clearselected={readProps.isPart} onClick={this.changeFieldReadAuth}>
              {_l('查看')}
            </Checkbox>
          </div>
          <div className={'filedSetting flex Bold'}>
            <Checkbox
              checked={showEdit ? editProps.isAll : false}
              disabled={!showEdit}
              clearselected={showEdit ? editProps.isPart : false}
              onClick={this.changeFieldEditAuth}
            >
              {_l('编辑')}
            </Checkbox>
          </div>
          {showDecrypt && (
            <div className={'filedSetting flex Bold'}>
              <Checkbox
                checked={decryptProps.isAll}
                clearselected={decryptProps.isPart}
                onClick={this.changeFieldDecryptAuth}
              >
                {_l('解密')}
              </Checkbox>
            </div>
          )}
        </div>
        {this.renderList()}
      </Wrap>
    );
  }

  render() {
    return <div>{this.renderContent()}</div>;
  }
}
