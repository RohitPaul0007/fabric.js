(function (window) {

  function appendResults(node, output, { goldenName }) {
      let template = document.getElementById('error_output');
      let errorOutput = template.content.cloneNode(true);
      Object.keys(output).forEach(key => {
        const canvas = output[key];
        errorOutput.querySelector(`*[data-canvas-type="${key}"]`).appendChild(canvas);
        canvas.style.cursor = 'pointer';
        canvas.setAttribute('data-golden', goldenName);
        canvas.onclick = () => {
          const link = document.createElement('a');
          link.href = fabric.util.toDataURL(canvas, 'png', 1);
          link.download = `(${key}) ${goldenName}`;
          link.click();
        }
      });
      node.appendChild(errorOutput);
      !!node.querySelector('.qunit-collapsed') && node.querySelector('table').classList.add('qunit-collapsed');
      node.firstChild.addEventListener('click', () => {
        node.querySelector('table').classList.toggle('qunit-collapsed');
      });
  }


  // https://api.qunitjs.com/callbacks/QUnit.testDone/
  function visualCallback() {
    this.currentArgs = {};
  }

  visualCallback.prototype.addArguments = function(argumentObj) {
    this.currentArgs = Object.assign({}, argumentObj);
  };

  visualCallback.prototype.testDone = function (details) {
    if (window && document && this.currentArgs.enabled) {
      let fabricCanvasDataRef = this.currentArgs.fabric;
      let ouputImageDataRef = this.currentArgs.diff;
      let goldenCanvasRef = this.currentArgs.golden;
      let goldenName = this.currentArgs.goldenName;
      let id = 'qunit-test-output-' + details.testId;
      let fabricCopy = document.createElement('canvas');
      let diff = document.createElement('canvas');
      diff.width = fabricCopy.width = fabricCanvasDataRef.width;
      diff.height = fabricCopy.height = fabricCanvasDataRef.height;
      diff.getContext('2d').putImageData(ouputImageDataRef, 0, 0);
      fabricCopy.getContext('2d').putImageData(fabricCanvasDataRef, 0, 0);

      let data = {
        actual: fabricCopy,
        expected: goldenCanvasRef,
        diff
      };

      let node = document.getElementById(id);

      if (node) {
        appendResults(node, data, { goldenName });
      }
      else {
        new MutationObserver((mutationList, observer) => {
          for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach(node => {
                if (node.id === id && !node.querySelector('table')) {
                  appendResults(node, data, { goldenName });
                  observer.disconnect();
                }
              });
            }
          }
        }).observe(document.getElementById('qunit-tests'), { childList: true });
      }
      // after one run, disable
      this.currentArgs.enabled = false;
    }
  };

  if (window) {
    window.visualCallback = new visualCallback();
  }
})(this);
