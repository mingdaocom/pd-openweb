import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import MouseBackEnd from '@mdfe/react-dnd-mouse-backend';
import CustomTemplateStageItem from './customTemplateStageItem';
import config from './config';

@DragDropContext(MouseBackEnd)
export default class CustomTemplateStage extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // 鼠标滚轮滚动
    $('#customTemplateBox .customTemplateStage').on('mousewheel DOMMouseScroll', function (event) {
      const scrollLeft = $(this).scrollLeft();
      const scrollWidth = $(this)[0].scrollWidth;
      const width = $(this).width();
      const wheelDelta = 120;
      const delta = parseInt(event.originalEvent.wheelDelta || -event.originalEvent.detail, 10);
      const isMac = /mac/i.test(navigator.platform);

      if (isMac && Math.abs(delta) < 50) {
        return;
      }

      // up
      if (delta > 0) {
        $(this).scrollLeft(scrollLeft - wheelDelta > 0 ? scrollLeft - wheelDelta : 0);
      } else if (delta < 0) {
        // down
        $(this).scrollLeft(scrollLeft + wheelDelta + width > scrollWidth ? scrollWidth - width : scrollLeft + wheelDelta);
      }
    });

    // 记录鼠标按下的位置
    $(document).on('mousedown.stageListDrag', '.customTemplateStage .customTemplateList', (event) => {
      config.mouseOffset = {
        left: event.clientX,
        top: event.clientY,
      };
    });
  }

  render() {
    return (
      <div className="customTemplateStage">
        {this.props.stages.map((item, i) => <CustomTemplateStageItem key={i} index={i} {...this.props} data={item} />)}
        {!this.props.isAddStage ? (
          <div className="customTemplateInline Font14 addNewStage" onClick={() => this.props.addStage('')}>
            <i className="icon-plus" />
            {_l('新建看板')}
          </div>
        ) : (
          undefined
        )}
        <div id="dragPreviewBox" />
      </div>
    );
  }
}
