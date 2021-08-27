import React from 'react';
import $ from 'jquery';
import ReactDOM from 'react-dom';

import { SignType } from 'src/components/customWidget/src/component/widgets/datetimeRange/data';
import SignWidget from './signWidget';

/**
 * 控件 ID
 */
const Controls = {
  /**
   * 类型
   */
  TYPE: '59a4f9696d12f903b1cdd4c3',
  /**
   * 时间段
   */
  RANGE: '59a4f9696d12f903b1cdd4c4',
  /**
   * 有效时长
   */
  LENGTH: '59a4f9696d12f903b1cdd4c5',
  /**
   * 备注
   */
  NOTE: '59a4f9696d12f903b1cdd4c6',
};

class Sign {
  constructor(target, controlId, type, controls) {
    /**
     * 元素 ID
     */
    this.target = target;
    /**
     * 控件 ID
     */
    this.controlId = controlId;
    /**
     * 组件数据类型（请假|加班|出差）
     */
    this.type = type || SignType.LEAVE;
    /**
     * 子组件列表
     */
    this.controls = controls || [];
    /**
     * 是否为只读模式
     */
    this.readOnly = !($(this.target).data('hasauth') !== false);
  }

  /**
   * 开始事件监听
   */
  start() {
    if ($(this.target).hasClass('Hidden')) {
      return;
    }

    this.hasAuth = $(this.target).data('hasauth');

    this.render();
  }

  onChange = (event, data) => {
    if ((this.type === SignType.LEAVE
        && !data[Controls.TYPE])
      || !data[Controls.RANGE]
      || !data[Controls.RANGE].length
      || !data[Controls.NOTE]) {
      $(this.target).data('range', '');
    } else {
      if (data[Controls.RANGE] && data[Controls.RANGE].map) {
        let list = data[Controls.RANGE].map(item => {
          if (item && item.getTime) {
            return item.getTime();
          } else {
            return item;
          }
        });

        if (list && list.join) {
          data[Controls.RANGE] = list.join(',');
        }
      }

      $(this.target).data('range', JSON.stringify(data));
    }
  };

  onError = (error, id, errorData) => {
    // console.log(errorData);
  };

  showError = msg => {
    $(this.target).data('error', msg);
  };

  onValid = (id, errorData) => {
    // console.log(errorData);
  };

  render() {
    $(this.target)
      .closest('.customContents')
      .find('.customFieldsLabel')
      .removeClass('error');
    $(this.target)
      .closest('.customDetailSingle')
      .find('.detailControlName')
      .removeClass('error');

    const signWidget = (
      <SignWidget
        type={this.type}
        id={this.controlId}
        controls={this.controls}
        readOnly={this.readOnly}
        showError={msg => {
          this.showError(msg);
        }}
        onChange={(event, data) => {
          this.onChange(event, data);
        }}
        onError={(event, id, errorData) => {
          this.onError(event, id, errorData);
        }}
        onValid={(id, errorData) => {
          this.onValid(id, errorData);
        }}
      />
    );

    ReactDOM.render(signWidget, this.target);
  }
}

export default Sign;
