import React from 'react';
import config from '../../../config';

import 'src/components/UploadFiles/index.less';

class EditModel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { widget } = this.props;
    let { data } = widget;
    return (
      <div className="UploadFiles">
        <div className="UploadFiles-header">
          <div className="UploadFiles-entrys">
            <div>
              <i className="icon icon-localUpload ThemeColor3" />
              <span>{_l('本地文件')}</span>
            </div>
            <div>
              <i className="icon icon-home-knowledge ThemeColor3" />
              <span>{_l('知识中心')}</span>
            </div>
          </div>
          <div className="UploadFiles-ramSize">
            <div className="UploadFiles-attachmentProgress">
              <div className="UploadFiles-currentProgress ThemeBGColor3" />
            </div>
            <div className="UploadFiles-info">0/1G({_l('至多本地, 知识文件各20个')})</div>
          </div>
        </div>
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.ATTACHMENT.type,
  EditModel,
};
