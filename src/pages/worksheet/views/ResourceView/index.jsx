import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Radio } from 'ming-ui/antd-components';
import autoSize from 'ming-ui/components/AutoSize';
import { isSameType } from 'src/pages/worksheet/common/ViewConfig/util.js';
import * as baseAction from 'src/pages/worksheet/redux/actions';
import * as viewAction from 'src/pages/worksheet/redux/actions/resourceview.js';
import SelectField from 'src/pages/worksheet/views/components/SelectField.jsx';
import 'src/pages/worksheet/views/ResourceView/index.less';
import { getIconByType } from 'src/utils/domain/control/metadata';
import { isRelateRecordTableControl } from 'src/utils/domain/control/type';
import { setSysWorkflowTimeControlFormat } from 'src/utils/services/worksheet/calendar';
import Resource from './Resource.jsx';

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
    background-color: var(--color-background-secondary);
  }
`;

function ResourceView(props) {
  const { view, saveView, controls = [], isCharge, sheetSwitchPermit, viewId, initData } = props;

  const [{ viewControlInfo, viewControl }, setState] = useSetState({
    viewControlInfo: {},
    viewControl: view.viewControl,
  });

  useEffect(() => {
    initData();
  }, [viewId, _.get(view, 'advancedSetting.showtitle')]);

  useEffect(() => {
    const { view, controls = [] } = props;
    const { viewControl = '' } = view;
    const viewControlInfo =
      (
        setSysWorkflowTimeControlFormat(
          controls.filter(
            item =>
              (_.includes([27, 48, 9, 10, 11, 26, 29, 28], item.type) ||
                (item.type === 30 &&
                  _.includes([27, 48, 9, 10, 11, 26, 29, 28], item.sourceControlType) &&
                  (item.strDefault || '').split('')[0] !== '1')) &&
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
                <Radio.Group
                  options={(
                    setSysWorkflowTimeControlFormat(
                      controls
                        .filter(
                          item =>
                            (_.includes([27, 48, 9, 10, 11, 26, 29, 28], item.type) ||
                              (item.type === 30 &&
                                _.includes([27, 48, 9, 10, 11, 26, 29, 28], item.sourceControlType) &&
                                (item.strDefault || '').split('')[0] !== '1')) &&
                            !['rowid'].includes(item.controlId) &&
                            !isRelateRecordTableControl(item),
                        )
                        .map(o => {
                          return { text: o.controlName, value: o.controlId, icon: `icon-${getIconByType(o.type)}` };
                        }),
                      sheetSwitchPermit,
                      'value',
                    ) || []
                  ).map(({ text, ...option }) => ({ ...option, label: text }))}
                  onChange={event =>
                    setState({
                      viewControl: event.target.value,
                    })
                  }
                  value={viewControl}
                  vertical
                />
                <Button
                  type="primary"
                  wide
                  disabled={!viewControl}
                  className="mTop32"
                  onClick={() => {
                    if (!viewControl) {
                      return;
                    }

                    const viewControlInfo = controls.find(o => o.controlId === viewControl) || {};
                    let data = {
                      viewControl,
                      advancedSetting: {
                        navshow: isSameType([26, 27, 48], viewControlInfo) ? '1' : '0',
                        navfilters: JSON.stringify([]),
                      },
                      controlsSorts: [],
                      displayControls: [],
                      coverCid: '',
                      editAdKeys: ['navfilters', 'navshow'],
                      editAttrs: ['viewControl', 'advancedSetting', 'displayControls', 'controlsSorts', 'coverCid'],
                    };
                    saveView(viewId, _.pick(data, [...(data.editAttrs || []), 'editAdKeys']));
                    if (window?.openViewConfig) {
                      window.openViewConfig();
                    }
                  }}
                >
                  {_l('确认')}
                </Button>
              </React.Fragment>
            }
            viewType={7}
          />
        </div>
      ) : (
        <Resource key={`resource_view_${viewId}`} {...props} />
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
