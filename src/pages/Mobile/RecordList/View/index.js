import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import * as actions from 'src/pages/Mobile/RecordList/redux/actions';
import { bindActionCreators } from 'redux';
import { Flex } from 'antd-mobile';
import SheetView from './SheetView';
import State from '../State';
import { VIEW_TYPE_ICON, VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';

const shieldingViewType = [VIEW_DISPLAY_TYPE.board, VIEW_DISPLAY_TYPE.structure, VIEW_DISPLAY_TYPE.calendar].map(item =>
  Number(item),
);

class View extends Component {
  constructor(props) {
    super(props);
  }
  renderError() {
    const { view } = this.props;
    return (
      <Flex className="withoutRows flex" direction="column" justify="center" align="center">
        <div className="text" style={{ width: 300, textAlign: 'center' }}>
          {_l(
            '抱歉，%0视图暂不支持，您可以通过PC端浏览器，或者移动客户端查看',
            _.find(VIEW_TYPE_ICON, { id: VIEW_DISPLAY_TYPE[view.viewType] }).text,
          )}
        </div>
      </Flex>
    )
  }
  render() {
    const { view, viewResultCode, quickFilter } = this.props;

    if (viewResultCode !== 1) {
      return <State resultCode={viewResultCode} type="view" />
    }

    if (shieldingViewType.includes(view.viewType)) {
      return this.renderError();
    }

    return (
      <div className="overflowHidden flex mobileView flexColumn">
        <SheetView view={view} />
      </div>
    )
  }
}

export default connect(
  state => ({
    viewResultCode: state.mobile.viewResultCode,
    worksheetInfo: state.mobile.worksheetInfo,
    quickFilter: state.mobile.quickFilter
  }),
  dispatch =>
    bindActionCreators(
      _.pick(actions, []),
      dispatch,
  ),
)(View);

