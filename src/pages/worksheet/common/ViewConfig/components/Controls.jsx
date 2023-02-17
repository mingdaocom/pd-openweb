import React from 'react';
import SortColumns from 'src/pages/worksheet/components/SortColumns/';
import _ from 'lodash';

// 字段
export default class Controls extends React.Component {
  constructor(props) {
    super(props);
    this.state = { height: document.documentElement.clientHeight - 320 };
  }
  componentDidMount() {
    $(window).on('resize', this.getHeight);
  }
  componentWillUnmount() {
    $(window).off('resize', this.getHeight);
  }
  getHeight = () => {
    this.setState({
      height: document.documentElement.clientHeight - 320,
    });
  };
  render() {
    const { height } = this.state;
    const { columns, view = {}, formatColumnsListForControls, columnChange } = this.props;
    const { controls = [] } = view;
    const viewcontrols = controls.filter(id => _.find(columns, column => column.controlId === id));
    return (
      <div className="commonConfigItem">
        <div className="Gray_9e mTop8 mBottom4">{_l('设置此视图下的表单中需要对用户隐藏的字段')}</div>
        <div className="ming Dropdown pointer w100 mBottom10 hideColumns">
          <SortColumns
            layout={2}
            noShowCount={true}
            noempty={false} //不需要至少显示一列
            maxHeight={height}
            dragable={false}
            showControls={columns.filter(item => !viewcontrols.includes(item.controlId)).map(item => item.controlId)}
            columns={formatColumnsListForControls(columns)}
            onChange={columnChange}
          />
        </div>
      </div>
    );
  }
}
