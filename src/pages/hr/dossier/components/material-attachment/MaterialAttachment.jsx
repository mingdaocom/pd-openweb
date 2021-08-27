import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Svg from 'ming-ui/components/Svg';

import './MaterialAttachment.less';
import '../../dossier.less';

import { DialogFiles } from '../dialog';

export default class MaterialAttachment extends Component {
  static propTypes = {
    name: PropTypes.string,
    id: PropTypes.string,
    employeeId: PropTypes.string,
    editable: PropTypes.bool,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        upload: PropTypes.bool,
      })
    ),
  };

  constructor(props) {
    super(props);

    this.state = {
      /**
       * 数据列表
       */
      data: this.props.data || [],
      /**
       * Dialog 是否可见
       */
      visible: false,
      /**
       * Dialog 数据
       */
      dialog: {
        /**
         * 标题
         */
        title: '',
        /**
         * 附件类型
         */
        type: '',
      },
    };
  }

  static defaultProps = {
    editable: true,
  };

  /**
   * 打开附件上传 Dialog
   */
  itemOnClick = (event, item) => {
    // 身份证限制为两张
    const limit = item.card ? 2 : 0;
    this.setState({
      visible: true,
      dialog: {
        title: _l('上传') + item.name,
        type: item.id,
        limit,
      },
    });
  };

  /**
   * 文件上传结束回调
   */
  uploadOnOk = (number) => {
    const targetId = this.state.dialog.type;
    const newData = this.state.data.map((item, i, list) => {
      const _item = _.cloneDeep(item);
      if (_item.id === targetId) {
        _item.upload = !!number;
      }
      return _item;
    });

    this.setState({
      data: newData,
      visible: false,
    });
  };

  /**
   * 文件上传取消回调
   */
  uploadOnCancel = () => {
    this.setState({
      visible: false,
    });
  };

  /**
   * 获得icon
   * @param {*} id typeId
   */
  getIconNameById(id) {
    const icons = {
      /** 在校证明 */
      '0': 'hr-school_certificate',
      /** 离职证明 */
      '1': 'hr_quit',
      /** 入职登记表 */
      '2': 'hr_draft-box',
      /** 证件照 */
      '3': 'hr_id_photo',
      /** 合同附件 */
      '4': 'hr_contract',
      /** 学历证明原件 */
      '5': 'hr_education',
      /** 身份证原件 */
      '6': 'hr_position2',
    };
    if (icons[id]) {
      return icons[id];
    }
    return '';
  }

  render() {
    return (
      <div className="dossier-user-formgroup materialAttachment">
        <h3 className="dossier-user-formgroup-name ThemeAfterBGColor3">
          <span>{this.props.name}</span>
        </h3>
        <div className="mTop16 mBottom16 mLeft10 mRight10 flexRow flexWrap">
          {this.state.data.map((item, index) => (
            <div
              className={cx('uploadBox ThemeBorderColor3 ThemeBGColor6', { mRight20: (index + 1) % 5 !== 0, 'uploadBox--noUpload': !item.upload })}
              key={item.id}
              onClick={(event) => {
                this.itemOnClick(event, item);
              }}
            >
              <div className="uploadBoxIconCircle ThemeBGColor3">
                <Svg icon={this.getIconNameById(index)} size="26" />
              </div>
              <span className={cx('uploadBoxName', item.upload ? 'ThemeColor3' : 'Gray_9e')}>{item.upload ? item.name : _l('上传' + item.name)}</span>
            </div>
          ))}
        </div>
        <DialogFiles
          visible={this.state.visible}
          title={this.state.dialog.title}
          type={this.state.dialog.type}
          employeeId={this.props.employeeId}
          limit={this.state.dialog.limit}
          editable={this.props.editable}
          onOk={(number) => {
            this.uploadOnOk(number);
          }}
          onCancel={() => {
            this.uploadOnCancel();
          }}
        />
      </div>
    );
  }
}
