import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { Tooltip } from 'ming-ui';
import Checkbox from 'ming-ui/components/Checkbox';
import projectSettingController from 'src/api/projectSetting';
import Config from '../../config';
import { fetchRootSubordinates, initRoot, updateCollapse } from './actions';
import { setStructureForAll, setStructureSelfEdit } from './common';
import Node from './components/node';
import NodeDialog from './components/NodeDialog';
import SearchInput from './components/searchBox';

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      auth: props.from != 'myReport',
      authForAll: false,
      searchUser: undefined,
      nodeDialogVisible: false,
    };
  }

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch(initRoot());
    dispatch(fetchRootSubordinates(''));
    dispatch(updateCollapse());

    projectSettingController
      .getStructureForAll({
        projectId: Config.projectId,
      })
      .then(auth => {
        this.setState({
          authForAll: auth.allowStructureForAll,
          allowStructureSelfEdit: auth.allowStructureSelfEdit,
        });
      });
  }

  changeSubordinate = checked => {
    setStructureSelfEdit({
      isAllowStructureSelfEdit: !checked,
    }).then(() => {
      this.setState({
        allowStructureSelfEdit: !checked,
      });
    });
  };

  changeReporting = checked => {
    setStructureForAll({
      forAll: !checked,
    }).then(() => {
      this.setState({
        authForAll: !checked,
      });
    });
  };

  render() {
    const { auth, authForAll, allowStructureSelfEdit, searchUser, nodeDialogVisible } = this.state;

    return (
      <Fragment>
        {auth && (
          <div className="rootBoardHeader flexRow">
            <div className="Font17 flex Bold">
              {_l('汇报关系')}
              <Tooltip
                autoCloseDelay={0}
                text={
                  <span className="White">
                    {_l(
                      '在工作表和工作流的汇报关系检索时，若当前用户的所有下级用户总数超过2000（含），系统将默认仅获取当前用户的“直属下一级”所有用户。',
                    )}
                    <div>{_l('注：用户离职时不会被移出汇报关系，您可以手动移除')}</div>
                  </span>
                }
                action={['hover']}
                popupPlacement="top"
              >
                <i className="icon-info_outline Gray_9e mLeft5" />
              </Tooltip>
            </div>

            <Fragment>
              <span
                data-tip={_l('勾选后允许员工在「个人账户/我的组织/我的汇报关系」中管理下属')}
                className="rootBoardHeaderTips"
              >
                <Checkbox checked={allowStructureSelfEdit} onClick={this.changeSubordinate} className="mLeft15">
                  {_l('允许员工自行管理下属')}
                </Checkbox>
              </span>
              <span
                data-tip={_l('勾选后允许员工在「个人账户/我的组织/我的汇报关系」中查看汇报关系')}
                className="rootBoardHeaderTips"
              >
                <Checkbox checked={authForAll} onClick={this.changeReporting} className="mLeft15">
                  {_l('全员可以查看汇报关系')}
                </Checkbox>
              </span>
            </Fragment>
          </div>
        )}
        <div className={cx('mainContent rootBoard box-sizing', { rootBoardBox: auth })}>
          <div className="card pAll20 box-sizing mLeft16 mRight16 h100">
            {auth && <SearchInput onChange={user => this.setState({ searchUser: user, nodeDialogVisible: true })} />}
            {nodeDialogVisible && (
              <NodeDialog
                auth={auth}
                id={searchUser.accountId}
                user={searchUser}
                handleClose={() => {
                  this.setState({
                    nodeDialogVisible: false,
                    searchUser: undefined,
                  });
                }}
                selectSearchUser={user => {
                  this.setState({ searchUser: user });
                }}
              />
            )}
            <div
              className="wrapper"
              ref={el => {
                this.wrapper = el;
              }}
            >
              <Node auth={auth} projectId={Config.projectId} />
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default connect()(Root);
