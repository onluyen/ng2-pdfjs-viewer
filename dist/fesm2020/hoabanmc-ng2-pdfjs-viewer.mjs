import * as i0 from '@angular/core';
import { EventEmitter, Component, ViewChild, Input, Output, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

class PdfJsViewerComponent {
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
            if (this.iframe.nativeElement.contentWindow) {
                pdfViewerOptions = this.iframe.nativeElement.contentWindow.PDFViewerApplicationOptions;
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
            if (this.iframe.nativeElement.contentWindow) {
                pdfViewer = this.iframe.nativeElement.contentWindow.PDFViewerApplication;
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
            console.log('load docx!');
            let url = this.getUrlFile();
            let ext = this.getFileExtension(url.split('.pdf')[0]);
            if (this.isValidFile(ext)) {
                this.viewWordBar.nativeElement.style.display = 'block';
                this.viewerUrl = `https://docs.google.com/gview?url=${url.split('.pdf')[0]}&embedded=true`;
                if (this.externalWindow) {
                    this.viewerTab.location.href = this.viewerUrl;
                }
                else {
                    this.iframe.nativeElement.src = this.viewerUrl;
                }
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
            this.iframe.nativeElement.src = this.viewerUrl;
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
PdfJsViewerComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "13.3.11", type: PdfJsViewerComponent, selector: "ng2-pdfjs-viewer", inputs: { viewerId: "viewerId", viewerFolder: "viewerFolder", externalWindow: "externalWindow", showSpinner: "showSpinner", downloadFileName: "downloadFileName", openFile: "openFile", download: "download", startDownload: "startDownload", viewBookmark: "viewBookmark", print: "print", startPrint: "startPrint", fullScreen: "fullScreen", find: "find", zoom: "zoom", nameddest: "nameddest", pagemode: "pagemode", lastPage: "lastPage", rotatecw: "rotatecw", rotateccw: "rotateccw", cursor: "cursor", scroll: "scroll", spread: "spread", locale: "locale", useOnlyCssZoom: "useOnlyCssZoom", errorOverride: "errorOverride", errorAppend: "errorAppend", errorMessage: "errorMessage", diagnosticLogs: "diagnosticLogs", externalWindowOptions: "externalWindowOptions", closeButton: "closeButton", page: "page", pdfSrc: "pdfSrc" }, outputs: { onBeforePrint: "onBeforePrint", onAfterPrint: "onAfterPrint", onDocumentLoad: "onDocumentLoad", onPageChange: "onPageChange", closeFile: "closeFile" }, viewQueries: [{ propertyName: "viewWordBar", first: true, predicate: ["viewWordBar"], descendants: true, static: true }, { propertyName: "iframe", first: true, predicate: ["iframe"], descendants: true, static: true }], ngImport: i0, template: `
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
  <iframe title="ng2-pdfjs-viewer" [hidden]="externalWindow || (!externalWindow && !pdfSrc)" #iframe width="100%" height="100%"></iframe>
  `, isInline: true, styles: ["\n  .toolbar {\n    position: relative;\n    left: 0;\n    right: 0;\n    z-index: 9999;\n    cursor: default;\n    display: none;\n  }\n\n  #toolbarContainer {\n    width: 100%;\n  }\n\n  #toolbarContainer {\n    position: relative;\n    height: 32px;\n    background-color: #474747;\n    background-image: linear-gradient(hsla(0,0%,32%,.99), hsla(0,0%,27%,.95));\n  }\n\n  #toolbarViewer {\n    height: 32px;\n    display: flex;\n    flex-direction: row;\n    justify-content: flex-end;\n    align-items: center;\n  }\n\n  button{\n    background: none;\n    width: 53px;\n    height: 25px;\n    min-width: 16px;\n    padding: 2px 6px 0;\n    border: 1px solid transparent;\n    border-radius: 2px;\n    color: hsla(0,0%,100%,.8);\n    font-size: 12px;\n    line-height: 14px;\n    -webkit-user-select: none;\n       -moz-user-select: none;\n        -ms-user-select: none;\n            user-select: none;\n    /* Opera does not support user-select, use <... unselectable=\"on\"> instead */\n    cursor: pointer;\n    transition-property: background-color, border-color, box-shadow;\n    transition-duration: 150ms;\n    transition-timing-function: ease;\n  }\n\n  button:hover{\n    background-color: hsla(0,0%,0%,.12);\n    background-image: linear-gradient(hsla(0,0%,100%,.05), hsla(0,0%,100%,0));\n    background-clip: padding-box;\n    border: 1px solid hsla(0,0%,0%,.35);\n    border-color: hsla(0,0%,0%,.32) hsla(0,0%,0%,.38) hsla(0,0%,0%,.42);\n    box-shadow: 0 1px 0 hsla(0,0%,100%,.05) inset,\n                0 0 1px hsla(0,0%,100%,.15) inset,\n                0 1px 0 hsla(0,0%,100%,.05);\n  }\n  "] });
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
  <iframe title="ng2-pdfjs-viewer" [hidden]="externalWindow || (!externalWindow && !pdfSrc)" #iframe width="100%" height="100%"></iframe>
  `
                }]
        }], propDecorators: { viewWordBar: [{
                type: ViewChild,
                args: ['viewWordBar', { static: true }]
            }], iframe: [{
                type: ViewChild,
                args: ['iframe', { static: true }]
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

class PdfJsViewerModule {
    static forRoot() {
        return {
            ngModule: PdfJsViewerModule
        };
    }
}
PdfJsViewerModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: PdfJsViewerModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
PdfJsViewerModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: PdfJsViewerModule, declarations: [PdfJsViewerComponent], imports: [CommonModule], exports: [PdfJsViewerComponent] });
PdfJsViewerModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: PdfJsViewerModule, imports: [[
            CommonModule
        ]] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: PdfJsViewerModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule
                    ],
                    declarations: [
                        PdfJsViewerComponent
                    ],
                    exports: [
                        PdfJsViewerComponent
                    ]
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { PdfJsViewerComponent, PdfJsViewerModule };
//# sourceMappingURL=hoabanmc-ng2-pdfjs-viewer.mjs.map
