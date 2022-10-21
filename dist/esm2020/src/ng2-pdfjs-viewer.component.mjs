import { Component, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export class PdfJsViewerComponent {
    constructor() {
        this.onBeforePrint = new EventEmitter();
        this.onAfterPrint = new EventEmitter();
        this.onDocumentLoad = new EventEmitter();
        this.onPageChange = new EventEmitter();
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
        this.closeFile = new EventEmitter();
    }
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
            console.log('load docx!');
            let url = this.getUrlFile();
            let ext = this.getFileExtension(url.split('.pdf')[0]);
            if (this.isValidFile(ext)) {
                this.viewWordBar.nativeElement.style.display = 'block';
                this.viewerUrl = `https://docs.google.com/gview?url=${url.split('.pdf')[0]}&embedded=true`;
                this.iframeDocx.nativeElement.style.display = 'block';
                let countTimeload = 0;
                let checkContent = false;
                do {
                    this.iframeDocx.nativeElement.src = this.viewerUrl;
                    setTimeout(() => {
                        let content = this.iframeDocx.nativeElement.contentWindow.document.getElementsByTagName('body')[0].innerHTML;
                        if (content !== '') {
                            checkContent = true;
                        }
                        console.log(countTimeload, content);
                    }, 3000 * countTimeload);
                    countTimeload++;
                } while (countTimeload === 4 || checkContent);
                setTimeout(() => {
                    this.loadingSpin.nativeElement.style.display = 'none';
                }, 3000 * countTimeload);
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
}
PdfJsViewerComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: PdfJsViewerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
PdfJsViewerComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "13.3.11", type: PdfJsViewerComponent, selector: "ng2-pdfjs-viewer", inputs: { viewerId: "viewerId", viewerFolder: "viewerFolder", externalWindow: "externalWindow", showSpinner: "showSpinner", downloadFileName: "downloadFileName", openFile: "openFile", download: "download", startDownload: "startDownload", viewBookmark: "viewBookmark", print: "print", startPrint: "startPrint", fullScreen: "fullScreen", find: "find", zoom: "zoom", nameddest: "nameddest", pagemode: "pagemode", lastPage: "lastPage", rotatecw: "rotatecw", rotateccw: "rotateccw", cursor: "cursor", scroll: "scroll", spread: "spread", locale: "locale", useOnlyCssZoom: "useOnlyCssZoom", errorOverride: "errorOverride", errorAppend: "errorAppend", errorMessage: "errorMessage", diagnosticLogs: "diagnosticLogs", externalWindowOptions: "externalWindowOptions", closeButton: "closeButton", page: "page", pdfSrc: "pdfSrc" }, outputs: { onBeforePrint: "onBeforePrint", onAfterPrint: "onAfterPrint", onDocumentLoad: "onDocumentLoad", onPageChange: "onPageChange", closeFile: "closeFile" }, viewQueries: [{ propertyName: "viewWordBar", first: true, predicate: ["viewWordBar"], descendants: true, static: true }, { propertyName: "loadingSpin", first: true, predicate: ["loadingSpin"], descendants: true, static: true }, { propertyName: "iframeDocx", first: true, predicate: ["iframeDocx"], descendants: true, static: true }, { propertyName: "iframePDF", first: true, predicate: ["iframePDF"], descendants: true, static: true }], ngImport: i0, template: `
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
    width: 100vw;
    height: 100vh;
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
  `, isInline: true, styles: ["\n  .toolbar {\n    position: relative;\n    left: 0;\n    right: 0;\n    z-index: 9999;\n    cursor: default;\n    display: none;\n  }\n\n  #toolbarContainer {\n    width: 100%;\n  }\n\n  #toolbarContainer {\n    position: relative;\n    height: 32px;\n    background-color: #474747;\n    background-image: linear-gradient(hsla(0,0%,32%,.99), hsla(0,0%,27%,.95));\n  }\n\n  #toolbarViewer {\n    height: 32px;\n    display: flex;\n    flex-direction: row;\n    justify-content: flex-end;\n    align-items: center;\n  }\n\n  button{\n    background: none;\n    width: 53px;\n    height: 25px;\n    min-width: 16px;\n    padding: 2px 6px 0;\n    border: 1px solid transparent;\n    border-radius: 2px;\n    color: hsla(0,0%,100%,.8);\n    font-size: 12px;\n    line-height: 14px;\n    -webkit-user-select: none;\n       -moz-user-select: none;\n        -ms-user-select: none;\n            user-select: none;\n    /* Opera does not support user-select, use <... unselectable=\"on\"> instead */\n    cursor: pointer;\n    transition-property: background-color, border-color, box-shadow;\n    transition-duration: 150ms;\n    transition-timing-function: ease;\n  }\n\n  button:hover{\n    background-color: hsla(0,0%,0%,.12);\n    background-image: linear-gradient(hsla(0,0%,100%,.05), hsla(0,0%,100%,0));\n    background-clip: padding-box;\n    border: 1px solid hsla(0,0%,0%,.35);\n    border-color: hsla(0,0%,0%,.32) hsla(0,0%,0%,.38) hsla(0,0%,0%,.42);\n    box-shadow: 0 1px 0 hsla(0,0%,100%,.05) inset,\n                0 0 1px hsla(0,0%,100%,.15) inset,\n                0 1px 0 hsla(0,0%,100%,.05);\n  }\n\n  .loadingSpin{\n    display: none;\n    position: relative;\n    top: 0;\n    left: 0;\n    width: 100vw;\n    height: 100vh;\n    background-color: rgba(0, 0, 0, .25);\n    z-index: 1000; \n  }\n\n  .loader {\n    z-index: 1001; \n    position: absolute;\n    left: 50%;\n    top: 50%;\n    transform: translate(-50%, -50%);\n    border: 16px solid #f3f3f3;\n    border-radius: 50%;\n    border-top: 16px solid #3498db;\n    width: 120px;\n    height: 120px;\n    -webkit-animation: spin 2s linear infinite; /* Safari */\n    animation: spin 2s linear infinite;\n  }\n  \n  /* Safari */\n  @-webkit-keyframes spin {\n    0% { -webkit-transform: rotate(0deg); }\n    100% { -webkit-transform: rotate(360deg); }\n  }\n  \n  @keyframes spin {\n    0% { transform: rotate(0deg); }\n    100% { transform: rotate(360deg); }\n  }\n  "] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: PdfJsViewerComponent, decorators: [{
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
    width: 100vw;
    height: 100vh;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQWMsTUFBTSxlQUFlLENBQUM7O0FBNkg5RixNQUFNLE9BQU8sb0JBQW9CO0lBM0hqQztRQWlJWSxrQkFBYSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ3RELGlCQUFZLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFDckQsbUJBQWMsR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUN2RCxpQkFBWSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBRS9DLG1CQUFjLEdBQVksS0FBSyxDQUFDO1FBQ2hDLGdCQUFXLEdBQVksSUFBSSxDQUFDO1FBRTVCLGFBQVEsR0FBWSxJQUFJLENBQUM7UUFDekIsYUFBUSxHQUFZLElBQUksQ0FBQztRQUV6QixpQkFBWSxHQUFZLEtBQUssQ0FBQztRQUM5QixVQUFLLEdBQVksSUFBSSxDQUFDO1FBRXRCLGVBQVUsR0FBWSxJQUFJLENBQUM7UUFDM0MsMENBQTBDO1FBQzFCLFNBQUksR0FBWSxJQUFJLENBQUM7UUFXckIsbUJBQWMsR0FBWSxLQUFLLENBQUM7UUFDaEMsa0JBQWEsR0FBWSxLQUFLLENBQUM7UUFDL0IsZ0JBQVcsR0FBWSxJQUFJLENBQUM7UUFFNUIsbUJBQWMsR0FBWSxJQUFJLENBQUM7UUFRckMsY0FBUyxHQUEwQixJQUFJLFlBQVksRUFBRSxDQUFDO0tBaVlqRTtJQTdYQyxJQUNXLElBQUksQ0FBQyxLQUFhO1FBQzNCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFO1lBQzdCLElBQUksQ0FBQyxv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QkFBdEIsTUFBTTtnQkFDRyxZQUFZO3NCQUFyQixNQUFNO2dCQUNHLGNBQWM7c0JBQXZCLE1BQU07Z0JBQ0csWUFBWTtzQkFBckIsTUFBTTtnQkFDUyxZQUFZO3NCQUEzQixLQUFLO2dCQUNVLGNBQWM7c0JBQTdCLEtBQUs7Z0JBQ1UsV0FBVztzQkFBMUIsS0FBSztnQkFDVSxnQkFBZ0I7c0JBQS9CLEtBQUs7Z0JBQ1UsUUFBUTtzQkFBdkIsS0FBSztnQkFDVSxRQUFRO3NCQUF2QixLQUFLO2dCQUNVLGFBQWE7c0JBQTVCLEtBQUs7Z0JBQ1UsWUFBWTtzQkFBM0IsS0FBSztnQkFDVSxLQUFLO3NCQUFwQixLQUFLO2dCQUNVLFVBQVU7c0JBQXpCLEtBQUs7Z0JBQ1UsVUFBVTtzQkFBekIsS0FBSztnQkFFVSxJQUFJO3NCQUFuQixLQUFLO2dCQUNVLElBQUk7c0JBQW5CLEtBQUs7Z0JBQ1UsU0FBUztzQkFBeEIsS0FBSztnQkFDVSxRQUFRO3NCQUF2QixLQUFLO2dCQUNVLFFBQVE7c0JBQXZCLEtBQUs7Z0JBQ1UsUUFBUTtzQkFBdkIsS0FBSztnQkFDVSxTQUFTO3NCQUF4QixLQUFLO2dCQUNVLE1BQU07c0JBQXJCLEtBQUs7Z0JBQ1UsTUFBTTtzQkFBckIsS0FBSztnQkFDVSxNQUFNO3NCQUFyQixLQUFLO2dCQUNVLE1BQU07c0JBQXJCLEtBQUs7Z0JBQ1UsY0FBYztzQkFBN0IsS0FBSztnQkFDVSxhQUFhO3NCQUE1QixLQUFLO2dCQUNVLFdBQVc7c0JBQTFCLEtBQUs7Z0JBQ1UsWUFBWTtzQkFBM0IsS0FBSztnQkFDVSxjQUFjO3NCQUE3QixLQUFLO2dCQUVVLHFCQUFxQjtzQkFBcEMsS0FBSztnQkFLVSxXQUFXO3NCQUExQixLQUFLO2dCQUNJLFNBQVM7c0JBQWxCLE1BQU07Z0JBS0ksSUFBSTtzQkFEZCxLQUFLO2dCQW1CSyxNQUFNO3NCQURoQixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgT3V0cHV0LCBWaWV3Q2hpbGQsIEV2ZW50RW1pdHRlciwgRWxlbWVudFJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICduZzItcGRmanMtdmlld2VyJyxcbiAgdGVtcGxhdGU6IGBcbiAgPHN0eWxlPlxuICAudG9vbGJhciB7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIGxlZnQ6IDA7XG4gICAgcmlnaHQ6IDA7XG4gICAgei1pbmRleDogOTk5OTtcbiAgICBjdXJzb3I6IGRlZmF1bHQ7XG4gICAgZGlzcGxheTogbm9uZTtcbiAgfVxuXG4gICN0b29sYmFyQ29udGFpbmVyIHtcbiAgICB3aWR0aDogMTAwJTtcbiAgfVxuXG4gICN0b29sYmFyQ29udGFpbmVyIHtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgaGVpZ2h0OiAzMnB4O1xuICAgIGJhY2tncm91bmQtY29sb3I6ICM0NzQ3NDc7XG4gICAgYmFja2dyb3VuZC1pbWFnZTogbGluZWFyLWdyYWRpZW50KGhzbGEoMCwwJSwzMiUsLjk5KSwgaHNsYSgwLDAlLDI3JSwuOTUpKTtcbiAgfVxuXG4gICN0b29sYmFyVmlld2VyIHtcbiAgICBoZWlnaHQ6IDMycHg7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogcm93O1xuICAgIGp1c3RpZnktY29udGVudDogZmxleC1lbmQ7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgfVxuXG4gIGJ1dHRvbntcbiAgICBiYWNrZ3JvdW5kOiBub25lO1xuICAgIHdpZHRoOiA1M3B4O1xuICAgIGhlaWdodDogMjVweDtcbiAgICBtaW4td2lkdGg6IDE2cHg7XG4gICAgcGFkZGluZzogMnB4IDZweCAwO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIHRyYW5zcGFyZW50O1xuICAgIGJvcmRlci1yYWRpdXM6IDJweDtcbiAgICBjb2xvcjogaHNsYSgwLDAlLDEwMCUsLjgpO1xuICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICBsaW5lLWhlaWdodDogMTRweDtcbiAgICAtd2Via2l0LXVzZXItc2VsZWN0OiBub25lO1xuICAgICAgIC1tb3otdXNlci1zZWxlY3Q6IG5vbmU7XG4gICAgICAgIC1tcy11c2VyLXNlbGVjdDogbm9uZTtcbiAgICAgICAgICAgIHVzZXItc2VsZWN0OiBub25lO1xuICAgIC8qIE9wZXJhIGRvZXMgbm90IHN1cHBvcnQgdXNlci1zZWxlY3QsIHVzZSA8Li4uIHVuc2VsZWN0YWJsZT1cIm9uXCI+IGluc3RlYWQgKi9cbiAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgdHJhbnNpdGlvbi1wcm9wZXJ0eTogYmFja2dyb3VuZC1jb2xvciwgYm9yZGVyLWNvbG9yLCBib3gtc2hhZG93O1xuICAgIHRyYW5zaXRpb24tZHVyYXRpb246IDE1MG1zO1xuICAgIHRyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uOiBlYXNlO1xuICB9XG5cbiAgYnV0dG9uOmhvdmVye1xuICAgIGJhY2tncm91bmQtY29sb3I6IGhzbGEoMCwwJSwwJSwuMTIpO1xuICAgIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudChoc2xhKDAsMCUsMTAwJSwuMDUpLCBoc2xhKDAsMCUsMTAwJSwwKSk7XG4gICAgYmFja2dyb3VuZC1jbGlwOiBwYWRkaW5nLWJveDtcbiAgICBib3JkZXI6IDFweCBzb2xpZCBoc2xhKDAsMCUsMCUsLjM1KTtcbiAgICBib3JkZXItY29sb3I6IGhzbGEoMCwwJSwwJSwuMzIpIGhzbGEoMCwwJSwwJSwuMzgpIGhzbGEoMCwwJSwwJSwuNDIpO1xuICAgIGJveC1zaGFkb3c6IDAgMXB4IDAgaHNsYSgwLDAlLDEwMCUsLjA1KSBpbnNldCxcbiAgICAgICAgICAgICAgICAwIDAgMXB4IGhzbGEoMCwwJSwxMDAlLC4xNSkgaW5zZXQsXG4gICAgICAgICAgICAgICAgMCAxcHggMCBoc2xhKDAsMCUsMTAwJSwuMDUpO1xuICB9XG5cbiAgLmxvYWRpbmdTcGlue1xuICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIHRvcDogMDtcbiAgICBsZWZ0OiAwO1xuICAgIHdpZHRoOiAxMDB2dztcbiAgICBoZWlnaHQ6IDEwMHZoO1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgLjI1KTtcbiAgICB6LWluZGV4OiAxMDAwOyBcbiAgfVxuXG4gIC5sb2FkZXIge1xuICAgIHotaW5kZXg6IDEwMDE7IFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBsZWZ0OiA1MCU7XG4gICAgdG9wOiA1MCU7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XG4gICAgYm9yZGVyOiAxNnB4IHNvbGlkICNmM2YzZjM7XG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgIGJvcmRlci10b3A6IDE2cHggc29saWQgIzM0OThkYjtcbiAgICB3aWR0aDogMTIwcHg7XG4gICAgaGVpZ2h0OiAxMjBweDtcbiAgICAtd2Via2l0LWFuaW1hdGlvbjogc3BpbiAycyBsaW5lYXIgaW5maW5pdGU7IC8qIFNhZmFyaSAqL1xuICAgIGFuaW1hdGlvbjogc3BpbiAycyBsaW5lYXIgaW5maW5pdGU7XG4gIH1cbiAgXG4gIC8qIFNhZmFyaSAqL1xuICBALXdlYmtpdC1rZXlmcmFtZXMgc3BpbiB7XG4gICAgMCUgeyAtd2Via2l0LXRyYW5zZm9ybTogcm90YXRlKDBkZWcpOyB9XG4gICAgMTAwJSB7IC13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsgfVxuICB9XG4gIFxuICBAa2V5ZnJhbWVzIHNwaW4ge1xuICAgIDAlIHsgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7IH1cbiAgICAxMDAlIHsgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsgfVxuICB9XG4gIDwvc3R5bGU+XG4gIDxkaXYgI3ZpZXdXb3JkQmFyIGNsYXNzPVwidG9vbGJhclwiPlxuICAgIDxkaXYgaWQ9XCJ0b29sYmFyQ29udGFpbmVyXCI+XG4gICAgICA8ZGl2IGlkPVwidG9vbGJhclZpZXdlclwiPlxuICAgICAgICAgIDxidXR0b24gaWQ9XCJkb3dubG9hZFwiIChjbGljayk9XCJkb3dubG9hZFdvcmRGaWxlKClcIiBjbGFzcz1cInRvb2xiYXJCdXR0b24gZG93bmxvYWRcIiB0aXRsZT1cIkRvd25sb2FkXCIgdGFiaW5kZXg9XCIzNFwiIGRhdGEtbDEwbi1pZD1cImRvd25sb2FkXCI+XG4gICAgICAgICAgICA8aW1nIHNyYz1cIi9hc3NldHMvcGRmanMvd2ViL2ltYWdlcy90b29sYmFyQnV0dG9uLWRvd25sb2FkLnBuZ1wiIGFsdD1cIkRvd25sb2FkXCIvPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgIDxidXR0b24gaWQ9XCJjbG9zZUZpbGVcIiAoY2xpY2spPVwiY2xvc2VXb3JkRmlsZSgpXCIgY2xhc3M9XCJ0b29sYmFyQnV0dG9uXCIgdGl0bGU9XCJDbG9zZVwiIHRhYmluZGV4PVwiMzZcIiBkYXRhLWwxMG4taWQ9XCJjbG9zZUZpbGVcIj5cbiAgICAgICAgICA8aW1nIHNyYz1cIi9hc3NldHMvcGRmanMvd2ViL2ltYWdlcy9jbG9zZS1maWxlLnBuZ1wiIGFsdD1cIkNsb3NlXCIvPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICA8L2Rpdj5cbiAgPGRpdiAjbG9hZGluZ1NwaW4gY2xhc3M9XCJsb2FkaW5nU3BpblwiPlxuICAgIDxkaXYgY2xhc3M9XCJsb2FkZXJcIj48L2Rpdj5cbiAgPC9kaXY+XG4gIDxpZnJhbWUgaWQ9XCJpZnJhbWVEb2N4XCIgI2lmcmFtZURvY3ggdGl0bGU9XCJuZzItcGRmanMtdmlld2VyXCIgW2hpZGRlbl09XCJleHRlcm5hbFdpbmRvdyB8fCAoIWV4dGVybmFsV2luZG93ICYmICFwZGZTcmMpXCIgI2lmcmFtZSB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCI+PC9pZnJhbWU+XG5cbiAgPGlmcmFtZSBpZD1cImlmcmFtZVBERlwiICNpZnJhbWVQREYgdGl0bGU9XCJuZzItcGRmanMtdmlld2VyXCIgW2hpZGRlbl09XCJleHRlcm5hbFdpbmRvdyB8fCAoIWV4dGVybmFsV2luZG93ICYmICFwZGZTcmMpXCIgI2lmcmFtZSB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCI+PC9pZnJhbWU+XG4gIGBcbn0pXG5leHBvcnQgY2xhc3MgUGRmSnNWaWV3ZXJDb21wb25lbnQge1xuICBAVmlld0NoaWxkKCd2aWV3V29yZEJhcicsIHsgc3RhdGljOiB0cnVlIH0pIHZpZXdXb3JkQmFyOiBFbGVtZW50UmVmO1xuICBAVmlld0NoaWxkKCdsb2FkaW5nU3BpbicsIHsgc3RhdGljOiB0cnVlIH0pIGxvYWRpbmdTcGluOiBFbGVtZW50UmVmO1xuICBAVmlld0NoaWxkKCdpZnJhbWVEb2N4JywgeyBzdGF0aWM6IHRydWUgfSkgaWZyYW1lRG9jeDogRWxlbWVudFJlZjtcbiAgQFZpZXdDaGlsZCgnaWZyYW1lUERGJywgeyBzdGF0aWM6IHRydWUgfSkgaWZyYW1lUERGOiBFbGVtZW50UmVmO1xuICBASW5wdXQoKSBwdWJsaWMgdmlld2VySWQ6IHN0cmluZztcbiAgQE91dHB1dCgpIG9uQmVmb3JlUHJpbnQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgb25BZnRlclByaW50OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQE91dHB1dCgpIG9uRG9jdW1lbnRMb2FkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQE91dHB1dCgpIG9uUGFnZUNoYW5nZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBJbnB1dCgpIHB1YmxpYyB2aWV3ZXJGb2xkZXI6IHN0cmluZztcbiAgQElucHV0KCkgcHVibGljIGV4dGVybmFsV2luZG93OiBib29sZWFuID0gZmFsc2U7XG4gIEBJbnB1dCgpIHB1YmxpYyBzaG93U3Bpbm5lcjogYm9vbGVhbiA9IHRydWU7XG4gIEBJbnB1dCgpIHB1YmxpYyBkb3dubG9hZEZpbGVOYW1lOiBzdHJpbmc7XG4gIEBJbnB1dCgpIHB1YmxpYyBvcGVuRmlsZTogYm9vbGVhbiA9IHRydWU7XG4gIEBJbnB1dCgpIHB1YmxpYyBkb3dubG9hZDogYm9vbGVhbiA9IHRydWU7XG4gIEBJbnB1dCgpIHB1YmxpYyBzdGFydERvd25sb2FkOiBib29sZWFuO1xuICBASW5wdXQoKSBwdWJsaWMgdmlld0Jvb2ttYXJrOiBib29sZWFuID0gZmFsc2U7XG4gIEBJbnB1dCgpIHB1YmxpYyBwcmludDogYm9vbGVhbiA9IHRydWU7XG4gIEBJbnB1dCgpIHB1YmxpYyBzdGFydFByaW50OiBib29sZWFuO1xuICBASW5wdXQoKSBwdWJsaWMgZnVsbFNjcmVlbjogYm9vbGVhbiA9IHRydWU7XG4gIC8vQElucHV0KCkgcHVibGljIHNob3dGdWxsU2NyZWVuOiBib29sZWFuO1xuICBASW5wdXQoKSBwdWJsaWMgZmluZDogYm9vbGVhbiA9IHRydWU7XG4gIEBJbnB1dCgpIHB1YmxpYyB6b29tOiBzdHJpbmc7XG4gIEBJbnB1dCgpIHB1YmxpYyBuYW1lZGRlc3Q6IHN0cmluZztcbiAgQElucHV0KCkgcHVibGljIHBhZ2Vtb2RlOiBzdHJpbmc7XG4gIEBJbnB1dCgpIHB1YmxpYyBsYXN0UGFnZTogYm9vbGVhbjtcbiAgQElucHV0KCkgcHVibGljIHJvdGF0ZWN3OiBib29sZWFuO1xuICBASW5wdXQoKSBwdWJsaWMgcm90YXRlY2N3OiBib29sZWFuO1xuICBASW5wdXQoKSBwdWJsaWMgY3Vyc29yOiBzdHJpbmc7XG4gIEBJbnB1dCgpIHB1YmxpYyBzY3JvbGw6IHN0cmluZztcbiAgQElucHV0KCkgcHVibGljIHNwcmVhZDogc3RyaW5nO1xuICBASW5wdXQoKSBwdWJsaWMgbG9jYWxlOiBzdHJpbmc7XG4gIEBJbnB1dCgpIHB1YmxpYyB1c2VPbmx5Q3NzWm9vbTogYm9vbGVhbiA9IGZhbHNlO1xuICBASW5wdXQoKSBwdWJsaWMgZXJyb3JPdmVycmlkZTogYm9vbGVhbiA9IGZhbHNlO1xuICBASW5wdXQoKSBwdWJsaWMgZXJyb3JBcHBlbmQ6IGJvb2xlYW4gPSB0cnVlO1xuICBASW5wdXQoKSBwdWJsaWMgZXJyb3JNZXNzYWdlOiBzdHJpbmc7XG4gIEBJbnB1dCgpIHB1YmxpYyBkaWFnbm9zdGljTG9nczogYm9vbGVhbiA9IHRydWU7XG5cbiAgQElucHV0KCkgcHVibGljIGV4dGVybmFsV2luZG93T3B0aW9uczogc3RyaW5nO1xuICBwdWJsaWMgdmlld2VyVGFiOiBhbnk7XG4gIHByaXZhdGUgX3NyYzogc3RyaW5nIHwgQmxvYiB8IFVpbnQ4QXJyYXk7XG4gIHByaXZhdGUgX3BhZ2U6IG51bWJlcjtcblxuICBASW5wdXQoKSBwdWJsaWMgY2xvc2VCdXR0b246IGJvb2xlYW47XG4gIEBPdXRwdXQoKSBjbG9zZUZpbGU6IEV2ZW50RW1pdHRlcjxib29sZWFuPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICB2aWV3ZXJVcmw7XG5cbiAgQElucHV0KClcbiAgcHVibGljIHNldCBwYWdlKF9wYWdlOiBudW1iZXIpIHtcbiAgICB0aGlzLl9wYWdlID0gX3BhZ2U7XG4gICAgaWYgKHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24pIHtcbiAgICAgIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24ucGFnZSA9IHRoaXMuX3BhZ2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLmRpYWdub3N0aWNMb2dzKSBjb25zb2xlLndhcm4oXCJEb2N1bWVudCBpcyBub3QgbG9hZGVkIHlldCEhIS4gVHJ5IHRvIHNldCBwYWdlIyBhZnRlciBmdWxsIGxvYWQuIElnbm9yZSB0aGlzIHdhcm5pbmcgaWYgeW91IGFyZSBub3Qgc2V0dGluZyBwYWdlIyB1c2luZyAnLicgbm90YXRpb24uIChFLmcuIHBkZlZpZXdlci5wYWdlID0gNTspXCIpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBnZXQgcGFnZSgpIHtcbiAgICBpZiAodGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24ucGFnZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuZGlhZ25vc3RpY0xvZ3MpIGNvbnNvbGUud2FybihcIkRvY3VtZW50IGlzIG5vdCBsb2FkZWQgeWV0ISEhLiBUcnkgdG8gcmV0cmlldmUgcGFnZSMgYWZ0ZXIgZnVsbCBsb2FkLlwiKTtcbiAgICB9XG4gIH1cblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2V0IHBkZlNyYyhfc3JjOiBzdHJpbmcgfCBCbG9iIHwgVWludDhBcnJheSkge1xuICAgIHRoaXMuX3NyYyA9IF9zcmM7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHBkZlNyYygpIHtcbiAgICByZXR1cm4gdGhpcy5fc3JjO1xuICB9XG5cbiAgcHVibGljIGdldCBQREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnMoKSB7XG4gICAgbGV0IHBkZlZpZXdlck9wdGlvbnMgPSBudWxsO1xuICAgIGlmICh0aGlzLmV4dGVybmFsV2luZG93KSB7XG4gICAgICBpZiAodGhpcy52aWV3ZXJUYWIpIHtcbiAgICAgICAgcGRmVmlld2VyT3B0aW9ucyA9IHRoaXMudmlld2VyVGFiLlBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuaWZyYW1lUERGLm5hdGl2ZUVsZW1lbnQuY29udGVudFdpbmRvdykge1xuICAgICAgICBwZGZWaWV3ZXJPcHRpb25zID0gdGhpcy5pZnJhbWVQREYubmF0aXZlRWxlbWVudC5jb250ZW50V2luZG93LlBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBkZlZpZXdlck9wdGlvbnM7XG4gIH1cblxuICBwdWJsaWMgZ2V0IFBERlZpZXdlckFwcGxpY2F0aW9uKCkge1xuICAgIGxldCBwZGZWaWV3ZXIgPSBudWxsO1xuICAgIGlmICh0aGlzLmV4dGVybmFsV2luZG93KSB7XG4gICAgICBpZiAodGhpcy52aWV3ZXJUYWIpIHtcbiAgICAgICAgcGRmVmlld2VyID0gdGhpcy52aWV3ZXJUYWIuUERGVmlld2VyQXBwbGljYXRpb247XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLmlmcmFtZVBERi5uYXRpdmVFbGVtZW50LmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgICAgcGRmVmlld2VyID0gdGhpcy5pZnJhbWVQREYubmF0aXZlRWxlbWVudC5jb250ZW50V2luZG93LlBERlZpZXdlckFwcGxpY2F0aW9uO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcGRmVmlld2VyO1xuICB9XG5cbiAgcHVibGljIHJlY2VpdmVNZXNzYWdlKHZpZXdlckV2ZW50KSB7XG4gICAgaWYgKHZpZXdlckV2ZW50LmRhdGEgJiYgdmlld2VyRXZlbnQuZGF0YS52aWV3ZXJJZCAmJiB2aWV3ZXJFdmVudC5kYXRhLmV2ZW50KSB7XG4gICAgICBsZXQgdmlld2VySWQgPSB2aWV3ZXJFdmVudC5kYXRhLnZpZXdlcklkO1xuICAgICAgbGV0IGV2ZW50ID0gdmlld2VyRXZlbnQuZGF0YS5ldmVudDtcbiAgICAgIGxldCBwYXJhbSA9IHZpZXdlckV2ZW50LmRhdGEucGFyYW07XG4gICAgICBpZiAodGhpcy52aWV3ZXJJZCA9PSB2aWV3ZXJJZCkge1xuICAgICAgICBpZiAodGhpcy5vbkJlZm9yZVByaW50ICYmIGV2ZW50ID09IFwiYmVmb3JlUHJpbnRcIikge1xuICAgICAgICAgIHRoaXMub25CZWZvcmVQcmludC5lbWl0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5vbkFmdGVyUHJpbnQgJiYgZXZlbnQgPT0gXCJhZnRlclByaW50XCIpIHtcbiAgICAgICAgICB0aGlzLm9uQWZ0ZXJQcmludC5lbWl0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5vbkRvY3VtZW50TG9hZCAmJiBldmVudCA9PSBcInBhZ2VzTG9hZGVkXCIpIHtcbiAgICAgICAgICB0aGlzLm9uRG9jdW1lbnRMb2FkLmVtaXQocGFyYW0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMub25QYWdlQ2hhbmdlICYmIGV2ZW50ID09IFwicGFnZUNoYW5nZVwiKSB7XG4gICAgICAgICAgdGhpcy5vblBhZ2VDaGFuZ2UuZW1pdChwYXJhbSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHZpZXdlckV2ZW50LmRhdGEgJiYgdmlld2VyRXZlbnQuZGF0YS5ldmVudCA9PT0gXCJjbG9zZWZpbGVcIikge1xuICAgICAgdGhpcy5jbG9zZUZpbGUuZW1pdCh0cnVlKTtcbiAgICB9IGVsc2UgaWYgKHZpZXdlckV2ZW50LmRhdGEgJiYgdmlld2VyRXZlbnQuZGF0YS5ldmVudCA9PT0gXCJsb2FkZXJFcnJvclwiKSB7XG4gICAgICB0aGlzLmxvYWRpbmdTcGluLm5hdGl2ZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICB0aGlzLmlmcmFtZVBERi5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cbiAgICAgIGNvbnNvbGUubG9nKCdsb2FkIGRvY3ghJyk7XG4gICAgICBsZXQgdXJsID0gdGhpcy5nZXRVcmxGaWxlKCk7XG4gICAgICBsZXQgZXh0ID0gdGhpcy5nZXRGaWxlRXh0ZW5zaW9uKHVybC5zcGxpdCgnLnBkZicpWzBdKTtcbiAgICAgIGlmICh0aGlzLmlzVmFsaWRGaWxlKGV4dCkpIHtcbiAgICAgICAgdGhpcy52aWV3V29yZEJhci5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICB0aGlzLnZpZXdlclVybCA9IGBodHRwczovL2RvY3MuZ29vZ2xlLmNvbS9ndmlldz91cmw9JHt1cmwuc3BsaXQoJy5wZGYnKVswXX0mZW1iZWRkZWQ9dHJ1ZWA7XG4gICAgICAgIHRoaXMuaWZyYW1lRG9jeC5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG4gICAgICAgIGxldCBjb3VudFRpbWVsb2FkID0gMDtcbiAgICAgICAgbGV0IGNoZWNrQ29udGVudCA9IGZhbHNlO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgdGhpcy5pZnJhbWVEb2N4Lm5hdGl2ZUVsZW1lbnQuc3JjID0gdGhpcy52aWV3ZXJVcmw7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBsZXQgY29udGVudCA9IHRoaXMuaWZyYW1lRG9jeC5uYXRpdmVFbGVtZW50LmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXS5pbm5lckhUTUw7XG4gICAgICAgICAgICBpZiAoY29udGVudCAhPT0gJycpIHtcbiAgICAgICAgICAgICAgY2hlY2tDb250ZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc29sZS5sb2coY291bnRUaW1lbG9hZCwgY29udGVudCk7XG4gICAgICAgICAgICBcblxuICAgICAgICAgIH0sIDMwMDAgKiBjb3VudFRpbWVsb2FkKTtcbiAgICAgICAgICBjb3VudFRpbWVsb2FkKys7XG4gICAgICAgIH0gd2hpbGUgKGNvdW50VGltZWxvYWQgPT09IDQgfHwgY2hlY2tDb250ZW50KTtcblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aGlzLmxvYWRpbmdTcGluLm5hdGl2ZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfSwgMzAwMCAqIGNvdW50VGltZWxvYWQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGRvd25sb2FkRmlsZShibG9iVXJsLCBmaWxlbmFtZSkge1xuICAgIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIGlmICghYS5jbGljaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEb3dubG9hZE1hbmFnZXI6IFwiYS5jbGljaygpXCIgaXMgbm90IHN1cHBvcnRlZC4nKTtcbiAgICB9XG4gICAgYS5ocmVmID0gYmxvYlVybDtcbiAgICBhLnRhcmdldCA9ICdfcGFyZW50JztcbiAgICBpZiAoJ2Rvd25sb2FkJyBpbiBhKSB7XG4gICAgICBhLmRvd25sb2FkID0gZmlsZW5hbWU7XG4gICAgfVxuICAgIChkb2N1bWVudC5ib2R5IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkuYXBwZW5kQ2hpbGQoYSk7XG4gICAgYS5jbGljaygpO1xuICAgIGEucmVtb3ZlKCk7XG4gIH1cblxuXG4gIHB1YmxpYyBkb3dubG9hZFdvcmRGaWxlKCkge1xuICAgIGNvbnNvbGUubG9nKCdkb3dubG9hZCBmaWxlIScpO1xuICAgIGxldCB1cmwgPSB0aGlzLmdldFVybEZpbGUoKTtcbiAgICBsZXQgZXh0ID0gdGhpcy5nZXRGaWxlRXh0ZW5zaW9uKHVybC5zcGxpdCgnLnBkZicpWzBdKTtcbiAgICBjb25zb2xlLmxvZyh1cmwuc3BsaXQoJy5wZGYnKVswXSk7XG4gICAgaWYgKHRoaXMuaXNWYWxpZEZpbGUoZXh0KSkge1xuICAgICAgdGhpcy5kb3dubG9hZEZpbGUodXJsLnNwbGl0KCcucGRmJylbMF0sICd0ZXN0Jyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5kb3dubG9hZEZpbGUodXJsLCAndGVzdCcpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBjbG9zZVdvcmRGaWxlKCkge1xuICAgIGNvbnNvbGUubG9nKCdjbG9zZSBGaWxlIScpO1xuICAgIHRoaXMuY2xvc2VGaWxlLmVtaXQodHJ1ZSk7XG4gIH1cblxuICBpc1ZhbGlkRmlsZShzdHIpIHtcbiAgICBzd2l0Y2ggKHN0ci50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICBjYXNlICdkb2MnOlxuICAgICAgY2FzZSAnZG9jeCc6XG4gICAgICBjYXNlICd4bHMnOlxuICAgICAgY2FzZSAneGxzeCc6XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBnZXRVcmxGaWxlKCkge1xuICAgIGlmICh0aGlzLl9zcmMgaW5zdGFuY2VvZiBCbG9iKSB7XG4gICAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KFVSTC5jcmVhdGVPYmplY3RVUkwodGhpcy5fc3JjKSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9zcmMgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgICBsZXQgYmxvYiA9IG5ldyBCbG9iKFt0aGlzLl9zcmNdLCB7IHR5cGU6IFwiYXBwbGljYXRpb24vcGRmXCIgfSk7XG4gICAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYikpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fc3JjO1xuICAgIH1cbiAgfVxuXG4gIGdldEZpbGVFeHRlbnNpb24oZmlsZW5hbWUpIHtcbiAgICBjb25zdCBleHQgPSAvXi4rXFwuKFteLl0rKSQvLmV4ZWMoZmlsZW5hbWUpO1xuICAgIHJldHVybiBleHQgPT0gbnVsbCA/ICcnIDogZXh0WzFdO1xuICB9XG5cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIHRoaXMucmVjZWl2ZU1lc3NhZ2UuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgIGlmICghdGhpcy5leHRlcm5hbFdpbmRvdykgeyAvLyBMb2FkIHBkZiBmb3IgZW1iZWRkZWQgdmlld3NcbiAgICAgIHRoaXMubG9hZFBkZigpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZWZyZXNoKCk6IHZvaWQgeyAvLyBOZWVkcyB0byBiZSBpbnZva2VkIGZvciBleHRlcm5hbCB3aW5kb3cgb3Igd2hlbiBuZWVkcyB0byByZWxvYWQgcGRmXG4gICAgdGhpcy5sb2FkUGRmKCk7XG4gIH1cblxuICBwcml2YXRlIGxvYWRQZGYoKSB7XG4gICAgaWYgKCF0aGlzLl9zcmMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy52aWV3ZXJVcmwgPSAnJztcbiAgICB0aGlzLnZpZXdXb3JkQmFyLm5hdGl2ZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAvLyBjb25zb2xlLmxvZyhgVGFiIGlzIC0gJHt0aGlzLnZpZXdlclRhYn1gKTtcbiAgICAvLyBpZiAodGhpcy52aWV3ZXJUYWIpIHtcbiAgICAvLyAgIGNvbnNvbGUubG9nKGBTdGF0dXMgb2Ygd2luZG93IC0gJHt0aGlzLnZpZXdlclRhYi5jbG9zZWR9YCk7XG4gICAgLy8gfVxuXG5cbiAgICB0aGlzLmlmcmFtZURvY3gubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG4gICAgaWYgKHRoaXMuZXh0ZXJuYWxXaW5kb3cgJiYgKHR5cGVvZiB0aGlzLnZpZXdlclRhYiA9PT0gJ3VuZGVmaW5lZCcgfHwgdGhpcy52aWV3ZXJUYWIuY2xvc2VkKSkge1xuICAgICAgdGhpcy52aWV3ZXJUYWIgPSB3aW5kb3cub3BlbignJywgJ19ibGFuaycsIHRoaXMuZXh0ZXJuYWxXaW5kb3dPcHRpb25zIHx8ICcnKTtcbiAgICAgIGlmICh0aGlzLnZpZXdlclRhYiA9PSBudWxsKSB7XG4gICAgICAgIGlmICh0aGlzLmRpYWdub3N0aWNMb2dzKSBjb25zb2xlLmVycm9yKFwibmcyLXBkZmpzLXZpZXdlcjogRm9yICdleHRlcm5hbFdpbmRvdyA9IHRydWUnLiBpLmUgb3BlbmluZyBpbiBuZXcgdGFiIHRvIHdvcmssIHBvcC11cHMgc2hvdWxkIGJlIGVuYWJsZWQuXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnNob3dTcGlubmVyKSB7XG4gICAgICAgIHRoaXMudmlld2VyVGFiLmRvY3VtZW50LndyaXRlKGBcbiAgICAgICAgICA8c3R5bGU+XG4gICAgICAgICAgLmxvYWRlciB7XG4gICAgICAgICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICAgICAgICBsZWZ0OiA0MCU7XG4gICAgICAgICAgICB0b3A6IDQwJTtcbiAgICAgICAgICAgIGJvcmRlcjogMTZweCBzb2xpZCAjZjNmM2YzO1xuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgICAgICAgYm9yZGVyLXRvcDogMTZweCBzb2xpZCAjMzQ5OGRiO1xuICAgICAgICAgICAgd2lkdGg6IDEyMHB4O1xuICAgICAgICAgICAgaGVpZ2h0OiAxMjBweDtcbiAgICAgICAgICAgIGFuaW1hdGlvbjogc3BpbiAycyBsaW5lYXIgaW5maW5pdGU7XG4gICAgICAgICAgfVxuICAgICAgICAgIEBrZXlmcmFtZXMgc3BpbiB7XG4gICAgICAgICAgICAwJSB7XG4gICAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgMTAwJSB7XG4gICAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIDwvc3R5bGU+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImxvYWRlclwiPjwvZGl2PlxuICAgICAgICBgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgZmlsZVVybCA9IHRoaXMuZ2V0VXJsRmlsZSgpO1xuICAgIC8vIGxldCB0aGlzLnZpZXdlclVybDtcbiAgICBpZiAodGhpcy52aWV3ZXJGb2xkZXIpIHtcbiAgICAgIHRoaXMudmlld2VyVXJsID0gYCR7dGhpcy52aWV3ZXJGb2xkZXJ9L3dlYi92aWV3ZXIuaHRtbGA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudmlld2VyVXJsID0gYGFzc2V0cy9wZGZqcy93ZWIvdmlld2VyLmh0bWxgO1xuICAgIH1cblxuICAgIHRoaXMudmlld2VyVXJsICs9IGA/ZmlsZT0ke2ZpbGVVcmx9YDtcblxuICAgIGlmICh0eXBlb2YgdGhpcy52aWV3ZXJJZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmdmlld2VySWQ9JHt0aGlzLnZpZXdlcklkfWA7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGhpcy5vbkJlZm9yZVByaW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZiZWZvcmVQcmludD10cnVlYDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uQWZ0ZXJQcmludCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmYWZ0ZXJQcmludD10cnVlYDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uRG9jdW1lbnRMb2FkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZwYWdlc0xvYWRlZD10cnVlYDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uUGFnZUNoYW5nZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmcGFnZUNoYW5nZT10cnVlYDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLmNsb3NlQnV0dG9uICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZjbG9zZUZpbGU9JHt0aGlzLmNsb3NlQnV0dG9ufWA7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZG93bmxvYWRGaWxlTmFtZSkge1xuICAgICAgaWYgKCF0aGlzLmRvd25sb2FkRmlsZU5hbWUuZW5kc1dpdGgoXCIucGRmXCIpKSB7XG4gICAgICAgIHRoaXMuZG93bmxvYWRGaWxlTmFtZSArPSBcIi5wZGZcIjtcbiAgICAgIH1cbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmZmlsZU5hbWU9JHt0aGlzLmRvd25sb2FkRmlsZU5hbWV9YDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9wZW5GaWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZvcGVuRmlsZT0ke3RoaXMub3BlbkZpbGV9YDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLmRvd25sb2FkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZkb3dubG9hZD0ke3RoaXMuZG93bmxvYWR9YDtcbiAgICB9XG4gICAgaWYgKHRoaXMuc3RhcnREb3dubG9hZCkge1xuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZzdGFydERvd25sb2FkPSR7dGhpcy5zdGFydERvd25sb2FkfWA7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGhpcy52aWV3Qm9va21hcmsgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnZpZXdCb29rbWFyaz0ke3RoaXMudmlld0Jvb2ttYXJrfWA7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGhpcy5wcmludCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmcHJpbnQ9JHt0aGlzLnByaW50fWA7XG4gICAgfVxuICAgIGlmICh0aGlzLnN0YXJ0UHJpbnQpIHtcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmc3RhcnRQcmludD0ke3RoaXMuc3RhcnRQcmludH1gO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHRoaXMuZnVsbFNjcmVlbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmZnVsbFNjcmVlbj0ke3RoaXMuZnVsbFNjcmVlbn1gO1xuICAgIH1cbiAgICAvLyBpZiAodGhpcy5zaG93RnVsbFNjcmVlbikge1xuICAgIC8vICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZzaG93RnVsbFNjcmVlbj0ke3RoaXMuc2hvd0Z1bGxTY3JlZW59YDtcbiAgICAvLyB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLmZpbmQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJmZpbmQ9JHt0aGlzLmZpbmR9YDtcbiAgICB9XG4gICAgaWYgKHRoaXMubGFzdFBhZ2UpIHtcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmbGFzdHBhZ2U9JHt0aGlzLmxhc3RQYWdlfWA7XG4gICAgfVxuICAgIGlmICh0aGlzLnJvdGF0ZWN3KSB7XG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnJvdGF0ZWN3PSR7dGhpcy5yb3RhdGVjd31gO1xuICAgIH1cbiAgICBpZiAodGhpcy5yb3RhdGVjY3cpIHtcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmcm90YXRlY2N3PSR7dGhpcy5yb3RhdGVjY3d9YDtcbiAgICB9XG4gICAgaWYgKHRoaXMuY3Vyc29yKSB7XG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJmN1cnNvcj0ke3RoaXMuY3Vyc29yfWA7XG4gICAgfVxuICAgIGlmICh0aGlzLnNjcm9sbCkge1xuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZzY3JvbGw9JHt0aGlzLnNjcm9sbH1gO1xuICAgIH1cbiAgICBpZiAodGhpcy5zcHJlYWQpIHtcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmc3ByZWFkPSR7dGhpcy5zcHJlYWR9YDtcbiAgICB9XG4gICAgaWYgKHRoaXMubG9jYWxlKSB7XG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJmxvY2FsZT0ke3RoaXMubG9jYWxlfWA7XG4gICAgfVxuICAgIGlmICh0aGlzLnVzZU9ubHlDc3Nab29tKSB7XG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnVzZU9ubHlDc3Nab29tPSR7dGhpcy51c2VPbmx5Q3NzWm9vbX1gO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9wYWdlIHx8IHRoaXMuem9vbSB8fCB0aGlzLm5hbWVkZGVzdCB8fCB0aGlzLnBhZ2Vtb2RlKSB0aGlzLnZpZXdlclVybCArPSBcIiNcIlxuICAgIGlmICh0aGlzLl9wYWdlKSB7XG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnBhZ2U9JHt0aGlzLl9wYWdlfWA7XG4gICAgfVxuICAgIGlmICh0aGlzLnpvb20pIHtcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmem9vbT0ke3RoaXMuem9vbX1gO1xuICAgIH1cbiAgICBpZiAodGhpcy5uYW1lZGRlc3QpIHtcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmbmFtZWRkZXN0PSR7dGhpcy5uYW1lZGRlc3R9YDtcbiAgICB9XG4gICAgaWYgKHRoaXMucGFnZW1vZGUpIHtcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmcGFnZW1vZGU9JHt0aGlzLnBhZ2Vtb2RlfWA7XG4gICAgfVxuICAgIGlmICh0aGlzLmVycm9yT3ZlcnJpZGUgfHwgdGhpcy5lcnJvckFwcGVuZCkge1xuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZlcnJvck1lc3NhZ2U9JHt0aGlzLmVycm9yTWVzc2FnZX1gO1xuXG4gICAgICBpZiAodGhpcy5lcnJvck92ZXJyaWRlKSB7XG4gICAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmZXJyb3JPdmVycmlkZT0ke3RoaXMuZXJyb3JPdmVycmlkZX1gO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuZXJyb3JBcHBlbmQpIHtcbiAgICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZlcnJvckFwcGVuZD0ke3RoaXMuZXJyb3JBcHBlbmR9YDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5leHRlcm5hbFdpbmRvdykge1xuICAgICAgdGhpcy52aWV3ZXJUYWIubG9jYXRpb24uaHJlZiA9IHRoaXMudmlld2VyVXJsO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmlmcmFtZVBERi5uYXRpdmVFbGVtZW50LnNyYyA9IHRoaXMudmlld2VyVXJsO1xuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKGBcbiAgICAgIHBkZlNyYyA9ICR7dGhpcy5wZGZTcmN9XG4gICAgICBmaWxlVXJsID0gJHtmaWxlVXJsfVxuICAgICAgZXh0ZXJuYWxXaW5kb3cgPSAke3RoaXMuZXh0ZXJuYWxXaW5kb3d9XG4gICAgICBkb3dubG9hZEZpbGVOYW1lID0gJHt0aGlzLmRvd25sb2FkRmlsZU5hbWV9XG4gICAgYCk7XG5cbiAgICAvLyB2aWV3ZXJGb2xkZXIgPSAke3RoaXMudmlld2VyRm9sZGVyfVxuICAgIC8vIG9wZW5GaWxlID0gJHt0aGlzLm9wZW5GaWxlfVxuICAgIC8vIGRvd25sb2FkID0gJHt0aGlzLmRvd25sb2FkfVxuICAgIC8vIHN0YXJ0RG93bmxvYWQgPSAke3RoaXMuc3RhcnREb3dubG9hZH1cbiAgICAvLyB2aWV3Qm9va21hcmsgPSAke3RoaXMudmlld0Jvb2ttYXJrfVxuICAgIC8vIHByaW50ID0gJHt0aGlzLnByaW50fVxuICAgIC8vIHN0YXJ0UHJpbnQgPSAke3RoaXMuc3RhcnRQcmludH1cbiAgICAvLyBmdWxsU2NyZWVuID0gJHt0aGlzLmZ1bGxTY3JlZW59XG4gICAgLy8gZmluZCA9ICR7dGhpcy5maW5kfVxuICAgIC8vIGxhc3RQYWdlID0gJHt0aGlzLmxhc3RQYWdlfVxuICAgIC8vIHJvdGF0ZWN3ID0gJHt0aGlzLnJvdGF0ZWN3fVxuICAgIC8vIHJvdGF0ZWNjdyA9ICR7dGhpcy5yb3RhdGVjY3d9XG4gICAgLy8gY3Vyc29yID0gJHt0aGlzLmN1cnNvcn1cbiAgICAvLyBzY3JvbGxNb2RlID0gJHt0aGlzLnNjcm9sbH1cbiAgICAvLyBzcHJlYWQgPSAke3RoaXMuc3ByZWFkfVxuICAgIC8vIHBhZ2UgPSAke3RoaXMucGFnZX1cbiAgICAvLyB6b29tID0gJHt0aGlzLnpvb219XG4gICAgLy8gbmFtZWRkZXN0ID0gJHt0aGlzLm5hbWVkZGVzdH1cbiAgICAvLyBwYWdlbW9kZSA9ICR7dGhpcy5wYWdlbW9kZX1cbiAgICAvLyBwYWdlbW9kZSA9ICR7dGhpcy5lcnJvck92ZXJyaWRlfVxuICAgIC8vIHBhZ2Vtb2RlID0gJHt0aGlzLmVycm9yQXBwZW5kfVxuICAgIC8vIHBhZ2Vtb2RlID0gJHt0aGlzLmVycm9yTWVzc2FnZX1cbiAgfVxufSJdfQ==