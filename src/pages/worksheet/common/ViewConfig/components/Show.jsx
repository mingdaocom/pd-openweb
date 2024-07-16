import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { filterHidedControls } from 'src/pages/worksheet/util';
import { Radio } from 'ming-ui';
import SortColumns from 'src/pages/worksheet/components/SortColumns/';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { NORMAL_SYSTEM_FIELDS_SORT, WORKFLOW_SYSTEM_FIELDS_SORT } from 'src/pages/worksheet/common/ViewConfig/util';
import _ from 'lodash';
import { getAdvanceSetting } from 'src/util';

const Wrap = styled.div`
  height: 100%;
`;
const SysSortColumn = styled.div`
  .workSheetChangeColumn {
    .searchBar,
    .quickOperate {
      display: none;
    }
  }
  .showControlsColumnCheckItem {
    &:hover {
      background-color: initial;
    }
    padding: 0 0;
  }
`;
// 显示列
export default class Show extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: document.documentElement.clientHeight - 323,
    };
  }
  componentDidMount() {
    this.initState(this.props);
    $(window).on('resize', this.getHeight);
  }
  componentWillReceiveProps(nextProps) {
    const { view } = nextProps;
    if (!_.isEqual(view, this.props.view)) {
      this.initState(nextProps);
    }
  }
  componentWillUnmount() {
    $(window).off('resize', this.getHeight);
  }
  initState = props => {
    const { view } = props;
    const { customdisplay = '0' } = getAdvanceSetting(view);
    const { showControls = [] } = view;
    this.setState({
      height: document.documentElement.clientHeight - 323,
      customShowControls: getAdvanceSetting(view, 'customShowControls') || showControls || [],
      showControls: view.showControls || [],
      customdisplay: customdisplay === '1' || showControls.length > 0 ? '1' : '0', // 是否配置自定义显示列
    });
  };
  getHeight = () => {
    this.setState({
      height: document.documentElement.clientHeight - 323,
    });
  };

  onChange = type => {
    const { updateCurrentView, view, columns, appId } = this.props;
    const { customShowControls, showControls } = this.state;
    if (type === '0') {
      updateCurrentView({
        ...view,
        appId,
        editAttrs: ['showControls', 'advancedSetting'],
        editAdKeys: ['customdisplay', 'customShowControls'],
        advancedSetting: {
          customdisplay: '0',
          customShowControls: JSON.stringify(showControls),
        },
        showControls: [],
      });
    } else {
      const filteredColumns = filterHidedControls(columns, view.controls, false)
        .filter(c => !!c.controlName && !_.includes([22, 10010, 43, 45, 49, 51], c.type))
        .sort((a, b) => {
          if (a.row === b.row) {
            return a.col - b.col;
          } else {
            return a.row - b.row;
          }
        });
      updateCurrentView({
        ...view,
        appId,
        editAttrs: ['showControls', 'advancedSetting'],
        editAdKeys: ['customdisplay'],
        advancedSetting: {
          customdisplay: '1',
        },
        showControls:
          (customShowControls || []).length !== 0
            ? customShowControls
            : filteredColumns
                .filter(l => l.controlId.length > 20)
                .slice(0, 50)
                .map(c => c.controlId),
      });
    }
  };
  onChangeColumns = ({ newShowControls, newControlSorts }) => {
    const { updateCurrentView, appId, view } = this.props;
    const { customdisplay } = this.state;
    if (customdisplay === '1') {
      this.setState(
        {
          showControls: newShowControls,
        },
        () => {
          updateCurrentView({
            ...view,
            appId,
            editAttrs: ['advancedSetting', 'showControls'],
            editAdKeys: ['customShowControls'],
            showControls: newShowControls,
            advancedSetting: { customShowControls: JSON.stringify(newShowControls) },
          });
        },
      );
    } else {
      updateCurrentView({
        ...view,
        appId,
        editAttrs: ['advancedSetting'],
        editAdKeys: ['sysids', 'syssort'],
        showControls: [],
        advancedSetting: { sysids: JSON.stringify(newShowControls), syssort: JSON.stringify(newControlSorts) },
      });
    }
  };
  render() {
    const { height, customdisplay, showControls = [] } = this.state;
    const { columns = [], view, sheetSwitchPermit } = this.props;
    const { controls = [] } = view;
    //是否显示系统字段
    const isShowWorkflowSys = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit);
    const defaultSysSort = isShowWorkflowSys
      ? [...WORKFLOW_SYSTEM_FIELDS_SORT, ...NORMAL_SYSTEM_FIELDS_SORT]
      : NORMAL_SYSTEM_FIELDS_SORT;
    const syssort = getAdvanceSetting(view, 'syssort') || defaultSysSort.filter(o => !controls.includes(o));
    const sysids = getAdvanceSetting(view, 'sysids') || [];
    //'0':表格显示列与表单中的字段保持一致 '1':自定义显示列
    const filteredColumns = filterHidedControls(columns, controls, false).filter(
      c => !!c.controlName && !_.includes([22, 10010, 43, 45, 49, 51, 52], c.type),
    );
    const showControlsForSortControl = showControls.filter(id =>
      _.find(filteredColumns, column => column.controlId === id),
    );
    const sysControlsColumnsForSort = isShowWorkflowSys
      ? columns.filter(c => _.includes(_.uniq([...syssort, ...WORKFLOW_SYSTEM_FIELDS_SORT]), c.controlId))
      : columns.filter(c =>
          _.includes(
            syssort.filter(v => !_.includes(WORKFLOW_SYSTEM_FIELDS_SORT, v)),
            c.controlId,
          ),
        );
    const customizeColumns = isShowWorkflowSys
      ? filteredColumns
      : filteredColumns.filter(c => !_.includes(WORKFLOW_SYSTEM_FIELDS_SORT, c.controlId));

    return (
      <Wrap className="flexRow commonConfigItem ming Dropdown w100 mTop15 hideColumns">
        <div className="">
          <Radio
            className=""
            text={_l('与表单字段保持一致（显示前50个）')}
            checked={customdisplay === '0'}
            onClick={value => {
              this.onChange('0');
            }}
          />
        </div>
        <div className="mTop15 mBottom20">
          <Radio
            className=""
            text={_l('自定义显示列')}
            checked={customdisplay === '1'}
            onClick={value => {
              this.onChange('1');
            }}
          />
        </div>
        {customdisplay === '1' ? (
          <SortColumns
            layout={2}
            placeholder={_l('查找字段')}
            noempty={false} //不需要至少显示一列
            maxHeight={height}
            showControls={showControlsForSortControl}
            columns={customizeColumns}
            controlsSorts={showControlsForSortControl}
            onChange={({ newShowControls, newControlSorts }) => {
              this.onChangeColumns({ newShowControls, newControlSorts });
            }}
            isShowColumns={true}
            sortAutoChange={true}
          />
        ) : (
          <SysSortColumn>
            <div className="commonConfigItem Font13 bold">{_l('显示系统字段')}</div>
            <SortColumns
              layout={2}
              noempty={false} //不需要至少显示一列
              showControls={sysids}
              dragable={false} //不可排序
              columns={sysControlsColumnsForSort}
              controlsSorts={syssort}
              maxHeight={height}
              onChange={({ newShowControls, newControlSorts }) => {
                this.onChangeColumns({ newShowControls, newControlSorts });
              }}
              sortAutoChange={true}
            />
          </SysSortColumn>
        )}
      </Wrap>
    );
  }
}
