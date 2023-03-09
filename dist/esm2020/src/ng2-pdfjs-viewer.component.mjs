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
                            return;
                        }
                        else {
                            countTimeload++;
                        }
                        console.log(countTimeload, content);
                    }, 3000 * countTimeload);
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
PdfJsViewerComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.2", ngImport: i0, type: PdfJsViewerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
PdfJsViewerComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.2", type: PdfJsViewerComponent, selector: "ng2-pdfjs-viewer", inputs: { viewerId: "viewerId", viewerFolder: "viewerFolder", externalWindow: "externalWindow", showSpinner: "showSpinner", downloadFileName: "downloadFileName", openFile: "openFile", download: "download", startDownload: "startDownload", viewBookmark: "viewBookmark", print: "print", startPrint: "startPrint", fullScreen: "fullScreen", find: "find", zoom: "zoom", nameddest: "nameddest", pagemode: "pagemode", lastPage: "lastPage", rotatecw: "rotatecw", rotateccw: "rotateccw", cursor: "cursor", scroll: "scroll", spread: "spread", locale: "locale", useOnlyCssZoom: "useOnlyCssZoom", errorOverride: "errorOverride", errorAppend: "errorAppend", errorMessage: "errorMessage", diagnosticLogs: "diagnosticLogs", externalWindowOptions: "externalWindowOptions", closeButton: "closeButton", page: "page", pdfSrc: "pdfSrc" }, outputs: { onBeforePrint: "onBeforePrint", onAfterPrint: "onAfterPrint", onDocumentLoad: "onDocumentLoad", onPageChange: "onPageChange", closeFile: "closeFile" }, viewQueries: [{ propertyName: "viewWordBar", first: true, predicate: ["viewWordBar"], descendants: true, static: true }, { propertyName: "loadingSpin", first: true, predicate: ["loadingSpin"], descendants: true, static: true }, { propertyName: "iframeDocx", first: true, predicate: ["iframeDocx"], descendants: true, static: true }, { propertyName: "iframePDF", first: true, predicate: ["iframePDF"], descendants: true, static: true }], ngImport: i0, template: `
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
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.2", ngImport: i0, type: PdfJsViewerComponent, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQWMsTUFBTSxlQUFlLENBQUM7O0FBNkg5RixNQUFNLE9BQU8sb0JBQW9CO0lBM0hqQztRQWlJWSxrQkFBYSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ3RELGlCQUFZLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFDckQsbUJBQWMsR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUN2RCxpQkFBWSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBRS9DLG1CQUFjLEdBQVksS0FBSyxDQUFDO1FBQ2hDLGdCQUFXLEdBQVksSUFBSSxDQUFDO1FBRTVCLGFBQVEsR0FBWSxJQUFJLENBQUM7UUFDekIsYUFBUSxHQUFZLElBQUksQ0FBQztRQUV6QixpQkFBWSxHQUFZLEtBQUssQ0FBQztRQUM5QixVQUFLLEdBQVksSUFBSSxDQUFDO1FBRXRCLGVBQVUsR0FBWSxJQUFJLENBQUM7UUFDM0MsMENBQTBDO1FBQzFCLFNBQUksR0FBWSxJQUFJLENBQUM7UUFXckIsbUJBQWMsR0FBWSxLQUFLLENBQUM7UUFDaEMsa0JBQWEsR0FBWSxLQUFLLENBQUM7UUFDL0IsZ0JBQVcsR0FBWSxJQUFJLENBQUM7UUFFNUIsbUJBQWMsR0FBWSxJQUFJLENBQUM7UUFRckMsY0FBUyxHQUEwQixJQUFJLFlBQVksRUFBRSxDQUFDO0tBZ1lqRTtJQTVYQyxJQUNXLElBQUksQ0FBQyxLQUFhO1FBQzNCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFO1lBQzdCLElBQUksQ0FBQyxv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ZXdDaGlsZCwgRXZlbnRFbWl0dGVyLCBFbGVtZW50UmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ25nMi1wZGZqcy12aWV3ZXInLFxyXG4gIHRlbXBsYXRlOiBgXHJcbiAgPHN0eWxlPlxyXG4gIC50b29sYmFyIHtcclxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICAgIGxlZnQ6IDA7XHJcbiAgICByaWdodDogMDtcclxuICAgIHotaW5kZXg6IDk5OTk7XHJcbiAgICBjdXJzb3I6IGRlZmF1bHQ7XHJcbiAgICBkaXNwbGF5OiBub25lO1xyXG4gIH1cclxuXHJcbiAgI3Rvb2xiYXJDb250YWluZXIge1xyXG4gICAgd2lkdGg6IDEwMCU7XHJcbiAgfVxyXG5cclxuICAjdG9vbGJhckNvbnRhaW5lciB7XHJcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICBoZWlnaHQ6IDMycHg7XHJcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDc0NzQ3O1xyXG4gICAgYmFja2dyb3VuZC1pbWFnZTogbGluZWFyLWdyYWRpZW50KGhzbGEoMCwwJSwzMiUsLjk5KSwgaHNsYSgwLDAlLDI3JSwuOTUpKTtcclxuICB9XHJcblxyXG4gICN0b29sYmFyVmlld2VyIHtcclxuICAgIGhlaWdodDogMzJweDtcclxuICAgIGRpc3BsYXk6IGZsZXg7XHJcbiAgICBmbGV4LWRpcmVjdGlvbjogcm93O1xyXG4gICAganVzdGlmeS1jb250ZW50OiBmbGV4LWVuZDtcclxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAgfVxyXG5cclxuICBidXR0b257XHJcbiAgICBiYWNrZ3JvdW5kOiBub25lO1xyXG4gICAgd2lkdGg6IDUzcHg7XHJcbiAgICBoZWlnaHQ6IDI1cHg7XHJcbiAgICBtaW4td2lkdGg6IDE2cHg7XHJcbiAgICBwYWRkaW5nOiAycHggNnB4IDA7XHJcbiAgICBib3JkZXI6IDFweCBzb2xpZCB0cmFuc3BhcmVudDtcclxuICAgIGJvcmRlci1yYWRpdXM6IDJweDtcclxuICAgIGNvbG9yOiBoc2xhKDAsMCUsMTAwJSwuOCk7XHJcbiAgICBmb250LXNpemU6IDEycHg7XHJcbiAgICBsaW5lLWhlaWdodDogMTRweDtcclxuICAgIC13ZWJraXQtdXNlci1zZWxlY3Q6IG5vbmU7XHJcbiAgICAgICAtbW96LXVzZXItc2VsZWN0OiBub25lO1xyXG4gICAgICAgIC1tcy11c2VyLXNlbGVjdDogbm9uZTtcclxuICAgICAgICAgICAgdXNlci1zZWxlY3Q6IG5vbmU7XHJcbiAgICAvKiBPcGVyYSBkb2VzIG5vdCBzdXBwb3J0IHVzZXItc2VsZWN0LCB1c2UgPC4uLiB1bnNlbGVjdGFibGU9XCJvblwiPiBpbnN0ZWFkICovXHJcbiAgICBjdXJzb3I6IHBvaW50ZXI7XHJcbiAgICB0cmFuc2l0aW9uLXByb3BlcnR5OiBiYWNrZ3JvdW5kLWNvbG9yLCBib3JkZXItY29sb3IsIGJveC1zaGFkb3c7XHJcbiAgICB0cmFuc2l0aW9uLWR1cmF0aW9uOiAxNTBtcztcclxuICAgIHRyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uOiBlYXNlO1xyXG4gIH1cclxuXHJcbiAgYnV0dG9uOmhvdmVye1xyXG4gICAgYmFja2dyb3VuZC1jb2xvcjogaHNsYSgwLDAlLDAlLC4xMik7XHJcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiBsaW5lYXItZ3JhZGllbnQoaHNsYSgwLDAlLDEwMCUsLjA1KSwgaHNsYSgwLDAlLDEwMCUsMCkpO1xyXG4gICAgYmFja2dyb3VuZC1jbGlwOiBwYWRkaW5nLWJveDtcclxuICAgIGJvcmRlcjogMXB4IHNvbGlkIGhzbGEoMCwwJSwwJSwuMzUpO1xyXG4gICAgYm9yZGVyLWNvbG9yOiBoc2xhKDAsMCUsMCUsLjMyKSBoc2xhKDAsMCUsMCUsLjM4KSBoc2xhKDAsMCUsMCUsLjQyKTtcclxuICAgIGJveC1zaGFkb3c6IDAgMXB4IDAgaHNsYSgwLDAlLDEwMCUsLjA1KSBpbnNldCxcclxuICAgICAgICAgICAgICAgIDAgMCAxcHggaHNsYSgwLDAlLDEwMCUsLjE1KSBpbnNldCxcclxuICAgICAgICAgICAgICAgIDAgMXB4IDAgaHNsYSgwLDAlLDEwMCUsLjA1KTtcclxuICB9XHJcblxyXG4gIC5sb2FkaW5nU3BpbntcclxuICAgIGRpc3BsYXk6IG5vbmU7XHJcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICB0b3A6IDA7XHJcbiAgICBsZWZ0OiAwO1xyXG4gICAgd2lkdGg6IDEwMHZ3O1xyXG4gICAgaGVpZ2h0OiAxMDB2aDtcclxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgLjI1KTtcclxuICAgIHotaW5kZXg6IDEwMDA7IFxyXG4gIH1cclxuXHJcbiAgLmxvYWRlciB7XHJcbiAgICB6LWluZGV4OiAxMDAxOyBcclxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgIGxlZnQ6IDUwJTtcclxuICAgIHRvcDogNTAlO1xyXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XHJcbiAgICBib3JkZXI6IDE2cHggc29saWQgI2YzZjNmMztcclxuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcclxuICAgIGJvcmRlci10b3A6IDE2cHggc29saWQgIzM0OThkYjtcclxuICAgIHdpZHRoOiAxMjBweDtcclxuICAgIGhlaWdodDogMTIwcHg7XHJcbiAgICAtd2Via2l0LWFuaW1hdGlvbjogc3BpbiAycyBsaW5lYXIgaW5maW5pdGU7IC8qIFNhZmFyaSAqL1xyXG4gICAgYW5pbWF0aW9uOiBzcGluIDJzIGxpbmVhciBpbmZpbml0ZTtcclxuICB9XHJcbiAgXHJcbiAgLyogU2FmYXJpICovXHJcbiAgQC13ZWJraXQta2V5ZnJhbWVzIHNwaW4ge1xyXG4gICAgMCUgeyAtd2Via2l0LXRyYW5zZm9ybTogcm90YXRlKDBkZWcpOyB9XHJcbiAgICAxMDAlIHsgLXdlYmtpdC10cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpOyB9XHJcbiAgfVxyXG4gIFxyXG4gIEBrZXlmcmFtZXMgc3BpbiB7XHJcbiAgICAwJSB7IHRyYW5zZm9ybTogcm90YXRlKDBkZWcpOyB9XHJcbiAgICAxMDAlIHsgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsgfVxyXG4gIH1cclxuICA8L3N0eWxlPlxyXG4gIDxkaXYgI3ZpZXdXb3JkQmFyIGNsYXNzPVwidG9vbGJhclwiPlxyXG4gICAgPGRpdiBpZD1cInRvb2xiYXJDb250YWluZXJcIj5cclxuICAgICAgPGRpdiBpZD1cInRvb2xiYXJWaWV3ZXJcIj5cclxuICAgICAgICAgIDxidXR0b24gaWQ9XCJkb3dubG9hZFwiIChjbGljayk9XCJkb3dubG9hZFdvcmRGaWxlKClcIiBjbGFzcz1cInRvb2xiYXJCdXR0b24gZG93bmxvYWRcIiB0aXRsZT1cIkRvd25sb2FkXCIgdGFiaW5kZXg9XCIzNFwiIGRhdGEtbDEwbi1pZD1cImRvd25sb2FkXCI+XHJcbiAgICAgICAgICAgIDxpbWcgc3JjPVwiL2Fzc2V0cy9wZGZqcy93ZWIvaW1hZ2VzL3Rvb2xiYXJCdXR0b24tZG93bmxvYWQucG5nXCIgYWx0PVwiRG93bmxvYWRcIi8+XHJcbiAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgPGJ1dHRvbiBpZD1cImNsb3NlRmlsZVwiIChjbGljayk9XCJjbG9zZVdvcmRGaWxlKClcIiBjbGFzcz1cInRvb2xiYXJCdXR0b25cIiB0aXRsZT1cIkNsb3NlXCIgdGFiaW5kZXg9XCIzNlwiIGRhdGEtbDEwbi1pZD1cImNsb3NlRmlsZVwiPlxyXG4gICAgICAgICAgPGltZyBzcmM9XCIvYXNzZXRzL3BkZmpzL3dlYi9pbWFnZXMvY2xvc2UtZmlsZS5wbmdcIiBhbHQ9XCJDbG9zZVwiLz5cclxuICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICA8L2Rpdj5cclxuICA8ZGl2ICNsb2FkaW5nU3BpbiBjbGFzcz1cImxvYWRpbmdTcGluXCI+XHJcbiAgICA8ZGl2IGNsYXNzPVwibG9hZGVyXCI+PC9kaXY+XHJcbiAgPC9kaXY+XHJcbiAgPGlmcmFtZSBpZD1cImlmcmFtZURvY3hcIiAjaWZyYW1lRG9jeCB0aXRsZT1cIm5nMi1wZGZqcy12aWV3ZXJcIiBbaGlkZGVuXT1cImV4dGVybmFsV2luZG93IHx8ICghZXh0ZXJuYWxXaW5kb3cgJiYgIXBkZlNyYylcIiAjaWZyYW1lIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIj48L2lmcmFtZT5cclxuXHJcbiAgPGlmcmFtZSBpZD1cImlmcmFtZVBERlwiICNpZnJhbWVQREYgdGl0bGU9XCJuZzItcGRmanMtdmlld2VyXCIgW2hpZGRlbl09XCJleHRlcm5hbFdpbmRvdyB8fCAoIWV4dGVybmFsV2luZG93ICYmICFwZGZTcmMpXCIgI2lmcmFtZSB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCI+PC9pZnJhbWU+XHJcbiAgYFxyXG59KVxyXG5leHBvcnQgY2xhc3MgUGRmSnNWaWV3ZXJDb21wb25lbnQge1xyXG4gIEBWaWV3Q2hpbGQoJ3ZpZXdXb3JkQmFyJywgeyBzdGF0aWM6IHRydWUgfSkgdmlld1dvcmRCYXI6IEVsZW1lbnRSZWY7XHJcbiAgQFZpZXdDaGlsZCgnbG9hZGluZ1NwaW4nLCB7IHN0YXRpYzogdHJ1ZSB9KSBsb2FkaW5nU3BpbjogRWxlbWVudFJlZjtcclxuICBAVmlld0NoaWxkKCdpZnJhbWVEb2N4JywgeyBzdGF0aWM6IHRydWUgfSkgaWZyYW1lRG9jeDogRWxlbWVudFJlZjtcclxuICBAVmlld0NoaWxkKCdpZnJhbWVQREYnLCB7IHN0YXRpYzogdHJ1ZSB9KSBpZnJhbWVQREY6IEVsZW1lbnRSZWY7XHJcbiAgQElucHV0KCkgcHVibGljIHZpZXdlcklkOiBzdHJpbmc7XHJcbiAgQE91dHB1dCgpIG9uQmVmb3JlUHJpbnQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG4gIEBPdXRwdXQoKSBvbkFmdGVyUHJpbnQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG4gIEBPdXRwdXQoKSBvbkRvY3VtZW50TG9hZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcbiAgQE91dHB1dCgpIG9uUGFnZUNoYW5nZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcbiAgQElucHV0KCkgcHVibGljIHZpZXdlckZvbGRlcjogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBleHRlcm5hbFdpbmRvdzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBzaG93U3Bpbm5lcjogYm9vbGVhbiA9IHRydWU7XHJcbiAgQElucHV0KCkgcHVibGljIGRvd25sb2FkRmlsZU5hbWU6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgb3BlbkZpbGU6IGJvb2xlYW4gPSB0cnVlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBkb3dubG9hZDogYm9vbGVhbiA9IHRydWU7XHJcbiAgQElucHV0KCkgcHVibGljIHN0YXJ0RG93bmxvYWQ6IGJvb2xlYW47XHJcbiAgQElucHV0KCkgcHVibGljIHZpZXdCb29rbWFyazogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBwcmludDogYm9vbGVhbiA9IHRydWU7XHJcbiAgQElucHV0KCkgcHVibGljIHN0YXJ0UHJpbnQ6IGJvb2xlYW47XHJcbiAgQElucHV0KCkgcHVibGljIGZ1bGxTY3JlZW46IGJvb2xlYW4gPSB0cnVlO1xyXG4gIC8vQElucHV0KCkgcHVibGljIHNob3dGdWxsU2NyZWVuOiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBmaW5kOiBib29sZWFuID0gdHJ1ZTtcclxuICBASW5wdXQoKSBwdWJsaWMgem9vbTogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBuYW1lZGRlc3Q6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgcGFnZW1vZGU6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgbGFzdFBhZ2U6IGJvb2xlYW47XHJcbiAgQElucHV0KCkgcHVibGljIHJvdGF0ZWN3OiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyByb3RhdGVjY3c6IGJvb2xlYW47XHJcbiAgQElucHV0KCkgcHVibGljIGN1cnNvcjogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBzY3JvbGw6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgc3ByZWFkOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgcHVibGljIGxvY2FsZTogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyB1c2VPbmx5Q3NzWm9vbTogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBlcnJvck92ZXJyaWRlOiBib29sZWFuID0gZmFsc2U7XHJcbiAgQElucHV0KCkgcHVibGljIGVycm9yQXBwZW5kOiBib29sZWFuID0gdHJ1ZTtcclxuICBASW5wdXQoKSBwdWJsaWMgZXJyb3JNZXNzYWdlOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgcHVibGljIGRpYWdub3N0aWNMb2dzOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgQElucHV0KCkgcHVibGljIGV4dGVybmFsV2luZG93T3B0aW9uczogc3RyaW5nO1xyXG4gIHB1YmxpYyB2aWV3ZXJUYWI6IGFueTtcclxuICBwcml2YXRlIF9zcmM6IHN0cmluZyB8IEJsb2IgfCBVaW50OEFycmF5O1xyXG4gIHByaXZhdGUgX3BhZ2U6IG51bWJlcjtcclxuXHJcbiAgQElucHV0KCkgcHVibGljIGNsb3NlQnV0dG9uOiBib29sZWFuO1xyXG4gIEBPdXRwdXQoKSBjbG9zZUZpbGU6IEV2ZW50RW1pdHRlcjxib29sZWFuPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgdmlld2VyVXJsO1xyXG5cclxuICBASW5wdXQoKVxyXG4gIHB1YmxpYyBzZXQgcGFnZShfcGFnZTogbnVtYmVyKSB7XHJcbiAgICB0aGlzLl9wYWdlID0gX3BhZ2U7XHJcbiAgICBpZiAodGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbikge1xyXG4gICAgICB0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uLnBhZ2UgPSB0aGlzLl9wYWdlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMuZGlhZ25vc3RpY0xvZ3MpIGNvbnNvbGUud2FybihcIkRvY3VtZW50IGlzIG5vdCBsb2FkZWQgeWV0ISEhLiBUcnkgdG8gc2V0IHBhZ2UjIGFmdGVyIGZ1bGwgbG9hZC4gSWdub3JlIHRoaXMgd2FybmluZyBpZiB5b3UgYXJlIG5vdCBzZXR0aW5nIHBhZ2UjIHVzaW5nICcuJyBub3RhdGlvbi4gKEUuZy4gcGRmVmlld2VyLnBhZ2UgPSA1OylcIik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHBhZ2UoKSB7XHJcbiAgICBpZiAodGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbikge1xyXG4gICAgICByZXR1cm4gdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbi5wYWdlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMuZGlhZ25vc3RpY0xvZ3MpIGNvbnNvbGUud2FybihcIkRvY3VtZW50IGlzIG5vdCBsb2FkZWQgeWV0ISEhLiBUcnkgdG8gcmV0cmlldmUgcGFnZSMgYWZ0ZXIgZnVsbCBsb2FkLlwiKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIEBJbnB1dCgpXHJcbiAgcHVibGljIHNldCBwZGZTcmMoX3NyYzogc3RyaW5nIHwgQmxvYiB8IFVpbnQ4QXJyYXkpIHtcclxuICAgIHRoaXMuX3NyYyA9IF9zcmM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHBkZlNyYygpIHtcclxuICAgIHJldHVybiB0aGlzLl9zcmM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IFBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucygpIHtcclxuICAgIGxldCBwZGZWaWV3ZXJPcHRpb25zID0gbnVsbDtcclxuICAgIGlmICh0aGlzLmV4dGVybmFsV2luZG93KSB7XHJcbiAgICAgIGlmICh0aGlzLnZpZXdlclRhYikge1xyXG4gICAgICAgIHBkZlZpZXdlck9wdGlvbnMgPSB0aGlzLnZpZXdlclRhYi5QREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnM7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICh0aGlzLmlmcmFtZVBERi5uYXRpdmVFbGVtZW50LmNvbnRlbnRXaW5kb3cpIHtcclxuICAgICAgICBwZGZWaWV3ZXJPcHRpb25zID0gdGhpcy5pZnJhbWVQREYubmF0aXZlRWxlbWVudC5jb250ZW50V2luZG93LlBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBkZlZpZXdlck9wdGlvbnM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IFBERlZpZXdlckFwcGxpY2F0aW9uKCkge1xyXG4gICAgbGV0IHBkZlZpZXdlciA9IG51bGw7XHJcbiAgICBpZiAodGhpcy5leHRlcm5hbFdpbmRvdykge1xyXG4gICAgICBpZiAodGhpcy52aWV3ZXJUYWIpIHtcclxuICAgICAgICBwZGZWaWV3ZXIgPSB0aGlzLnZpZXdlclRhYi5QREZWaWV3ZXJBcHBsaWNhdGlvbjtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMuaWZyYW1lUERGLm5hdGl2ZUVsZW1lbnQuY29udGVudFdpbmRvdykge1xyXG4gICAgICAgIHBkZlZpZXdlciA9IHRoaXMuaWZyYW1lUERGLm5hdGl2ZUVsZW1lbnQuY29udGVudFdpbmRvdy5QREZWaWV3ZXJBcHBsaWNhdGlvbjtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBkZlZpZXdlcjtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZWNlaXZlTWVzc2FnZSh2aWV3ZXJFdmVudCkge1xyXG4gICAgaWYgKHZpZXdlckV2ZW50LmRhdGEgJiYgdmlld2VyRXZlbnQuZGF0YS52aWV3ZXJJZCAmJiB2aWV3ZXJFdmVudC5kYXRhLmV2ZW50KSB7XHJcbiAgICAgIGxldCB2aWV3ZXJJZCA9IHZpZXdlckV2ZW50LmRhdGEudmlld2VySWQ7XHJcbiAgICAgIGxldCBldmVudCA9IHZpZXdlckV2ZW50LmRhdGEuZXZlbnQ7XHJcbiAgICAgIGxldCBwYXJhbSA9IHZpZXdlckV2ZW50LmRhdGEucGFyYW07XHJcbiAgICAgIGlmICh0aGlzLnZpZXdlcklkID09IHZpZXdlcklkKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub25CZWZvcmVQcmludCAmJiBldmVudCA9PSBcImJlZm9yZVByaW50XCIpIHtcclxuICAgICAgICAgIHRoaXMub25CZWZvcmVQcmludC5lbWl0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMub25BZnRlclByaW50ICYmIGV2ZW50ID09IFwiYWZ0ZXJQcmludFwiKSB7XHJcbiAgICAgICAgICB0aGlzLm9uQWZ0ZXJQcmludC5lbWl0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMub25Eb2N1bWVudExvYWQgJiYgZXZlbnQgPT0gXCJwYWdlc0xvYWRlZFwiKSB7XHJcbiAgICAgICAgICB0aGlzLm9uRG9jdW1lbnRMb2FkLmVtaXQocGFyYW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLm9uUGFnZUNoYW5nZSAmJiBldmVudCA9PSBcInBhZ2VDaGFuZ2VcIikge1xyXG4gICAgICAgICAgdGhpcy5vblBhZ2VDaGFuZ2UuZW1pdChwYXJhbSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAodmlld2VyRXZlbnQuZGF0YSAmJiB2aWV3ZXJFdmVudC5kYXRhLmV2ZW50ID09PSBcImNsb3NlZmlsZVwiKSB7XHJcbiAgICAgIHRoaXMuY2xvc2VGaWxlLmVtaXQodHJ1ZSk7XHJcbiAgICB9IGVsc2UgaWYgKHZpZXdlckV2ZW50LmRhdGEgJiYgdmlld2VyRXZlbnQuZGF0YS5ldmVudCA9PT0gXCJsb2FkZXJFcnJvclwiKSB7XHJcbiAgICAgIHRoaXMubG9hZGluZ1NwaW4ubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgdGhpcy5pZnJhbWVQREYubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG5cclxuICAgICAgY29uc29sZS5sb2coJ2xvYWQgZG9jeCEnKTtcclxuICAgICAgbGV0IHVybCA9IHRoaXMuZ2V0VXJsRmlsZSgpO1xyXG4gICAgICBsZXQgZXh0ID0gdGhpcy5nZXRGaWxlRXh0ZW5zaW9uKHVybC5zcGxpdCgnLnBkZicpWzBdKTtcclxuICAgICAgaWYgKHRoaXMuaXNWYWxpZEZpbGUoZXh0KSkge1xyXG4gICAgICAgIHRoaXMudmlld1dvcmRCYXIubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgICB0aGlzLnZpZXdlclVybCA9IGBodHRwczovL2RvY3MuZ29vZ2xlLmNvbS9ndmlldz91cmw9JHt1cmwuc3BsaXQoJy5wZGYnKVswXX0mZW1iZWRkZWQ9dHJ1ZWA7XHJcbiAgICAgICAgdGhpcy5pZnJhbWVEb2N4Lm5hdGl2ZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcblxyXG4gICAgICAgIGxldCBjb3VudFRpbWVsb2FkID0gMDtcclxuICAgICAgICBsZXQgY2hlY2tDb250ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgdGhpcy5pZnJhbWVEb2N4Lm5hdGl2ZUVsZW1lbnQuc3JjID0gdGhpcy52aWV3ZXJVcmw7XHJcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgbGV0IGNvbnRlbnQgPSB0aGlzLmlmcmFtZURvY3gubmF0aXZlRWxlbWVudC5jb250ZW50V2luZG93LmRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF0uaW5uZXJIVE1MO1xyXG4gICAgICAgICAgICBpZiAoY29udGVudCAhPT0gJycpIHtcclxuICAgICAgICAgICAgICBjaGVja0NvbnRlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBjb3VudFRpbWVsb2FkKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5sb2coY291bnRUaW1lbG9hZCwgY29udGVudCk7XHJcbiAgICAgICAgICB9LCAzMDAwICogY291bnRUaW1lbG9hZCk7XHJcbiAgICAgICAgfSB3aGlsZSAoY291bnRUaW1lbG9hZCA9PT0gNCB8fCBjaGVja0NvbnRlbnQpO1xyXG5cclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIHRoaXMubG9hZGluZ1NwaW4ubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIH0sIDMwMDAgKiBjb3VudFRpbWVsb2FkKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZG93bmxvYWRGaWxlKGJsb2JVcmwsIGZpbGVuYW1lKSB7XHJcbiAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuICAgIGlmICghYS5jbGljaykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Rvd25sb2FkTWFuYWdlcjogXCJhLmNsaWNrKClcIiBpcyBub3Qgc3VwcG9ydGVkLicpO1xyXG4gICAgfVxyXG4gICAgYS5ocmVmID0gYmxvYlVybDtcclxuICAgIGEudGFyZ2V0ID0gJ19wYXJlbnQnO1xyXG4gICAgaWYgKCdkb3dubG9hZCcgaW4gYSkge1xyXG4gICAgICBhLmRvd25sb2FkID0gZmlsZW5hbWU7XHJcbiAgICB9XHJcbiAgICAoZG9jdW1lbnQuYm9keSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpLmFwcGVuZENoaWxkKGEpO1xyXG4gICAgYS5jbGljaygpO1xyXG4gICAgYS5yZW1vdmUoKTtcclxuICB9XHJcblxyXG5cclxuICBwdWJsaWMgZG93bmxvYWRXb3JkRmlsZSgpIHtcclxuICAgIGNvbnNvbGUubG9nKCdkb3dubG9hZCBmaWxlIScpO1xyXG4gICAgbGV0IHVybCA9IHRoaXMuZ2V0VXJsRmlsZSgpO1xyXG4gICAgbGV0IGV4dCA9IHRoaXMuZ2V0RmlsZUV4dGVuc2lvbih1cmwuc3BsaXQoJy5wZGYnKVswXSk7XHJcbiAgICBjb25zb2xlLmxvZyh1cmwuc3BsaXQoJy5wZGYnKVswXSk7XHJcbiAgICBpZiAodGhpcy5pc1ZhbGlkRmlsZShleHQpKSB7XHJcbiAgICAgIHRoaXMuZG93bmxvYWRGaWxlKHVybC5zcGxpdCgnLnBkZicpWzBdLCAndGVzdCcpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuZG93bmxvYWRGaWxlKHVybCwgJ3Rlc3QnKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBjbG9zZVdvcmRGaWxlKCkge1xyXG4gICAgY29uc29sZS5sb2coJ2Nsb3NlIEZpbGUhJyk7XHJcbiAgICB0aGlzLmNsb3NlRmlsZS5lbWl0KHRydWUpO1xyXG4gIH1cclxuXHJcbiAgaXNWYWxpZEZpbGUoc3RyKSB7XHJcbiAgICBzd2l0Y2ggKHN0ci50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgIGNhc2UgJ2RvYyc6XHJcbiAgICAgIGNhc2UgJ2RvY3gnOlxyXG4gICAgICBjYXNlICd4bHMnOlxyXG4gICAgICBjYXNlICd4bHN4JzpcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIGdldFVybEZpbGUoKSB7XHJcbiAgICBpZiAodGhpcy5fc3JjIGluc3RhbmNlb2YgQmxvYikge1xyXG4gICAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KFVSTC5jcmVhdGVPYmplY3RVUkwodGhpcy5fc3JjKSk7XHJcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3NyYyBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcclxuICAgICAgbGV0IGJsb2IgPSBuZXcgQmxvYihbdGhpcy5fc3JjXSwgeyB0eXBlOiBcImFwcGxpY2F0aW9uL3BkZlwiIH0pO1xyXG4gICAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYikpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX3NyYztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGdldEZpbGVFeHRlbnNpb24oZmlsZW5hbWUpIHtcclxuICAgIGNvbnN0IGV4dCA9IC9eLitcXC4oW14uXSspJC8uZXhlYyhmaWxlbmFtZSk7XHJcbiAgICByZXR1cm4gZXh0ID09IG51bGwgPyAnJyA6IGV4dFsxXTtcclxuICB9XHJcblxyXG4gIG5nT25Jbml0KCk6IHZvaWQge1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIHRoaXMucmVjZWl2ZU1lc3NhZ2UuYmluZCh0aGlzKSwgZmFsc2UpO1xyXG4gICAgaWYgKCF0aGlzLmV4dGVybmFsV2luZG93KSB7IC8vIExvYWQgcGRmIGZvciBlbWJlZGRlZCB2aWV3c1xyXG4gICAgICB0aGlzLmxvYWRQZGYoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyByZWZyZXNoKCk6IHZvaWQgeyAvLyBOZWVkcyB0byBiZSBpbnZva2VkIGZvciBleHRlcm5hbCB3aW5kb3cgb3Igd2hlbiBuZWVkcyB0byByZWxvYWQgcGRmXHJcbiAgICB0aGlzLmxvYWRQZGYoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbG9hZFBkZigpIHtcclxuICAgIGlmICghdGhpcy5fc3JjKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMudmlld2VyVXJsID0gJyc7XHJcbiAgICB0aGlzLnZpZXdXb3JkQmFyLm5hdGl2ZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIC8vIGNvbnNvbGUubG9nKGBUYWIgaXMgLSAke3RoaXMudmlld2VyVGFifWApO1xyXG4gICAgLy8gaWYgKHRoaXMudmlld2VyVGFiKSB7XHJcbiAgICAvLyAgIGNvbnNvbGUubG9nKGBTdGF0dXMgb2Ygd2luZG93IC0gJHt0aGlzLnZpZXdlclRhYi5jbG9zZWR9YCk7XHJcbiAgICAvLyB9XHJcblxyXG5cclxuICAgIHRoaXMuaWZyYW1lRG9jeC5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcblxyXG4gICAgaWYgKHRoaXMuZXh0ZXJuYWxXaW5kb3cgJiYgKHR5cGVvZiB0aGlzLnZpZXdlclRhYiA9PT0gJ3VuZGVmaW5lZCcgfHwgdGhpcy52aWV3ZXJUYWIuY2xvc2VkKSkge1xyXG4gICAgICB0aGlzLnZpZXdlclRhYiA9IHdpbmRvdy5vcGVuKCcnLCAnX2JsYW5rJywgdGhpcy5leHRlcm5hbFdpbmRvd09wdGlvbnMgfHwgJycpO1xyXG4gICAgICBpZiAodGhpcy52aWV3ZXJUYWIgPT0gbnVsbCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRpYWdub3N0aWNMb2dzKSBjb25zb2xlLmVycm9yKFwibmcyLXBkZmpzLXZpZXdlcjogRm9yICdleHRlcm5hbFdpbmRvdyA9IHRydWUnLiBpLmUgb3BlbmluZyBpbiBuZXcgdGFiIHRvIHdvcmssIHBvcC11cHMgc2hvdWxkIGJlIGVuYWJsZWQuXCIpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMuc2hvd1NwaW5uZXIpIHtcclxuICAgICAgICB0aGlzLnZpZXdlclRhYi5kb2N1bWVudC53cml0ZShgXHJcbiAgICAgICAgICA8c3R5bGU+XHJcbiAgICAgICAgICAubG9hZGVyIHtcclxuICAgICAgICAgICAgcG9zaXRpb246IGZpeGVkO1xyXG4gICAgICAgICAgICBsZWZ0OiA0MCU7XHJcbiAgICAgICAgICAgIHRvcDogNDAlO1xyXG4gICAgICAgICAgICBib3JkZXI6IDE2cHggc29saWQgI2YzZjNmMztcclxuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xyXG4gICAgICAgICAgICBib3JkZXItdG9wOiAxNnB4IHNvbGlkICMzNDk4ZGI7XHJcbiAgICAgICAgICAgIHdpZHRoOiAxMjBweDtcclxuICAgICAgICAgICAgaGVpZ2h0OiAxMjBweDtcclxuICAgICAgICAgICAgYW5pbWF0aW9uOiBzcGluIDJzIGxpbmVhciBpbmZpbml0ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIEBrZXlmcmFtZXMgc3BpbiB7XHJcbiAgICAgICAgICAgIDAlIHtcclxuICAgICAgICAgICAgICB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAxMDAlIHtcclxuICAgICAgICAgICAgICB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICA8L3N0eWxlPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImxvYWRlclwiPjwvZGl2PlxyXG4gICAgICAgIGApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGZpbGVVcmwgPSB0aGlzLmdldFVybEZpbGUoKTtcclxuICAgIC8vIGxldCB0aGlzLnZpZXdlclVybDtcclxuICAgIGlmICh0aGlzLnZpZXdlckZvbGRlcikge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCA9IGAke3RoaXMudmlld2VyRm9sZGVyfS93ZWIvdmlld2VyLmh0bWxgO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgPSBgYXNzZXRzL3BkZmpzL3dlYi92aWV3ZXIuaHRtbGA7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy52aWV3ZXJVcmwgKz0gYD9maWxlPSR7ZmlsZVVybH1gO1xyXG5cclxuICAgIGlmICh0eXBlb2YgdGhpcy52aWV3ZXJJZCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZ2aWV3ZXJJZD0ke3RoaXMudmlld2VySWR9YDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5vbkJlZm9yZVByaW50ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJmJlZm9yZVByaW50PXRydWVgO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uQWZ0ZXJQcmludCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZhZnRlclByaW50PXRydWVgO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uRG9jdW1lbnRMb2FkICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnBhZ2VzTG9hZGVkPXRydWVgO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uUGFnZUNoYW5nZSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZwYWdlQ2hhbmdlPXRydWVgO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmNsb3NlQnV0dG9uICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJmNsb3NlRmlsZT0ke3RoaXMuY2xvc2VCdXR0b259YDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5kb3dubG9hZEZpbGVOYW1lKSB7XHJcbiAgICAgIGlmICghdGhpcy5kb3dubG9hZEZpbGVOYW1lLmVuZHNXaXRoKFwiLnBkZlwiKSkge1xyXG4gICAgICAgIHRoaXMuZG93bmxvYWRGaWxlTmFtZSArPSBcIi5wZGZcIjtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJmZpbGVOYW1lPSR7dGhpcy5kb3dubG9hZEZpbGVOYW1lfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMub3BlbkZpbGUgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmb3BlbkZpbGU9JHt0aGlzLm9wZW5GaWxlfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZG93bmxvYWQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmZG93bmxvYWQ9JHt0aGlzLmRvd25sb2FkfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5zdGFydERvd25sb2FkKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmc3RhcnREb3dubG9hZD0ke3RoaXMuc3RhcnREb3dubG9hZH1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLnZpZXdCb29rbWFyayAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZ2aWV3Qm9va21hcms9JHt0aGlzLnZpZXdCb29rbWFya31gO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLnByaW50ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnByaW50PSR7dGhpcy5wcmludH1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuc3RhcnRQcmludCkge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnN0YXJ0UHJpbnQ9JHt0aGlzLnN0YXJ0UHJpbnR9YDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5mdWxsU2NyZWVuICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJmZ1bGxTY3JlZW49JHt0aGlzLmZ1bGxTY3JlZW59YDtcclxuICAgIH1cclxuICAgIC8vIGlmICh0aGlzLnNob3dGdWxsU2NyZWVuKSB7XHJcbiAgICAvLyAgIHRoaXMudmlld2VyVXJsICs9IGAmc2hvd0Z1bGxTY3JlZW49JHt0aGlzLnNob3dGdWxsU2NyZWVufWA7XHJcbiAgICAvLyB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZmluZCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZmaW5kPSR7dGhpcy5maW5kfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5sYXN0UGFnZSkge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJmxhc3RwYWdlPSR7dGhpcy5sYXN0UGFnZX1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMucm90YXRlY3cpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZyb3RhdGVjdz0ke3RoaXMucm90YXRlY3d9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnJvdGF0ZWNjdykge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnJvdGF0ZWNjdz0ke3RoaXMucm90YXRlY2N3fWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5jdXJzb3IpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZjdXJzb3I9JHt0aGlzLmN1cnNvcn1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuc2Nyb2xsKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmc2Nyb2xsPSR7dGhpcy5zY3JvbGx9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnNwcmVhZCkge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnNwcmVhZD0ke3RoaXMuc3ByZWFkfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5sb2NhbGUpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZsb2NhbGU9JHt0aGlzLmxvY2FsZX1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMudXNlT25seUNzc1pvb20pIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZ1c2VPbmx5Q3NzWm9vbT0ke3RoaXMudXNlT25seUNzc1pvb219YDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5fcGFnZSB8fCB0aGlzLnpvb20gfHwgdGhpcy5uYW1lZGRlc3QgfHwgdGhpcy5wYWdlbW9kZSkgdGhpcy52aWV3ZXJVcmwgKz0gXCIjXCJcclxuICAgIGlmICh0aGlzLl9wYWdlKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmcGFnZT0ke3RoaXMuX3BhZ2V9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnpvb20pIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZ6b29tPSR7dGhpcy56b29tfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5uYW1lZGRlc3QpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZuYW1lZGRlc3Q9JHt0aGlzLm5hbWVkZGVzdH1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMucGFnZW1vZGUpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZwYWdlbW9kZT0ke3RoaXMucGFnZW1vZGV9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmVycm9yT3ZlcnJpZGUgfHwgdGhpcy5lcnJvckFwcGVuZCkge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJmVycm9yTWVzc2FnZT0ke3RoaXMuZXJyb3JNZXNzYWdlfWA7XHJcblxyXG4gICAgICBpZiAodGhpcy5lcnJvck92ZXJyaWRlKSB7XHJcbiAgICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZlcnJvck92ZXJyaWRlPSR7dGhpcy5lcnJvck92ZXJyaWRlfWA7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRoaXMuZXJyb3JBcHBlbmQpIHtcclxuICAgICAgICB0aGlzLnZpZXdlclVybCArPSBgJmVycm9yQXBwZW5kPSR7dGhpcy5lcnJvckFwcGVuZH1gO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuZXh0ZXJuYWxXaW5kb3cpIHtcclxuICAgICAgdGhpcy52aWV3ZXJUYWIubG9jYXRpb24uaHJlZiA9IHRoaXMudmlld2VyVXJsO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5pZnJhbWVQREYubmF0aXZlRWxlbWVudC5zcmMgPSB0aGlzLnZpZXdlclVybDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zb2xlLmxvZyhgXHJcbiAgICAgIHBkZlNyYyA9ICR7dGhpcy5wZGZTcmN9XHJcbiAgICAgIGZpbGVVcmwgPSAke2ZpbGVVcmx9XHJcbiAgICAgIGV4dGVybmFsV2luZG93ID0gJHt0aGlzLmV4dGVybmFsV2luZG93fVxyXG4gICAgICBkb3dubG9hZEZpbGVOYW1lID0gJHt0aGlzLmRvd25sb2FkRmlsZU5hbWV9XHJcbiAgICBgKTtcclxuXHJcbiAgICAvLyB2aWV3ZXJGb2xkZXIgPSAke3RoaXMudmlld2VyRm9sZGVyfVxyXG4gICAgLy8gb3BlbkZpbGUgPSAke3RoaXMub3BlbkZpbGV9XHJcbiAgICAvLyBkb3dubG9hZCA9ICR7dGhpcy5kb3dubG9hZH1cclxuICAgIC8vIHN0YXJ0RG93bmxvYWQgPSAke3RoaXMuc3RhcnREb3dubG9hZH1cclxuICAgIC8vIHZpZXdCb29rbWFyayA9ICR7dGhpcy52aWV3Qm9va21hcmt9XHJcbiAgICAvLyBwcmludCA9ICR7dGhpcy5wcmludH1cclxuICAgIC8vIHN0YXJ0UHJpbnQgPSAke3RoaXMuc3RhcnRQcmludH1cclxuICAgIC8vIGZ1bGxTY3JlZW4gPSAke3RoaXMuZnVsbFNjcmVlbn1cclxuICAgIC8vIGZpbmQgPSAke3RoaXMuZmluZH1cclxuICAgIC8vIGxhc3RQYWdlID0gJHt0aGlzLmxhc3RQYWdlfVxyXG4gICAgLy8gcm90YXRlY3cgPSAke3RoaXMucm90YXRlY3d9XHJcbiAgICAvLyByb3RhdGVjY3cgPSAke3RoaXMucm90YXRlY2N3fVxyXG4gICAgLy8gY3Vyc29yID0gJHt0aGlzLmN1cnNvcn1cclxuICAgIC8vIHNjcm9sbE1vZGUgPSAke3RoaXMuc2Nyb2xsfVxyXG4gICAgLy8gc3ByZWFkID0gJHt0aGlzLnNwcmVhZH1cclxuICAgIC8vIHBhZ2UgPSAke3RoaXMucGFnZX1cclxuICAgIC8vIHpvb20gPSAke3RoaXMuem9vbX1cclxuICAgIC8vIG5hbWVkZGVzdCA9ICR7dGhpcy5uYW1lZGRlc3R9XHJcbiAgICAvLyBwYWdlbW9kZSA9ICR7dGhpcy5wYWdlbW9kZX1cclxuICAgIC8vIHBhZ2Vtb2RlID0gJHt0aGlzLmVycm9yT3ZlcnJpZGV9XHJcbiAgICAvLyBwYWdlbW9kZSA9ICR7dGhpcy5lcnJvckFwcGVuZH1cclxuICAgIC8vIHBhZ2Vtb2RlID0gJHt0aGlzLmVycm9yTWVzc2FnZX1cclxuICB9XHJcbn0iXX0=