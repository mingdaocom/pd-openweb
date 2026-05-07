import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button, Dialog, Dropdown, FunctionWrap, LoadDiv, MultipleDropdown } from 'ming-ui';
import ajaxRequest from 'src/api/appManagement';
import knowledgeAjax from 'src/pages/AppSettings/components/Knowledge/api/knowledge';
import '../SelectUsersFromApp/index.less';

class SelectVectorKnowledge extends Component {
  static propTypes = {
    companyId: PropTypes.string.isRequired,
    appId: PropTypes.string,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
  };
  static defaultProps = {
    companyId: '',
    appId: '',
    onOk: () => {},
    onCancel: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      selectAppId: props.appId,
      selectKnowledgeIds: [],
      appList: null,
      knowledgeList: [],
    };
  }

  componentDidMount() {
    const { selectAppId } = this.state;

    this.getAppList();

    if (selectAppId) {
      this.getKnowledgeByApp(selectAppId);
    }
  }

  /**
   * 获取所有的应用
   */
  getAppList() {
    const { selectAppId } = this.state;

    ajaxRequest.getManagerApps({ projectId: this.props.companyId }).then(result => {
      result = result.map(({ appId, appName }) => {
        return {
          value: appId,
          text: selectAppId === appId ? appName + _l('（本应用）') : appName,
          label: appName,
        };
      });

      this.setState({ appList: result });

      if (!selectAppId && result.length) {
        this.setState({ selectAppId: result[0].value });
        this.getKnowledgeByApp(result[0].value);
      }
    });
  }

  /**
   * 根据应用获取知识库
   */
  getKnowledgeByApp(appId) {
    knowledgeAjax.getKnowledgeBase({ apkId: appId }).then(res => {
      res = res.map(({ id, name }) => {
        return {
          value: id,
          label: name,
        };
      });

      this.setState({ knowledgeList: res });
    });
  }

  /**
   * 确认事件
   */
  onOk = () => {
    const { selectAppId, selectKnowledgeIds, appList, knowledgeList } = this.state;
    const appName = appList.find(item => item.value === selectAppId).label;
    const list = selectKnowledgeIds.map(id => {
      const singleRole = knowledgeList.find(item => item.value === id);
      return {
        id,
        name: singleRole.label,
      };
    });

    this.props.onOk({ appId: selectAppId, appName, knowledgeList: list });
    this.props.onCancel();
  };

  /**
   * 渲染内容
   */
  renderContent() {
    const { onCancel } = this.props;
    const { selectAppId, selectKnowledgeIds, appList, knowledgeList } = this.state;
    const label = selectKnowledgeIds.map(id => knowledgeList.find(item => item.value === id).label);

    return (
      <Fragment>
        <div className="formItem flexRow mTop10">
          <div className="label">{_l('应用')}</div>
          <div className="content">
            <Dropdown
              isAppendToBody
              border
              openSearch
              className="w100"
              placeholder={_l('请选择')}
              noData={_l('没有可选的应用')}
              value={selectAppId}
              data={appList}
              onChange={id => {
                this.setState({ selectAppId: id, selectKnowledgeIds: [] });
                this.getKnowledgeByApp(id);
              }}
            />
          </div>
        </div>
        <div className="formItem flexRow mTop15">
          <div className="label">{_l('知识库')}</div>
          <div className="content">
            <MultipleDropdown
              className={label.length ? '' : 'noSelectRoles'}
              value={selectKnowledgeIds}
              options={knowledgeList}
              multipleSelect
              label={label.length ? label.join('、') : _l('选择知识库')}
              multipleLevel={false}
              multipleHideDropdownNav
              filter
              filterHint={_l('搜索')}
              onChange={(evt, ids) => this.setState({ selectKnowledgeIds: ids })}
            />
          </div>
        </div>
        <div className="btns TxtRight mTop20">
          <Button type="link" onClick={onCancel}>
            {_l('取消')}
          </Button>
          <Button disabled={!selectAppId || !selectKnowledgeIds.length} onClick={this.onOk}>
            {_l('确定')}
          </Button>
        </div>
      </Fragment>
    );
  }

  render() {
    const { appList } = this.state;

    return (
      <Dialog
        className="selectUserFromAppDialog"
        visible
        title={_l('选择应用下的知识库')}
        footer={null}
        onCancel={this.props.onCancel}
      >
        {appList === null ? <LoadDiv /> : this.renderContent()}
      </Dialog>
    );
  }
}

export default props => FunctionWrap(SelectVectorKnowledge, { ...props });
