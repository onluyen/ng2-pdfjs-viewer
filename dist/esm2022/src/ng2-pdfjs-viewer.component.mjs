import { Component, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export class PdfJsViewerComponent {
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
    relaseUrl; // Avoid memory leask with `URL.createObjectURL`
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
    ngOnDestroy() {
        this.relaseUrl?.();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.10", ngImport: i0, type: PdfJsViewerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.10", type: PdfJsViewerComponent, selector: "ng2-pdfjs-viewer", inputs: { viewerId: "viewerId", viewerFolder: "viewerFolder", externalWindow: "externalWindow", showSpinner: "showSpinner", downloadFileName: "downloadFileName", openFile: "openFile", download: "download", startDownload: "startDownload", viewBookmark: "viewBookmark", print: "print", startPrint: "startPrint", fullScreen: "fullScreen", find: "find", zoom: "zoom", nameddest: "nameddest", pagemode: "pagemode", lastPage: "lastPage", rotatecw: "rotatecw", rotateccw: "rotateccw", cursor: "cursor", scroll: "scroll", spread: "spread", locale: "locale", useOnlyCssZoom: "useOnlyCssZoom", errorOverride: "errorOverride", errorAppend: "errorAppend", errorMessage: "errorMessage", diagnosticLogs: "diagnosticLogs", externalWindowOptions: "externalWindowOptions", closeButton: "closeButton", page: "page", pdfSrc: "pdfSrc" }, outputs: { onBeforePrint: "onBeforePrint", onAfterPrint: "onAfterPrint", onDocumentLoad: "onDocumentLoad", onPageChange: "onPageChange", closeFile: "closeFile" }, viewQueries: [{ propertyName: "viewWordBar", first: true, predicate: ["viewWordBar"], descendants: true, static: true }, { propertyName: "loadingSpin", first: true, predicate: ["loadingSpin"], descendants: true, static: true }, { propertyName: "iframeDocx", first: true, predicate: ["iframeDocx"], descendants: true, static: true }, { propertyName: "iframePDF", first: true, predicate: ["iframePDF"], descendants: true, static: true }], ngImport: i0, template: `
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
  <iframe id="iframeDocx" #iframeDocx title="ng2-pdfjs-viewer" [hidden]="externalWindow || (!externalWindow && !pdfSrc)" width="100%" height="100%"></iframe>

  <iframe id="iframePDF" #iframePDF title="ng2-pdfjs-viewer" [hidden]="externalWindow || (!externalWindow && !pdfSrc)" width="100%" height="100%"></iframe>
  `, isInline: true, styles: ["\n  .toolbar {\n    position: relative;\n    left: 0;\n    right: 0;\n    z-index: 9999;\n    cursor: default;\n    display: none;\n  }\n\n  #toolbarContainer {\n    width: 100%;\n  }\n\n  #toolbarContainer {\n    position: relative;\n    height: 32px;\n    background-color: #474747;\n    background-image: linear-gradient(hsla(0,0%,32%,.99), hsla(0,0%,27%,.95));\n  }\n\n  #toolbarViewer {\n    height: 32px;\n    display: flex;\n    flex-direction: row;\n    justify-content: flex-end;\n    align-items: center;\n  }\n\n  button{\n    background: none;\n    width: 53px;\n    height: 25px;\n    min-width: 16px;\n    padding: 2px 6px 0;\n    border: 1px solid transparent;\n    border-radius: 2px;\n    color: hsla(0,0%,100%,.8);\n    font-size: 12px;\n    line-height: 14px;\n    -webkit-user-select: none;\n       -moz-user-select: none;\n        -ms-user-select: none;\n            user-select: none;\n    /* Opera does not support user-select, use <... unselectable=\"on\"> instead */\n    cursor: pointer;\n    transition-property: background-color, border-color, box-shadow;\n    transition-duration: 150ms;\n    transition-timing-function: ease;\n  }\n\n  button:hover{\n    background-color: hsla(0,0%,0%,.12);\n    background-image: linear-gradient(hsla(0,0%,100%,.05), hsla(0,0%,100%,0));\n    background-clip: padding-box;\n    border: 1px solid hsla(0,0%,0%,.35);\n    border-color: hsla(0,0%,0%,.32) hsla(0,0%,0%,.38) hsla(0,0%,0%,.42);\n    box-shadow: 0 1px 0 hsla(0,0%,100%,.05) inset,\n                0 0 1px hsla(0,0%,100%,.15) inset,\n                0 1px 0 hsla(0,0%,100%,.05);\n  }\n\n  .loadingSpin{\n    display: none;\n    position: relative;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    background-color: rgba(0, 0, 0, .25);\n    z-index: 1000; \n  }\n\n  .loader {\n    z-index: 1001; \n    position: absolute;\n    left: 50%;\n    top: 50%;\n    transform: translate(-50%, -50%);\n    border: 16px solid #f3f3f3;\n    border-radius: 50%;\n    border-top: 16px solid #3498db;\n    width: 120px;\n    height: 120px;\n    -webkit-animation: spin 2s linear infinite; /* Safari */\n    animation: spin 2s linear infinite;\n  }\n  \n  /* Safari */\n  @-webkit-keyframes spin {\n    0% { -webkit-transform: rotate(0deg); }\n    100% { -webkit-transform: rotate(360deg); }\n  }\n  \n  @keyframes spin {\n    0% { transform: rotate(0deg); }\n    100% { transform: rotate(360deg); }\n  }\n  "] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.10", ngImport: i0, type: PdfJsViewerComponent, decorators: [{
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
  <iframe id="iframeDocx" #iframeDocx title="ng2-pdfjs-viewer" [hidden]="externalWindow || (!externalWindow && !pdfSrc)" width="100%" height="100%"></iframe>

  <iframe id="iframePDF" #iframePDF title="ng2-pdfjs-viewer" [hidden]="externalWindow || (!externalWindow && !pdfSrc)" width="100%" height="100%"></iframe>
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQWlDLE1BQU0sZUFBZSxDQUFDOztBQTZIakgsTUFBTSxPQUFPLG9CQUFvQjtJQUNhLFdBQVcsQ0FBYTtJQUN4QixXQUFXLENBQWE7SUFDekIsVUFBVSxDQUFhO0lBQ3hCLFNBQVMsQ0FBYTtJQUNoRCxRQUFRLENBQVM7SUFDdkIsYUFBYSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO0lBQ3RELFlBQVksR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztJQUNyRCxjQUFjLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7SUFDdkQsWUFBWSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO0lBQy9DLFlBQVksQ0FBUztJQUNyQixjQUFjLEdBQVksS0FBSyxDQUFDO0lBQ2hDLFdBQVcsR0FBWSxJQUFJLENBQUM7SUFDNUIsZ0JBQWdCLENBQVM7SUFDekIsUUFBUSxHQUFZLElBQUksQ0FBQztJQUN6QixRQUFRLEdBQVksSUFBSSxDQUFDO0lBQ3pCLGFBQWEsQ0FBVTtJQUN2QixZQUFZLEdBQVksS0FBSyxDQUFDO0lBQzlCLEtBQUssR0FBWSxJQUFJLENBQUM7SUFDdEIsVUFBVSxDQUFVO0lBQ3BCLFVBQVUsR0FBWSxJQUFJLENBQUM7SUFDM0MsMENBQTBDO0lBQzFCLElBQUksR0FBWSxJQUFJLENBQUM7SUFDckIsSUFBSSxDQUFTO0lBQ2IsU0FBUyxDQUFTO0lBQ2xCLFFBQVEsQ0FBUztJQUNqQixRQUFRLENBQVU7SUFDbEIsUUFBUSxDQUFVO0lBQ2xCLFNBQVMsQ0FBVTtJQUNuQixNQUFNLENBQVM7SUFDZixNQUFNLENBQVM7SUFDZixN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O3NCQUF2QixLQUFLO2dCQUNVLFFBQVE7c0JBQXZCLEtBQUs7Z0JBQ1UsYUFBYTtzQkFBNUIsS0FBSztnQkFDVSxZQUFZO3NCQUEzQixLQUFLO2dCQUNVLEtBQUs7c0JBQXBCLEtBQUs7Z0JBQ1UsVUFBVTtzQkFBekIsS0FBSztnQkFDVSxVQUFVO3NCQUF6QixLQUFLO2dCQUVVLElBQUk7c0JBQW5CLEtBQUs7Z0JBQ1UsSUFBSTtzQkFBbkIsS0FBSztnQkFDVSxTQUFTO3NCQUF4QixLQUFLO2dCQUNVLFFBQVE7c0JBQXZCLEtBQUs7Z0JBQ1UsUUFBUTtzQkFBdkIsS0FBSztnQkFDVSxRQUFRO3NCQUF2QixLQUFLO2dCQUNVLFNBQVM7c0JBQXhCLEtBQUs7Z0JBQ1UsTUFBTTtzQkFBckIsS0FBSztnQkFDVSxNQUFNO3NCQUFyQixLQUFLO2dCQUNVLE1BQU07c0JBQXJCLEtBQUs7Z0JBQ1UsTUFBTTtzQkFBckIsS0FBSztnQkFDVSxjQUFjO3NCQUE3QixLQUFLO2dCQUNVLGFBQWE7c0JBQTVCLEtBQUs7Z0JBQ1UsV0FBVztzQkFBMUIsS0FBSztnQkFDVSxZQUFZO3NCQUEzQixLQUFLO2dCQUNVLGNBQWM7c0JBQTdCLEtBQUs7Z0JBRVUscUJBQXFCO3NCQUFwQyxLQUFLO2dCQUtVLFdBQVc7c0JBQTFCLEtBQUs7Z0JBQ0ksU0FBUztzQkFBbEIsTUFBTTtnQkFLSSxJQUFJO3NCQURkLEtBQUs7Z0JBbUJLLE1BQU07c0JBRGhCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBPdXRwdXQsIFZpZXdDaGlsZCwgRXZlbnRFbWl0dGVyLCBFbGVtZW50UmVmLCBPbkRlc3Ryb3ksIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICduZzItcGRmanMtdmlld2VyJyxcclxuICB0ZW1wbGF0ZTogYFxyXG4gIDxzdHlsZT5cclxuICAudG9vbGJhciB7XHJcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICBsZWZ0OiAwO1xyXG4gICAgcmlnaHQ6IDA7XHJcbiAgICB6LWluZGV4OiA5OTk5O1xyXG4gICAgY3Vyc29yOiBkZWZhdWx0O1xyXG4gICAgZGlzcGxheTogbm9uZTtcclxuICB9XHJcblxyXG4gICN0b29sYmFyQ29udGFpbmVyIHtcclxuICAgIHdpZHRoOiAxMDAlO1xyXG4gIH1cclxuXHJcbiAgI3Rvb2xiYXJDb250YWluZXIge1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgaGVpZ2h0OiAzMnB4O1xyXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzQ3NDc0NztcclxuICAgIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudChoc2xhKDAsMCUsMzIlLC45OSksIGhzbGEoMCwwJSwyNyUsLjk1KSk7XHJcbiAgfVxyXG5cclxuICAjdG9vbGJhclZpZXdlciB7XHJcbiAgICBoZWlnaHQ6IDMycHg7XHJcbiAgICBkaXNwbGF5OiBmbGV4O1xyXG4gICAgZmxleC1kaXJlY3Rpb246IHJvdztcclxuICAgIGp1c3RpZnktY29udGVudDogZmxleC1lbmQ7XHJcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIH1cclxuXHJcbiAgYnV0dG9ue1xyXG4gICAgYmFja2dyb3VuZDogbm9uZTtcclxuICAgIHdpZHRoOiA1M3B4O1xyXG4gICAgaGVpZ2h0OiAyNXB4O1xyXG4gICAgbWluLXdpZHRoOiAxNnB4O1xyXG4gICAgcGFkZGluZzogMnB4IDZweCAwO1xyXG4gICAgYm9yZGVyOiAxcHggc29saWQgdHJhbnNwYXJlbnQ7XHJcbiAgICBib3JkZXItcmFkaXVzOiAycHg7XHJcbiAgICBjb2xvcjogaHNsYSgwLDAlLDEwMCUsLjgpO1xyXG4gICAgZm9udC1zaXplOiAxMnB4O1xyXG4gICAgbGluZS1oZWlnaHQ6IDE0cHg7XHJcbiAgICAtd2Via2l0LXVzZXItc2VsZWN0OiBub25lO1xyXG4gICAgICAgLW1vei11c2VyLXNlbGVjdDogbm9uZTtcclxuICAgICAgICAtbXMtdXNlci1zZWxlY3Q6IG5vbmU7XHJcbiAgICAgICAgICAgIHVzZXItc2VsZWN0OiBub25lO1xyXG4gICAgLyogT3BlcmEgZG9lcyBub3Qgc3VwcG9ydCB1c2VyLXNlbGVjdCwgdXNlIDwuLi4gdW5zZWxlY3RhYmxlPVwib25cIj4gaW5zdGVhZCAqL1xyXG4gICAgY3Vyc29yOiBwb2ludGVyO1xyXG4gICAgdHJhbnNpdGlvbi1wcm9wZXJ0eTogYmFja2dyb3VuZC1jb2xvciwgYm9yZGVyLWNvbG9yLCBib3gtc2hhZG93O1xyXG4gICAgdHJhbnNpdGlvbi1kdXJhdGlvbjogMTUwbXM7XHJcbiAgICB0cmFuc2l0aW9uLXRpbWluZy1mdW5jdGlvbjogZWFzZTtcclxuICB9XHJcblxyXG4gIGJ1dHRvbjpob3ZlcntcclxuICAgIGJhY2tncm91bmQtY29sb3I6IGhzbGEoMCwwJSwwJSwuMTIpO1xyXG4gICAgYmFja2dyb3VuZC1pbWFnZTogbGluZWFyLWdyYWRpZW50KGhzbGEoMCwwJSwxMDAlLC4wNSksIGhzbGEoMCwwJSwxMDAlLDApKTtcclxuICAgIGJhY2tncm91bmQtY2xpcDogcGFkZGluZy1ib3g7XHJcbiAgICBib3JkZXI6IDFweCBzb2xpZCBoc2xhKDAsMCUsMCUsLjM1KTtcclxuICAgIGJvcmRlci1jb2xvcjogaHNsYSgwLDAlLDAlLC4zMikgaHNsYSgwLDAlLDAlLC4zOCkgaHNsYSgwLDAlLDAlLC40Mik7XHJcbiAgICBib3gtc2hhZG93OiAwIDFweCAwIGhzbGEoMCwwJSwxMDAlLC4wNSkgaW5zZXQsXHJcbiAgICAgICAgICAgICAgICAwIDAgMXB4IGhzbGEoMCwwJSwxMDAlLC4xNSkgaW5zZXQsXHJcbiAgICAgICAgICAgICAgICAwIDFweCAwIGhzbGEoMCwwJSwxMDAlLC4wNSk7XHJcbiAgfVxyXG5cclxuICAubG9hZGluZ1NwaW57XHJcbiAgICBkaXNwbGF5OiBub25lO1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgdG9wOiAwO1xyXG4gICAgbGVmdDogMDtcclxuICAgIHdpZHRoOiAxMDAlO1xyXG4gICAgaGVpZ2h0OiAxMDAlO1xyXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAuMjUpO1xyXG4gICAgei1pbmRleDogMTAwMDsgXHJcbiAgfVxyXG5cclxuICAubG9hZGVyIHtcclxuICAgIHotaW5kZXg6IDEwMDE7IFxyXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xyXG4gICAgbGVmdDogNTAlO1xyXG4gICAgdG9wOiA1MCU7XHJcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTtcclxuICAgIGJvcmRlcjogMTZweCBzb2xpZCAjZjNmM2YzO1xyXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xyXG4gICAgYm9yZGVyLXRvcDogMTZweCBzb2xpZCAjMzQ5OGRiO1xyXG4gICAgd2lkdGg6IDEyMHB4O1xyXG4gICAgaGVpZ2h0OiAxMjBweDtcclxuICAgIC13ZWJraXQtYW5pbWF0aW9uOiBzcGluIDJzIGxpbmVhciBpbmZpbml0ZTsgLyogU2FmYXJpICovXHJcbiAgICBhbmltYXRpb246IHNwaW4gMnMgbGluZWFyIGluZmluaXRlO1xyXG4gIH1cclxuICBcclxuICAvKiBTYWZhcmkgKi9cclxuICBALXdlYmtpdC1rZXlmcmFtZXMgc3BpbiB7XHJcbiAgICAwJSB7IC13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7IH1cclxuICAgIDEwMCUgeyAtd2Via2l0LXRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7IH1cclxuICB9XHJcbiAgXHJcbiAgQGtleWZyYW1lcyBzcGluIHtcclxuICAgIDAlIHsgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7IH1cclxuICAgIDEwMCUgeyB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpOyB9XHJcbiAgfVxyXG4gIDwvc3R5bGU+XHJcbiAgPGRpdiAjdmlld1dvcmRCYXIgY2xhc3M9XCJ0b29sYmFyXCI+XHJcbiAgICA8ZGl2IGlkPVwidG9vbGJhckNvbnRhaW5lclwiPlxyXG4gICAgICA8ZGl2IGlkPVwidG9vbGJhclZpZXdlclwiPlxyXG4gICAgICAgICAgPGJ1dHRvbiBpZD1cImRvd25sb2FkXCIgKGNsaWNrKT1cImRvd25sb2FkV29yZEZpbGUoKVwiIGNsYXNzPVwidG9vbGJhckJ1dHRvbiBkb3dubG9hZFwiIHRpdGxlPVwiRG93bmxvYWRcIiB0YWJpbmRleD1cIjM0XCIgZGF0YS1sMTBuLWlkPVwiZG93bmxvYWRcIj5cclxuICAgICAgICAgICAgPGltZyBzcmM9XCIvYXNzZXRzL3BkZmpzL3dlYi9pbWFnZXMvdG9vbGJhckJ1dHRvbi1kb3dubG9hZC5wbmdcIiBhbHQ9XCJEb3dubG9hZFwiLz5cclxuICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICA8YnV0dG9uIGlkPVwiY2xvc2VGaWxlXCIgKGNsaWNrKT1cImNsb3NlV29yZEZpbGUoKVwiIGNsYXNzPVwidG9vbGJhckJ1dHRvblwiIHRpdGxlPVwiQ2xvc2VcIiB0YWJpbmRleD1cIjM2XCIgZGF0YS1sMTBuLWlkPVwiY2xvc2VGaWxlXCI+XHJcbiAgICAgICAgICA8aW1nIHNyYz1cIi9hc3NldHMvcGRmanMvd2ViL2ltYWdlcy9jbG9zZS1maWxlLnBuZ1wiIGFsdD1cIkNsb3NlXCIvPlxyXG4gICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gIDwvZGl2PlxyXG4gIDxkaXYgI2xvYWRpbmdTcGluIGNsYXNzPVwibG9hZGluZ1NwaW5cIj5cclxuICAgIDxkaXYgY2xhc3M9XCJsb2FkZXJcIj48L2Rpdj5cclxuICA8L2Rpdj5cclxuICA8aWZyYW1lIGlkPVwiaWZyYW1lRG9jeFwiICNpZnJhbWVEb2N4IHRpdGxlPVwibmcyLXBkZmpzLXZpZXdlclwiIFtoaWRkZW5dPVwiZXh0ZXJuYWxXaW5kb3cgfHwgKCFleHRlcm5hbFdpbmRvdyAmJiAhcGRmU3JjKVwiIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIj48L2lmcmFtZT5cclxuXHJcbiAgPGlmcmFtZSBpZD1cImlmcmFtZVBERlwiICNpZnJhbWVQREYgdGl0bGU9XCJuZzItcGRmanMtdmlld2VyXCIgW2hpZGRlbl09XCJleHRlcm5hbFdpbmRvdyB8fCAoIWV4dGVybmFsV2luZG93ICYmICFwZGZTcmMpXCIgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiPjwvaWZyYW1lPlxyXG4gIGBcclxufSlcclxuZXhwb3J0IGNsYXNzIFBkZkpzVmlld2VyQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xyXG4gIEBWaWV3Q2hpbGQoJ3ZpZXdXb3JkQmFyJywgeyBzdGF0aWM6IHRydWUgfSkgdmlld1dvcmRCYXI6IEVsZW1lbnRSZWY7XHJcbiAgQFZpZXdDaGlsZCgnbG9hZGluZ1NwaW4nLCB7IHN0YXRpYzogdHJ1ZSB9KSBsb2FkaW5nU3BpbjogRWxlbWVudFJlZjtcclxuICBAVmlld0NoaWxkKCdpZnJhbWVEb2N4JywgeyBzdGF0aWM6IHRydWUgfSkgaWZyYW1lRG9jeDogRWxlbWVudFJlZjtcclxuICBAVmlld0NoaWxkKCdpZnJhbWVQREYnLCB7IHN0YXRpYzogdHJ1ZSB9KSBpZnJhbWVQREY6IEVsZW1lbnRSZWY7XHJcbiAgQElucHV0KCkgcHVibGljIHZpZXdlcklkOiBzdHJpbmc7XHJcbiAgQE91dHB1dCgpIG9uQmVmb3JlUHJpbnQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG4gIEBPdXRwdXQoKSBvbkFmdGVyUHJpbnQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG4gIEBPdXRwdXQoKSBvbkRvY3VtZW50TG9hZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcbiAgQE91dHB1dCgpIG9uUGFnZUNoYW5nZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcbiAgQElucHV0KCkgcHVibGljIHZpZXdlckZvbGRlcjogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBleHRlcm5hbFdpbmRvdzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBzaG93U3Bpbm5lcjogYm9vbGVhbiA9IHRydWU7XHJcbiAgQElucHV0KCkgcHVibGljIGRvd25sb2FkRmlsZU5hbWU6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgb3BlbkZpbGU6IGJvb2xlYW4gPSB0cnVlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBkb3dubG9hZDogYm9vbGVhbiA9IHRydWU7XHJcbiAgQElucHV0KCkgcHVibGljIHN0YXJ0RG93bmxvYWQ6IGJvb2xlYW47XHJcbiAgQElucHV0KCkgcHVibGljIHZpZXdCb29rbWFyazogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBwcmludDogYm9vbGVhbiA9IHRydWU7XHJcbiAgQElucHV0KCkgcHVibGljIHN0YXJ0UHJpbnQ6IGJvb2xlYW47XHJcbiAgQElucHV0KCkgcHVibGljIGZ1bGxTY3JlZW46IGJvb2xlYW4gPSB0cnVlO1xyXG4gIC8vQElucHV0KCkgcHVibGljIHNob3dGdWxsU2NyZWVuOiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBmaW5kOiBib29sZWFuID0gdHJ1ZTtcclxuICBASW5wdXQoKSBwdWJsaWMgem9vbTogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBuYW1lZGRlc3Q6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgcGFnZW1vZGU6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgbGFzdFBhZ2U6IGJvb2xlYW47XHJcbiAgQElucHV0KCkgcHVibGljIHJvdGF0ZWN3OiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyByb3RhdGVjY3c6IGJvb2xlYW47XHJcbiAgQElucHV0KCkgcHVibGljIGN1cnNvcjogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBzY3JvbGw6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgc3ByZWFkOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgcHVibGljIGxvY2FsZTogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyB1c2VPbmx5Q3NzWm9vbTogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBlcnJvck92ZXJyaWRlOiBib29sZWFuID0gZmFsc2U7XHJcbiAgQElucHV0KCkgcHVibGljIGVycm9yQXBwZW5kOiBib29sZWFuID0gdHJ1ZTtcclxuICBASW5wdXQoKSBwdWJsaWMgZXJyb3JNZXNzYWdlOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgcHVibGljIGRpYWdub3N0aWNMb2dzOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgQElucHV0KCkgcHVibGljIGV4dGVybmFsV2luZG93T3B0aW9uczogc3RyaW5nO1xyXG4gIHB1YmxpYyB2aWV3ZXJUYWI6IGFueTtcclxuICBwcml2YXRlIF9zcmM6IHN0cmluZyB8IEJsb2IgfCBVaW50OEFycmF5O1xyXG4gIHByaXZhdGUgX3BhZ2U6IG51bWJlcjtcclxuXHJcbiAgQElucHV0KCkgcHVibGljIGNsb3NlQnV0dG9uOiBib29sZWFuO1xyXG4gIEBPdXRwdXQoKSBjbG9zZUZpbGU6IEV2ZW50RW1pdHRlcjxib29sZWFuPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgdmlld2VyVXJsO1xyXG5cclxuICBASW5wdXQoKVxyXG4gIHB1YmxpYyBzZXQgcGFnZShfcGFnZTogbnVtYmVyKSB7XHJcbiAgICB0aGlzLl9wYWdlID0gX3BhZ2U7XHJcbiAgICBpZiAodGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbikge1xyXG4gICAgICB0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uLnBhZ2UgPSB0aGlzLl9wYWdlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMuZGlhZ25vc3RpY0xvZ3MpIGNvbnNvbGUud2FybihcIkRvY3VtZW50IGlzIG5vdCBsb2FkZWQgeWV0ISEhLiBUcnkgdG8gc2V0IHBhZ2UjIGFmdGVyIGZ1bGwgbG9hZC4gSWdub3JlIHRoaXMgd2FybmluZyBpZiB5b3UgYXJlIG5vdCBzZXR0aW5nIHBhZ2UjIHVzaW5nICcuJyBub3RhdGlvbi4gKEUuZy4gcGRmVmlld2VyLnBhZ2UgPSA1OylcIik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHBhZ2UoKSB7XHJcbiAgICBpZiAodGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbikge1xyXG4gICAgICByZXR1cm4gdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbi5wYWdlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMuZGlhZ25vc3RpY0xvZ3MpIGNvbnNvbGUud2FybihcIkRvY3VtZW50IGlzIG5vdCBsb2FkZWQgeWV0ISEhLiBUcnkgdG8gcmV0cmlldmUgcGFnZSMgYWZ0ZXIgZnVsbCBsb2FkLlwiKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIEBJbnB1dCgpXHJcbiAgcHVibGljIHNldCBwZGZTcmMoX3NyYzogc3RyaW5nIHwgQmxvYiB8IFVpbnQ4QXJyYXkpIHtcclxuICAgIHRoaXMuX3NyYyA9IF9zcmM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHBkZlNyYygpIHtcclxuICAgIHJldHVybiB0aGlzLl9zcmM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IFBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucygpIHtcclxuICAgIGxldCBwZGZWaWV3ZXJPcHRpb25zID0gbnVsbDtcclxuICAgIGlmICh0aGlzLmV4dGVybmFsV2luZG93KSB7XHJcbiAgICAgIGlmICh0aGlzLnZpZXdlclRhYikge1xyXG4gICAgICAgIHBkZlZpZXdlck9wdGlvbnMgPSB0aGlzLnZpZXdlclRhYi5QREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnM7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICh0aGlzLmlmcmFtZVBERi5uYXRpdmVFbGVtZW50LmNvbnRlbnRXaW5kb3cpIHtcclxuICAgICAgICBwZGZWaWV3ZXJPcHRpb25zID0gdGhpcy5pZnJhbWVQREYubmF0aXZlRWxlbWVudC5jb250ZW50V2luZG93LlBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBkZlZpZXdlck9wdGlvbnM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IFBERlZpZXdlckFwcGxpY2F0aW9uKCkge1xyXG4gICAgbGV0IHBkZlZpZXdlciA9IG51bGw7XHJcbiAgICBpZiAodGhpcy5leHRlcm5hbFdpbmRvdykge1xyXG4gICAgICBpZiAodGhpcy52aWV3ZXJUYWIpIHtcclxuICAgICAgICBwZGZWaWV3ZXIgPSB0aGlzLnZpZXdlclRhYi5QREZWaWV3ZXJBcHBsaWNhdGlvbjtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMuaWZyYW1lUERGLm5hdGl2ZUVsZW1lbnQuY29udGVudFdpbmRvdykge1xyXG4gICAgICAgIHBkZlZpZXdlciA9IHRoaXMuaWZyYW1lUERGLm5hdGl2ZUVsZW1lbnQuY29udGVudFdpbmRvdy5QREZWaWV3ZXJBcHBsaWNhdGlvbjtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBkZlZpZXdlcjtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZWNlaXZlTWVzc2FnZSh2aWV3ZXJFdmVudCkge1xyXG4gICAgaWYgKHZpZXdlckV2ZW50LmRhdGEgJiYgdmlld2VyRXZlbnQuZGF0YS52aWV3ZXJJZCAmJiB2aWV3ZXJFdmVudC5kYXRhLmV2ZW50KSB7XHJcbiAgICAgIGxldCB2aWV3ZXJJZCA9IHZpZXdlckV2ZW50LmRhdGEudmlld2VySWQ7XHJcbiAgICAgIGxldCBldmVudCA9IHZpZXdlckV2ZW50LmRhdGEuZXZlbnQ7XHJcbiAgICAgIGxldCBwYXJhbSA9IHZpZXdlckV2ZW50LmRhdGEucGFyYW07XHJcbiAgICAgIGlmICh0aGlzLnZpZXdlcklkID09IHZpZXdlcklkKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub25CZWZvcmVQcmludCAmJiBldmVudCA9PSBcImJlZm9yZVByaW50XCIpIHtcclxuICAgICAgICAgIHRoaXMub25CZWZvcmVQcmludC5lbWl0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMub25BZnRlclByaW50ICYmIGV2ZW50ID09IFwiYWZ0ZXJQcmludFwiKSB7XHJcbiAgICAgICAgICB0aGlzLm9uQWZ0ZXJQcmludC5lbWl0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMub25Eb2N1bWVudExvYWQgJiYgZXZlbnQgPT0gXCJwYWdlc0xvYWRlZFwiKSB7XHJcbiAgICAgICAgICB0aGlzLm9uRG9jdW1lbnRMb2FkLmVtaXQocGFyYW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLm9uUGFnZUNoYW5nZSAmJiBldmVudCA9PSBcInBhZ2VDaGFuZ2VcIikge1xyXG4gICAgICAgICAgdGhpcy5vblBhZ2VDaGFuZ2UuZW1pdChwYXJhbSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAodmlld2VyRXZlbnQuZGF0YSAmJiB2aWV3ZXJFdmVudC5kYXRhLmV2ZW50ID09PSBcImNsb3NlZmlsZVwiKSB7XHJcbiAgICAgIHRoaXMuY2xvc2VGaWxlLmVtaXQodHJ1ZSk7XHJcbiAgICB9IGVsc2UgaWYgKHZpZXdlckV2ZW50LmRhdGEgJiYgdmlld2VyRXZlbnQuZGF0YS5ldmVudCA9PT0gXCJsb2FkZXJFcnJvclwiKSB7XHJcbiAgICAgIHRoaXMubG9hZGluZ1NwaW4ubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgdGhpcy5pZnJhbWVQREYubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG5cclxuXHJcbiAgICAgIGxldCB1cmwgPSB0aGlzLmdldFVybEZpbGUoKTtcclxuICAgICAgbGV0IGV4dCA9IHRoaXMuZ2V0RmlsZUV4dGVuc2lvbih1cmwuc3BsaXQoJy5wZGYnKVswXSk7XHJcbiAgICAgIGlmICh0aGlzLmlzVmFsaWRGaWxlKGV4dCkpIHtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2codXJsLnNwbGl0KCcucGRmJylbMF0pO1xyXG5cclxuICAgICAgICB0aGlzLnZpZXdXb3JkQmFyLm5hdGl2ZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgdGhpcy52aWV3ZXJVcmwgPSBgaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZ3ZpZXc/dXJsPSR7dXJsLnNwbGl0KCcucGRmJylbMF19JmVtYmVkZGVkPXRydWVgO1xyXG4gICAgICAgIHRoaXMuaWZyYW1lRG9jeC5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG5cclxuICAgICAgICBsZXQgY291bnRUaW1lbG9hZCA9IDA7XHJcbiAgICAgICAgbGV0IGNoZWNrQ29udGVudCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgdGhpcy5pZnJhbWVEb2N4Lm5hdGl2ZUVsZW1lbnQuc3JjID0gdGhpcy52aWV3ZXJVcmw7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgIGxldCBjb250ZW50ID0gdGhpcy5pZnJhbWVEb2N4Lm5hdGl2ZUVsZW1lbnQ/LmNvbnRlbnRXaW5kb3c/LmRvY3VtZW50Py5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdPy5pbm5lckhUTUw7XHJcbiAgICAgICAgICAgICAgaWYgKGNvbnRlbnQgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICBjaGVja0NvbnRlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb3VudFRpbWVsb2FkKys7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAzMDAwICogY291bnRUaW1lbG9hZCk7XHJcbiAgICAgICAgICB9IHdoaWxlIChjb3VudFRpbWVsb2FkID09PSA0IHx8IGNoZWNrQ29udGVudCk7XHJcblxyXG5cclxuICAgICAgICAgIGlmICghY2hlY2tDb250ZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMudmlld2VyVXJsID0gYGh0dHBzOi8vdmlldy5vZmZpY2VhcHBzLmxpdmUuY29tL29wL2VtYmVkLmFzcHg/c3JjPSR7dXJsLnNwbGl0KCcucGRmJylbMF19YDtcclxuICAgICAgICAgICAgdGhpcy5pZnJhbWVEb2N4Lm5hdGl2ZUVsZW1lbnQuc3JjID0gdGhpcy52aWV3ZXJVcmw7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBhbGVydCgnSGnhu4duIHThuqFpIGNoxrBhIHhlbSDEkcaw4bujYyBmaWxlIScpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5sb2FkaW5nU3Bpbi5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgfSwgMzIwMCAqIGNvdW50VGltZWxvYWQpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCfEkOG7i25oIGThuqFuZyBraMO0bmcgaOG7o3AgbOG7hyEnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZG93bmxvYWRGaWxlKGJsb2JVcmwsIGZpbGVuYW1lKSB7XHJcbiAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuICAgIGlmICghYS5jbGljaykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Rvd25sb2FkTWFuYWdlcjogXCJhLmNsaWNrKClcIiBpcyBub3Qgc3VwcG9ydGVkLicpO1xyXG4gICAgfVxyXG4gICAgYS5ocmVmID0gYmxvYlVybDtcclxuICAgIGEudGFyZ2V0ID0gJ19wYXJlbnQnO1xyXG4gICAgaWYgKCdkb3dubG9hZCcgaW4gYSkge1xyXG4gICAgICBhLmRvd25sb2FkID0gZmlsZW5hbWU7XHJcbiAgICB9XHJcbiAgICAoZG9jdW1lbnQuYm9keSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpLmFwcGVuZENoaWxkKGEpO1xyXG4gICAgYS5jbGljaygpO1xyXG4gICAgYS5yZW1vdmUoKTtcclxuICB9XHJcblxyXG5cclxuICBwdWJsaWMgZG93bmxvYWRXb3JkRmlsZSgpIHtcclxuICAgIGNvbnNvbGUubG9nKCdkb3dubG9hZCBmaWxlIScpO1xyXG4gICAgbGV0IHVybCA9IHRoaXMuZ2V0VXJsRmlsZSgpO1xyXG4gICAgbGV0IGV4dCA9IHRoaXMuZ2V0RmlsZUV4dGVuc2lvbih1cmwuc3BsaXQoJy5wZGYnKVswXSk7XHJcbiAgICBjb25zb2xlLmxvZyh1cmwuc3BsaXQoJy5wZGYnKVswXSk7XHJcbiAgICBpZiAodGhpcy5pc1ZhbGlkRmlsZShleHQpKSB7XHJcbiAgICAgIHRoaXMuZG93bmxvYWRGaWxlKHVybC5zcGxpdCgnLnBkZicpWzBdLCAndGVzdCcpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuZG93bmxvYWRGaWxlKHVybCwgJ3Rlc3QnKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBjbG9zZVdvcmRGaWxlKCkge1xyXG4gICAgY29uc29sZS5sb2coJ2Nsb3NlIEZpbGUhJyk7XHJcbiAgICB0aGlzLmNsb3NlRmlsZS5lbWl0KHRydWUpO1xyXG4gIH1cclxuXHJcbiAgaXNWYWxpZEZpbGUoc3RyKSB7XHJcbiAgICBzd2l0Y2ggKHN0ci50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgIGNhc2UgJ2RvYyc6XHJcbiAgICAgIGNhc2UgJ2RvY3gnOlxyXG4gICAgICBjYXNlICd4bHMnOlxyXG4gICAgICBjYXNlICd4bHN4JzpcclxuICAgICAgY2FzZSAncHB0eCc6XHJcbiAgICAgIGNhc2UgJ3BwdCc6XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBnZXRVcmxGaWxlKCkge1xyXG4gICAgaWYgKHRoaXMuX3NyYyBpbnN0YW5jZW9mIEJsb2IpIHtcclxuICAgICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChVUkwuY3JlYXRlT2JqZWN0VVJMKHRoaXMuX3NyYykpO1xyXG4gICAgfSBlbHNlIGlmICh0aGlzLl9zcmMgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XHJcbiAgICAgIGxldCBibG9iID0gbmV3IEJsb2IoW3RoaXMuX3NyY10sIHsgdHlwZTogXCJhcHBsaWNhdGlvbi9wZGZcIiB9KTtcclxuICAgICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9zcmM7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnZXRGaWxlRXh0ZW5zaW9uKGZpbGVuYW1lKSB7XHJcbiAgICBjb25zdCBleHQgPSAvXi4rXFwuKFteLl0rKSQvLmV4ZWMoZmlsZW5hbWUpO1xyXG4gICAgcmV0dXJuIGV4dCA9PSBudWxsID8gJycgOiBleHRbMV07XHJcbiAgfVxyXG5cclxuICBuZ09uSW5pdCgpOiB2b2lkIHtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCB0aGlzLnJlY2VpdmVNZXNzYWdlLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgIGlmICghdGhpcy5leHRlcm5hbFdpbmRvdykgeyAvLyBMb2FkIHBkZiBmb3IgZW1iZWRkZWQgdmlld3NcclxuICAgICAgdGhpcy5sb2FkUGRmKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVmcmVzaCgpOiB2b2lkIHsgLy8gTmVlZHMgdG8gYmUgaW52b2tlZCBmb3IgZXh0ZXJuYWwgd2luZG93IG9yIHdoZW4gbmVlZHMgdG8gcmVsb2FkIHBkZlxyXG4gICAgdGhpcy5sb2FkUGRmKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlbGFzZVVybD86ICgpID0+IHZvaWQ7IC8vIEF2b2lkIG1lbW9yeSBsZWFzayB3aXRoIGBVUkwuY3JlYXRlT2JqZWN0VVJMYFxyXG5cclxuICBwcml2YXRlIGxvYWRQZGYoKSB7XHJcbiAgICBpZiAoIXRoaXMuX3NyYykge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0aGlzLnZpZXdlclVybCA9ICcnO1xyXG4gICAgdGhpcy52aWV3V29yZEJhci5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhgVGFiIGlzIC0gJHt0aGlzLnZpZXdlclRhYn1gKTtcclxuICAgIC8vIGlmICh0aGlzLnZpZXdlclRhYikge1xyXG4gICAgLy8gICBjb25zb2xlLmxvZyhgU3RhdHVzIG9mIHdpbmRvdyAtICR7dGhpcy52aWV3ZXJUYWIuY2xvc2VkfWApO1xyXG4gICAgLy8gfVxyXG5cclxuXHJcbiAgICB0aGlzLmlmcmFtZURvY3gubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG5cclxuICAgIGlmICh0aGlzLmV4dGVybmFsV2luZG93ICYmICh0eXBlb2YgdGhpcy52aWV3ZXJUYWIgPT09ICd1bmRlZmluZWQnIHx8IHRoaXMudmlld2VyVGFiLmNsb3NlZCkpIHtcclxuICAgICAgdGhpcy52aWV3ZXJUYWIgPSB3aW5kb3cub3BlbignJywgJ19ibGFuaycsIHRoaXMuZXh0ZXJuYWxXaW5kb3dPcHRpb25zIHx8ICcnKTtcclxuICAgICAgaWYgKHRoaXMudmlld2VyVGFiID09IG51bGwpIHtcclxuICAgICAgICBpZiAodGhpcy5kaWFnbm9zdGljTG9ncykgY29uc29sZS5lcnJvcihcIm5nMi1wZGZqcy12aWV3ZXI6IEZvciAnZXh0ZXJuYWxXaW5kb3cgPSB0cnVlJy4gaS5lIG9wZW5pbmcgaW4gbmV3IHRhYiB0byB3b3JrLCBwb3AtdXBzIHNob3VsZCBiZSBlbmFibGVkLlwiKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh0aGlzLnNob3dTcGlubmVyKSB7XHJcbiAgICAgICAgdGhpcy52aWV3ZXJUYWIuZG9jdW1lbnQud3JpdGUoYFxyXG4gICAgICAgICAgPHN0eWxlPlxyXG4gICAgICAgICAgLmxvYWRlciB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcclxuICAgICAgICAgICAgbGVmdDogNDAlO1xyXG4gICAgICAgICAgICB0b3A6IDQwJTtcclxuICAgICAgICAgICAgYm9yZGVyOiAxNnB4IHNvbGlkICNmM2YzZjM7XHJcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcclxuICAgICAgICAgICAgYm9yZGVyLXRvcDogMTZweCBzb2xpZCAjMzQ5OGRiO1xyXG4gICAgICAgICAgICB3aWR0aDogMTIwcHg7XHJcbiAgICAgICAgICAgIGhlaWdodDogMTIwcHg7XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbjogc3BpbiAycyBsaW5lYXIgaW5maW5pdGU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBAa2V5ZnJhbWVzIHNwaW4ge1xyXG4gICAgICAgICAgICAwJSB7XHJcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgMTAwJSB7XHJcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgPC9zdHlsZT5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJsb2FkZXJcIj48L2Rpdj5cclxuICAgICAgICBgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBmaWxlVXJsID0gdGhpcy5nZXRVcmxGaWxlKCk7XHJcbiAgICAvLyBsZXQgdGhpcy52aWV3ZXJVcmw7XHJcbiAgICBpZiAodGhpcy52aWV3ZXJGb2xkZXIpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgPSBgJHt0aGlzLnZpZXdlckZvbGRlcn0vd2ViL3ZpZXdlci5odG1sYDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsID0gYGFzc2V0cy9wZGZqcy93ZWIvdmlld2VyLmh0bWxgO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudmlld2VyVXJsICs9IGA/ZmlsZT0ke2ZpbGVVcmx9YDtcclxuXHJcbiAgICBpZiAodHlwZW9mIHRoaXMudmlld2VySWQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmdmlld2VySWQ9JHt0aGlzLnZpZXdlcklkfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMub25CZWZvcmVQcmludCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZiZWZvcmVQcmludD10cnVlYDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5vbkFmdGVyUHJpbnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmYWZ0ZXJQcmludD10cnVlYDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5vbkRvY3VtZW50TG9hZCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZwYWdlc0xvYWRlZD10cnVlYDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5vblBhZ2VDaGFuZ2UgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmcGFnZUNoYW5nZT10cnVlYDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5jbG9zZUJ1dHRvbiAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZjbG9zZUZpbGU9JHt0aGlzLmNsb3NlQnV0dG9ufWA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuZG93bmxvYWRGaWxlTmFtZSkge1xyXG4gICAgICBpZiAoIXRoaXMuZG93bmxvYWRGaWxlTmFtZS5lbmRzV2l0aChcIi5wZGZcIikpIHtcclxuICAgICAgICB0aGlzLmRvd25sb2FkRmlsZU5hbWUgKz0gXCIucGRmXCI7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZmaWxlTmFtZT0ke3RoaXMuZG93bmxvYWRGaWxlTmFtZX1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLm9wZW5GaWxlICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJm9wZW5GaWxlPSR7dGhpcy5vcGVuRmlsZX1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmRvd25sb2FkICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJmRvd25sb2FkPSR7dGhpcy5kb3dubG9hZH1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuc3RhcnREb3dubG9hZCkge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnN0YXJ0RG93bmxvYWQ9JHt0aGlzLnN0YXJ0RG93bmxvYWR9YDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy52aWV3Qm9va21hcmsgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmdmlld0Jvb2ttYXJrPSR7dGhpcy52aWV3Qm9va21hcmt9YDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5wcmludCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZwcmludD0ke3RoaXMucHJpbnR9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnN0YXJ0UHJpbnQpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZzdGFydFByaW50PSR7dGhpcy5zdGFydFByaW50fWA7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZnVsbFNjcmVlbiAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZmdWxsU2NyZWVuPSR7dGhpcy5mdWxsU2NyZWVufWA7XHJcbiAgICB9XHJcbiAgICAvLyBpZiAodGhpcy5zaG93RnVsbFNjcmVlbikge1xyXG4gICAgLy8gICB0aGlzLnZpZXdlclVybCArPSBgJnNob3dGdWxsU2NyZWVuPSR7dGhpcy5zaG93RnVsbFNjcmVlbn1gO1xyXG4gICAgLy8gfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmZpbmQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmZmluZD0ke3RoaXMuZmluZH1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMubGFzdFBhZ2UpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZsYXN0cGFnZT0ke3RoaXMubGFzdFBhZ2V9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnJvdGF0ZWN3KSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmcm90YXRlY3c9JHt0aGlzLnJvdGF0ZWN3fWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5yb3RhdGVjY3cpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZyb3RhdGVjY3c9JHt0aGlzLnJvdGF0ZWNjd31gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuY3Vyc29yKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmY3Vyc29yPSR7dGhpcy5jdXJzb3J9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnNjcm9sbCkge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnNjcm9sbD0ke3RoaXMuc2Nyb2xsfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5zcHJlYWQpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZzcHJlYWQ9JHt0aGlzLnNwcmVhZH1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMubG9jYWxlKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmbG9jYWxlPSR7dGhpcy5sb2NhbGV9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnVzZU9ubHlDc3Nab29tKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmdXNlT25seUNzc1pvb209JHt0aGlzLnVzZU9ubHlDc3Nab29tfWA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuX3BhZ2UgfHwgdGhpcy56b29tIHx8IHRoaXMubmFtZWRkZXN0IHx8IHRoaXMucGFnZW1vZGUpIHRoaXMudmlld2VyVXJsICs9IFwiI1wiXHJcbiAgICBpZiAodGhpcy5fcGFnZSkge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnBhZ2U9JHt0aGlzLl9wYWdlfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy56b29tKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmem9vbT0ke3RoaXMuem9vbX1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMubmFtZWRkZXN0KSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmbmFtZWRkZXN0PSR7dGhpcy5uYW1lZGRlc3R9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnBhZ2Vtb2RlKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmcGFnZW1vZGU9JHt0aGlzLnBhZ2Vtb2RlfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5lcnJvck92ZXJyaWRlIHx8IHRoaXMuZXJyb3JBcHBlbmQpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZlcnJvck1lc3NhZ2U9JHt0aGlzLmVycm9yTWVzc2FnZX1gO1xyXG5cclxuICAgICAgaWYgKHRoaXMuZXJyb3JPdmVycmlkZSkge1xyXG4gICAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmZXJyb3JPdmVycmlkZT0ke3RoaXMuZXJyb3JPdmVycmlkZX1gO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLmVycm9yQXBwZW5kKSB7XHJcbiAgICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZlcnJvckFwcGVuZD0ke3RoaXMuZXJyb3JBcHBlbmR9YDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmV4dGVybmFsV2luZG93KSB7XHJcbiAgICAgIHRoaXMudmlld2VyVGFiLmxvY2F0aW9uLmhyZWYgPSB0aGlzLnZpZXdlclVybDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuaWZyYW1lUERGLm5hdGl2ZUVsZW1lbnQuc3JjID0gdGhpcy52aWV3ZXJVcmw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc29sZS5sb2coYFxyXG4gICAgICBwZGZTcmMgPSAke3RoaXMucGRmU3JjfVxyXG4gICAgICBmaWxlVXJsID0gJHtmaWxlVXJsfVxyXG4gICAgICBleHRlcm5hbFdpbmRvdyA9ICR7dGhpcy5leHRlcm5hbFdpbmRvd31cclxuICAgICAgZG93bmxvYWRGaWxlTmFtZSA9ICR7dGhpcy5kb3dubG9hZEZpbGVOYW1lfVxyXG4gICAgYCk7XHJcblxyXG4gICAgLy8gdmlld2VyRm9sZGVyID0gJHt0aGlzLnZpZXdlckZvbGRlcn1cclxuICAgIC8vIG9wZW5GaWxlID0gJHt0aGlzLm9wZW5GaWxlfVxyXG4gICAgLy8gZG93bmxvYWQgPSAke3RoaXMuZG93bmxvYWR9XHJcbiAgICAvLyBzdGFydERvd25sb2FkID0gJHt0aGlzLnN0YXJ0RG93bmxvYWR9XHJcbiAgICAvLyB2aWV3Qm9va21hcmsgPSAke3RoaXMudmlld0Jvb2ttYXJrfVxyXG4gICAgLy8gcHJpbnQgPSAke3RoaXMucHJpbnR9XHJcbiAgICAvLyBzdGFydFByaW50ID0gJHt0aGlzLnN0YXJ0UHJpbnR9XHJcbiAgICAvLyBmdWxsU2NyZWVuID0gJHt0aGlzLmZ1bGxTY3JlZW59XHJcbiAgICAvLyBmaW5kID0gJHt0aGlzLmZpbmR9XHJcbiAgICAvLyBsYXN0UGFnZSA9ICR7dGhpcy5sYXN0UGFnZX1cclxuICAgIC8vIHJvdGF0ZWN3ID0gJHt0aGlzLnJvdGF0ZWN3fVxyXG4gICAgLy8gcm90YXRlY2N3ID0gJHt0aGlzLnJvdGF0ZWNjd31cclxuICAgIC8vIGN1cnNvciA9ICR7dGhpcy5jdXJzb3J9XHJcbiAgICAvLyBzY3JvbGxNb2RlID0gJHt0aGlzLnNjcm9sbH1cclxuICAgIC8vIHNwcmVhZCA9ICR7dGhpcy5zcHJlYWR9XHJcbiAgICAvLyBwYWdlID0gJHt0aGlzLnBhZ2V9XHJcbiAgICAvLyB6b29tID0gJHt0aGlzLnpvb219XHJcbiAgICAvLyBuYW1lZGRlc3QgPSAke3RoaXMubmFtZWRkZXN0fVxyXG4gICAgLy8gcGFnZW1vZGUgPSAke3RoaXMucGFnZW1vZGV9XHJcbiAgICAvLyBwYWdlbW9kZSA9ICR7dGhpcy5lcnJvck92ZXJyaWRlfVxyXG4gICAgLy8gcGFnZW1vZGUgPSAke3RoaXMuZXJyb3JBcHBlbmR9XHJcbiAgICAvLyBwYWdlbW9kZSA9ICR7dGhpcy5lcnJvck1lc3NhZ2V9XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcclxuICAgIHRoaXMucmVsYXNlVXJsPy4oKTtcclxuICB9XHJcbn1cclxuIl19