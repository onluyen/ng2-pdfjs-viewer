(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common')) :
  typeof define === 'function' && define.amd ? define('@onluyen/ng2-pdfjs-viewer', ['exports', '@angular/core', '@angular/common'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.onluyen = global.onluyen || {}, global.onluyen["ng2-pdfjs-viewer"] = {}), global.ng.core, global.ng.common));
})(this, (function (exports, core, common) { 'use strict';

  var PdfJsViewerComponent = /** @class */ (function () {
      function PdfJsViewerComponent() {
          this.onBeforePrint = new core.EventEmitter();
          this.onAfterPrint = new core.EventEmitter();
          this.onDocumentLoad = new core.EventEmitter();
          this.onPageChange = new core.EventEmitter();
          this.externalWindow = false;
          this.showSpinner = true;
          this.openFile = true;
          this.download = true;
          this.viewBookmark = false;
          this.print = true;
          this.fullScreen = true;
          //@Input() public showFullScreen: boolean;
          this.find = true;
          this.useOnlyCssZoom = false;
          this.errorOverride = false;
          this.errorAppend = true;
          this.diagnosticLogs = true;
          this.closeFile = new core.EventEmitter();
      }
      Object.defineProperty(PdfJsViewerComponent.prototype, "page", {
          get: function () {
              if (this.PDFViewerApplication) {
                  return this.PDFViewerApplication.page;
              }
              else {
                  if (this.diagnosticLogs)
                      console.warn("Document is not loaded yet!!!. Try to retrieve page# after full load.");
              }
          },
          set: function (_page) {
              this._page = _page;
              if (this.PDFViewerApplication) {
                  this.PDFViewerApplication.page = this._page;
              }
              else {
                  if (this.diagnosticLogs)
                      console.warn("Document is not loaded yet!!!. Try to set page# after full load. Ignore this warning if you are not setting page# using '.' notation. (E.g. pdfViewer.page = 5;)");
              }
          },
          enumerable: false,
          configurable: true
      });
      Object.defineProperty(PdfJsViewerComponent.prototype, "pdfSrc", {
          get: function () {
              return this._src;
          },
          set: function (_src) {
              this._src = _src;
          },
          enumerable: false,
          configurable: true
      });
      Object.defineProperty(PdfJsViewerComponent.prototype, "PDFViewerApplicationOptions", {
          get: function () {
              var pdfViewerOptions = null;
              if (this.externalWindow) {
                  if (this.viewerTab) {
                      pdfViewerOptions = this.viewerTab.PDFViewerApplicationOptions;
                  }
              }
              else {
                  if (this.iframePDF.nativeElement.contentWindow) {
                      pdfViewerOptions = this.iframePDF.nativeElement.contentWindow.PDFViewerApplicationOptions;
                  }
              }
              return pdfViewerOptions;
          },
          enumerable: false,
          configurable: true
      });
      Object.defineProperty(PdfJsViewerComponent.prototype, "PDFViewerApplication", {
          get: function () {
              var pdfViewer = null;
              if (this.externalWindow) {
                  if (this.viewerTab) {
                      pdfViewer = this.viewerTab.PDFViewerApplication;
                  }
              }
              else {
                  if (this.iframePDF.nativeElement.contentWindow) {
                      pdfViewer = this.iframePDF.nativeElement.contentWindow.PDFViewerApplication;
                  }
              }
              return pdfViewer;
          },
          enumerable: false,
          configurable: true
      });
      PdfJsViewerComponent.prototype.receiveMessage = function (viewerEvent) {
          var _this = this;
          if (viewerEvent.data && viewerEvent.data.viewerId && viewerEvent.data.event) {
              var viewerId = viewerEvent.data.viewerId;
              var event = viewerEvent.data.event;
              var param = viewerEvent.data.param;
              if (this.viewerId == viewerId) {
                  if (this.onBeforePrint && event == "beforePrint") {
                      this.onBeforePrint.emit();
                  }
                  else if (this.onAfterPrint && event == "afterPrint") {
                      this.onAfterPrint.emit();
                  }
                  else if (this.onDocumentLoad && event == "pagesLoaded") {
                      this.onDocumentLoad.emit(param);
                  }
                  else if (this.onPageChange && event == "pageChange") {
                      this.onPageChange.emit(param);
                  }
              }
          }
          if (viewerEvent.data && viewerEvent.data.event === "closefile") {
              this.closeFile.emit(true);
          }
          else if (viewerEvent.data && viewerEvent.data.event === "loaderError") {
              this.loadingSpin.nativeElement.style.display = 'block';
              this.iframePDF.nativeElement.style.display = 'none';
              var url_1 = this.getUrlFile();
              var ext = this.getFileExtension(url_1.split('.pdf')[0]);
              if (this.isValidFile(ext)) {
                  console.log(url_1.split('.pdf')[0]);
                  this.viewWordBar.nativeElement.style.display = 'block';
                  this.viewerUrl = "https://docs.google.com/gview?url=" + url_1.split('.pdf')[0] + "&embedded=true";
                  this.iframeDocx.nativeElement.style.display = 'block';
                  var countTimeload_1 = 0;
                  var checkContent_1 = false;
                  setTimeout(function () {
                      do {
                          _this.iframeDocx.nativeElement.src = _this.viewerUrl;
                          setTimeout(function () {
                              var _a, _b, _c, _d;
                              var content = (_d = (_c = (_b = (_a = _this.iframeDocx.nativeElement) === null || _a === void 0 ? void 0 : _a.contentWindow) === null || _b === void 0 ? void 0 : _b.document) === null || _c === void 0 ? void 0 : _c.getElementsByTagName('body')[0]) === null || _d === void 0 ? void 0 : _d.innerHTML;
                              if (content !== '') {
                                  checkContent_1 = true;
                                  return;
                              }
                              else {
                                  countTimeload_1++;
                              }
                          }, 3000 * countTimeload_1);
                      } while (countTimeload_1 === 4 || checkContent_1);
                      if (!checkContent_1) {
                          _this.viewerUrl = "https://view.officeapps.live.com/op/embed.aspx?src=" + url_1.split('.pdf')[0];
                          _this.iframeDocx.nativeElement.src = _this.viewerUrl;
                      }
                      else {
                          alert('Hiện tại chưa xem được file!');
                      }
                  });
                  setTimeout(function () {
                      _this.loadingSpin.nativeElement.style.display = 'none';
                  }, 3200 * countTimeload_1);
              }
              else {
                  console.log('Định dạng không hợp lệ!');
              }
          }
      };
      PdfJsViewerComponent.prototype.downloadFile = function (blobUrl, filename) {
          var a = document.createElement('a');
          if (!a.click) {
              throw new Error('DownloadManager: "a.click()" is not supported.');
          }
          a.href = blobUrl;
          a.target = '_parent';
          if ('download' in a) {
              a.download = filename;
          }
          (document.body || document.documentElement).appendChild(a);
          a.click();
          a.remove();
      };
      PdfJsViewerComponent.prototype.downloadWordFile = function () {
          console.log('download file!');
          var url = this.getUrlFile();
          var ext = this.getFileExtension(url.split('.pdf')[0]);
          console.log(url.split('.pdf')[0]);
          if (this.isValidFile(ext)) {
              this.downloadFile(url.split('.pdf')[0], 'test');
          }
          else {
              this.downloadFile(url, 'test');
          }
      };
      PdfJsViewerComponent.prototype.closeWordFile = function () {
          console.log('close File!');
          this.closeFile.emit(true);
      };
      PdfJsViewerComponent.prototype.isValidFile = function (str) {
          switch (str.toLowerCase()) {
              case 'doc':
              case 'docx':
              case 'xls':
              case 'xlsx':
              case 'pptx':
              case 'ppt':
                  return true;
          }
          return false;
      };
      PdfJsViewerComponent.prototype.getUrlFile = function () {
          if (this._src instanceof Blob) {
              return encodeURIComponent(URL.createObjectURL(this._src));
          }
          else if (this._src instanceof Uint8Array) {
              var blob = new Blob([this._src], { type: "application/pdf" });
              return encodeURIComponent(URL.createObjectURL(blob));
          }
          else {
              return this._src;
          }
      };
      PdfJsViewerComponent.prototype.getFileExtension = function (filename) {
          var ext = /^.+\.([^.]+)$/.exec(filename);
          return ext == null ? '' : ext[1];
      };
      PdfJsViewerComponent.prototype.ngOnInit = function () {
          window.addEventListener("message", this.receiveMessage.bind(this), false);
          if (!this.externalWindow) { // Load pdf for embedded views
              this.loadPdf();
          }
      };
      PdfJsViewerComponent.prototype.refresh = function () {
          this.loadPdf();
      };
      PdfJsViewerComponent.prototype.loadPdf = function () {
          if (!this._src) {
              return;
          }
          this.viewerUrl = '';
          this.viewWordBar.nativeElement.style.display = 'none';
          // console.log(`Tab is - ${this.viewerTab}`);
          // if (this.viewerTab) {
          //   console.log(`Status of window - ${this.viewerTab.closed}`);
          // }
          this.iframeDocx.nativeElement.style.display = 'none';
          if (this.externalWindow && (typeof this.viewerTab === 'undefined' || this.viewerTab.closed)) {
              this.viewerTab = window.open('', '_blank', this.externalWindowOptions || '');
              if (this.viewerTab == null) {
                  if (this.diagnosticLogs)
                      console.error("ng2-pdfjs-viewer: For 'externalWindow = true'. i.e opening in new tab to work, pop-ups should be enabled.");
                  return;
              }
              if (this.showSpinner) {
                  this.viewerTab.document.write("\n          <style>\n          .loader {\n            position: fixed;\n            left: 40%;\n            top: 40%;\n            border: 16px solid #f3f3f3;\n            border-radius: 50%;\n            border-top: 16px solid #3498db;\n            width: 120px;\n            height: 120px;\n            animation: spin 2s linear infinite;\n          }\n          @keyframes spin {\n            0% {\n              transform: rotate(0deg);\n            }\n            100% {\n              transform: rotate(360deg);\n            }\n          }\n          </style>\n          <div class=\"loader\"></div>\n        ");
              }
          }
          var fileUrl = this.getUrlFile();
          // let this.viewerUrl;
          if (this.viewerFolder) {
              this.viewerUrl = this.viewerFolder + "/web/viewer.html";
          }
          else {
              this.viewerUrl = "assets/pdfjs/web/viewer.html";
          }
          this.viewerUrl += "?file=" + fileUrl;
          if (typeof this.viewerId !== 'undefined') {
              this.viewerUrl += "&viewerId=" + this.viewerId;
          }
          if (typeof this.onBeforePrint !== 'undefined') {
              this.viewerUrl += "&beforePrint=true";
          }
          if (typeof this.onAfterPrint !== 'undefined') {
              this.viewerUrl += "&afterPrint=true";
          }
          if (typeof this.onDocumentLoad !== 'undefined') {
              this.viewerUrl += "&pagesLoaded=true";
          }
          if (typeof this.onPageChange !== 'undefined') {
              this.viewerUrl += "&pageChange=true";
          }
          if (typeof this.closeButton !== 'undefined') {
              this.viewerUrl += "&closeFile=" + this.closeButton;
          }
          if (this.downloadFileName) {
              if (!this.downloadFileName.endsWith(".pdf")) {
                  this.downloadFileName += ".pdf";
              }
              this.viewerUrl += "&fileName=" + this.downloadFileName;
          }
          if (typeof this.openFile !== 'undefined') {
              this.viewerUrl += "&openFile=" + this.openFile;
          }
          if (typeof this.download !== 'undefined') {
              this.viewerUrl += "&download=" + this.download;
          }
          if (this.startDownload) {
              this.viewerUrl += "&startDownload=" + this.startDownload;
          }
          if (typeof this.viewBookmark !== 'undefined') {
              this.viewerUrl += "&viewBookmark=" + this.viewBookmark;
          }
          if (typeof this.print !== 'undefined') {
              this.viewerUrl += "&print=" + this.print;
          }
          if (this.startPrint) {
              this.viewerUrl += "&startPrint=" + this.startPrint;
          }
          if (typeof this.fullScreen !== 'undefined') {
              this.viewerUrl += "&fullScreen=" + this.fullScreen;
          }
          // if (this.showFullScreen) {
          //   this.viewerUrl += `&showFullScreen=${this.showFullScreen}`;
          // }
          if (typeof this.find !== 'undefined') {
              this.viewerUrl += "&find=" + this.find;
          }
          if (this.lastPage) {
              this.viewerUrl += "&lastpage=" + this.lastPage;
          }
          if (this.rotatecw) {
              this.viewerUrl += "&rotatecw=" + this.rotatecw;
          }
          if (this.rotateccw) {
              this.viewerUrl += "&rotateccw=" + this.rotateccw;
          }
          if (this.cursor) {
              this.viewerUrl += "&cursor=" + this.cursor;
          }
          if (this.scroll) {
              this.viewerUrl += "&scroll=" + this.scroll;
          }
          if (this.spread) {
              this.viewerUrl += "&spread=" + this.spread;
          }
          if (this.locale) {
              this.viewerUrl += "&locale=" + this.locale;
          }
          if (this.useOnlyCssZoom) {
              this.viewerUrl += "&useOnlyCssZoom=" + this.useOnlyCssZoom;
          }
          if (this._page || this.zoom || this.nameddest || this.pagemode)
              this.viewerUrl += "#";
          if (this._page) {
              this.viewerUrl += "&page=" + this._page;
          }
          if (this.zoom) {
              this.viewerUrl += "&zoom=" + this.zoom;
          }
          if (this.nameddest) {
              this.viewerUrl += "&nameddest=" + this.nameddest;
          }
          if (this.pagemode) {
              this.viewerUrl += "&pagemode=" + this.pagemode;
          }
          if (this.errorOverride || this.errorAppend) {
              this.viewerUrl += "&errorMessage=" + this.errorMessage;
              if (this.errorOverride) {
                  this.viewerUrl += "&errorOverride=" + this.errorOverride;
              }
              if (this.errorAppend) {
                  this.viewerUrl += "&errorAppend=" + this.errorAppend;
              }
          }
          if (this.externalWindow) {
              this.viewerTab.location.href = this.viewerUrl;
          }
          else {
              this.iframePDF.nativeElement.src = this.viewerUrl;
          }
          console.log("\n      pdfSrc = " + this.pdfSrc + "\n      fileUrl = " + fileUrl + "\n      externalWindow = " + this.externalWindow + "\n      downloadFileName = " + this.downloadFileName + "\n    ");
          // viewerFolder = ${this.viewerFolder}
          // openFile = ${this.openFile}
          // download = ${this.download}
          // startDownload = ${this.startDownload}
          // viewBookmark = ${this.viewBookmark}
          // print = ${this.print}
          // startPrint = ${this.startPrint}
          // fullScreen = ${this.fullScreen}
          // find = ${this.find}
          // lastPage = ${this.lastPage}
          // rotatecw = ${this.rotatecw}
          // rotateccw = ${this.rotateccw}
          // cursor = ${this.cursor}
          // scrollMode = ${this.scroll}
          // spread = ${this.spread}
          // page = ${this.page}
          // zoom = ${this.zoom}
          // nameddest = ${this.nameddest}
          // pagemode = ${this.pagemode}
          // pagemode = ${this.errorOverride}
          // pagemode = ${this.errorAppend}
          // pagemode = ${this.errorMessage}
      };
      return PdfJsViewerComponent;
  }());
  PdfJsViewerComponent.decorators = [
      { type: core.Component, args: [{
                  selector: 'ng2-pdfjs-viewer',
                  template: "\n  <style>\n  .toolbar {\n    position: relative;\n    left: 0;\n    right: 0;\n    z-index: 9999;\n    cursor: default;\n    display: none;\n  }\n\n  #toolbarContainer {\n    width: 100%;\n  }\n\n  #toolbarContainer {\n    position: relative;\n    height: 32px;\n    background-color: #474747;\n    background-image: linear-gradient(hsla(0,0%,32%,.99), hsla(0,0%,27%,.95));\n  }\n\n  #toolbarViewer {\n    height: 32px;\n    display: flex;\n    flex-direction: row;\n    justify-content: flex-end;\n    align-items: center;\n  }\n\n  button{\n    background: none;\n    width: 53px;\n    height: 25px;\n    min-width: 16px;\n    padding: 2px 6px 0;\n    border: 1px solid transparent;\n    border-radius: 2px;\n    color: hsla(0,0%,100%,.8);\n    font-size: 12px;\n    line-height: 14px;\n    -webkit-user-select: none;\n       -moz-user-select: none;\n        -ms-user-select: none;\n            user-select: none;\n    /* Opera does not support user-select, use <... unselectable=\"on\"> instead */\n    cursor: pointer;\n    transition-property: background-color, border-color, box-shadow;\n    transition-duration: 150ms;\n    transition-timing-function: ease;\n  }\n\n  button:hover{\n    background-color: hsla(0,0%,0%,.12);\n    background-image: linear-gradient(hsla(0,0%,100%,.05), hsla(0,0%,100%,0));\n    background-clip: padding-box;\n    border: 1px solid hsla(0,0%,0%,.35);\n    border-color: hsla(0,0%,0%,.32) hsla(0,0%,0%,.38) hsla(0,0%,0%,.42);\n    box-shadow: 0 1px 0 hsla(0,0%,100%,.05) inset,\n                0 0 1px hsla(0,0%,100%,.15) inset,\n                0 1px 0 hsla(0,0%,100%,.05);\n  }\n\n  .loadingSpin{\n    display: none;\n    position: relative;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    background-color: rgba(0, 0, 0, .25);\n    z-index: 1000; \n  }\n\n  .loader {\n    z-index: 1001; \n    position: absolute;\n    left: 50%;\n    top: 50%;\n    transform: translate(-50%, -50%);\n    border: 16px solid #f3f3f3;\n    border-radius: 50%;\n    border-top: 16px solid #3498db;\n    width: 120px;\n    height: 120px;\n    -webkit-animation: spin 2s linear infinite; /* Safari */\n    animation: spin 2s linear infinite;\n  }\n  \n  /* Safari */\n  @-webkit-keyframes spin {\n    0% { -webkit-transform: rotate(0deg); }\n    100% { -webkit-transform: rotate(360deg); }\n  }\n  \n  @keyframes spin {\n    0% { transform: rotate(0deg); }\n    100% { transform: rotate(360deg); }\n  }\n  </style>\n  <div #viewWordBar class=\"toolbar\">\n    <div id=\"toolbarContainer\">\n      <div id=\"toolbarViewer\">\n          <button id=\"download\" (click)=\"downloadWordFile()\" class=\"toolbarButton download\" title=\"Download\" tabindex=\"34\" data-l10n-id=\"download\">\n            <img src=\"/assets/pdfjs/web/images/toolbarButton-download.png\" alt=\"Download\"/>\n          </button>\n                \n          <button id=\"closeFile\" (click)=\"closeWordFile()\" class=\"toolbarButton\" title=\"Close\" tabindex=\"36\" data-l10n-id=\"closeFile\">\n          <img src=\"/assets/pdfjs/web/images/close-file.png\" alt=\"Close\"/>\n          </button>\n        </div>\n      </div>\n  </div>\n  <div #loadingSpin class=\"loadingSpin\">\n    <div class=\"loader\"></div>\n  </div>\n  <iframe id=\"iframeDocx\" #iframeDocx title=\"ng2-pdfjs-viewer\" [hidden]=\"externalWindow || (!externalWindow && !pdfSrc)\" width=\"100%\" height=\"100%\"></iframe>\n\n  <iframe id=\"iframePDF\" #iframePDF title=\"ng2-pdfjs-viewer\" [hidden]=\"externalWindow || (!externalWindow && !pdfSrc)\" width=\"100%\" height=\"100%\"></iframe>\n  "
              },] }
  ];
  PdfJsViewerComponent.propDecorators = {
      viewWordBar: [{ type: core.ViewChild, args: ['viewWordBar', { static: true },] }],
      loadingSpin: [{ type: core.ViewChild, args: ['loadingSpin', { static: true },] }],
      iframeDocx: [{ type: core.ViewChild, args: ['iframeDocx', { static: true },] }],
      iframePDF: [{ type: core.ViewChild, args: ['iframePDF', { static: true },] }],
      viewerId: [{ type: core.Input }],
      onBeforePrint: [{ type: core.Output }],
      onAfterPrint: [{ type: core.Output }],
      onDocumentLoad: [{ type: core.Output }],
      onPageChange: [{ type: core.Output }],
      viewerFolder: [{ type: core.Input }],
      externalWindow: [{ type: core.Input }],
      showSpinner: [{ type: core.Input }],
      downloadFileName: [{ type: core.Input }],
      openFile: [{ type: core.Input }],
      download: [{ type: core.Input }],
      startDownload: [{ type: core.Input }],
      viewBookmark: [{ type: core.Input }],
      print: [{ type: core.Input }],
      startPrint: [{ type: core.Input }],
      fullScreen: [{ type: core.Input }],
      find: [{ type: core.Input }],
      zoom: [{ type: core.Input }],
      nameddest: [{ type: core.Input }],
      pagemode: [{ type: core.Input }],
      lastPage: [{ type: core.Input }],
      rotatecw: [{ type: core.Input }],
      rotateccw: [{ type: core.Input }],
      cursor: [{ type: core.Input }],
      scroll: [{ type: core.Input }],
      spread: [{ type: core.Input }],
      locale: [{ type: core.Input }],
      useOnlyCssZoom: [{ type: core.Input }],
      errorOverride: [{ type: core.Input }],
      errorAppend: [{ type: core.Input }],
      errorMessage: [{ type: core.Input }],
      diagnosticLogs: [{ type: core.Input }],
      externalWindowOptions: [{ type: core.Input }],
      closeButton: [{ type: core.Input }],
      closeFile: [{ type: core.Output }],
      page: [{ type: core.Input }],
      pdfSrc: [{ type: core.Input }]
  };

  var PdfJsViewerModule = /** @class */ (function () {
      function PdfJsViewerModule() {
      }
      PdfJsViewerModule.forRoot = function () {
          return {
              ngModule: PdfJsViewerModule
          };
      };
      return PdfJsViewerModule;
  }());
  PdfJsViewerModule.decorators = [
      { type: core.NgModule, args: [{
                  imports: [
                      common.CommonModule
                  ],
                  declarations: [
                      PdfJsViewerComponent
                  ],
                  exports: [
                      PdfJsViewerComponent
                  ]
              },] }
  ];

  /**
   * Generated bundle index. Do not edit.
   */

  exports.PdfJsViewerComponent = PdfJsViewerComponent;
  exports.PdfJsViewerModule = PdfJsViewerModule;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=onluyen-ng2-pdfjs-viewer.umd.js.map
