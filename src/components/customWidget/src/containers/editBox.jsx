import React from 'react';
import { connect } from 'react-redux';
import { classSet } from '../utils/util';
import config from '../config';
import EditItemGroup from './editItemGroup';
import topImg from '../image/editbox_top.png';
import bottomImg from '../image/editbox_bottom.png';

@connect(state => ({
  formulaState: state.formulaState,
}))
export default class EditBox extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let { title } = this.props;
    return (
      <div className="customContent">
        {title && <div className="customTitle pLeft20">{title}</div>}
        <div
          className={classSet({ formulaEdit: this.props.formulaState.formulaEdit }, 'editBox flexColumn')}
          ref="editBox"
        >
          {config.global.sourceType === config.ENVIRONMENT.TASK ? (
            <div className="showImg" style={{ width: '100%' }}>
              <img src={topImg} alt={_l('展示')} style={{ width: '100%', display: 'block' }} />
            </div>
          ) : null}
          <EditItemGroup />
          {config.global.sourceType === config.ENVIRONMENT.TASK ? (
            <div className="showImg" style={{ width: '100%' }}>
              <img src={bottomImg} alt={_l('展示')} style={{ width: '100%', display: 'block' }} />
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
