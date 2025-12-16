import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { getIconByType } from 'src/pages/widgetConfig/util';
import lookPng from './img/s.png';
import { formatFields, getDecryptCheckboxProps, getFunction, getSectionIds } from './util';

const Wrap = styled.div`
  text-align: left;
  .title {
    font-weight: 400;
  }
  .fieldsHeader {
    position: sticky;
    top: 0;
    padding: 13px;
    background: #fff;
    z-index: 1;
    border-bottom: 1px solid #eaeaea;
  }
  .filedName {
    width: 260px;
    padding-left: 2px;
    .isParent {
      margin-left: -18px;
    }
  }
  .fieldItem {
    border-bottom: 1px solid #eaeaea;
    padding: 13px;
    .isDecrypt {
      padding: 3px 5px;
      background: #ffe49b;
      border-radius: 3px 3px 3px 3px;
    }
    &.isChild {
      margin-left: 24px;
      .filedName {
        width: 236px;
      }
    }
  }
`;

export default class extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      fields: this.props.fields,
      closeList: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    if (_.isEqual(nextProps.fields, this.props.fields)) {
      this.setState({
        fields: nextProps.fields,
      });
    }
  }

  changeFields = (checked, fieldId, key) => {
    const { onChange } = this.props;
    const fields = formatFields(checked, fieldId, key, this.state.fields);
    this.setState(
      {
        fields,
      },
      () => {
        onChange({
          fields,
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

  renderLiCon = ({
    fieldName,
    fieldId,
    type,
    notAdd,
    notEdit,
    notRead,
    isDecrypt,
    hideWhenAdded,
    dataMask,
    sectionId,
  }) => {
    const { fields, closeList } = this.state;
    const { formatViews, sheet } = this.props;
    const { showEdit } = formatViews(sheet.views);
    const showAdd = sheet.canAdd;
    const showDecrypt = fields.filter(o => o.dataMask === '1').length > 0;
    const isDecryptField = dataMask === '1';
    const ids = getSectionIds(fields);
    if (closeList.includes(sectionId)) {
      return '';
    }

    return (
      <div className={cx('fieldItem flexRow alignItemsCenter', { isChild: sectionId })} key={fieldId}>
        <div
          className={cx('filedName flexRow alignItemsCenter', { Hand: ids.includes(fieldId) })}
          onClick={() => {
            this.setState({
              closeList: closeList.includes(fieldId) ? closeList.filter(o => o !== fieldId) : closeList.concat(fieldId),
            });
          }}
        >
          {ids.includes(fieldId) && (
            <i
              className={cx(
                'icon mRight6 Font14 isParent',
                !closeList.includes(fieldId) ? 'icon-arrow-down' : 'icon-arrow-right-tip',
              )}
            ></i>
          )}
          {<i className={cx('icon Gray_9e mRight6 Font16', 'icon-' + getIconByType(type))}></i>}
          <span className="flex">
            {fieldName || (type === 22 ? _l('分段') : _l('备注'))}
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
          {![52].includes(type) && (
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
            {isDecryptField && <Checkbox checked={isDecrypt} value={fieldId} onClick={this.changeFieldDecryptAuth} />}
          </div>
        )}
      </div>
    );
  };

  renderList = () => {
    const { fields } = this.state;
    return (
      <div className="">
        {_.map(fields, data => {
          return this.renderLiCon(data);
        })}
      </div>
    );
  };

  renderContent() {
    const { formatViews, sheet } = this.props;
    const { showEdit } = formatViews(sheet.views);
    const showAdd = sheet.canAdd;
    const { fields } = this.state;

    const addProps = getFunction('notAdd')(fields.filter(o => !o.hideWhenAdded));
    const readProps = getFunction('notRead')(fields);
    const editProps = getFunction('notEdit')(fields);
    const decryptProps = getDecryptCheckboxProps(fields);
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
            <Tooltip title={_l('指“新增记录”时，可查看的字段')}>
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
                {_l('解码')}
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
