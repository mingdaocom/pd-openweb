import React, { Component } from 'react';
import api from 'api/homeApp';
import styled from 'styled-components';
import { SvgIcon } from 'ming-ui';
import { Select } from 'ming-ui/antd-components';

const AppIconWrap = styled.div`
  width: 23px;
  height: 23px;
  margin-right: 10px;
  border-radius: 4px;
  flex-shrink: 0;

  > div {
    line-height: normal;
  }
`;

const formatOptions = projects =>
  projects.map(project => ({
    label: project.projectName,
    options: (project.projectApps || []).map(app => ({
      label: app.name,
      value: app.id,
      iconColor: app.iconColor,
      iconUrl: app.iconUrl,
    })),
  }));

const renderAppOption = ({ data }) => (
  <div className="flexRow alignItemsCenter">
    <AppIconWrap className="flexRow alignItemsCenter justifyContentCenter" style={{ backgroundColor: data.iconColor }}>
      <SvgIcon url={data.iconUrl} fill="#fff" size={20} addClassName="mTop2" />
    </AppIconWrap>
    <span className="flex ellipsis">{data.label}</span>
  </div>
);

export default class AppFilter extends Component {
  state = {
    options: [],
  };

  componentDidMount() {
    api.getAllHomeApp().then(data => {
      const projects = [
        ...(data.validProject || []),
        {
          projectId: 'validProject',
          projectName: _l('外部协作应用'),
          projectApps: data.externalApps,
        },
      ];

      this.setState({ options: formatOptions(projects) });
    });
  }

  render() {
    const { options } = this.state;
    const { apkId, onChange } = this.props;

    return (
      <Select
        allowClear
        className="w100"
        showPopupSearch
        optionFilterProp="label"
        value={apkId || undefined}
        options={options}
        optionRender={renderAppOption}
        notFoundContent={_l('暂无应用搜索结果')}
        onChange={onChange}
      />
    );
  }
}
