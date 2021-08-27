import React, { Fragment, Component } from 'react';
import { Flex, Button, Modal } from 'antd-mobile';
import noAppImg from './img/noApp.png';
import noAppListImg from './img/noList.png';
import noRoleImg from './img/lock.png';
import AppManagement from 'src/api/appManagement';
import './index.less';

const STATUS_TO_TEXT = {
  1: { src: noAppListImg, text: _l('请前往Web端创建工作表，开始构建你的应用') },
  2: { src: noAppImg, text: _l('应用不存在') },
  4: { src: noRoleImg, text: _l('你还不是应用成员，无权访问此应用') },
  5: { src: noRoleImg, text: _l('未分配任何工作表，请联系此应用的管理员') },
};

export default class PermissionsInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
    	isAppActioning: false,
    }
  }
  handleAddAppApply = () => {
  	const { appId } = this.props;
  	this.setState({ isAppActioning: true });
	  AppManagement.addAppApply({
	    appId,
	    remark: '',
	  }).then(data => {
	  	this.setState({ isAppActioning: false });
	    if (data) {
	      Modal.alert(
	        _l('申请已提交'),
	        '',
	        [{
	          text: _l('确定'),
	          onPress: () => { },
	        },
	        ]);
	    }
	  });
  }
  render() {
  	const { isAppActioning } = this.state;
  	const { status, isApp } = this.props;
  	return (
      <Flex
        align="center"
        justify="between"
        style={{
          height: isApp ? '100%' : document.documentElement.clientHeight,
        }}
        className="TxtMiddle TxtCenter WhiteBG box-sizing overflowHidden">
        <Flex.Item>
          <img src={STATUS_TO_TEXT[status].src} alt={_l('错误')} className="InlineBlock" width="110" />
          <br />
          <p className="mTop25 mBottom25 TxtCenter Gray Font17 hintInfo">{STATUS_TO_TEXT[status].text}</p>
          {status === 4 && (
          	<div style={{height: 120}}>
	            <Button
	              inline
	              loading={isAppActioning}
	              type="primary"
	              size="middle"
	              className="applyBtn"
	              onClick={this.handleAddAppApply}
	            >
	              {_l('申请加入')}
	            </Button>
            </div>
          )}
        </Flex.Item>
      </Flex>
  	);
  }
}