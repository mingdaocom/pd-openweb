import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSetState } from 'react-use';
import Rescource from './Rescource.jsx';
import SelectField from 'src/pages/worksheet/views/components/SelectField.jsx';
import { RadioGroup } from 'ming-ui';
import * as baseAction from 'src/pages/worksheet/redux/actions';
import * as viewAction from 'src/pages/worksheet/redux/actions/resourceview.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util.js';
import autoSize from 'ming-ui/decorators/autoSize';
import cx from 'classnames';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { isRelateRecordTableControl } from 'worksheet/util';

const Wrap = styled.div`
  width: 100%;
  height: 100%;
  .wrapSelectField {
    position: absolute;
    width: 100%;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    box-sizing: border-box;
    overflow: hidden;
    background-color: #f5f5f5;
  }
`;
const BtnForSure = styled.div`
   {
    padding: 0 32px;
    line-height: 36px;
    height: 36px;
    color: #fff;
    background-color: #2196f3;
    border-radius: 4px;
    outline: none;
    cursor: pointer;
    border: 1px solid transparent;
    margin-top: 32px;
    box-sizing: border-box;
    display: inline-block;
    &.isUnAb {
      background-color: #8fcaf9;
      cursor: not-allowed;
    }
  }
`;

function ResourceView(props) {
  const { appId, view, saveView, controls = [], isCharge, sheetSwitchPermit, viewId, initData } = props;

  const [{ viewControlInfo, viewControl }, setState] = useSetState({
    viewControlInfo: {},
    viewControl: view.viewControl,
  });

  useEffect(() => {
    initData();
  }, [viewId]);

  useEffect(() => {
    const { view, controls = [] } = props;
    const { viewControl = '' } = view;
    const viewControlInfo =
      (
        setSysWorkflowTimeControlFormat(
          controls.filter(
            item =>
              _.includes([27, 48, 9, 10, 11, 26, 29], item.type) &&
              !['rowid'].includes(item.controlId) &&
              !isRelateRecordTableControl(item),
          ),
          sheetSwitchPermit,
        ) || []
      ).find(it => it.controlId === viewControl) || {};

    setState({
      viewControl,
      viewControlInfo,
    });
  }, [props.view]);
  return (
    <Wrap key={`resource_${viewId}`}>
      {!viewControlInfo.controlId ? (
        <div className="wrapSelectField pTop10 pBottom10">
          <SelectField
            isCharge={isCharge}
            context={
              <React.Fragment>
                <h5>{_l('资源')}</h5>
                <RadioGroup
                  data={setSysWorkflowTimeControlFormat(
                    controls
                      .filter(
                        item =>
                          _.includes([27, 48, 9, 10, 11, 26, 29], item.type) &&
                          !['rowid'].includes(item.controlId) &&
                          !isRelateRecordTableControl(item),
                      )
                      .map(o => {
                        return { text: o.controlName, value: o.controlId, icon: `icon-${getIconByType(o.type)}` };
                      }),
                    sheetSwitchPermit,
                    'value',
                  )}
                  onChange={value => setState({ viewControl: value })}
                  checkedValue={viewControl}
                  vertical
                />
                <BtnForSure
                  className={cx('', {
                    isUnAb: !viewControl,
                  })}
                  onClick={() => {
                    if (!viewControl) {
                      return;
                    }
                    const viewControlInfo = controls.find(o => o.controlId === viewControl) || {};
                    let data = {
                      viewControl,
                      advancedSetting: {
                        navshow: viewControlInfo.type === 26 ? '1' : '0',
                        navfilters: JSON.stringify([]),
                      },
                      controlsSorts: [],
                      displayControls: [],
                      coverCid: '',
                      editAdKeys: ['navfilters', 'navshow'],
                      editAttrs: ['viewControl', 'advancedSetting', 'displayControls', 'controlsSorts', 'coverCid'],
                    };
                    saveView(viewId, _.pick(data, [...(data.editAttrs || []), 'editAdKeys']));
                    window.openViewConfig();
                  }}
                >
                  {_l('确认')}
                </BtnForSure>
              </React.Fragment>
            }
            viewType={7}
          />
        </div>
      ) : (
        <Rescource key={`resource_view_${viewId}`} {...props} />
      )}
    </Wrap>
  );
}

export default connect(
  state => ({
    ..._.omit(state.sheet, [
      'boardView',
      'hierarchyView',
      'sheetview',
      'galleryview',
      'calendarview',
      'gunterView',
      'excelCreateAppAndSheet',
      'detailView',
      'customWidgetView',
    ]),
  }),
  dispatch => bindActionCreators({ ...baseAction, ...viewAction }, dispatch),
)(autoSize(ResourceView));
