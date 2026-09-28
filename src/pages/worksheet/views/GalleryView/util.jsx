import _ from 'lodash';
import { getCardWidth } from 'worksheet/common/ViewConfig/getCardWidth';
import { getCoverStyle } from 'src/pages/worksheet/common/ViewConfig/utils';
import { permitList } from 'src/utils/domain/control/formEnum';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';
import { getTitleControlForCard } from 'src/utils/services/worksheet/view';
import { RENDER_RECORD_NECESSARY_ATTR } from 'src/utils/services/worksheet/view';

export const getWidth = props => {
  const { base = {}, views = [], width } = props;
  const view = views.find(o => o.viewId === base.viewId) || {};
  const { coverPosition = '2' } = getCoverStyle(view);
  const cardWidth = getCardWidth(view);
  const isTopCover = coverPosition === '2';
  const adjustedWidth = width - 16; // padding: 8px * 2
  const minW = cardWidth ? Number(cardWidth) + 16 : isTopCover ? 246 : 336;
  return minW > adjustedWidth ? minW : Math.floor(adjustedWidth / Math.floor(adjustedWidth / minW));
};

export const getDataWithFormat = (row, props) => {
  const { base, controls, views, sheetSwitchPermit } = props;
  const view = views.find(o => o.viewId === base.viewId) || {};
  const { displayControls = [] } = view;
  const parsedRow = row;
  const arr = [];

  const titleControl = getTitleControlForCard(view, controls);

  if (titleControl) {
    arr.push({ ..._.pick(titleControl, RENDER_RECORD_NECESSARY_ATTR), value: parsedRow[titleControl.controlId] });
  }

  const isShowWorkflowSys = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit);
  const displayControlsCopy = isShowWorkflowSys
    ? displayControls
    : displayControls.filter(
        it =>
          !_.includes(
            ['wfname', 'wfstatus', 'wfcuaids', 'wfrtime', 'wfftime', 'wfdtime', 'wfcaid', 'wfctime', 'wfcotime'],
            it,
          ),
      );

  displayControlsCopy.forEach(id => {
    const currentControl = _.find(controls, ({ controlId }) => controlId === id);

    if (currentControl) {
      arr.push({ ..._.pick(currentControl, RENDER_RECORD_NECESSARY_ATTR), value: parsedRow[id] });
    }
  });

  return arr;
};
