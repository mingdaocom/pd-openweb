import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Tooltip from 'ming-ui/components/Tooltip';
import Checkbox from 'ming-ui/components/Checkbox';
import RadioGroup from 'ming-ui/components/RadioGroup2';

import { fieldPropType } from '../config';
import FieldSettingDialog from '../FieldSettingDialog';

import styles from './style.less?module';

export default class extends PureComponent {
  static propTypes = {
    showRead: PropTypes.bool, // 是否禁用读取
    showEdit: PropTypes.bool, // 是否禁用编辑
    showRemove: PropTypes.bool, // 是否禁用删除

    canAdd: PropTypes.bool,
    readLevel: PropTypes.number,
    editLevel: PropTypes.number,
    removeLevel: PropTypes.number,
    onChange: PropTypes.func,

    fields: PropTypes.arrayOf(fieldPropType),

    children: PropTypes.element.isRequired,
    getContainer: PropTypes.func, // rc-trigger popupContainer
  };

  state = {
    showFieldSettingDialog: false,
  };


  renderDialog() {
    const { fields, onChange, showEdit, canAdd } = this.props;
    const { showFieldSettingDialog } = this.state;
    if (showFieldSettingDialog) {
      return (
        <FieldSettingDialog
          showEdit={showEdit}
          showAdd={canAdd}
          fields={fields}
          onChange={onChange}
          onCancel={() => {
            this.setState({
              showFieldSettingDialog: false,
            });
          }}
        />
      );
    }
    return null;
  }

  renderContent() {
    const { showRead, showEdit, showRemove, canAdd, readLevel, editLevel, removeLevel, onChange, isForPortal } =
      this.props;
    const data = (key, type = 'operation') =>
      isForPortal
        ? [
            {
              text: _l('全部'),
              value: 100,
              checked: key === 100,
            },
            {
              text: type === 'look' ? _l('加入的') : _l('拥有的'),
              value: 20,
              checked: key === 20,
            },
          ]
        : [
            {
              text: _l('全部'),
              value: 100,
              checked: key === 100,
            },
            {
              text: type === 'look' ? _l('加入的') : _l('拥有的'),
              value: 20,
              checked: key === 20,
            },
            {
              text: type === 'look' ? _l('本人和下属加入的') : _l('本人和下属拥有的'),
              value: 30,
              checked: key === 30,
            },
          ];
    return (
      <React.Fragment>
        <div className={cx(styles.tipHeader, 'pLeft20 pRight20')}>{_l('数据操作权限')}</div>
        <div className="pLeft20 pRight20 Font13">
          <div className="Gray_75 mTop20">{_l('查看')}</div>
          <RadioGroup
            className="mTop10"
            disabled={!showRead}
            data={data(readLevel, 'look')}
            radioItemClassName={styles.radioItem}
            onChange={value => {
              onChange({
                readLevel: value,
              });
            }}
          />
          <div className="mTop20 Gray_75">{_l('编辑')}</div>
          <RadioGroup
            className="mTop10"
            disabled={!showEdit}
            data={data(editLevel)}
            radioItemClassName={styles.radioItem}
            onChange={value => {
              onChange({
                editLevel: value,
              });
            }}
          />
          <div className="mTop20 Gray_75">{_l('删除')}</div>
          <RadioGroup
            className="mTop10"
            disabled={!showRemove}
            data={data(removeLevel)}
            radioItemClassName={styles.radioItem}
            onChange={value => {
              onChange({
                removeLevel: value,
              });
            }}
          />
        </div>
        <div className={cx(styles.tipFooter, 'pLeft20 pRight20 mTop20')}>
          <span
            className="ThemeColor3 ThemeHoverColor2 Hand"
            onClick={() => {
              this.setState({
                showFieldSettingDialog: true,
              });
            }}
          >
            {_l('字段权限')}
          </span>
        </div>
      </React.Fragment>
    );
  }

  render() {
    const { children, getContainer } = this.props;
    const props = {
      popupPlacement: 'left',
      offset: [-4, 0],
      themeColor: 'white',
      action: ['click'],
      text: this.renderContent(),
      // popupVisible: true,
      tooltipClass: styles.roleTooltipSetting,
      getPopupContainer: getContainer,
    };

    return (
      <React.Fragment>
        {this.renderDialog()}
        <Tooltip {...props}>{children}</Tooltip>
      </React.Fragment>
    );
  }
}
