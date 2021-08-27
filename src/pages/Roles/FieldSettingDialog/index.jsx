import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, ScrollView, Dialog } from 'ming-ui';
// import memoizeOne from 'memoize-one';
import { fieldPropType } from '../config';

import styles from './style.less?module';

const getFunction = function (keyName) {
  return function (fields) {
    // console.count('format');
    const isAll = _.every(fields, ({ [keyName]: value }) => !value);
    const isPart = !isAll && _.some(fields, ({ [keyName]: value }) => !value);
    return { isAll, isPart };
  };
};

export default class extends React.PureComponent {
  static propTypes = {
    showEdit: PropTypes.bool,
    showAdd: PropTypes.bool,
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

  state = {
    fields: this.props.fields,
  };

  componentWillReceiveProps(nextProps) {
    if (_.isEqual(nextProps.fields, this.props.fields)) {
      this.setState({
        fields: nextProps.fields,
      });
    }
  }

  submit = () => {
    const { fields } = this.state;
    const { onChange, onCancel } = this.props;
    onChange({
      fields,
    });
    onCancel();
  };

  changeFields(checked, fieldId, key) {
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
        };
      }
      return {
        ...field,
        [key]: checked,
      };
    };

    this.setState({
      fields: _.map(fields, field => {
        // 全选切换
        if (fieldId === undefined) {
          return changeField(field);
        }
        // 单选切换
        if (field.fieldId === fieldId) {
          return changeField(field);
        }
        return field;
      }),
    });
  }

  changeFieldReadAuth = (checked, fieldId) => {
    this.changeFields(checked, fieldId, 'notRead');
  };

  changeFieldEditAuth = (checked, fieldId) => {
    this.changeFields(checked, fieldId, 'notEdit');
  };

  changeFieldAddAuth = (checked, fieldId) => {
    this.changeFields(checked, fieldId, 'notAdd');
  };

  renderList() {
    const { showEdit, showAdd } = this.props;
    const { fields } = this.state;

    return (
      <ScrollView
        className={styles.fieldsSettingScrollView}
        ref={scrollView => {
          this.scrollView = scrollView;
        }}
      >
        {_.map(fields, ({ fieldName, fieldId, type, notAdd, notEdit, notRead, isReadField, hideWhenAdded }) => {
          return (
            <div className={styles.fieldItem} key={fieldId}>
              <div className={styles.filedName}>{fieldName || (type === 22 ? _l('分段') : _l('备注'))}</div>
              <div className={styles.filedSetting}>
                {!hideWhenAdded && (
                  <Checkbox
                    checked={showAdd ? !notAdd : false}
                    disabled={!showAdd}
                    value={fieldId}
                    onClick={this.changeFieldAddAuth}
                  />
                )}
              </div>
              <div className={styles.filedSetting}>
                <Checkbox checked={!notRead} value={fieldId} onClick={this.changeFieldReadAuth} />
              </div>
              <div className={styles.filedSetting}>
                {!isReadField && (
                  <Checkbox
                    checked={showEdit ? !notEdit : false}
                    disabled={!showEdit}
                    value={fieldId}
                    onClick={this.changeFieldEditAuth}
                  />
                )}
              </div>
            </div>
          );
        })}
      </ScrollView>
    );
  }

  renderContent() {
    const { showEdit, showAdd } = this.props;
    const { fields } = this.state;

    const addProps = this.getAddCheckboxProps(fields);
    const readProps = this.getReadCheckboxProps(fields);
    const editProps = this.getEditCheckboxProps(fields);
    return (
      <React.Fragment>
        <div className={styles.fieldsHeader + ' Gray'}>
          <div className={styles.filedName + ' bold'}>{_l('字段')}</div>
          <div className={styles.filedSetting}>
            <Checkbox
              checked={showAdd ? addProps.isAll : false}
              disabled={!showAdd}
              indeterminate={showAdd ? addProps.isPart : false}
              onClick={this.changeFieldAddAuth}
            >
              {_l('创建')}
            </Checkbox>
          </div>
          <div className={styles.filedSetting}>
            <Checkbox checked={readProps.isAll} indeterminate={readProps.isPart} onClick={this.changeFieldReadAuth}>
              {_l('查看')}
            </Checkbox>
          </div>
          <div className={styles.filedSetting}>
            <Checkbox
              checked={showEdit ? editProps.isAll : false}
              disabled={!showEdit}
              indeterminate={showEdit ? editProps.isPart : false}
              onClick={this.changeFieldEditAuth}
            >
              {_l('编辑')}
            </Checkbox>
          </div>
        </div>
        {this.renderList()}
      </React.Fragment>
    );
  }

  render() {
    const { onCancel } = this.props;
    const dialogProps = {
      title: _l('字段权限'),
      visible: true,
      width: 560,
      type: 'fixed',
      overlayClosable: false,
      dialogClasses: styles.fieldSettingDialog,
      onOk: this.submit,
      onCancel,
    };

    return <Dialog {...dialogProps}>{this.renderContent()}</Dialog>;
  }
}
