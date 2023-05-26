import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { filterHidedControls } from 'src/pages/worksheet/util';
import { Radio } from 'ming-ui';
import SortColumns from 'src/pages/worksheet/components/SortColumns/';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { WORKFLOW_SYSTEM_FIELDS_SORT } from 'src/pages/worksheet/common/ViewConfig/util';
import _ from 'lodash';
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
    this.state = { height: document.documentElement.clientHeight - 360 };
  }
  componentDidMount() {
    $(window).on('resize', this.getHeight);
  }
  componentWillUnmount() {
    $(window).off('resize', this.getHeight);
  }
  getHeight = () => {
    this.setState({
      height: document.documentElement.clientHeight - 360,
    });
  };
  render() {
    const { height } = this.state;
    const { columns, view, sheetSwitchPermit, info = {} } = this.props;
    const { showControls = [], customdisplay = '0', sysids, syssort } = info;
    const isShowWorkflowSys = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit);
    const filteredColumns = filterHidedControls(columns, view.controls, false).filter(
      c => !!c.controlName && !_.includes([22, 10010, 43, 45, 49], c.type),
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
            text={_l('与表单字段保持一致（显示前30个）')}
            checked={customdisplay === '0'}
            onClick={value => {
              this.props.onChange('0');
            }}
          />
        </div>
        <div className="mTop15 mBottom20">
          <Radio
            className=""
            text={_l('自定义显示列')}
            checked={customdisplay === '1'}
            onClick={value => {
              this.props.onChange('1');
            }}
          />
        </div>
        {customdisplay === '1' ? (
          <SortColumns
            layout={2}
            noempty={false} //不需要至少显示一列
            maxHeight={height}
            showControls={showControlsForSortControl}
            columns={customizeColumns}
            controlsSorts={showControlsForSortControl}
            onChange={({ newShowControls, newControlSorts }) => {
              this.props.onChangeColumns({ newShowControls, newControlSorts });
            }}
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
              onChange={({ newShowControls, newControlSorts }) => {
                this.props.onChangeColumns({ newShowControls, newControlSorts });
              }}
            />
          </SysSortColumn>
        )}
      </Wrap>
    );
  }
}
