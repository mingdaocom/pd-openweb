import React, { Fragment, Component } from 'react';
import Icon from 'ming-ui/components/Icon';
import SvgIcon from 'src/components/SvgIcon';
import { MY_APP_SIDE_DATA } from '../config';
import { navigateTo } from 'src/router/navigateTo';
import ThirdApp from './ThirdApp';
import MyProcessEntry from 'src/pages/workflow/MyProcess/Entry';
import MyProcess from 'src/pages/workflow/MyProcess';
import privateSource from 'src/api/privateSource';

const SingleItem = ({ icon, iconUrl, text, color, onClick }) => {
  return (
    <li onClick={onClick}>
      {icon && <Icon icon={icon} style={{ color, fontSize: '18px' }} />}
      {iconUrl && <SvgIcon size="18" fill={color} url={iconUrl} />}
      <span className="Gray_75">{text}</span>
    </li>
  );
};

export default class MyAppSide extends Component {
  state = {
    thirdPartyAppVisible: false,
    myProcessVisible: location.href.toLocaleLowerCase().indexOf('processmatters') > -1,
    countData: {},
    sourcesList: [],
  };
  componentDidMount() {
    privateSource.getSources({ status: 1 }).then(result => {
      const sourcesList = result.map(item => {
        return {
          color: item.color,
          iconUrl: item.iconUrl,
          text: item.name,
          id: item.eventParams ? 'thirdApp' : item.id,
          href: item.linkParams ? item.linkParams.url : null,
        };
      });
      MY_APP_SIDE_DATA.forEach(item => {
        if (item.id === 'sourcemodule') {
          item.data = sourcesList;
        }
      });
      this.setState({ sourcesList });
    });
  }
  render() {
    const { thirdPartyAppVisible, myProcessVisible, countData } = this.state;
    return (
      <div className="myAppSideWrap">
        <MyProcessEntry
          countData={countData}
          onClick={() => {
            this.setState({ myProcessVisible: true });
          }}
          updateCountData={countData => {
            this.setState({ countData });
          }}
        />
        {MY_APP_SIDE_DATA.map(({ title, data }, key) => {
          if (
            data.filter(
              item => !_.includes(['hr', 'thirdApp'], item.id) || _.get(md, ['global', 'Account', 'hrVisible']),
            ).length === 0
          ) {
            return null;
          }

          return (
            <Fragment key={key}>
              {data.length ? <div className="appTitle Font13 Gray_9e bold">{title}</div> : null}
              <ul>
                {data.map(({ id, href, ...rest }) => {
                  if (_.includes(['hr', 'thirdApp'], id) && !_.get(md, ['global', 'Account', 'hrVisible'])) {
                    return null;
                  }

                  if (href && href.indexOf('http') > -1) {
                    return (
                      <a key={id} href={href} className="Gray NoUnderline" target="_blank">
                        <SingleItem {...rest} />
                      </a>
                    );
                  }

                  if (id === 'help') {
                    return (
                      <SingleItem
                        key={id}
                        {...rest}
                        onClick={() => window.KF5SupportBoxAPI && window.KF5SupportBoxAPI.open()}
                      />
                    );
                  }
                  if (id === 'thirdApp') {
                    return (
                      <SingleItem key={id} {...rest} onClick={() => this.setState({ thirdPartyAppVisible: true })} />
                    );
                  }
                  return <SingleItem key={id} {...rest} onClick={() => navigateTo(href)} />;
                })}
              </ul>
            </Fragment>
          );
        })}

        {md.global.Config.Version && (
          <div
            className="TxtCenter Font12 Gray_9e pBottom10"
            style={{ position: 'fixed', bottom: 0, width: 240, background: '#fafafa' }}
          >
            {_l('当前版本：v%0', md.global.Config.Version)}
          </div>
        )}

        {thirdPartyAppVisible && <ThirdApp onCancel={() => this.setState({ thirdPartyAppVisible: false })} />}
        {myProcessVisible && (
          <MyProcess
            countData={countData}
            onCancel={() => {
              this.setState({ myProcessVisible: false });
            }}
            updateCountData={countData => {
              this.setState({ countData });
            }}
          />
        )}
      </div>
    );
  }
}
