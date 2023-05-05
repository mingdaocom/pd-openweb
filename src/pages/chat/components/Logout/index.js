import React, { Component } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { Button } from 'ming-ui';
import './index.less';

class Logout extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div className="logoutMask">
				<div className="logoutModal z-depth-2 card">
					<div>{_l('登录状态已过期')}</div>
					<div className="logoutBtns">
						<Button type="link" onClick={() => { unmountLogout(); }}>
							{_l('已登录')}
						</Button>
						<Button type="primary" onClick={() => { location.href = `${window.subPath || ''}/login.htm?ReturnUrl=${ encodeURIComponent(location.href) }` }}>
							{_l('重新登录')}
						</Button>
					</div>
				</div>
			</div>
		);
	}
}

const renderLogout = () => {
	const div = document.createElement('DIV');
	div.className = 'logoutWrapper';
	document.body.appendChild(div);
	render(<Logout />, document.querySelector('.logoutWrapper'));
}

const unmountLogout = () => {
	const el = document.querySelector('.logoutWrapper');
	unmountComponentAtNode(el);
	$(el).remove();
}

export default renderLogout;
