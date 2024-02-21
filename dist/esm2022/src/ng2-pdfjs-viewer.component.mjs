import { Component, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
class PdfJsViewerComponent {
    viewWordBar;
    loadingSpin;
    iframeDocx;
    iframePDF;
    viewerId;
    onBeforePrint = new EventEmitter();
    onAfterPrint = new EventEmitter();
    onDocumentLoad = new EventEmitter();
    onPageChange = new EventEmitter();
    viewerFolder;
    externalWindow = false;
    showSpinner = true;
    downloadFileName;
    openFile = true;
    download = true;
    startDownload;
    viewBookmark = false;
    print = true;
    startPrint;
    fullScreen = true;
    //@Input() public showFullScreen: boolean;
    find = true;
    zoom;
    nameddest;
    pagemode;
    lastPage;
    rotatecw;
    rotateccw;
    cursor;
    scroll;
    spread;
    locale;
    useOnlyCssZoom = false;
    errorOverride = false;
    errorAppend = true;
    errorMessage;
    diagnosticLogs = true;
    externalWindowOptions;
    viewerTab;
    _src;
    _page;
    closeButton;
    closeFile = new EventEmitter();
    viewerUrl;
    set page(_page) {
        this._page = _page;
        if (this.PDFViewerApplication) {
            this.PDFViewerApplication.page = this._page;
        }
        else {
            if (this.diagnosticLogs)
                console.warn("Document is not loaded yet!!!. Try to set page# after full load. Ignore this warning if you are not setting page# using '.' notation. (E.g. pdfViewer.page = 5;)");
        }
    }
    get page() {
        if (this.PDFViewerApplication) {
            return this.PDFViewerApplication.page;
        }
        else {
            if (this.diagnosticLogs)
                console.warn("Document is not loaded yet!!!. Try to retrieve page# after full load.");
        }
    }
    set pdfSrc(_src) {
        this._src = _src;
    }
    get pdfSrc() {
        return this._src;
    }
    get PDFViewerApplicationOptions() {
        let pdfViewerOptions = null;
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
    }
    get PDFViewerApplication() {
        let pdfViewer = null;
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
    }
    receiveMessage(viewerEvent) {
        if (viewerEvent.data && viewerEvent.data.viewerId && viewerEvent.data.event) {
            let viewerId = viewerEvent.data.viewerId;
            let event = viewerEvent.data.event;
            let param = viewerEvent.data.param;
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
            let url = this.getUrlFile();
            let ext = this.getFileExtension(url.split('.pdf')[0]);
            if (this.isValidFile(ext)) {
                console.log(url.split('.pdf')[0]);
                this.viewWordBar.nativeElement.style.display = 'block';
                this.viewerUrl = `https://docs.google.com/gview?url=${url.split('.pdf')[0]}&embedded=true`;
                this.iframeDocx.nativeElement.style.display = 'block';
                let countTimeload = 0;
                let checkContent = false;
                setTimeout(() => {
                    do {
                        this.iframeDocx.nativeElement.src = this.viewerUrl;
                        setTimeout(() => {
                            let content = this.iframeDocx.nativeElement?.contentWindow?.document?.getElementsByTagName('body')[0]?.innerHTML;
                            if (content !== '') {
                                checkContent = true;
                                return;
                            }
                            else {
                                countTimeload++;
                            }
                        }, 3000 * countTimeload);
                    } while (countTimeload === 4 || checkContent);
                    if (!checkContent) {
                        this.viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${url.split('.pdf')[0]}`;
                        this.iframeDocx.nativeElement.src = this.viewerUrl;
                    }
                    else {
                        alert('Hiện tại chưa xem được file!');
                    }
                });
                setTimeout(() => {
                    this.loadingSpin.nativeElement.style.display = 'none';
                }, 3200 * countTimeload);
            }
            else {
                console.log('Định dạng không hợp lệ!');
            }
        }
    }
    downloadFile(blobUrl, filename) {
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
    }
    downloadWordFile() {
        console.log('download file!');
        let url = this.getUrlFile();
        let ext = this.getFileExtension(url.split('.pdf')[0]);
        console.log(url.split('.pdf')[0]);
        if (this.isValidFile(ext)) {
            this.downloadFile(url.split('.pdf')[0], 'test');
        }
        else {
            this.downloadFile(url, 'test');
        }
    }
    closeWordFile() {
        console.log('close File!');
        this.closeFile.emit(true);
    }
    isValidFile(str) {
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
    }
    getUrlFile() {
        if (this._src instanceof Blob) {
            return encodeURIComponent(URL.createObjectURL(this._src));
        }
        else if (this._src instanceof Uint8Array) {
            let blob = new Blob([this._src], { type: "application/pdf" });
            return encodeURIComponent(URL.createObjectURL(blob));
        }
        else {
            return this._src;
        }
    }
    getFileExtension(filename) {
        const ext = /^.+\.([^.]+)$/.exec(filename);
        return ext == null ? '' : ext[1];
    }
    ngOnInit() {
        window.addEventListener("message", this.receiveMessage.bind(this), false);
        if (!this.externalWindow) { // Load pdf for embedded views
            this.loadPdf();
        }
    }
    refresh() {
        this.loadPdf();
    }
    loadPdf() {
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
                this.viewerTab.document.write(`
          <style>
          .loader {
            position: fixed;
            left: 40%;
            top: 40%;
            border: 16px solid #f3f3f3;
            border-radius: 50%;
            border-top: 16px solid #3498db;
            width: 120px;
            height: 120px;
            animation: spin 2s linear infinite;
          }
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
          </style>
          <div class="loader"></div>
        `);
            }
        }
        let fileUrl = this.getUrlFile();
        // let this.viewerUrl;
        if (this.viewerFolder) {
            this.viewerUrl = `${this.viewerFolder}/web/viewer.html`;
        }
        else {
            this.viewerUrl = `assets/pdfjs/web/viewer.html`;
        }
        this.viewerUrl += `?file=${fileUrl}`;
        if (typeof this.viewerId !== 'undefined') {
            this.viewerUrl += `&viewerId=${this.viewerId}`;
        }
        if (typeof this.onBeforePrint !== 'undefined') {
            this.viewerUrl += `&beforePrint=true`;
        }
        if (typeof this.onAfterPrint !== 'undefined') {
            this.viewerUrl += `&afterPrint=true`;
        }
        if (typeof this.onDocumentLoad !== 'undefined') {
            this.viewerUrl += `&pagesLoaded=true`;
        }
        if (typeof this.onPageChange !== 'undefined') {
            this.viewerUrl += `&pageChange=true`;
        }
        if (typeof this.closeButton !== 'undefined') {
            this.viewerUrl += `&closeFile=${this.closeButton}`;
        }
        if (this.downloadFileName) {
            if (!this.downloadFileName.endsWith(".pdf")) {
                this.downloadFileName += ".pdf";
            }
            this.viewerUrl += `&fileName=${this.downloadFileName}`;
        }
        if (typeof this.openFile !== 'undefined') {
            this.viewerUrl += `&openFile=${this.openFile}`;
        }
        if (typeof this.download !== 'undefined') {
            this.viewerUrl += `&download=${this.download}`;
        }
        if (this.startDownload) {
            this.viewerUrl += `&startDownload=${this.startDownload}`;
        }
        if (typeof this.viewBookmark !== 'undefined') {
            this.viewerUrl += `&viewBookmark=${this.viewBookmark}`;
        }
        if (typeof this.print !== 'undefined') {
            this.viewerUrl += `&print=${this.print}`;
        }
        if (this.startPrint) {
            this.viewerUrl += `&startPrint=${this.startPrint}`;
        }
        if (typeof this.fullScreen !== 'undefined') {
            this.viewerUrl += `&fullScreen=${this.fullScreen}`;
        }
        // if (this.showFullScreen) {
        //   this.viewerUrl += `&showFullScreen=${this.showFullScreen}`;
        // }
        if (typeof this.find !== 'undefined') {
            this.viewerUrl += `&find=${this.find}`;
        }
        if (this.lastPage) {
            this.viewerUrl += `&lastpage=${this.lastPage}`;
        }
        if (this.rotatecw) {
            this.viewerUrl += `&rotatecw=${this.rotatecw}`;
        }
        if (this.rotateccw) {
            this.viewerUrl += `&rotateccw=${this.rotateccw}`;
        }
        if (this.cursor) {
            this.viewerUrl += `&cursor=${this.cursor}`;
        }
        if (this.scroll) {
            this.viewerUrl += `&scroll=${this.scroll}`;
        }
        if (this.spread) {
            this.viewerUrl += `&spread=${this.spread}`;
        }
        if (this.locale) {
            this.viewerUrl += `&locale=${this.locale}`;
        }
        if (this.useOnlyCssZoom) {
            this.viewerUrl += `&useOnlyCssZoom=${this.useOnlyCssZoom}`;
        }
        if (this._page || this.zoom || this.nameddest || this.pagemode)
            this.viewerUrl += "#";
        if (this._page) {
            this.viewerUrl += `&page=${this._page}`;
        }
        if (this.zoom) {
            this.viewerUrl += `&zoom=${this.zoom}`;
        }
        if (this.nameddest) {
            this.viewerUrl += `&nameddest=${this.nameddest}`;
        }
        if (this.pagemode) {
            this.viewerUrl += `&pagemode=${this.pagemode}`;
        }
        if (this.errorOverride || this.errorAppend) {
            this.viewerUrl += `&errorMessage=${this.errorMessage}`;
            if (this.errorOverride) {
                this.viewerUrl += `&errorOverride=${this.errorOverride}`;
            }
            if (this.errorAppend) {
                this.viewerUrl += `&errorAppend=${this.errorAppend}`;
            }
        }
        if (this.externalWindow) {
            this.viewerTab.location.href = this.viewerUrl;
        }
        else {
            this.iframePDF.nativeElement.src = this.viewerUrl;
        }
        console.log(`
      pdfSrc = ${this.pdfSrc}
      fileUrl = ${fileUrl}
      externalWindow = ${this.externalWindow}
      downloadFileName = ${this.downloadFileName}
    `);
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
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.3", ngImport: i0, type: PdfJsViewerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.0.3", type: PdfJsViewerComponent, selector: "ng2-pdfjs-viewer", inputs: { viewerId: "viewerId", viewerFolder: "viewerFolder", externalWindow: "externalWindow", showSpinner: "showSpinner", downloadFileName: "downloadFileName", openFile: "openFile", download: "download", startDownload: "startDownload", viewBookmark: "viewBookmark", print: "print", startPrint: "startPrint", fullScreen: "fullScreen", find: "find", zoom: "zoom", nameddest: "nameddest", pagemode: "pagemode", lastPage: "lastPage", rotatecw: "rotatecw", rotateccw: "rotateccw", cursor: "cursor", scroll: "scroll", spread: "spread", locale: "locale", useOnlyCssZoom: "useOnlyCssZoom", errorOverride: "errorOverride", errorAppend: "errorAppend", errorMessage: "errorMessage", diagnosticLogs: "diagnosticLogs", externalWindowOptions: "externalWindowOptions", closeButton: "closeButton", page: "page", pdfSrc: "pdfSrc" }, outputs: { onBeforePrint: "onBeforePrint", onAfterPrint: "onAfterPrint", onDocumentLoad: "onDocumentLoad", onPageChange: "onPageChange", closeFile: "closeFile" }, viewQueries: [{ propertyName: "viewWordBar", first: true, predicate: ["viewWordBar"], descendants: true, static: true }, { propertyName: "loadingSpin", first: true, predicate: ["loadingSpin"], descendants: true, static: true }, { propertyName: "iframeDocx", first: true, predicate: ["iframeDocx"], descendants: true, static: true }, { propertyName: "iframePDF", first: true, predicate: ["iframePDF"], descendants: true, static: true }], ngImport: i0, template: `
  <style>
  .toolbar {
    position: relative;
    left: 0;
    right: 0;
    z-index: 9999;
    cursor: default;
    display: none;
  }

  #toolbarContainer {
    width: 100%;
  }

  #toolbarContainer {
    position: relative;
    height: 32px;
    background-color: #474747;
    background-image: linear-gradient(hsla(0,0%,32%,.99), hsla(0,0%,27%,.95));
  }

  #toolbarViewer {
    height: 32px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  }

  button{
    background: none;
    width: 53px;
    height: 25px;
    min-width: 16px;
    padding: 2px 6px 0;
    border: 1px solid transparent;
    border-radius: 2px;
    color: hsla(0,0%,100%,.8);
    font-size: 12px;
    line-height: 14px;
    -webkit-user-select: none;
       -moz-user-select: none;
        -ms-user-select: none;
            user-select: none;
    /* Opera does not support user-select, use <... unselectable="on"> instead */
    cursor: pointer;
    transition-property: background-color, border-color, box-shadow;
    transition-duration: 150ms;
    transition-timing-function: ease;
  }

  button:hover{
    background-color: hsla(0,0%,0%,.12);
    background-image: linear-gradient(hsla(0,0%,100%,.05), hsla(0,0%,100%,0));
    background-clip: padding-box;
    border: 1px solid hsla(0,0%,0%,.35);
    border-color: hsla(0,0%,0%,.32) hsla(0,0%,0%,.38) hsla(0,0%,0%,.42);
    box-shadow: 0 1px 0 hsla(0,0%,100%,.05) inset,
                0 0 1px hsla(0,0%,100%,.15) inset,
                0 1px 0 hsla(0,0%,100%,.05);
  }

  .loadingSpin{
    display: none;
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .25);
    z-index: 1000; 
  }

  .loader {
    z-index: 1001; 
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border: 16px solid #f3f3f3;
    border-radius: 50%;
    border-top: 16px solid #3498db;
    width: 120px;
    height: 120px;
    -webkit-animation: spin 2s linear infinite; /* Safari */
    animation: spin 2s linear infinite;
  }
  
  /* Safari */
  @-webkit-keyframes spin {
    0% { -webkit-transform: rotate(0deg); }
    100% { -webkit-transform: rotate(360deg); }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>
  <div #viewWordBar class="toolbar">
    <div id="toolbarContainer">
      <div id="toolbarViewer">
          <button id="download" (click)="downloadWordFile()" class="toolbarButton download" title="Download" tabindex="34" data-l10n-id="download">
            <img src="/assets/pdfjs/web/images/toolbarButton-download.png" alt="Download"/>
          </button>
                
          <button id="closeFile" (click)="closeWordFile()" class="toolbarButton" title="Close" tabindex="36" data-l10n-id="closeFile">
          <img src="/assets/pdfjs/web/images/close-file.png" alt="Close"/>
          </button>
        </div>
      </div>
  </div>
  <div #loadingSpin class="loadingSpin">
    <div class="loader"></div>
  </div>
  <iframe id="iframeDocx" #iframeDocx title="ng2-pdfjs-viewer" [hidden]="externalWindow || (!externalWindow && !pdfSrc)" #iframe width="100%" height="100%"></iframe>

  <iframe id="iframePDF" #iframePDF title="ng2-pdfjs-viewer" [hidden]="externalWindow || (!externalWindow && !pdfSrc)" #iframe width="100%" height="100%"></iframe>
  `, isInline: true, styles: ["\n  .toolbar {\n    position: relative;\n    left: 0;\n    right: 0;\n    z-index: 9999;\n    cursor: default;\n    display: none;\n  }\n\n  #toolbarContainer {\n    width: 100%;\n  }\n\n  #toolbarContainer {\n    position: relative;\n    height: 32px;\n    background-color: #474747;\n    background-image: linear-gradient(hsla(0,0%,32%,.99), hsla(0,0%,27%,.95));\n  }\n\n  #toolbarViewer {\n    height: 32px;\n    display: flex;\n    flex-direction: row;\n    justify-content: flex-end;\n    align-items: center;\n  }\n\n  button{\n    background: none;\n    width: 53px;\n    height: 25px;\n    min-width: 16px;\n    padding: 2px 6px 0;\n    border: 1px solid transparent;\n    border-radius: 2px;\n    color: hsla(0,0%,100%,.8);\n    font-size: 12px;\n    line-height: 14px;\n    -webkit-user-select: none;\n       -moz-user-select: none;\n        -ms-user-select: none;\n            user-select: none;\n    /* Opera does not support user-select, use <... unselectable=\"on\"> instead */\n    cursor: pointer;\n    transition-property: background-color, border-color, box-shadow;\n    transition-duration: 150ms;\n    transition-timing-function: ease;\n  }\n\n  button:hover{\n    background-color: hsla(0,0%,0%,.12);\n    background-image: linear-gradient(hsla(0,0%,100%,.05), hsla(0,0%,100%,0));\n    background-clip: padding-box;\n    border: 1px solid hsla(0,0%,0%,.35);\n    border-color: hsla(0,0%,0%,.32) hsla(0,0%,0%,.38) hsla(0,0%,0%,.42);\n    box-shadow: 0 1px 0 hsla(0,0%,100%,.05) inset,\n                0 0 1px hsla(0,0%,100%,.15) inset,\n                0 1px 0 hsla(0,0%,100%,.05);\n  }\n\n  .loadingSpin{\n    display: none;\n    position: relative;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    background-color: rgba(0, 0, 0, .25);\n    z-index: 1000; \n  }\n\n  .loader {\n    z-index: 1001; \n    position: absolute;\n    left: 50%;\n    top: 50%;\n    transform: translate(-50%, -50%);\n    border: 16px solid #f3f3f3;\n    border-radius: 50%;\n    border-top: 16px solid #3498db;\n    width: 120px;\n    height: 120px;\n    -webkit-animation: spin 2s linear infinite; /* Safari */\n    animation: spin 2s linear infinite;\n  }\n  \n  /* Safari */\n  @-webkit-keyframes spin {\n    0% { -webkit-transform: rotate(0deg); }\n    100% { -webkit-transform: rotate(360deg); }\n  }\n  \n  @keyframes spin {\n    0% { transform: rotate(0deg); }\n    100% { transform: rotate(360deg); }\n  }\n  "] });
}
export { PdfJsViewerComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.3", ngImport: i0, type: PdfJsViewerComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ng2-pdfjs-viewer',
                    template: `
  <style>
  .toolbar {
    position: relative;
    left: 0;
    right: 0;
    z-index: 9999;
    cursor: default;
    display: none;
  }

  #toolbarContainer {
    width: 100%;
  }

  #toolbarContainer {
    position: relative;
    height: 32px;
    background-color: #474747;
    background-image: linear-gradient(hsla(0,0%,32%,.99), hsla(0,0%,27%,.95));
  }

  #toolbarViewer {
    height: 32px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  }

  button{
    background: none;
    width: 53px;
    height: 25px;
    min-width: 16px;
    padding: 2px 6px 0;
    border: 1px solid transparent;
    border-radius: 2px;
    color: hsla(0,0%,100%,.8);
    font-size: 12px;
    line-height: 14px;
    -webkit-user-select: none;
       -moz-user-select: none;
        -ms-user-select: none;
            user-select: none;
    /* Opera does not support user-select, use <... unselectable="on"> instead */
    cursor: pointer;
    transition-property: background-color, border-color, box-shadow;
    transition-duration: 150ms;
    transition-timing-function: ease;
  }

  button:hover{
    background-color: hsla(0,0%,0%,.12);
    background-image: linear-gradient(hsla(0,0%,100%,.05), hsla(0,0%,100%,0));
    background-clip: padding-box;
    border: 1px solid hsla(0,0%,0%,.35);
    border-color: hsla(0,0%,0%,.32) hsla(0,0%,0%,.38) hsla(0,0%,0%,.42);
    box-shadow: 0 1px 0 hsla(0,0%,100%,.05) inset,
                0 0 1px hsla(0,0%,100%,.15) inset,
                0 1px 0 hsla(0,0%,100%,.05);
  }

  .loadingSpin{
    display: none;
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .25);
    z-index: 1000; 
  }

  .loader {
    z-index: 1001; 
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border: 16px solid #f3f3f3;
    border-radius: 50%;
    border-top: 16px solid #3498db;
    width: 120px;
    height: 120px;
    -webkit-animation: spin 2s linear infinite; /* Safari */
    animation: spin 2s linear infinite;
  }
  
  /* Safari */
  @-webkit-keyframes spin {
    0% { -webkit-transform: rotate(0deg); }
    100% { -webkit-transform: rotate(360deg); }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>
  <div #viewWordBar class="toolbar">
    <div id="toolbarContainer">
      <div id="toolbarViewer">
          <button id="download" (click)="downloadWordFile()" class="toolbarButton download" title="Download" tabindex="34" data-l10n-id="download">
            <img src="/assets/pdfjs/web/images/toolbarButton-download.png" alt="Download"/>
          </button>
                
          <button id="closeFile" (click)="closeWordFile()" class="toolbarButton" title="Close" tabindex="36" data-l10n-id="closeFile">
          <img src="/assets/pdfjs/web/images/close-file.png" alt="Close"/>
          </button>
        </div>
      </div>
  </div>
  <div #loadingSpin class="loadingSpin">
    <div class="loader"></div>
  </div>
  <iframe id="iframeDocx" #iframeDocx title="ng2-pdfjs-viewer" [hidden]="externalWindow || (!externalWindow && !pdfSrc)" #iframe width="100%" height="100%"></iframe>

  <iframe id="iframePDF" #iframePDF title="ng2-pdfjs-viewer" [hidden]="externalWindow || (!externalWindow && !pdfSrc)" #iframe width="100%" height="100%"></iframe>
  `
                }]
        }], propDecorators: { viewWordBar: [{
                type: ViewChild,
                args: ['viewWordBar', { static: true }]
            }], loadingSpin: [{
                type: ViewChild,
                args: ['loadingSpin', { static: true }]
            }], iframeDocx: [{
                type: ViewChild,
                args: ['iframeDocx', { static: true }]
            }], iframePDF: [{
                type: ViewChild,
                args: ['iframePDF', { static: true }]
            }], viewerId: [{
                type: Input
            }], onBeforePrint: [{
                type: Output
            }], onAfterPrint: [{
                type: Output
            }], onDocumentLoad: [{
                type: Output
            }], onPageChange: [{
                type: Output
            }], viewerFolder: [{
                type: Input
            }], externalWindow: [{
                type: Input
            }], showSpinner: [{
                type: Input
            }], downloadFileName: [{
                type: Input
            }], openFile: [{
                type: Input
            }], download: [{
                type: Input
            }], startDownload: [{
                type: Input
            }], viewBookmark: [{
                type: Input
            }], print: [{
                type: Input
            }], startPrint: [{
                type: Input
            }], fullScreen: [{
                type: Input
            }], find: [{
                type: Input
            }], zoom: [{
                type: Input
            }], nameddest: [{
                type: Input
            }], pagemode: [{
                type: Input
            }], lastPage: [{
                type: Input
            }], rotatecw: [{
                type: Input
            }], rotateccw: [{
                type: Input
            }], cursor: [{
                type: Input
            }], scroll: [{
                type: Input
            }], spread: [{
                type: Input
            }], locale: [{
                type: Input
            }], useOnlyCssZoom: [{
                type: Input
            }], errorOverride: [{
                type: Input
            }], errorAppend: [{
                type: Input
            }], errorMessage: [{
                type: Input
            }], diagnosticLogs: [{
                type: Input
            }], externalWindowOptions: [{
                type: Input
            }], closeButton: [{
                type: Input
            }], closeFile: [{
                type: Output
            }], page: [{
                type: Input
            }], pdfSrc: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQWMsTUFBTSxlQUFlLENBQUM7O0FBRTlGLE1BMkhhLG9CQUFvQjtJQUNhLFdBQVcsQ0FBYTtJQUN4QixXQUFXLENBQWE7SUFDekIsVUFBVSxDQUFhO0lBQ3hCLFNBQVMsQ0FBYTtJQUNoRCxRQUFRLENBQVM7SUFDdkIsYUFBYSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO0lBQ3RELFlBQVksR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztJQUNyRCxjQUFjLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7SUFDdkQsWUFBWSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO0lBQy9DLFlBQVksQ0FBUztJQUNyQixjQUFjLEdBQVksS0FBSyxDQUFDO0lBQ2hDLFdBQVcsR0FBWSxJQUFJLENBQUM7SUFDNUIsZ0JBQWdCLENBQVM7SUFDekIsUUFBUSxHQUFZLElBQUksQ0FBQztJQUN6QixRQUFRLEdBQVksSUFBSSxDQUFDO0lBQ3pCLGFBQWEsQ0FBVTtJQUN2QixZQUFZLEdBQVksS0FBSyxDQUFDO0lBQzlCLEtBQUssR0FBWSxJQUFJLENBQUM7SUFDdEIsVUFBVSxDQUFVO0lBQ3BCLFVBQVUsR0FBWSxJQUFJLENBQUM7SUFDM0MsMENBQTBDO0lBQzFCLElBQUksR0FBWSxJQUFJLENBQUM7SUFDckIsSUFBSSxDQUFTO0lBQ2IsU0FBUyxDQUFTO0lBQ2xCLFFBQVEsQ0FBUztJQUNqQixRQUFRLENBQVU7SUFDbEIsUUFBUSxDQUFVO0lBQ2xCLFNBQVMsQ0FBVTtJQUNuQixNQUFNLENBQVM7SUFDZixNQUFNLENBQVM7SUFDZixNQUFNLENB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QUE3QixLQUFLO2dCQUNVLFdBQVc7c0JBQTFCLEtBQUs7Z0JBQ1UsZ0JBQWdCO3NCQUEvQixLQUFLO2dCQUNVLFFBQVE7c0JBQXZCLEtBQUs7Z0JBQ1UsUUFBUTtzQkFBdkIsS0FBSztnQkFDVSxhQUFhO3NCQUE1QixLQUFLO2dCQUNVLFlBQVk7c0JBQTNCLEtBQUs7Z0JBQ1UsS0FBSztzQkFBcEIsS0FBSztnQkFDVSxVQUFVO3NCQUF6QixLQUFLO2dCQUNVLFVBQVU7c0JBQXpCLEtBQUs7Z0JBRVUsSUFBSTtzQkFBbkIsS0FBSztnQkFDVSxJQUFJO3NCQUFuQixLQUFLO2dCQUNVLFNBQVM7c0JBQXhCLEtBQUs7Z0JBQ1UsUUFBUTtzQkFBdkIsS0FBSztnQkFDVSxRQUFRO3NCQUF2QixLQUFLO2dCQUNVLFFBQVE7c0JBQXZCLEtBQUs7Z0JBQ1UsU0FBUztzQkFBeEIsS0FBSztnQkFDVSxNQUFNO3NCQUFyQixLQUFLO2dCQUNVLE1BQU07c0JBQXJCLEtBQUs7Z0JBQ1UsTUFBTTtzQkFBckIsS0FBSztnQkFDVSxNQUFNO3NCQUFyQixLQUFLO2dCQUNVLGNBQWM7c0JBQTdCLEtBQUs7Z0JBQ1UsYUFBYTtzQkFBNUIsS0FBSztnQkFDVSxXQUFXO3NCQUExQixLQUFLO2dCQUNVLFlBQVk7c0JBQTNCLEtBQUs7Z0JBQ1UsY0FBYztzQkFBN0IsS0FBSztnQkFFVSxxQkFBcUI7c0JBQXBDLEtBQUs7Z0JBS1UsV0FBVztzQkFBMUIsS0FBSztnQkFDSSxTQUFTO3NCQUFsQixNQUFNO2dCQUtJLElBQUk7c0JBRGQsS0FBSztnQkFtQkssTUFBTTtzQkFEaEIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIE91dHB1dCwgVmlld0NoaWxkLCBFdmVudEVtaXR0ZXIsIEVsZW1lbnRSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAnbmcyLXBkZmpzLXZpZXdlcicsXHJcbiAgdGVtcGxhdGU6IGBcclxuICA8c3R5bGU+XHJcbiAgLnRvb2xiYXIge1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgbGVmdDogMDtcclxuICAgIHJpZ2h0OiAwO1xyXG4gICAgei1pbmRleDogOTk5OTtcclxuICAgIGN1cnNvcjogZGVmYXVsdDtcclxuICAgIGRpc3BsYXk6IG5vbmU7XHJcbiAgfVxyXG5cclxuICAjdG9vbGJhckNvbnRhaW5lciB7XHJcbiAgICB3aWR0aDogMTAwJTtcclxuICB9XHJcblxyXG4gICN0b29sYmFyQ29udGFpbmVyIHtcclxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICAgIGhlaWdodDogMzJweDtcclxuICAgIGJhY2tncm91bmQtY29sb3I6ICM0NzQ3NDc7XHJcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiBsaW5lYXItZ3JhZGllbnQoaHNsYSgwLDAlLDMyJSwuOTkpLCBoc2xhKDAsMCUsMjclLC45NSkpO1xyXG4gIH1cclxuXHJcbiAgI3Rvb2xiYXJWaWV3ZXIge1xyXG4gICAgaGVpZ2h0OiAzMnB4O1xyXG4gICAgZGlzcGxheTogZmxleDtcclxuICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XHJcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtZW5kO1xyXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcclxuICB9XHJcblxyXG4gIGJ1dHRvbntcclxuICAgIGJhY2tncm91bmQ6IG5vbmU7XHJcbiAgICB3aWR0aDogNTNweDtcclxuICAgIGhlaWdodDogMjVweDtcclxuICAgIG1pbi13aWR0aDogMTZweDtcclxuICAgIHBhZGRpbmc6IDJweCA2cHggMDtcclxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHRyYW5zcGFyZW50O1xyXG4gICAgYm9yZGVyLXJhZGl1czogMnB4O1xyXG4gICAgY29sb3I6IGhzbGEoMCwwJSwxMDAlLC44KTtcclxuICAgIGZvbnQtc2l6ZTogMTJweDtcclxuICAgIGxpbmUtaGVpZ2h0OiAxNHB4O1xyXG4gICAgLXdlYmtpdC11c2VyLXNlbGVjdDogbm9uZTtcclxuICAgICAgIC1tb3otdXNlci1zZWxlY3Q6IG5vbmU7XHJcbiAgICAgICAgLW1zLXVzZXItc2VsZWN0OiBub25lO1xyXG4gICAgICAgICAgICB1c2VyLXNlbGVjdDogbm9uZTtcclxuICAgIC8qIE9wZXJhIGRvZXMgbm90IHN1cHBvcnQgdXNlci1zZWxlY3QsIHVzZSA8Li4uIHVuc2VsZWN0YWJsZT1cIm9uXCI+IGluc3RlYWQgKi9cclxuICAgIGN1cnNvcjogcG9pbnRlcjtcclxuICAgIHRyYW5zaXRpb24tcHJvcGVydHk6IGJhY2tncm91bmQtY29sb3IsIGJvcmRlci1jb2xvciwgYm94LXNoYWRvdztcclxuICAgIHRyYW5zaXRpb24tZHVyYXRpb246IDE1MG1zO1xyXG4gICAgdHJhbnNpdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2U7XHJcbiAgfVxyXG5cclxuICBidXR0b246aG92ZXJ7XHJcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiBoc2xhKDAsMCUsMCUsLjEyKTtcclxuICAgIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudChoc2xhKDAsMCUsMTAwJSwuMDUpLCBoc2xhKDAsMCUsMTAwJSwwKSk7XHJcbiAgICBiYWNrZ3JvdW5kLWNsaXA6IHBhZGRpbmctYm94O1xyXG4gICAgYm9yZGVyOiAxcHggc29saWQgaHNsYSgwLDAlLDAlLC4zNSk7XHJcbiAgICBib3JkZXItY29sb3I6IGhzbGEoMCwwJSwwJSwuMzIpIGhzbGEoMCwwJSwwJSwuMzgpIGhzbGEoMCwwJSwwJSwuNDIpO1xyXG4gICAgYm94LXNoYWRvdzogMCAxcHggMCBoc2xhKDAsMCUsMTAwJSwuMDUpIGluc2V0LFxyXG4gICAgICAgICAgICAgICAgMCAwIDFweCBoc2xhKDAsMCUsMTAwJSwuMTUpIGluc2V0LFxyXG4gICAgICAgICAgICAgICAgMCAxcHggMCBoc2xhKDAsMCUsMTAwJSwuMDUpO1xyXG4gIH1cclxuXHJcbiAgLmxvYWRpbmdTcGlue1xyXG4gICAgZGlzcGxheTogbm9uZTtcclxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICAgIHRvcDogMDtcclxuICAgIGxlZnQ6IDA7XHJcbiAgICB3aWR0aDogMTAwJTtcclxuICAgIGhlaWdodDogMTAwJTtcclxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgLjI1KTtcclxuICAgIHotaW5kZXg6IDEwMDA7IFxyXG4gIH1cclxuXHJcbiAgLmxvYWRlciB7XHJcbiAgICB6LWluZGV4OiAxMDAxOyBcclxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgIGxlZnQ6IDUwJTtcclxuICAgIHRvcDogNTAlO1xyXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XHJcbiAgICBib3JkZXI6IDE2cHggc29saWQgI2YzZjNmMztcclxuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcclxuICAgIGJvcmRlci10b3A6IDE2cHggc29saWQgIzM0OThkYjtcclxuICAgIHdpZHRoOiAxMjBweDtcclxuICAgIGhlaWdodDogMTIwcHg7XHJcbiAgICAtd2Via2l0LWFuaW1hdGlvbjogc3BpbiAycyBsaW5lYXIgaW5maW5pdGU7IC8qIFNhZmFyaSAqL1xyXG4gICAgYW5pbWF0aW9uOiBzcGluIDJzIGxpbmVhciBpbmZpbml0ZTtcclxuICB9XHJcbiAgXHJcbiAgLyogU2FmYXJpICovXHJcbiAgQC13ZWJraXQta2V5ZnJhbWVzIHNwaW4ge1xyXG4gICAgMCUgeyAtd2Via2l0LXRyYW5zZm9ybTogcm90YXRlKDBkZWcpOyB9XHJcbiAgICAxMDAlIHsgLXdlYmtpdC10cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpOyB9XHJcbiAgfVxyXG4gIFxyXG4gIEBrZXlmcmFtZXMgc3BpbiB7XHJcbiAgICAwJSB7IHRyYW5zZm9ybTogcm90YXRlKDBkZWcpOyB9XHJcbiAgICAxMDAlIHsgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsgfVxyXG4gIH1cclxuICA8L3N0eWxlPlxyXG4gIDxkaXYgI3ZpZXdXb3JkQmFyIGNsYXNzPVwidG9vbGJhclwiPlxyXG4gICAgPGRpdiBpZD1cInRvb2xiYXJDb250YWluZXJcIj5cclxuICAgICAgPGRpdiBpZD1cInRvb2xiYXJWaWV3ZXJcIj5cclxuICAgICAgICAgIDxidXR0b24gaWQ9XCJkb3dubG9hZFwiIChjbGljayk9XCJkb3dubG9hZFdvcmRGaWxlKClcIiBjbGFzcz1cInRvb2xiYXJCdXR0b24gZG93bmxvYWRcIiB0aXRsZT1cIkRvd25sb2FkXCIgdGFiaW5kZXg9XCIzNFwiIGRhdGEtbDEwbi1pZD1cImRvd25sb2FkXCI+XHJcbiAgICAgICAgICAgIDxpbWcgc3JjPVwiL2Fzc2V0cy9wZGZqcy93ZWIvaW1hZ2VzL3Rvb2xiYXJCdXR0b24tZG93bmxvYWQucG5nXCIgYWx0PVwiRG93bmxvYWRcIi8+XHJcbiAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgPGJ1dHRvbiBpZD1cImNsb3NlRmlsZVwiIChjbGljayk9XCJjbG9zZVdvcmRGaWxlKClcIiBjbGFzcz1cInRvb2xiYXJCdXR0b25cIiB0aXRsZT1cIkNsb3NlXCIgdGFiaW5kZXg9XCIzNlwiIGRhdGEtbDEwbi1pZD1cImNsb3NlRmlsZVwiPlxyXG4gICAgICAgICAgPGltZyBzcmM9XCIvYXNzZXRzL3BkZmpzL3dlYi9pbWFnZXMvY2xvc2UtZmlsZS5wbmdcIiBhbHQ9XCJDbG9zZVwiLz5cclxuICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICA8L2Rpdj5cclxuICA8ZGl2ICNsb2FkaW5nU3BpbiBjbGFzcz1cImxvYWRpbmdTcGluXCI+XHJcbiAgICA8ZGl2IGNsYXNzPVwibG9hZGVyXCI+PC9kaXY+XHJcbiAgPC9kaXY+XHJcbiAgPGlmcmFtZSBpZD1cImlmcmFtZURvY3hcIiAjaWZyYW1lRG9jeCB0aXRsZT1cIm5nMi1wZGZqcy12aWV3ZXJcIiBbaGlkZGVuXT1cImV4dGVybmFsV2luZG93IHx8ICghZXh0ZXJuYWxXaW5kb3cgJiYgIXBkZlNyYylcIiAjaWZyYW1lIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIj48L2lmcmFtZT5cclxuXHJcbiAgPGlmcmFtZSBpZD1cImlmcmFtZVBERlwiICNpZnJhbWVQREYgdGl0bGU9XCJuZzItcGRmanMtdmlld2VyXCIgW2hpZGRlbl09XCJleHRlcm5hbFdpbmRvdyB8fCAoIWV4dGVybmFsV2luZG93ICYmICFwZGZTcmMpXCIgI2lmcmFtZSB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCI+PC9pZnJhbWU+XHJcbiAgYFxyXG59KVxyXG5leHBvcnQgY2xhc3MgUGRmSnNWaWV3ZXJDb21wb25lbnQge1xyXG4gIEBWaWV3Q2hpbGQoJ3ZpZXdXb3JkQmFyJywgeyBzdGF0aWM6IHRydWUgfSkgdmlld1dvcmRCYXI6IEVsZW1lbnRSZWY7XHJcbiAgQFZpZXdDaGlsZCgnbG9hZGluZ1NwaW4nLCB7IHN0YXRpYzogdHJ1ZSB9KSBsb2FkaW5nU3BpbjogRWxlbWVudFJlZjtcclxuICBAVmlld0NoaWxkKCdpZnJhbWVEb2N4JywgeyBzdGF0aWM6IHRydWUgfSkgaWZyYW1lRG9jeDogRWxlbWVudFJlZjtcclxuICBAVmlld0NoaWxkKCdpZnJhbWVQREYnLCB7IHN0YXRpYzogdHJ1ZSB9KSBpZnJhbWVQREY6IEVsZW1lbnRSZWY7XHJcbiAgQElucHV0KCkgcHVibGljIHZpZXdlcklkOiBzdHJpbmc7XHJcbiAgQE91dHB1dCgpIG9uQmVmb3JlUHJpbnQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG4gIEBPdXRwdXQoKSBvbkFmdGVyUHJpbnQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG4gIEBPdXRwdXQoKSBvbkRvY3VtZW50TG9hZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcbiAgQE91dHB1dCgpIG9uUGFnZUNoYW5nZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcbiAgQElucHV0KCkgcHVibGljIHZpZXdlckZvbGRlcjogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBleHRlcm5hbFdpbmRvdzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBzaG93U3Bpbm5lcjogYm9vbGVhbiA9IHRydWU7XHJcbiAgQElucHV0KCkgcHVibGljIGRvd25sb2FkRmlsZU5hbWU6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgb3BlbkZpbGU6IGJvb2xlYW4gPSB0cnVlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBkb3dubG9hZDogYm9vbGVhbiA9IHRydWU7XHJcbiAgQElucHV0KCkgcHVibGljIHN0YXJ0RG93bmxvYWQ6IGJvb2xlYW47XHJcbiAgQElucHV0KCkgcHVibGljIHZpZXdCb29rbWFyazogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBwcmludDogYm9vbGVhbiA9IHRydWU7XHJcbiAgQElucHV0KCkgcHVibGljIHN0YXJ0UHJpbnQ6IGJvb2xlYW47XHJcbiAgQElucHV0KCkgcHVibGljIGZ1bGxTY3JlZW46IGJvb2xlYW4gPSB0cnVlO1xyXG4gIC8vQElucHV0KCkgcHVibGljIHNob3dGdWxsU2NyZWVuOiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBmaW5kOiBib29sZWFuID0gdHJ1ZTtcclxuICBASW5wdXQoKSBwdWJsaWMgem9vbTogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBuYW1lZGRlc3Q6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgcGFnZW1vZGU6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgbGFzdFBhZ2U6IGJvb2xlYW47XHJcbiAgQElucHV0KCkgcHVibGljIHJvdGF0ZWN3OiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyByb3RhdGVjY3c6IGJvb2xlYW47XHJcbiAgQElucHV0KCkgcHVibGljIGN1cnNvcjogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBzY3JvbGw6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgc3ByZWFkOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgcHVibGljIGxvY2FsZTogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyB1c2VPbmx5Q3NzWm9vbTogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBlcnJvck92ZXJyaWRlOiBib29sZWFuID0gZmFsc2U7XHJcbiAgQElucHV0KCkgcHVibGljIGVycm9yQXBwZW5kOiBib29sZWFuID0gdHJ1ZTtcclxuICBASW5wdXQoKSBwdWJsaWMgZXJyb3JNZXNzYWdlOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgcHVibGljIGRpYWdub3N0aWNMb2dzOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgQElucHV0KCkgcHVibGljIGV4dGVybmFsV2luZG93T3B0aW9uczogc3RyaW5nO1xyXG4gIHB1YmxpYyB2aWV3ZXJUYWI6IGFueTtcclxuICBwcml2YXRlIF9zcmM6IHN0cmluZyB8IEJsb2IgfCBVaW50OEFycmF5O1xyXG4gIHByaXZhdGUgX3BhZ2U6IG51bWJlcjtcclxuXHJcbiAgQElucHV0KCkgcHVibGljIGNsb3NlQnV0dG9uOiBib29sZWFuO1xyXG4gIEBPdXRwdXQoKSBjbG9zZUZpbGU6IEV2ZW50RW1pdHRlcjxib29sZWFuPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgdmlld2VyVXJsO1xyXG5cclxuICBASW5wdXQoKVxyXG4gIHB1YmxpYyBzZXQgcGFnZShfcGFnZTogbnVtYmVyKSB7XHJcbiAgICB0aGlzLl9wYWdlID0gX3BhZ2U7XHJcbiAgICBpZiAodGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbikge1xyXG4gICAgICB0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uLnBhZ2UgPSB0aGlzLl9wYWdlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMuZGlhZ25vc3RpY0xvZ3MpIGNvbnNvbGUud2FybihcIkRvY3VtZW50IGlzIG5vdCBsb2FkZWQgeWV0ISEhLiBUcnkgdG8gc2V0IHBhZ2UjIGFmdGVyIGZ1bGwgbG9hZC4gSWdub3JlIHRoaXMgd2FybmluZyBpZiB5b3UgYXJlIG5vdCBzZXR0aW5nIHBhZ2UjIHVzaW5nICcuJyBub3RhdGlvbi4gKEUuZy4gcGRmVmlld2VyLnBhZ2UgPSA1OylcIik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHBhZ2UoKSB7XHJcbiAgICBpZiAodGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbikge1xyXG4gICAgICByZXR1cm4gdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbi5wYWdlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMuZGlhZ25vc3RpY0xvZ3MpIGNvbnNvbGUud2FybihcIkRvY3VtZW50IGlzIG5vdCBsb2FkZWQgeWV0ISEhLiBUcnkgdG8gcmV0cmlldmUgcGFnZSMgYWZ0ZXIgZnVsbCBsb2FkLlwiKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIEBJbnB1dCgpXHJcbiAgcHVibGljIHNldCBwZGZTcmMoX3NyYzogc3RyaW5nIHwgQmxvYiB8IFVpbnQ4QXJyYXkpIHtcclxuICAgIHRoaXMuX3NyYyA9IF9zcmM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHBkZlNyYygpIHtcclxuICAgIHJldHVybiB0aGlzLl9zcmM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IFBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucygpIHtcclxuICAgIGxldCBwZGZWaWV3ZXJPcHRpb25zID0gbnVsbDtcclxuICAgIGlmICh0aGlzLmV4dGVybmFsV2luZG93KSB7XHJcbiAgICAgIGlmICh0aGlzLnZpZXdlclRhYikge1xyXG4gICAgICAgIHBkZlZpZXdlck9wdGlvbnMgPSB0aGlzLnZpZXdlclRhYi5QREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnM7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICh0aGlzLmlmcmFtZVBERi5uYXRpdmVFbGVtZW50LmNvbnRlbnRXaW5kb3cpIHtcclxuICAgICAgICBwZGZWaWV3ZXJPcHRpb25zID0gdGhpcy5pZnJhbWVQREYubmF0aXZlRWxlbWVudC5jb250ZW50V2luZG93LlBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBkZlZpZXdlck9wdGlvbnM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IFBERlZpZXdlckFwcGxpY2F0aW9uKCkge1xyXG4gICAgbGV0IHBkZlZpZXdlciA9IG51bGw7XHJcbiAgICBpZiAodGhpcy5leHRlcm5hbFdpbmRvdykge1xyXG4gICAgICBpZiAodGhpcy52aWV3ZXJUYWIpIHtcclxuICAgICAgICBwZGZWaWV3ZXIgPSB0aGlzLnZpZXdlclRhYi5QREZWaWV3ZXJBcHBsaWNhdGlvbjtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMuaWZyYW1lUERGLm5hdGl2ZUVsZW1lbnQuY29udGVudFdpbmRvdykge1xyXG4gICAgICAgIHBkZlZpZXdlciA9IHRoaXMuaWZyYW1lUERGLm5hdGl2ZUVsZW1lbnQuY29udGVudFdpbmRvdy5QREZWaWV3ZXJBcHBsaWNhdGlvbjtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBkZlZpZXdlcjtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZWNlaXZlTWVzc2FnZSh2aWV3ZXJFdmVudCkge1xyXG4gICAgaWYgKHZpZXdlckV2ZW50LmRhdGEgJiYgdmlld2VyRXZlbnQuZGF0YS52aWV3ZXJJZCAmJiB2aWV3ZXJFdmVudC5kYXRhLmV2ZW50KSB7XHJcbiAgICAgIGxldCB2aWV3ZXJJZCA9IHZpZXdlckV2ZW50LmRhdGEudmlld2VySWQ7XHJcbiAgICAgIGxldCBldmVudCA9IHZpZXdlckV2ZW50LmRhdGEuZXZlbnQ7XHJcbiAgICAgIGxldCBwYXJhbSA9IHZpZXdlckV2ZW50LmRhdGEucGFyYW07XHJcbiAgICAgIGlmICh0aGlzLnZpZXdlcklkID09IHZpZXdlcklkKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub25CZWZvcmVQcmludCAmJiBldmVudCA9PSBcImJlZm9yZVByaW50XCIpIHtcclxuICAgICAgICAgIHRoaXMub25CZWZvcmVQcmludC5lbWl0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMub25BZnRlclByaW50ICYmIGV2ZW50ID09IFwiYWZ0ZXJQcmludFwiKSB7XHJcbiAgICAgICAgICB0aGlzLm9uQWZ0ZXJQcmludC5lbWl0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMub25Eb2N1bWVudExvYWQgJiYgZXZlbnQgPT0gXCJwYWdlc0xvYWRlZFwiKSB7XHJcbiAgICAgICAgICB0aGlzLm9uRG9jdW1lbnRMb2FkLmVtaXQocGFyYW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLm9uUGFnZUNoYW5nZSAmJiBldmVudCA9PSBcInBhZ2VDaGFuZ2VcIikge1xyXG4gICAgICAgICAgdGhpcy5vblBhZ2VDaGFuZ2UuZW1pdChwYXJhbSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAodmlld2VyRXZlbnQuZGF0YSAmJiB2aWV3ZXJFdmVudC5kYXRhLmV2ZW50ID09PSBcImNsb3NlZmlsZVwiKSB7XHJcbiAgICAgIHRoaXMuY2xvc2VGaWxlLmVtaXQodHJ1ZSk7XHJcbiAgICB9IGVsc2UgaWYgKHZpZXdlckV2ZW50LmRhdGEgJiYgdmlld2VyRXZlbnQuZGF0YS5ldmVudCA9PT0gXCJsb2FkZXJFcnJvclwiKSB7XHJcbiAgICAgIHRoaXMubG9hZGluZ1NwaW4ubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgdGhpcy5pZnJhbWVQREYubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG5cclxuXHJcbiAgICAgIGxldCB1cmwgPSB0aGlzLmdldFVybEZpbGUoKTtcclxuICAgICAgbGV0IGV4dCA9IHRoaXMuZ2V0RmlsZUV4dGVuc2lvbih1cmwuc3BsaXQoJy5wZGYnKVswXSk7XHJcbiAgICAgIGlmICh0aGlzLmlzVmFsaWRGaWxlKGV4dCkpIHtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2codXJsLnNwbGl0KCcucGRmJylbMF0pO1xyXG5cclxuICAgICAgICB0aGlzLnZpZXdXb3JkQmFyLm5hdGl2ZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgdGhpcy52aWV3ZXJVcmwgPSBgaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZ3ZpZXc/dXJsPSR7dXJsLnNwbGl0KCcucGRmJylbMF19JmVtYmVkZGVkPXRydWVgO1xyXG4gICAgICAgIHRoaXMuaWZyYW1lRG9jeC5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG5cclxuICAgICAgICBsZXQgY291bnRUaW1lbG9hZCA9IDA7XHJcbiAgICAgICAgbGV0IGNoZWNrQ29udGVudCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgdGhpcy5pZnJhbWVEb2N4Lm5hdGl2ZUVsZW1lbnQuc3JjID0gdGhpcy52aWV3ZXJVcmw7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgIGxldCBjb250ZW50ID0gdGhpcy5pZnJhbWVEb2N4Lm5hdGl2ZUVsZW1lbnQ/LmNvbnRlbnRXaW5kb3c/LmRvY3VtZW50Py5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdPy5pbm5lckhUTUw7XHJcbiAgICAgICAgICAgICAgaWYgKGNvbnRlbnQgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICBjaGVja0NvbnRlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb3VudFRpbWVsb2FkKys7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAzMDAwICogY291bnRUaW1lbG9hZCk7XHJcbiAgICAgICAgICB9IHdoaWxlIChjb3VudFRpbWVsb2FkID09PSA0IHx8IGNoZWNrQ29udGVudCk7XHJcblxyXG5cclxuICAgICAgICAgIGlmICghY2hlY2tDb250ZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMudmlld2VyVXJsID0gYGh0dHBzOi8vdmlldy5vZmZpY2VhcHBzLmxpdmUuY29tL29wL2VtYmVkLmFzcHg/c3JjPSR7dXJsLnNwbGl0KCcucGRmJylbMF19YDtcclxuICAgICAgICAgICAgdGhpcy5pZnJhbWVEb2N4Lm5hdGl2ZUVsZW1lbnQuc3JjID0gdGhpcy52aWV3ZXJVcmw7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBhbGVydCgnSGnhu4duIHThuqFpIGNoxrBhIHhlbSDEkcaw4bujYyBmaWxlIScpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5sb2FkaW5nU3Bpbi5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgfSwgMzIwMCAqIGNvdW50VGltZWxvYWQpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCfEkOG7i25oIGThuqFuZyBraMO0bmcgaOG7o3AgbOG7hyEnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZG93bmxvYWRGaWxlKGJsb2JVcmwsIGZpbGVuYW1lKSB7XHJcbiAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuICAgIGlmICghYS5jbGljaykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Rvd25sb2FkTWFuYWdlcjogXCJhLmNsaWNrKClcIiBpcyBub3Qgc3VwcG9ydGVkLicpO1xyXG4gICAgfVxyXG4gICAgYS5ocmVmID0gYmxvYlVybDtcclxuICAgIGEudGFyZ2V0ID0gJ19wYXJlbnQnO1xyXG4gICAgaWYgKCdkb3dubG9hZCcgaW4gYSkge1xyXG4gICAgICBhLmRvd25sb2FkID0gZmlsZW5hbWU7XHJcbiAgICB9XHJcbiAgICAoZG9jdW1lbnQuYm9keSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpLmFwcGVuZENoaWxkKGEpO1xyXG4gICAgYS5jbGljaygpO1xyXG4gICAgYS5yZW1vdmUoKTtcclxuICB9XHJcblxyXG5cclxuICBwdWJsaWMgZG93bmxvYWRXb3JkRmlsZSgpIHtcclxuICAgIGNvbnNvbGUubG9nKCdkb3dubG9hZCBmaWxlIScpO1xyXG4gICAgbGV0IHVybCA9IHRoaXMuZ2V0VXJsRmlsZSgpO1xyXG4gICAgbGV0IGV4dCA9IHRoaXMuZ2V0RmlsZUV4dGVuc2lvbih1cmwuc3BsaXQoJy5wZGYnKVswXSk7XHJcbiAgICBjb25zb2xlLmxvZyh1cmwuc3BsaXQoJy5wZGYnKVswXSk7XHJcbiAgICBpZiAodGhpcy5pc1ZhbGlkRmlsZShleHQpKSB7XHJcbiAgICAgIHRoaXMuZG93bmxvYWRGaWxlKHVybC5zcGxpdCgnLnBkZicpWzBdLCAndGVzdCcpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuZG93bmxvYWRGaWxlKHVybCwgJ3Rlc3QnKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBjbG9zZVdvcmRGaWxlKCkge1xyXG4gICAgY29uc29sZS5sb2coJ2Nsb3NlIEZpbGUhJyk7XHJcbiAgICB0aGlzLmNsb3NlRmlsZS5lbWl0KHRydWUpO1xyXG4gIH1cclxuXHJcbiAgaXNWYWxpZEZpbGUoc3RyKSB7XHJcbiAgICBzd2l0Y2ggKHN0ci50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgIGNhc2UgJ2RvYyc6XHJcbiAgICAgIGNhc2UgJ2RvY3gnOlxyXG4gICAgICBjYXNlICd4bHMnOlxyXG4gICAgICBjYXNlICd4bHN4JzpcclxuICAgICAgY2FzZSAncHB0eCc6XHJcbiAgICAgIGNhc2UgJ3BwdCc6XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBnZXRVcmxGaWxlKCkge1xyXG4gICAgaWYgKHRoaXMuX3NyYyBpbnN0YW5jZW9mIEJsb2IpIHtcclxuICAgICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChVUkwuY3JlYXRlT2JqZWN0VVJMKHRoaXMuX3NyYykpO1xyXG4gICAgfSBlbHNlIGlmICh0aGlzLl9zcmMgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XHJcbiAgICAgIGxldCBibG9iID0gbmV3IEJsb2IoW3RoaXMuX3NyY10sIHsgdHlwZTogXCJhcHBsaWNhdGlvbi9wZGZcIiB9KTtcclxuICAgICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9zcmM7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnZXRGaWxlRXh0ZW5zaW9uKGZpbGVuYW1lKSB7XHJcbiAgICBjb25zdCBleHQgPSAvXi4rXFwuKFteLl0rKSQvLmV4ZWMoZmlsZW5hbWUpO1xyXG4gICAgcmV0dXJuIGV4dCA9PSBudWxsID8gJycgOiBleHRbMV07XHJcbiAgfVxyXG5cclxuICBuZ09uSW5pdCgpOiB2b2lkIHtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCB0aGlzLnJlY2VpdmVNZXNzYWdlLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgIGlmICghdGhpcy5leHRlcm5hbFdpbmRvdykgeyAvLyBMb2FkIHBkZiBmb3IgZW1iZWRkZWQgdmlld3NcclxuICAgICAgdGhpcy5sb2FkUGRmKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVmcmVzaCgpOiB2b2lkIHsgLy8gTmVlZHMgdG8gYmUgaW52b2tlZCBmb3IgZXh0ZXJuYWwgd2luZG93IG9yIHdoZW4gbmVlZHMgdG8gcmVsb2FkIHBkZlxyXG4gICAgdGhpcy5sb2FkUGRmKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGxvYWRQZGYoKSB7XHJcbiAgICBpZiAoIXRoaXMuX3NyYykge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0aGlzLnZpZXdlclVybCA9ICcnO1xyXG4gICAgdGhpcy52aWV3V29yZEJhci5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhgVGFiIGlzIC0gJHt0aGlzLnZpZXdlclRhYn1gKTtcclxuICAgIC8vIGlmICh0aGlzLnZpZXdlclRhYikge1xyXG4gICAgLy8gICBjb25zb2xlLmxvZyhgU3RhdHVzIG9mIHdpbmRvdyAtICR7dGhpcy52aWV3ZXJUYWIuY2xvc2VkfWApO1xyXG4gICAgLy8gfVxyXG5cclxuXHJcbiAgICB0aGlzLmlmcmFtZURvY3gubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG5cclxuICAgIGlmICh0aGlzLmV4dGVybmFsV2luZG93ICYmICh0eXBlb2YgdGhpcy52aWV3ZXJUYWIgPT09ICd1bmRlZmluZWQnIHx8IHRoaXMudmlld2VyVGFiLmNsb3NlZCkpIHtcclxuICAgICAgdGhpcy52aWV3ZXJUYWIgPSB3aW5kb3cub3BlbignJywgJ19ibGFuaycsIHRoaXMuZXh0ZXJuYWxXaW5kb3dPcHRpb25zIHx8ICcnKTtcclxuICAgICAgaWYgKHRoaXMudmlld2VyVGFiID09IG51bGwpIHtcclxuICAgICAgICBpZiAodGhpcy5kaWFnbm9zdGljTG9ncykgY29uc29sZS5lcnJvcihcIm5nMi1wZGZqcy12aWV3ZXI6IEZvciAnZXh0ZXJuYWxXaW5kb3cgPSB0cnVlJy4gaS5lIG9wZW5pbmcgaW4gbmV3IHRhYiB0byB3b3JrLCBwb3AtdXBzIHNob3VsZCBiZSBlbmFibGVkLlwiKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh0aGlzLnNob3dTcGlubmVyKSB7XHJcbiAgICAgICAgdGhpcy52aWV3ZXJUYWIuZG9jdW1lbnQud3JpdGUoYFxyXG4gICAgICAgICAgPHN0eWxlPlxyXG4gICAgICAgICAgLmxvYWRlciB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcclxuICAgICAgICAgICAgbGVmdDogNDAlO1xyXG4gICAgICAgICAgICB0b3A6IDQwJTtcclxuICAgICAgICAgICAgYm9yZGVyOiAxNnB4IHNvbGlkICNmM2YzZjM7XHJcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcclxuICAgICAgICAgICAgYm9yZGVyLXRvcDogMTZweCBzb2xpZCAjMzQ5OGRiO1xyXG4gICAgICAgICAgICB3aWR0aDogMTIwcHg7XHJcbiAgICAgICAgICAgIGhlaWdodDogMTIwcHg7XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbjogc3BpbiAycyBsaW5lYXIgaW5maW5pdGU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBAa2V5ZnJhbWVzIHNwaW4ge1xyXG4gICAgICAgICAgICAwJSB7XHJcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgMTAwJSB7XHJcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgPC9zdHlsZT5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJsb2FkZXJcIj48L2Rpdj5cclxuICAgICAgICBgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBmaWxlVXJsID0gdGhpcy5nZXRVcmxGaWxlKCk7XHJcbiAgICAvLyBsZXQgdGhpcy52aWV3ZXJVcmw7XHJcbiAgICBpZiAodGhpcy52aWV3ZXJGb2xkZXIpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgPSBgJHt0aGlzLnZpZXdlckZvbGRlcn0vd2ViL3ZpZXdlci5odG1sYDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsID0gYGFzc2V0cy9wZGZqcy93ZWIvdmlld2VyLmh0bWxgO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudmlld2VyVXJsICs9IGA/ZmlsZT0ke2ZpbGVVcmx9YDtcclxuXHJcbiAgICBpZiAodHlwZW9mIHRoaXMudmlld2VySWQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmdmlld2VySWQ9JHt0aGlzLnZpZXdlcklkfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMub25CZWZvcmVQcmludCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZiZWZvcmVQcmludD10cnVlYDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5vbkFmdGVyUHJpbnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmYWZ0ZXJQcmludD10cnVlYDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5vbkRvY3VtZW50TG9hZCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZwYWdlc0xvYWRlZD10cnVlYDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5vblBhZ2VDaGFuZ2UgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmcGFnZUNoYW5nZT10cnVlYDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5jbG9zZUJ1dHRvbiAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZjbG9zZUZpbGU9JHt0aGlzLmNsb3NlQnV0dG9ufWA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuZG93bmxvYWRGaWxlTmFtZSkge1xyXG4gICAgICBpZiAoIXRoaXMuZG93bmxvYWRGaWxlTmFtZS5lbmRzV2l0aChcIi5wZGZcIikpIHtcclxuICAgICAgICB0aGlzLmRvd25sb2FkRmlsZU5hbWUgKz0gXCIucGRmXCI7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZmaWxlTmFtZT0ke3RoaXMuZG93bmxvYWRGaWxlTmFtZX1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLm9wZW5GaWxlICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJm9wZW5GaWxlPSR7dGhpcy5vcGVuRmlsZX1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmRvd25sb2FkICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJmRvd25sb2FkPSR7dGhpcy5kb3dubG9hZH1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuc3RhcnREb3dubG9hZCkge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnN0YXJ0RG93bmxvYWQ9JHt0aGlzLnN0YXJ0RG93bmxvYWR9YDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy52aWV3Qm9va21hcmsgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmdmlld0Jvb2ttYXJrPSR7dGhpcy52aWV3Qm9va21hcmt9YDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5wcmludCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZwcmludD0ke3RoaXMucHJpbnR9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnN0YXJ0UHJpbnQpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZzdGFydFByaW50PSR7dGhpcy5zdGFydFByaW50fWA7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZnVsbFNjcmVlbiAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZmdWxsU2NyZWVuPSR7dGhpcy5mdWxsU2NyZWVufWA7XHJcbiAgICB9XHJcbiAgICAvLyBpZiAodGhpcy5zaG93RnVsbFNjcmVlbikge1xyXG4gICAgLy8gICB0aGlzLnZpZXdlclVybCArPSBgJnNob3dGdWxsU2NyZWVuPSR7dGhpcy5zaG93RnVsbFNjcmVlbn1gO1xyXG4gICAgLy8gfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmZpbmQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmZmluZD0ke3RoaXMuZmluZH1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMubGFzdFBhZ2UpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZsYXN0cGFnZT0ke3RoaXMubGFzdFBhZ2V9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnJvdGF0ZWN3KSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmcm90YXRlY3c9JHt0aGlzLnJvdGF0ZWN3fWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5yb3RhdGVjY3cpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZyb3RhdGVjY3c9JHt0aGlzLnJvdGF0ZWNjd31gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuY3Vyc29yKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmY3Vyc29yPSR7dGhpcy5jdXJzb3J9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnNjcm9sbCkge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnNjcm9sbD0ke3RoaXMuc2Nyb2xsfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5zcHJlYWQpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZzcHJlYWQ9JHt0aGlzLnNwcmVhZH1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMubG9jYWxlKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmbG9jYWxlPSR7dGhpcy5sb2NhbGV9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnVzZU9ubHlDc3Nab29tKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmdXNlT25seUNzc1pvb209JHt0aGlzLnVzZU9ubHlDc3Nab29tfWA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuX3BhZ2UgfHwgdGhpcy56b29tIHx8IHRoaXMubmFtZWRkZXN0IHx8IHRoaXMucGFnZW1vZGUpIHRoaXMudmlld2VyVXJsICs9IFwiI1wiXHJcbiAgICBpZiAodGhpcy5fcGFnZSkge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnBhZ2U9JHt0aGlzLl9wYWdlfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy56b29tKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmem9vbT0ke3RoaXMuem9vbX1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMubmFtZWRkZXN0KSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmbmFtZWRkZXN0PSR7dGhpcy5uYW1lZGRlc3R9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnBhZ2Vtb2RlKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmcGFnZW1vZGU9JHt0aGlzLnBhZ2Vtb2RlfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5lcnJvck92ZXJyaWRlIHx8IHRoaXMuZXJyb3JBcHBlbmQpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZlcnJvck1lc3NhZ2U9JHt0aGlzLmVycm9yTWVzc2FnZX1gO1xyXG5cclxuICAgICAgaWYgKHRoaXMuZXJyb3JPdmVycmlkZSkge1xyXG4gICAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmZXJyb3JPdmVycmlkZT0ke3RoaXMuZXJyb3JPdmVycmlkZX1gO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLmVycm9yQXBwZW5kKSB7XHJcbiAgICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZlcnJvckFwcGVuZD0ke3RoaXMuZXJyb3JBcHBlbmR9YDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmV4dGVybmFsV2luZG93KSB7XHJcbiAgICAgIHRoaXMudmlld2VyVGFiLmxvY2F0aW9uLmhyZWYgPSB0aGlzLnZpZXdlclVybDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuaWZyYW1lUERGLm5hdGl2ZUVsZW1lbnQuc3JjID0gdGhpcy52aWV3ZXJVcmw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc29sZS5sb2coYFxyXG4gICAgICBwZGZTcmMgPSAke3RoaXMucGRmU3JjfVxyXG4gICAgICBmaWxlVXJsID0gJHtmaWxlVXJsfVxyXG4gICAgICBleHRlcm5hbFdpbmRvdyA9ICR7dGhpcy5leHRlcm5hbFdpbmRvd31cclxuICAgICAgZG93bmxvYWRGaWxlTmFtZSA9ICR7dGhpcy5kb3dubG9hZEZpbGVOYW1lfVxyXG4gICAgYCk7XHJcblxyXG4gICAgLy8gdmlld2VyRm9sZGVyID0gJHt0aGlzLnZpZXdlckZvbGRlcn1cclxuICAgIC8vIG9wZW5GaWxlID0gJHt0aGlzLm9wZW5GaWxlfVxyXG4gICAgLy8gZG93bmxvYWQgPSAke3RoaXMuZG93bmxvYWR9XHJcbiAgICAvLyBzdGFydERvd25sb2FkID0gJHt0aGlzLnN0YXJ0RG93bmxvYWR9XHJcbiAgICAvLyB2aWV3Qm9va21hcmsgPSAke3RoaXMudmlld0Jvb2ttYXJrfVxyXG4gICAgLy8gcHJpbnQgPSAke3RoaXMucHJpbnR9XHJcbiAgICAvLyBzdGFydFByaW50ID0gJHt0aGlzLnN0YXJ0UHJpbnR9XHJcbiAgICAvLyBmdWxsU2NyZWVuID0gJHt0aGlzLmZ1bGxTY3JlZW59XHJcbiAgICAvLyBmaW5kID0gJHt0aGlzLmZpbmR9XHJcbiAgICAvLyBsYXN0UGFnZSA9ICR7dGhpcy5sYXN0UGFnZX1cclxuICAgIC8vIHJvdGF0ZWN3ID0gJHt0aGlzLnJvdGF0ZWN3fVxyXG4gICAgLy8gcm90YXRlY2N3ID0gJHt0aGlzLnJvdGF0ZWNjd31cclxuICAgIC8vIGN1cnNvciA9ICR7dGhpcy5jdXJzb3J9XHJcbiAgICAvLyBzY3JvbGxNb2RlID0gJHt0aGlzLnNjcm9sbH1cclxuICAgIC8vIHNwcmVhZCA9ICR7dGhpcy5zcHJlYWR9XHJcbiAgICAvLyBwYWdlID0gJHt0aGlzLnBhZ2V9XHJcbiAgICAvLyB6b29tID0gJHt0aGlzLnpvb219XHJcbiAgICAvLyBuYW1lZGRlc3QgPSAke3RoaXMubmFtZWRkZXN0fVxyXG4gICAgLy8gcGFnZW1vZGUgPSAke3RoaXMucGFnZW1vZGV9XHJcbiAgICAvLyBwYWdlbW9kZSA9ICR7dGhpcy5lcnJvck92ZXJyaWRlfVxyXG4gICAgLy8gcGFnZW1vZGUgPSAke3RoaXMuZXJyb3JBcHBlbmR9XHJcbiAgICAvLyBwYWdlbW9kZSA9ICR7dGhpcy5lcnJvck1lc3NhZ2V9XHJcbiAgfVxyXG59XHJcbiJdfQ==