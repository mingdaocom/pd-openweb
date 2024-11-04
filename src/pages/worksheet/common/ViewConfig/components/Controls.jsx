import React from 'react';
import SortColumns from 'src/pages/worksheet/components/SortColumns/';
import _ from 'lodash';
import { getAdvanceSetting } from 'src/util';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { NORMAL_SYSTEM_FIELDS_SORT, WORKFLOW_SYSTEM_FIELDS_SORT } from 'src/pages/worksheet/common/ViewConfig/util';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget.js';

// 字段
export default class Controls extends React.Component {
  constructor(props) {
    super(props);
    this.state = { height: document.documentElement.clientHeight - 280 };
  }
  componentDidMount() {
    $(window).on('resize', this.getHeight);
  }
  componentWillUnmount() {
    $(window).off('resize', this.getHeight);
  }
  getHeight = () => {
    this.setState({
      height: document.documentElement.clientHeight - 280,
    });
  };

  // sysids：显示的系统字段 syssort：系统字段顺序
  columnChange = ({ newShowControls, newControlSorts }) => {
    const { view, appId, updateCurrentView, sheetSwitchPermit, formatColumnsListForControls } = this.props;
    const { showControls = [] } = view;

    const isShowWorkflowSys = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit);
    const defaultSysSort = isShowWorkflowSys
      ? [...WORKFLOW_SYSTEM_FIELDS_SORT, ...NORMAL_SYSTEM_FIELDS_SORT]
      : NORMAL_SYSTEM_FIELDS_SORT;
    const syssort =
      getAdvanceSetting(view, 'syssort') || defaultSysSort.filter(o => !(view.controls || []).includes(o));
    const sysids = getAdvanceSetting(view, 'sysids') || [];

    let { columns } = this.props;
    columns = formatColumnsListForControls(columns);
    const newColumns = columns.filter(item => !newShowControls.includes(item.controlId));
    const controls = newColumns.map(item => item.controlId);
    let data = {};
    let editAttrs = ['controls', 'displayControls', 'showControls'];
    if (controls.includes('ownerid')) {
      data = {
        sysids: JSON.stringify(sysids.filter(o => !controls.includes(o))),
        syssort: JSON.stringify(syssort.filter(o => !controls.includes(o))),
      };
      editAttrs = [...editAttrs, 'advancedSetting'];
    } else if (!syssort.includes('ownerid')) {
      data = {
        syssort: JSON.stringify(syssort.concat('ownerid')),
      };
      editAttrs = [...editAttrs, 'advancedSetting'];
    }
    updateCurrentView({
      ...view,
      appId,
      editAttrs,
      controls,
      displayControls: (_.get(view, 'displayControls') || []).filter(o => !controls.includes(o)),
      showControls: showControls.filter(o => !controls.includes(o)),
      ...(editAttrs.includes('advancedSetting') ? { advancedSetting: data, editAdKeys: Object.keys(data) } : {}),
    });
  };

  render() {
    const { height } = this.state;
    const { columns, view = {}, formatColumnsListForControls } = this.props;
    const { controls = [] } = view;
    const viewcontrols = controls.filter(id => _.find(columns, column => column.controlId === id));
    return (
      <div className="commonConfigItem">
        <div className="Gray_75 mTop8 mBottom4">{_l('设置此视图下的表单中需要对用户隐藏的字段')}</div>
        <div className="ming Dropdown pointer w100 mBottom10 hideColumns">
          <SortColumns
            layout={2}
            noShowCount={true}
            noempty={false} //不需要至少显示一列
            maxHeight={height}
            dragable={false}
            showControls={columns.filter(item => !viewcontrols.includes(item.controlId)).map(item => item.controlId)}
            columns={formatColumnsListForControls(
              columns.sort((a, b) => {
                if (a.row === b.row) {
                  return a.col - b.col;
                } else {
                  return a.row - b.row;
                }
              }),
            )}
            onChange={this.columnChange}
            showTabs={true}
          />
        </div>
      </div>
    );
  }
}
