import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Textarea from 'ming-ui/components/Textarea';
import Button from 'ming-ui/components/Button';
import sheetAjax from 'src/api/worksheet';

export default class SheetDesc extends Component {
  constructor(props) {
    super(props);
    const { desc } = props;
    this.state = {
      desc,
    }
  }
  handleSave() {
    const desc = this.state.desc.trim();
    this.props.onSave(desc);
    if (desc !== this.props.desc) {
      sheetAjax
        .updateWorksheetDec({
          worksheetId: this.props.worksheetId,
          dec: desc,
        })
        .then((data) => {
          alert(_l('修改成功'));
        })
        .fail((err) => {
          alert(_l('修改工作表描述失败'), 2);
        });
    }
  }
  render() {
    const { desc } = this.state;
    return (
      <div className="WhiteBG z-depth-2 boderRadAll_4" style={{width: 250, padding: 12}}>
        <Textarea
          autoFocus
          className="Font13"
          maxHeight={300}
          placeholder={_l('添加工作表描述')}
          value={desc}
          onChange={(value) => {
            this.setState({
              desc: value.slice(0, 300),
            })
          }}
        />
        <div className="TxtRight pTop10">
          <Button type="link" size="tiny" onClick={this.props.onClose}>{_l('取消')}</Button>
          <Button type="primary" size="tiny" onClick={this.handleSave.bind(this)}>{_l('保存')}</Button>
        </div>
      </div>
    );
  }
}
