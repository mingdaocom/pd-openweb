import React, { Component } from 'react';
import { string, func } from 'prop-types';
import FullScreenCurtain from 'src/pages/workflow/components/FullScreenCurtain/index.jsx';
import PrintForm from 'src/pages/Print/index.jsx';

export default class PrintTemDialog extends Component {
  static propTypes = {
    onBack: func,
  };

  static defaultProps = {
    onBack: () => {},
  };

  render() {
    const { onBack, isDefault, type, from, printId, worksheetId, projectId, rowId, getType, viewId, appId, name, fileTypeNum } = this.props;
    const match = {
      params: {
        printType: 'worksheet',
        printId,
        type, // new|edit|preview
        from, //
        isDefault, // 系统打印模板
        worksheetId,
        projectId,
        rowId,
        getType,
        viewId,
        appId,
        name,
        fileTypeNum,
      },
    };

    return (
      <FullScreenCurtain>
        <PrintForm match={match} onBack={onBack} />
      </FullScreenCurtain>
    );
  }
}
