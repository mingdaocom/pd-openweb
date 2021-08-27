/*
 * @Author: cloudZQY
 * @Module: 中间组件编辑排序部分的容器
 * @Description:
 * @Date: 2018-03-27 09:52:30
 * @Last Modified by: cloudZQY
 * @Last Modified time: 2018-03-27 09:52:30
 */
/*
 * @Author: cloudZQY
 * @Module: 中间组件编辑排序部分的容器
 * @Description:
 * @Date: 2018-03-27 09:52:30
 * @Last Modified by: cloudZQY
 * @Last Modified time: 2018-03-27 09:52:30
 */
/*
 * @Author: cloudZQY
 * @Module: 中间组件编辑排序部分的容器
 * @Description:
 * @Date: 2018-03-27 09:52:30
 * @Last Modified by: cloudZQY
 * @Last Modified time: 2018-03-27 09:52:30
 */
/*
 * @Author: cloudZQY
 * @Module: 中间组件编辑排序部分的容器
 * @Description:
 * @Date: 2018-03-27 09:52:30
 * @Last Modified by: cloudZQY
 * @Last Modified time: 2018-03-27 09:52:30
 */
import React from 'react';
import { connect } from 'react-redux';
import { classSet, getBindFormula, getBindMoneyCn, showDeleteConfirmModal } from '../utils/util';
import config from '../config';
import global from '../config/globalConfig';
import ScrollView from 'ming-ui/components/ScrollView';
import EditItemGroup from './editItemGroup';

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
        <div className={classSet({ formulaEdit: this.props.formulaState.formulaEdit }, 'editBox flexColumn')} ref="editBox">
          {config.global.sourceType === config.ENVIRONMENT.TASK ? (
            <div className="showImg" style={{ width: '100%' }}>
              <img src={require('../image/editbox_top.png')} alt={_l('展示')} style={{ width: '100%', display: 'block' }} />
            </div>
          ) : null}
          <EditItemGroup />
          {config.global.sourceType === config.ENVIRONMENT.TASK ? (
            <div className="showImg" style={{ width: '100%' }}>
              <img src={require('../image/editbox_bottom.png')} alt={_l('展示')} style={{ width: '100%', display: 'block' }} />
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
