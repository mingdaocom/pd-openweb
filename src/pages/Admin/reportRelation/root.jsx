import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

import Checkbox from 'ming-ui/components/Checkbox';
import Node from './components/node';
import SearchInput from './components/searchBox';

import { initRoot, fetchNode, updateCollapse } from './actions';
import { getAuth, setStructureForAll, setStructureSelfEdit } from './common';
import cx from 'classnames';

class Root extends Component {
  static defaultProps = {
    isProjectAdmin: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      auth: props.from != 'myReport',
      authForAll: false,
    };
  }

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch(initRoot());
    dispatch(fetchNode());
    dispatch(updateCollapse());

    getAuth().done(auth => {
      this.setState({
        authForAll: auth.allowStructureForAll,
        allowStructureSelfEdit: auth.allowStructureSelfEdit,
      });
    });
  }

  componentDidMount() {
    $.subscribe('REPORT_RELATION_SCROLLTOP', (event, data) => {
      this.scrollTo(data.top);
    });
  }

  componentWillUnmount() {
    $.unsubscribe('REPORT_RELATION_SCROLLTOP');
  }

  scrollTo(top) {
    if (this.wrapper) {
      const $wrapper = $(this.wrapper);
      const wrapperTop = $wrapper.offset().top;
      const wrapperScrollTop = $wrapper.scrollTop() + (top - wrapperTop);
      const scrollHeight = this.wrapper.scrollHeight;
      $wrapper.scrollTop(Math.min(scrollHeight, wrapperScrollTop));
    }
  }

  changeSubordinate = checked => {
    setStructureSelfEdit({
      isAllowStructureSelfEdit: !checked,
    }).done(() => {
      this.setState({
        allowStructureSelfEdit: !checked,
      });
    });
  };

  changeReporting = checked => {
    setStructureForAll({
      forAll: !checked,
    }).done(() => {
      this.setState({
        authForAll: !checked,
      });
    });
  };

  render() {
    const { isProjectAdmin } = this.props;
    const { auth, authForAll, allowStructureSelfEdit } = this.state;

    return (
      <Fragment>
        {auth && (
          <div className="rootBoardHeader flexRow">
            <div className="Font17 flex Bold">{_l('汇报关系')}</div>
            {isProjectAdmin && (
              <Fragment>
                <span data-tip={_l('勾选后允许员工在「个人账户/我的组织/我的汇报关系」中管理下属')} className="rootBoardHeaderTips">
                  <Checkbox checked={allowStructureSelfEdit} onClick={this.changeSubordinate} className="mLeft15">
                    {_l('允许员工自行管理下属')}
                  </Checkbox>
                </span>
                <span data-tip={_l('勾选后允许员工在「个人账户/我的组织/我的汇报关系」中查看汇报关系')} className="rootBoardHeaderTips">
                  <Checkbox checked={authForAll} onClick={this.changeReporting} className="mLeft15">
                    {_l('全员可以查看汇报关系')}
                  </Checkbox>
                </span>
              </Fragment>
            )}
          </div>
        )}
        <div className={cx('mainContent rootBoard box-sizing', { rootBoardBox: auth })}>
          <div className="card pAll20 box-sizing mLeft16 mRight16 h100">
            {auth && <SearchInput />}
            <div
              className="wrapper"
              ref={el => {
                this.wrapper = el;
              }}>
              <Node auth={auth} />
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default connect()(Root);
