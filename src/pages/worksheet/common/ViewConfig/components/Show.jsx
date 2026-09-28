import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Radio } from 'ming-ui/antd-components';
import {
  VIEW_CONFIG_EXCLUDED_CONTROL_TYPES,
  VIEW_CONFIG_EXCLUDED_CONTROL_TYPES_WITH_SECTION,
} from 'src/pages/worksheet/common/ViewConfig/config';
import SortColumns from 'src/pages/worksheet/components/SortColumns/';
import { getAdvanceSetting } from 'src/utils/domain/control/advancedSetting';
import { permitList } from 'src/utils/domain/control/formEnum';
import { filterHidedControls } from 'src/utils/domain/control/sort';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';
import { NORMAL_SYSTEM_FIELDS_SORT, WORKFLOW_SYSTEM_FIELDS_SORT } from 'src/utils/domain/worksheet/view';

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

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      const { view } = this.props;

      if (!_.isEqual(view, prevProps.view)) {
        this.initState(this.props);
      }
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
      customdisplay: customdisplay === '1' ? '1' : '0', // 是否配置自定义显示列
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
        .filter(c => !!c.controlName && !_.includes(VIEW_CONFIG_EXCLUDED_CONTROL_TYPES, c.type))
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
      c => !!c.controlName && !_.includes(VIEW_CONFIG_EXCLUDED_CONTROL_TYPES_WITH_SECTION, c.type),
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
      <Wrap className="flexRow commonConfigItem w100 mTop15 hideColumns flexColumn">
        <div className="">
          <Radio
            className=""
            checked={customdisplay === '0'}
            onChange={() => {
              this.onChange('0');
            }}
            title={_l('与表单字段保持一致（显示前50个）')}
          >
            {_l('与表单字段保持一致（显示前50个）')}
          </Radio>
        </div>
        <div className="mTop15 mBottom20">
          <Radio
            className=""
            checked={customdisplay === '1'}
            onChange={() => {
              this.onChange('1');
            }}
            title={_l('自定义显示列')}
          >
            {_l('自定义显示列')}
          </Radio>
        </div>
        {customdisplay === '1' ? (
          <SortColumns
            layout={2}
            placeholder={_l('搜索字段')}
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
            disabled={this.props.saveViewSetLoading}
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
              disabled={this.props.saveViewSetLoading}
            />
          </SysSortColumn>
        )}
      </Wrap>
    );
  }
}
