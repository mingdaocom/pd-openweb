import domtoimage from 'dom-to-image';

const printImage = el => {
  return new Promise((resolve, reject) => {
    domtoimage.toPng(el).then((dataUrl) => {
      let img = new Image();
      img.onload = () => {
        resolve(img);
      }
      img.src = dataUrl;
    }).catch((error) => {
      console.error('oops, something went wrong!', error);
      resolve();
    });
  });
}

class Canvas {
  constructor (config = {}) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = config.bgWidth;
    this.canvas.height = config.bgHeight;
    this.ctx = this.canvas.getContext('2d');
    this.title = config.title;
  }
  async mergeRun(els) {
    const imgSrcs = els.map(({ el }) => printImage(el));
    const imgEles = await Promise.all(imgSrcs);
    imgEles.map((item, index) => {
      if (item) {
        const { x = 0, y = 0 } = els[index];
        const { offsetWidth, offsetHeight } = els[index].el;
        this.ctx.drawImage(item, x, y, offsetWidth, offsetHeight);
      }
    });
  }
  download() {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(blob => {
        try {
          saveAs(blob, this.title);
          setTimeout(() => {
            resolve(blob);
          }, 1000);
        } catch (err) {
          reject();
        }
      });
    });
  }
}

const printGunter = (name) => {

  return new Promise((resolve, reject) => {

    const directoryHeader = document.querySelector('.gunterDirectoryHeader');
    const groupingScroller = document.querySelector('.gunterGroupingScroller');
    const chartHeader = document.querySelector('.gunterChartHeader .headerScroll');
    const chartScroller = document.querySelector('.gunterChartScroller');

    const gunter = new Canvas({
       bgWidth: groupingScroller.offsetWidth + chartHeader.offsetWidth,
       bgHeight: directoryHeader.offsetHeight + groupingScroller.offsetHeight,
       title: name
    });

    gunter.mergeRun([
      {
        el: directoryHeader,
        x: 0,
        y: 0,
      },
      {
        el: groupingScroller,
        x: 0,
        y: directoryHeader.offsetHeight,
      },
      {
        el: chartHeader,
        x: directoryHeader.offsetWidth,
        y: 0,
      },
      {
        el: chartScroller,
        x: directoryHeader.offsetWidth,
        y: chartHeader.offsetHeight,
      }
    ]).then(() => {
      gunter.download().then(blob => {
        if (blob) {
          window.close();
        } else {
          resolve(true);
        }
      }).catch(() => {
        resolve(true);
      });
    });

  });

}

export default printGunter;
