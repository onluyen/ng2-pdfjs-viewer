import { Component, Input, Output, ViewChild, EventEmitter } from '@angular/core';
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
                            var _a, _b, _c, _d;
                            let content = (_d = (_c = (_b = (_a = this.iframeDocx.nativeElement) === null || _a === void 0 ? void 0 : _a.contentWindow) === null || _b === void 0 ? void 0 : _b.document) === null || _c === void 0 ? void 0 : _c.getElementsByTagName('body')[0]) === null || _d === void 0 ? void 0 : _d.innerHTML;
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
}
PdfJsViewerComponent.decorators = [
    { type: Component, args: [{
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
            },] }
];
PdfJsViewerComponent.propDecorators = {
    viewWordBar: [{ type: ViewChild, args: ['viewWordBar', { static: true },] }],
    loadingSpin: [{ type: ViewChild, args: ['loadingSpin', { static: true },] }],
    iframeDocx: [{ type: ViewChild, args: ['iframeDocx', { static: true },] }],
    iframePDF: [{ type: ViewChild, args: ['iframePDF', { static: true },] }],
    viewerId: [{ type: Input }],
    onBeforePrint: [{ type: Output }],
    onAfterPrint: [{ type: Output }],
    onDocumentLoad: [{ type: Output }],
    onPageChange: [{ type: Output }],
    viewerFolder: [{ type: Input }],
    externalWindow: [{ type: Input }],
    showSpinner: [{ type: Input }],
    downloadFileName: [{ type: Input }],
    openFile: [{ type: Input }],
    download: [{ type: Input }],
    startDownload: [{ type: Input }],
    viewBookmark: [{ type: Input }],
    print: [{ type: Input }],
    startPrint: [{ type: Input }],
    fullScreen: [{ type: Input }],
    find: [{ type: Input }],
    zoom: [{ type: Input }],
    nameddest: [{ type: Input }],
    pagemode: [{ type: Input }],
    lastPage: [{ type: Input }],
    rotatecw: [{ type: Input }],
    rotateccw: [{ type: Input }],
    cursor: [{ type: Input }],
    scroll: [{ type: Input }],
    spread: [{ type: Input }],
    locale: [{ type: Input }],
    useOnlyCssZoom: [{ type: Input }],
    errorOverride: [{ type: Input }],
    errorAppend: [{ type: Input }],
    errorMessage: [{ type: Input }],
    diagnosticLogs: [{ type: Input }],
    externalWindowOptions: [{ type: Input }],
    closeButton: [{ type: Input }],
    closeFile: [{ type: Output }],
    page: [{ type: Input }],
    pdfSrc: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQWMsTUFBTSxlQUFlLENBQUM7QUE2SDlGLE1BQU0sT0FBTyxvQkFBb0I7SUEzSGpDO1FBaUlZLGtCQUFhLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFDdEQsaUJBQVksR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUNyRCxtQkFBYyxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ3ZELGlCQUFZLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFFL0MsbUJBQWMsR0FBWSxLQUFLLENBQUM7UUFDaEMsZ0JBQVcsR0FBWSxJQUFJLENBQUM7UUFFNUIsYUFBUSxHQUFZLElBQUksQ0FBQztRQUN6QixhQUFRLEdBQVksSUFBSSxDQUFDO1FBRXpCLGlCQUFZLEdBQVksS0FBSyxDQUFDO1FBQzlCLFVBQUssR0FBWSxJQUFJLENBQUM7UUFFdEIsZUFBVSxHQUFZLElBQUksQ0FBQztRQUMzQywwQ0FBMEM7UUFDMUIsU0FBSSxHQUFZLElBQUksQ0FBQztRQVdyQixtQkFBYyxHQUFZLEtBQUssQ0FBQztRQUNoQyxrQkFBYSxHQUFZLEtBQUssQ0FBQztRQUMvQixnQkFBVyxHQUFZLElBQUksQ0FBQztRQUU1QixtQkFBYyxHQUFZLElBQUksQ0FBQztRQVFyQyxjQUFTLEdBQTBCLElBQUksWUFBWSxFQUFFLENBQUM7SUFpWmxFLENBQUM7SUE3WUMsSUFDVyxJQUFJLENBQUMsS0FBYTtRQUMzQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtZQUM3QixJQUFJLENB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Q3pDLFNBQVMsU0FBQyxhQUFhLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO3lCQUN6QyxTQUFTLFNBQUMsWUFBWSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTt3QkFDeEMsU0FBUyxTQUFDLFdBQVcsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7dUJBQ3ZDLEtBQUs7NEJBQ0wsTUFBTTsyQkFDTixNQUFNOzZCQUNOLE1BQU07MkJBQ04sTUFBTTsyQkFDTixLQUFLOzZCQUNMLEtBQUs7MEJBQ0wsS0FBSzsrQkFDTCxLQUFLO3VCQUNMLEtBQUs7dUJBQ0wsS0FBSzs0QkFDTCxLQUFLOzJCQUNMLEtBQUs7b0JBQ0wsS0FBSzt5QkFDTCxLQUFLO3lCQUNMLEtBQUs7bUJBRUwsS0FBSzttQkFDTCxLQUFLO3dCQUNMLEtBQUs7dUJBQ0wsS0FBSzt1QkFDTCxLQUFLO3VCQUNMLEtBQUs7d0JBQ0wsS0FBSztxQkFDTCxLQUFLO3FCQUNMLEtBQUs7cUJBQ0wsS0FBSztxQkFDTCxLQUFLOzZCQUNMLEtBQUs7NEJBQ0wsS0FBSzswQkFDTCxLQUFLOzJCQUNMLEtBQUs7NkJBQ0wsS0FBSztvQ0FFTCxLQUFLOzBCQUtMLEtBQUs7d0JBQ0wsTUFBTTttQkFJTixLQUFLO3FCQWtCTCxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgT3V0cHV0LCBWaWV3Q2hpbGQsIEV2ZW50RW1pdHRlciwgRWxlbWVudFJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICduZzItcGRmanMtdmlld2VyJyxcclxuICB0ZW1wbGF0ZTogYFxyXG4gIDxzdHlsZT5cclxuICAudG9vbGJhciB7XHJcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICBsZWZ0OiAwO1xyXG4gICAgcmlnaHQ6IDA7XHJcbiAgICB6LWluZGV4OiA5OTk5O1xyXG4gICAgY3Vyc29yOiBkZWZhdWx0O1xyXG4gICAgZGlzcGxheTogbm9uZTtcclxuICB9XHJcblxyXG4gICN0b29sYmFyQ29udGFpbmVyIHtcclxuICAgIHdpZHRoOiAxMDAlO1xyXG4gIH1cclxuXHJcbiAgI3Rvb2xiYXJDb250YWluZXIge1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgaGVpZ2h0OiAzMnB4O1xyXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzQ3NDc0NztcclxuICAgIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudChoc2xhKDAsMCUsMzIlLC45OSksIGhzbGEoMCwwJSwyNyUsLjk1KSk7XHJcbiAgfVxyXG5cclxuICAjdG9vbGJhclZpZXdlciB7XHJcbiAgICBoZWlnaHQ6IDMycHg7XHJcbiAgICBkaXNwbGF5OiBmbGV4O1xyXG4gICAgZmxleC1kaXJlY3Rpb246IHJvdztcclxuICAgIGp1c3RpZnktY29udGVudDogZmxleC1lbmQ7XHJcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIH1cclxuXHJcbiAgYnV0dG9ue1xyXG4gICAgYmFja2dyb3VuZDogbm9uZTtcclxuICAgIHdpZHRoOiA1M3B4O1xyXG4gICAgaGVpZ2h0OiAyNXB4O1xyXG4gICAgbWluLXdpZHRoOiAxNnB4O1xyXG4gICAgcGFkZGluZzogMnB4IDZweCAwO1xyXG4gICAgYm9yZGVyOiAxcHggc29saWQgdHJhbnNwYXJlbnQ7XHJcbiAgICBib3JkZXItcmFkaXVzOiAycHg7XHJcbiAgICBjb2xvcjogaHNsYSgwLDAlLDEwMCUsLjgpO1xyXG4gICAgZm9udC1zaXplOiAxMnB4O1xyXG4gICAgbGluZS1oZWlnaHQ6IDE0cHg7XHJcbiAgICAtd2Via2l0LXVzZXItc2VsZWN0OiBub25lO1xyXG4gICAgICAgLW1vei11c2VyLXNlbGVjdDogbm9uZTtcclxuICAgICAgICAtbXMtdXNlci1zZWxlY3Q6IG5vbmU7XHJcbiAgICAgICAgICAgIHVzZXItc2VsZWN0OiBub25lO1xyXG4gICAgLyogT3BlcmEgZG9lcyBub3Qgc3VwcG9ydCB1c2VyLXNlbGVjdCwgdXNlIDwuLi4gdW5zZWxlY3RhYmxlPVwib25cIj4gaW5zdGVhZCAqL1xyXG4gICAgY3Vyc29yOiBwb2ludGVyO1xyXG4gICAgdHJhbnNpdGlvbi1wcm9wZXJ0eTogYmFja2dyb3VuZC1jb2xvciwgYm9yZGVyLWNvbG9yLCBib3gtc2hhZG93O1xyXG4gICAgdHJhbnNpdGlvbi1kdXJhdGlvbjogMTUwbXM7XHJcbiAgICB0cmFuc2l0aW9uLXRpbWluZy1mdW5jdGlvbjogZWFzZTtcclxuICB9XHJcblxyXG4gIGJ1dHRvbjpob3ZlcntcclxuICAgIGJhY2tncm91bmQtY29sb3I6IGhzbGEoMCwwJSwwJSwuMTIpO1xyXG4gICAgYmFja2dyb3VuZC1pbWFnZTogbGluZWFyLWdyYWRpZW50KGhzbGEoMCwwJSwxMDAlLC4wNSksIGhzbGEoMCwwJSwxMDAlLDApKTtcclxuICAgIGJhY2tncm91bmQtY2xpcDogcGFkZGluZy1ib3g7XHJcbiAgICBib3JkZXI6IDFweCBzb2xpZCBoc2xhKDAsMCUsMCUsLjM1KTtcclxuICAgIGJvcmRlci1jb2xvcjogaHNsYSgwLDAlLDAlLC4zMikgaHNsYSgwLDAlLDAlLC4zOCkgaHNsYSgwLDAlLDAlLC40Mik7XHJcbiAgICBib3gtc2hhZG93OiAwIDFweCAwIGhzbGEoMCwwJSwxMDAlLC4wNSkgaW5zZXQsXHJcbiAgICAgICAgICAgICAgICAwIDAgMXB4IGhzbGEoMCwwJSwxMDAlLC4xNSkgaW5zZXQsXHJcbiAgICAgICAgICAgICAgICAwIDFweCAwIGhzbGEoMCwwJSwxMDAlLC4wNSk7XHJcbiAgfVxyXG5cclxuICAubG9hZGluZ1NwaW57XHJcbiAgICBkaXNwbGF5OiBub25lO1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgdG9wOiAwO1xyXG4gICAgbGVmdDogMDtcclxuICAgIHdpZHRoOiAxMDAlO1xyXG4gICAgaGVpZ2h0OiAxMDAlO1xyXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAuMjUpO1xyXG4gICAgei1pbmRleDogMTAwMDsgXHJcbiAgfVxyXG5cclxuICAubG9hZGVyIHtcclxuICAgIHotaW5kZXg6IDEwMDE7IFxyXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xyXG4gICAgbGVmdDogNTAlO1xyXG4gICAgdG9wOiA1MCU7XHJcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTtcclxuICAgIGJvcmRlcjogMTZweCBzb2xpZCAjZjNmM2YzO1xyXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xyXG4gICAgYm9yZGVyLXRvcDogMTZweCBzb2xpZCAjMzQ5OGRiO1xyXG4gICAgd2lkdGg6IDEyMHB4O1xyXG4gICAgaGVpZ2h0OiAxMjBweDtcclxuICAgIC13ZWJraXQtYW5pbWF0aW9uOiBzcGluIDJzIGxpbmVhciBpbmZpbml0ZTsgLyogU2FmYXJpICovXHJcbiAgICBhbmltYXRpb246IHNwaW4gMnMgbGluZWFyIGluZmluaXRlO1xyXG4gIH1cclxuICBcclxuICAvKiBTYWZhcmkgKi9cclxuICBALXdlYmtpdC1rZXlmcmFtZXMgc3BpbiB7XHJcbiAgICAwJSB7IC13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7IH1cclxuICAgIDEwMCUgeyAtd2Via2l0LXRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7IH1cclxuICB9XHJcbiAgXHJcbiAgQGtleWZyYW1lcyBzcGluIHtcclxuICAgIDAlIHsgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7IH1cclxuICAgIDEwMCUgeyB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpOyB9XHJcbiAgfVxyXG4gIDwvc3R5bGU+XHJcbiAgPGRpdiAjdmlld1dvcmRCYXIgY2xhc3M9XCJ0b29sYmFyXCI+XHJcbiAgICA8ZGl2IGlkPVwidG9vbGJhckNvbnRhaW5lclwiPlxyXG4gICAgICA8ZGl2IGlkPVwidG9vbGJhclZpZXdlclwiPlxyXG4gICAgICAgICAgPGJ1dHRvbiBpZD1cImRvd25sb2FkXCIgKGNsaWNrKT1cImRvd25sb2FkV29yZEZpbGUoKVwiIGNsYXNzPVwidG9vbGJhckJ1dHRvbiBkb3dubG9hZFwiIHRpdGxlPVwiRG93bmxvYWRcIiB0YWJpbmRleD1cIjM0XCIgZGF0YS1sMTBuLWlkPVwiZG93bmxvYWRcIj5cclxuICAgICAgICAgICAgPGltZyBzcmM9XCIvYXNzZXRzL3BkZmpzL3dlYi9pbWFnZXMvdG9vbGJhckJ1dHRvbi1kb3dubG9hZC5wbmdcIiBhbHQ9XCJEb3dubG9hZFwiLz5cclxuICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICA8YnV0dG9uIGlkPVwiY2xvc2VGaWxlXCIgKGNsaWNrKT1cImNsb3NlV29yZEZpbGUoKVwiIGNsYXNzPVwidG9vbGJhckJ1dHRvblwiIHRpdGxlPVwiQ2xvc2VcIiB0YWJpbmRleD1cIjM2XCIgZGF0YS1sMTBuLWlkPVwiY2xvc2VGaWxlXCI+XHJcbiAgICAgICAgICA8aW1nIHNyYz1cIi9hc3NldHMvcGRmanMvd2ViL2ltYWdlcy9jbG9zZS1maWxlLnBuZ1wiIGFsdD1cIkNsb3NlXCIvPlxyXG4gICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gIDwvZGl2PlxyXG4gIDxkaXYgI2xvYWRpbmdTcGluIGNsYXNzPVwibG9hZGluZ1NwaW5cIj5cclxuICAgIDxkaXYgY2xhc3M9XCJsb2FkZXJcIj48L2Rpdj5cclxuICA8L2Rpdj5cclxuICA8aWZyYW1lIGlkPVwiaWZyYW1lRG9jeFwiICNpZnJhbWVEb2N4IHRpdGxlPVwibmcyLXBkZmpzLXZpZXdlclwiIFtoaWRkZW5dPVwiZXh0ZXJuYWxXaW5kb3cgfHwgKCFleHRlcm5hbFdpbmRvdyAmJiAhcGRmU3JjKVwiIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIj48L2lmcmFtZT5cclxuXHJcbiAgPGlmcmFtZSBpZD1cImlmcmFtZVBERlwiICNpZnJhbWVQREYgdGl0bGU9XCJuZzItcGRmanMtdmlld2VyXCIgW2hpZGRlbl09XCJleHRlcm5hbFdpbmRvdyB8fCAoIWV4dGVybmFsV2luZG93ICYmICFwZGZTcmMpXCIgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiPjwvaWZyYW1lPlxyXG4gIGBcclxufSlcclxuZXhwb3J0IGNsYXNzIFBkZkpzVmlld2VyQ29tcG9uZW50IHtcclxuICBAVmlld0NoaWxkKCd2aWV3V29yZEJhcicsIHsgc3RhdGljOiB0cnVlIH0pIHZpZXdXb3JkQmFyOiBFbGVtZW50UmVmO1xyXG4gIEBWaWV3Q2hpbGQoJ2xvYWRpbmdTcGluJywgeyBzdGF0aWM6IHRydWUgfSkgbG9hZGluZ1NwaW46IEVsZW1lbnRSZWY7XHJcbiAgQFZpZXdDaGlsZCgnaWZyYW1lRG9jeCcsIHsgc3RhdGljOiB0cnVlIH0pIGlmcmFtZURvY3g6IEVsZW1lbnRSZWY7XHJcbiAgQFZpZXdDaGlsZCgnaWZyYW1lUERGJywgeyBzdGF0aWM6IHRydWUgfSkgaWZyYW1lUERGOiBFbGVtZW50UmVmO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyB2aWV3ZXJJZDogc3RyaW5nO1xyXG4gIEBPdXRwdXQoKSBvbkJlZm9yZVByaW50OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuICBAT3V0cHV0KCkgb25BZnRlclByaW50OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuICBAT3V0cHV0KCkgb25Eb2N1bWVudExvYWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG4gIEBPdXRwdXQoKSBvblBhZ2VDaGFuZ2U6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyB2aWV3ZXJGb2xkZXI6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgZXh0ZXJuYWxXaW5kb3c6IGJvb2xlYW4gPSBmYWxzZTtcclxuICBASW5wdXQoKSBwdWJsaWMgc2hvd1NwaW5uZXI6IGJvb2xlYW4gPSB0cnVlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBkb3dubG9hZEZpbGVOYW1lOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgcHVibGljIG9wZW5GaWxlOiBib29sZWFuID0gdHJ1ZTtcclxuICBASW5wdXQoKSBwdWJsaWMgZG93bmxvYWQ6IGJvb2xlYW4gPSB0cnVlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBzdGFydERvd25sb2FkOiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyB2aWV3Qm9va21hcms6IGJvb2xlYW4gPSBmYWxzZTtcclxuICBASW5wdXQoKSBwdWJsaWMgcHJpbnQ6IGJvb2xlYW4gPSB0cnVlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBzdGFydFByaW50OiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBmdWxsU2NyZWVuOiBib29sZWFuID0gdHJ1ZTtcclxuICAvL0BJbnB1dCgpIHB1YmxpYyBzaG93RnVsbFNjcmVlbjogYm9vbGVhbjtcclxuICBASW5wdXQoKSBwdWJsaWMgZmluZDogYm9vbGVhbiA9IHRydWU7XHJcbiAgQElucHV0KCkgcHVibGljIHpvb206IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgbmFtZWRkZXN0OiBzdHJpbmc7XHJcbiAgQElucHV0KCkgcHVibGljIHBhZ2Vtb2RlOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgcHVibGljIGxhc3RQYWdlOiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyByb3RhdGVjdzogYm9vbGVhbjtcclxuICBASW5wdXQoKSBwdWJsaWMgcm90YXRlY2N3OiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBjdXJzb3I6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgc2Nyb2xsOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgcHVibGljIHNwcmVhZDogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBsb2NhbGU6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgdXNlT25seUNzc1pvb206IGJvb2xlYW4gPSBmYWxzZTtcclxuICBASW5wdXQoKSBwdWJsaWMgZXJyb3JPdmVycmlkZTogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBlcnJvckFwcGVuZDogYm9vbGVhbiA9IHRydWU7XHJcbiAgQElucHV0KCkgcHVibGljIGVycm9yTWVzc2FnZTogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBkaWFnbm9zdGljTG9nczogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gIEBJbnB1dCgpIHB1YmxpYyBleHRlcm5hbFdpbmRvd09wdGlvbnM6IHN0cmluZztcclxuICBwdWJsaWMgdmlld2VyVGFiOiBhbnk7XHJcbiAgcHJpdmF0ZSBfc3JjOiBzdHJpbmcgfCBCbG9iIHwgVWludDhBcnJheTtcclxuICBwcml2YXRlIF9wYWdlOiBudW1iZXI7XHJcblxyXG4gIEBJbnB1dCgpIHB1YmxpYyBjbG9zZUJ1dHRvbjogYm9vbGVhbjtcclxuICBAT3V0cHV0KCkgY2xvc2VGaWxlOiBFdmVudEVtaXR0ZXI8Ym9vbGVhbj4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gIHZpZXdlclVybDtcclxuXHJcbiAgQElucHV0KClcclxuICBwdWJsaWMgc2V0IHBhZ2UoX3BhZ2U6IG51bWJlcikge1xyXG4gICAgdGhpcy5fcGFnZSA9IF9wYWdlO1xyXG4gICAgaWYgKHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24pIHtcclxuICAgICAgdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbi5wYWdlID0gdGhpcy5fcGFnZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICh0aGlzLmRpYWdub3N0aWNMb2dzKSBjb25zb2xlLndhcm4oXCJEb2N1bWVudCBpcyBub3QgbG9hZGVkIHlldCEhIS4gVHJ5IHRvIHNldCBwYWdlIyBhZnRlciBmdWxsIGxvYWQuIElnbm9yZSB0aGlzIHdhcm5pbmcgaWYgeW91IGFyZSBub3Qgc2V0dGluZyBwYWdlIyB1c2luZyAnLicgbm90YXRpb24uIChFLmcuIHBkZlZpZXdlci5wYWdlID0gNTspXCIpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBwYWdlKCkge1xyXG4gICAgaWYgKHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24pIHtcclxuICAgICAgcmV0dXJuIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24ucGFnZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICh0aGlzLmRpYWdub3N0aWNMb2dzKSBjb25zb2xlLndhcm4oXCJEb2N1bWVudCBpcyBub3QgbG9hZGVkIHlldCEhIS4gVHJ5IHRvIHJldHJpZXZlIHBhZ2UjIGFmdGVyIGZ1bGwgbG9hZC5cIik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBASW5wdXQoKVxyXG4gIHB1YmxpYyBzZXQgcGRmU3JjKF9zcmM6IHN0cmluZyB8IEJsb2IgfCBVaW50OEFycmF5KSB7XHJcbiAgICB0aGlzLl9zcmMgPSBfc3JjO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBwZGZTcmMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3JjO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBQREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnMoKSB7XHJcbiAgICBsZXQgcGRmVmlld2VyT3B0aW9ucyA9IG51bGw7XHJcbiAgICBpZiAodGhpcy5leHRlcm5hbFdpbmRvdykge1xyXG4gICAgICBpZiAodGhpcy52aWV3ZXJUYWIpIHtcclxuICAgICAgICBwZGZWaWV3ZXJPcHRpb25zID0gdGhpcy52aWV3ZXJUYWIuUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAodGhpcy5pZnJhbWVQREYubmF0aXZlRWxlbWVudC5jb250ZW50V2luZG93KSB7XHJcbiAgICAgICAgcGRmVmlld2VyT3B0aW9ucyA9IHRoaXMuaWZyYW1lUERGLm5hdGl2ZUVsZW1lbnQuY29udGVudFdpbmRvdy5QREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnM7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBwZGZWaWV3ZXJPcHRpb25zO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBQREZWaWV3ZXJBcHBsaWNhdGlvbigpIHtcclxuICAgIGxldCBwZGZWaWV3ZXIgPSBudWxsO1xyXG4gICAgaWYgKHRoaXMuZXh0ZXJuYWxXaW5kb3cpIHtcclxuICAgICAgaWYgKHRoaXMudmlld2VyVGFiKSB7XHJcbiAgICAgICAgcGRmVmlld2VyID0gdGhpcy52aWV3ZXJUYWIuUERGVmlld2VyQXBwbGljYXRpb247XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICh0aGlzLmlmcmFtZVBERi5uYXRpdmVFbGVtZW50LmNvbnRlbnRXaW5kb3cpIHtcclxuICAgICAgICBwZGZWaWV3ZXIgPSB0aGlzLmlmcmFtZVBERi5uYXRpdmVFbGVtZW50LmNvbnRlbnRXaW5kb3cuUERGVmlld2VyQXBwbGljYXRpb247XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBwZGZWaWV3ZXI7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVjZWl2ZU1lc3NhZ2Uodmlld2VyRXZlbnQpIHtcclxuICAgIGlmICh2aWV3ZXJFdmVudC5kYXRhICYmIHZpZXdlckV2ZW50LmRhdGEudmlld2VySWQgJiYgdmlld2VyRXZlbnQuZGF0YS5ldmVudCkge1xyXG4gICAgICBsZXQgdmlld2VySWQgPSB2aWV3ZXJFdmVudC5kYXRhLnZpZXdlcklkO1xyXG4gICAgICBsZXQgZXZlbnQgPSB2aWV3ZXJFdmVudC5kYXRhLmV2ZW50O1xyXG4gICAgICBsZXQgcGFyYW0gPSB2aWV3ZXJFdmVudC5kYXRhLnBhcmFtO1xyXG4gICAgICBpZiAodGhpcy52aWV3ZXJJZCA9PSB2aWV3ZXJJZCkge1xyXG4gICAgICAgIGlmICh0aGlzLm9uQmVmb3JlUHJpbnQgJiYgZXZlbnQgPT0gXCJiZWZvcmVQcmludFwiKSB7XHJcbiAgICAgICAgICB0aGlzLm9uQmVmb3JlUHJpbnQuZW1pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLm9uQWZ0ZXJQcmludCAmJiBldmVudCA9PSBcImFmdGVyUHJpbnRcIikge1xyXG4gICAgICAgICAgdGhpcy5vbkFmdGVyUHJpbnQuZW1pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLm9uRG9jdW1lbnRMb2FkICYmIGV2ZW50ID09IFwicGFnZXNMb2FkZWRcIikge1xyXG4gICAgICAgICAgdGhpcy5vbkRvY3VtZW50TG9hZC5lbWl0KHBhcmFtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5vblBhZ2VDaGFuZ2UgJiYgZXZlbnQgPT0gXCJwYWdlQ2hhbmdlXCIpIHtcclxuICAgICAgICAgIHRoaXMub25QYWdlQ2hhbmdlLmVtaXQocGFyYW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHZpZXdlckV2ZW50LmRhdGEgJiYgdmlld2VyRXZlbnQuZGF0YS5ldmVudCA9PT0gXCJjbG9zZWZpbGVcIikge1xyXG4gICAgICB0aGlzLmNsb3NlRmlsZS5lbWl0KHRydWUpO1xyXG4gICAgfSBlbHNlIGlmICh2aWV3ZXJFdmVudC5kYXRhICYmIHZpZXdlckV2ZW50LmRhdGEuZXZlbnQgPT09IFwibG9hZGVyRXJyb3JcIikge1xyXG4gICAgICB0aGlzLmxvYWRpbmdTcGluLm5hdGl2ZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgIHRoaXMuaWZyYW1lUERGLm5hdGl2ZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuXHJcblxyXG4gICAgICBsZXQgdXJsID0gdGhpcy5nZXRVcmxGaWxlKCk7XHJcbiAgICAgIGxldCBleHQgPSB0aGlzLmdldEZpbGVFeHRlbnNpb24odXJsLnNwbGl0KCcucGRmJylbMF0pO1xyXG4gICAgICBpZiAodGhpcy5pc1ZhbGlkRmlsZShleHQpKSB7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKHVybC5zcGxpdCgnLnBkZicpWzBdKTtcclxuXHJcbiAgICAgICAgdGhpcy52aWV3V29yZEJhci5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICAgIHRoaXMudmlld2VyVXJsID0gYGh0dHBzOi8vZG9jcy5nb29nbGUuY29tL2d2aWV3P3VybD0ke3VybC5zcGxpdCgnLnBkZicpWzBdfSZlbWJlZGRlZD10cnVlYDtcclxuICAgICAgICB0aGlzLmlmcmFtZURvY3gubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuXHJcbiAgICAgICAgbGV0IGNvdW50VGltZWxvYWQgPSAwO1xyXG4gICAgICAgIGxldCBjaGVja0NvbnRlbnQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIHRoaXMuaWZyYW1lRG9jeC5uYXRpdmVFbGVtZW50LnNyYyA9IHRoaXMudmlld2VyVXJsO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICBsZXQgY29udGVudCA9IHRoaXMuaWZyYW1lRG9jeC5uYXRpdmVFbGVtZW50Py5jb250ZW50V2luZG93Py5kb2N1bWVudD8uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXT8uaW5uZXJIVE1MO1xyXG4gICAgICAgICAgICAgIGlmIChjb250ZW50ICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgY2hlY2tDb250ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY291bnRUaW1lbG9hZCsrO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgMzAwMCAqIGNvdW50VGltZWxvYWQpO1xyXG4gICAgICAgICAgfSB3aGlsZSAoY291bnRUaW1lbG9hZCA9PT0gNCB8fCBjaGVja0NvbnRlbnQpO1xyXG5cclxuXHJcbiAgICAgICAgICBpZiAoIWNoZWNrQ29udGVudCkge1xyXG4gICAgICAgICAgICB0aGlzLnZpZXdlclVybCA9IGBodHRwczovL3ZpZXcub2ZmaWNlYXBwcy5saXZlLmNvbS9vcC9lbWJlZC5hc3B4P3NyYz0ke3VybC5zcGxpdCgnLnBkZicpWzBdfWA7XHJcbiAgICAgICAgICAgIHRoaXMuaWZyYW1lRG9jeC5uYXRpdmVFbGVtZW50LnNyYyA9IHRoaXMudmlld2VyVXJsO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYWxlcnQoJ0hp4buHbiB04bqhaSBjaMawYSB4ZW0gxJHGsOG7o2MgZmlsZSEnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIHRoaXMubG9hZGluZ1NwaW4ubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIH0sIDMyMDAgKiBjb3VudFRpbWVsb2FkKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnxJDhu4tuaCBk4bqhbmcga2jDtG5nIGjhu6NwIGzhu4chJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGRvd25sb2FkRmlsZShibG9iVXJsLCBmaWxlbmFtZSkge1xyXG4gICAgdmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgICBpZiAoIWEuY2xpY2spIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEb3dubG9hZE1hbmFnZXI6IFwiYS5jbGljaygpXCIgaXMgbm90IHN1cHBvcnRlZC4nKTtcclxuICAgIH1cclxuICAgIGEuaHJlZiA9IGJsb2JVcmw7XHJcbiAgICBhLnRhcmdldCA9ICdfcGFyZW50JztcclxuICAgIGlmICgnZG93bmxvYWQnIGluIGEpIHtcclxuICAgICAgYS5kb3dubG9hZCA9IGZpbGVuYW1lO1xyXG4gICAgfVxyXG4gICAgKGRvY3VtZW50LmJvZHkgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KS5hcHBlbmRDaGlsZChhKTtcclxuICAgIGEuY2xpY2soKTtcclxuICAgIGEucmVtb3ZlKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgcHVibGljIGRvd25sb2FkV29yZEZpbGUoKSB7XHJcbiAgICBjb25zb2xlLmxvZygnZG93bmxvYWQgZmlsZSEnKTtcclxuICAgIGxldCB1cmwgPSB0aGlzLmdldFVybEZpbGUoKTtcclxuICAgIGxldCBleHQgPSB0aGlzLmdldEZpbGVFeHRlbnNpb24odXJsLnNwbGl0KCcucGRmJylbMF0pO1xyXG4gICAgY29uc29sZS5sb2codXJsLnNwbGl0KCcucGRmJylbMF0pO1xyXG4gICAgaWYgKHRoaXMuaXNWYWxpZEZpbGUoZXh0KSkge1xyXG4gICAgICB0aGlzLmRvd25sb2FkRmlsZSh1cmwuc3BsaXQoJy5wZGYnKVswXSwgJ3Rlc3QnKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLmRvd25sb2FkRmlsZSh1cmwsICd0ZXN0Jyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY2xvc2VXb3JkRmlsZSgpIHtcclxuICAgIGNvbnNvbGUubG9nKCdjbG9zZSBGaWxlIScpO1xyXG4gICAgdGhpcy5jbG9zZUZpbGUuZW1pdCh0cnVlKTtcclxuICB9XHJcblxyXG4gIGlzVmFsaWRGaWxlKHN0cikge1xyXG4gICAgc3dpdGNoIChzdHIudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICBjYXNlICdkb2MnOlxyXG4gICAgICBjYXNlICdkb2N4JzpcclxuICAgICAgY2FzZSAneGxzJzpcclxuICAgICAgY2FzZSAneGxzeCc6XHJcbiAgICAgIGNhc2UgJ3BwdHgnOlxyXG4gICAgICBjYXNlICdwcHQnOlxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgZ2V0VXJsRmlsZSgpIHtcclxuICAgIGlmICh0aGlzLl9zcmMgaW5zdGFuY2VvZiBCbG9iKSB7XHJcbiAgICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoVVJMLmNyZWF0ZU9iamVjdFVSTCh0aGlzLl9zcmMpKTtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5fc3JjIGluc3RhbmNlb2YgVWludDhBcnJheSkge1xyXG4gICAgICBsZXQgYmxvYiA9IG5ldyBCbG9iKFt0aGlzLl9zcmNdLCB7IHR5cGU6IFwiYXBwbGljYXRpb24vcGRmXCIgfSk7XHJcbiAgICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5fc3JjO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZ2V0RmlsZUV4dGVuc2lvbihmaWxlbmFtZSkge1xyXG4gICAgY29uc3QgZXh0ID0gL14uK1xcLihbXi5dKykkLy5leGVjKGZpbGVuYW1lKTtcclxuICAgIHJldHVybiBleHQgPT0gbnVsbCA/ICcnIDogZXh0WzFdO1xyXG4gIH1cclxuXHJcbiAgbmdPbkluaXQoKTogdm9pZCB7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5yZWNlaXZlTWVzc2FnZS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgICBpZiAoIXRoaXMuZXh0ZXJuYWxXaW5kb3cpIHsgLy8gTG9hZCBwZGYgZm9yIGVtYmVkZGVkIHZpZXdzXHJcbiAgICAgIHRoaXMubG9hZFBkZigpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlZnJlc2goKTogdm9pZCB7IC8vIE5lZWRzIHRvIGJlIGludm9rZWQgZm9yIGV4dGVybmFsIHdpbmRvdyBvciB3aGVuIG5lZWRzIHRvIHJlbG9hZCBwZGZcclxuICAgIHRoaXMubG9hZFBkZigpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBsb2FkUGRmKCkge1xyXG4gICAgaWYgKCF0aGlzLl9zcmMpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy52aWV3ZXJVcmwgPSAnJztcclxuICAgIHRoaXMudmlld1dvcmRCYXIubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgLy8gY29uc29sZS5sb2coYFRhYiBpcyAtICR7dGhpcy52aWV3ZXJUYWJ9YCk7XHJcbiAgICAvLyBpZiAodGhpcy52aWV3ZXJUYWIpIHtcclxuICAgIC8vICAgY29uc29sZS5sb2coYFN0YXR1cyBvZiB3aW5kb3cgLSAke3RoaXMudmlld2VyVGFiLmNsb3NlZH1gKTtcclxuICAgIC8vIH1cclxuXHJcblxyXG4gICAgdGhpcy5pZnJhbWVEb2N4Lm5hdGl2ZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuXHJcbiAgICBpZiAodGhpcy5leHRlcm5hbFdpbmRvdyAmJiAodHlwZW9mIHRoaXMudmlld2VyVGFiID09PSAndW5kZWZpbmVkJyB8fCB0aGlzLnZpZXdlclRhYi5jbG9zZWQpKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVGFiID0gd2luZG93Lm9wZW4oJycsICdfYmxhbmsnLCB0aGlzLmV4dGVybmFsV2luZG93T3B0aW9ucyB8fCAnJyk7XHJcbiAgICAgIGlmICh0aGlzLnZpZXdlclRhYiA9PSBudWxsKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGlhZ25vc3RpY0xvZ3MpIGNvbnNvbGUuZXJyb3IoXCJuZzItcGRmanMtdmlld2VyOiBGb3IgJ2V4dGVybmFsV2luZG93ID0gdHJ1ZScuIGkuZSBvcGVuaW5nIGluIG5ldyB0YWIgdG8gd29yaywgcG9wLXVwcyBzaG91bGQgYmUgZW5hYmxlZC5cIik7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAodGhpcy5zaG93U3Bpbm5lcikge1xyXG4gICAgICAgIHRoaXMudmlld2VyVGFiLmRvY3VtZW50LndyaXRlKGBcclxuICAgICAgICAgIDxzdHlsZT5cclxuICAgICAgICAgIC5sb2FkZXIge1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogZml4ZWQ7XHJcbiAgICAgICAgICAgIGxlZnQ6IDQwJTtcclxuICAgICAgICAgICAgdG9wOiA0MCU7XHJcbiAgICAgICAgICAgIGJvcmRlcjogMTZweCBzb2xpZCAjZjNmM2YzO1xyXG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XHJcbiAgICAgICAgICAgIGJvcmRlci10b3A6IDE2cHggc29saWQgIzM0OThkYjtcclxuICAgICAgICAgICAgd2lkdGg6IDEyMHB4O1xyXG4gICAgICAgICAgICBoZWlnaHQ6IDEyMHB4O1xyXG4gICAgICAgICAgICBhbmltYXRpb246IHNwaW4gMnMgbGluZWFyIGluZmluaXRlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgQGtleWZyYW1lcyBzcGluIHtcclxuICAgICAgICAgICAgMCUge1xyXG4gICAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIDEwMCUge1xyXG4gICAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIDwvc3R5bGU+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibG9hZGVyXCI+PC9kaXY+XHJcbiAgICAgICAgYCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBsZXQgZmlsZVVybCA9IHRoaXMuZ2V0VXJsRmlsZSgpO1xyXG4gICAgLy8gbGV0IHRoaXMudmlld2VyVXJsO1xyXG4gICAgaWYgKHRoaXMudmlld2VyRm9sZGVyKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsID0gYCR7dGhpcy52aWV3ZXJGb2xkZXJ9L3dlYi92aWV3ZXIuaHRtbGA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCA9IGBhc3NldHMvcGRmanMvd2ViL3ZpZXdlci5odG1sYDtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnZpZXdlclVybCArPSBgP2ZpbGU9JHtmaWxlVXJsfWA7XHJcblxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLnZpZXdlcklkICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnZpZXdlcklkPSR7dGhpcy52aWV3ZXJJZH1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uQmVmb3JlUHJpbnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmYmVmb3JlUHJpbnQ9dHJ1ZWA7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMub25BZnRlclByaW50ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJmFmdGVyUHJpbnQ9dHJ1ZWA7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMub25Eb2N1bWVudExvYWQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmcGFnZXNMb2FkZWQ9dHJ1ZWA7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMub25QYWdlQ2hhbmdlICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnBhZ2VDaGFuZ2U9dHJ1ZWA7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMuY2xvc2VCdXR0b24gIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmY2xvc2VGaWxlPSR7dGhpcy5jbG9zZUJ1dHRvbn1gO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmRvd25sb2FkRmlsZU5hbWUpIHtcclxuICAgICAgaWYgKCF0aGlzLmRvd25sb2FkRmlsZU5hbWUuZW5kc1dpdGgoXCIucGRmXCIpKSB7XHJcbiAgICAgICAgdGhpcy5kb3dubG9hZEZpbGVOYW1lICs9IFwiLnBkZlwiO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmZmlsZU5hbWU9JHt0aGlzLmRvd25sb2FkRmlsZU5hbWV9YDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5vcGVuRmlsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZvcGVuRmlsZT0ke3RoaXMub3BlbkZpbGV9YDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5kb3dubG9hZCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZkb3dubG9hZD0ke3RoaXMuZG93bmxvYWR9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnN0YXJ0RG93bmxvYWQpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZzdGFydERvd25sb2FkPSR7dGhpcy5zdGFydERvd25sb2FkfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMudmlld0Jvb2ttYXJrICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnZpZXdCb29rbWFyaz0ke3RoaXMudmlld0Jvb2ttYXJrfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMucHJpbnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmcHJpbnQ9JHt0aGlzLnByaW50fWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5zdGFydFByaW50KSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmc3RhcnRQcmludD0ke3RoaXMuc3RhcnRQcmludH1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmZ1bGxTY3JlZW4gIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmZnVsbFNjcmVlbj0ke3RoaXMuZnVsbFNjcmVlbn1gO1xyXG4gICAgfVxyXG4gICAgLy8gaWYgKHRoaXMuc2hvd0Z1bGxTY3JlZW4pIHtcclxuICAgIC8vICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZzaG93RnVsbFNjcmVlbj0ke3RoaXMuc2hvd0Z1bGxTY3JlZW59YDtcclxuICAgIC8vIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5maW5kICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJmZpbmQ9JHt0aGlzLmZpbmR9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmxhc3RQYWdlKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmbGFzdHBhZ2U9JHt0aGlzLmxhc3RQYWdlfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5yb3RhdGVjdykge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnJvdGF0ZWN3PSR7dGhpcy5yb3RhdGVjd31gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMucm90YXRlY2N3KSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmcm90YXRlY2N3PSR7dGhpcy5yb3RhdGVjY3d9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmN1cnNvcikge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJmN1cnNvcj0ke3RoaXMuY3Vyc29yfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5zY3JvbGwpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZzY3JvbGw9JHt0aGlzLnNjcm9sbH1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuc3ByZWFkKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmc3ByZWFkPSR7dGhpcy5zcHJlYWR9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmxvY2FsZSkge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJmxvY2FsZT0ke3RoaXMubG9jYWxlfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy51c2VPbmx5Q3NzWm9vbSkge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnVzZU9ubHlDc3Nab29tPSR7dGhpcy51c2VPbmx5Q3NzWm9vbX1gO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLl9wYWdlIHx8IHRoaXMuem9vbSB8fCB0aGlzLm5hbWVkZGVzdCB8fCB0aGlzLnBhZ2Vtb2RlKSB0aGlzLnZpZXdlclVybCArPSBcIiNcIlxyXG4gICAgaWYgKHRoaXMuX3BhZ2UpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZwYWdlPSR7dGhpcy5fcGFnZX1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuem9vbSkge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnpvb209JHt0aGlzLnpvb219YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLm5hbWVkZGVzdCkge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJm5hbWVkZGVzdD0ke3RoaXMubmFtZWRkZXN0fWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5wYWdlbW9kZSkge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnBhZ2Vtb2RlPSR7dGhpcy5wYWdlbW9kZX1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuZXJyb3JPdmVycmlkZSB8fCB0aGlzLmVycm9yQXBwZW5kKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmZXJyb3JNZXNzYWdlPSR7dGhpcy5lcnJvck1lc3NhZ2V9YDtcclxuXHJcbiAgICAgIGlmICh0aGlzLmVycm9yT3ZlcnJpZGUpIHtcclxuICAgICAgICB0aGlzLnZpZXdlclVybCArPSBgJmVycm9yT3ZlcnJpZGU9JHt0aGlzLmVycm9yT3ZlcnJpZGV9YDtcclxuICAgICAgfVxyXG4gICAgICBpZiAodGhpcy5lcnJvckFwcGVuZCkge1xyXG4gICAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmZXJyb3JBcHBlbmQ9JHt0aGlzLmVycm9yQXBwZW5kfWA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5leHRlcm5hbFdpbmRvdykge1xyXG4gICAgICB0aGlzLnZpZXdlclRhYi5sb2NhdGlvbi5ocmVmID0gdGhpcy52aWV3ZXJVcmw7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmlmcmFtZVBERi5uYXRpdmVFbGVtZW50LnNyYyA9IHRoaXMudmlld2VyVXJsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnNvbGUubG9nKGBcclxuICAgICAgcGRmU3JjID0gJHt0aGlzLnBkZlNyY31cclxuICAgICAgZmlsZVVybCA9ICR7ZmlsZVVybH1cclxuICAgICAgZXh0ZXJuYWxXaW5kb3cgPSAke3RoaXMuZXh0ZXJuYWxXaW5kb3d9XHJcbiAgICAgIGRvd25sb2FkRmlsZU5hbWUgPSAke3RoaXMuZG93bmxvYWRGaWxlTmFtZX1cclxuICAgIGApO1xyXG5cclxuICAgIC8vIHZpZXdlckZvbGRlciA9ICR7dGhpcy52aWV3ZXJGb2xkZXJ9XHJcbiAgICAvLyBvcGVuRmlsZSA9ICR7dGhpcy5vcGVuRmlsZX1cclxuICAgIC8vIGRvd25sb2FkID0gJHt0aGlzLmRvd25sb2FkfVxyXG4gICAgLy8gc3RhcnREb3dubG9hZCA9ICR7dGhpcy5zdGFydERvd25sb2FkfVxyXG4gICAgLy8gdmlld0Jvb2ttYXJrID0gJHt0aGlzLnZpZXdCb29rbWFya31cclxuICAgIC8vIHByaW50ID0gJHt0aGlzLnByaW50fVxyXG4gICAgLy8gc3RhcnRQcmludCA9ICR7dGhpcy5zdGFydFByaW50fVxyXG4gICAgLy8gZnVsbFNjcmVlbiA9ICR7dGhpcy5mdWxsU2NyZWVufVxyXG4gICAgLy8gZmluZCA9ICR7dGhpcy5maW5kfVxyXG4gICAgLy8gbGFzdFBhZ2UgPSAke3RoaXMubGFzdFBhZ2V9XHJcbiAgICAvLyByb3RhdGVjdyA9ICR7dGhpcy5yb3RhdGVjd31cclxuICAgIC8vIHJvdGF0ZWNjdyA9ICR7dGhpcy5yb3RhdGVjY3d9XHJcbiAgICAvLyBjdXJzb3IgPSAke3RoaXMuY3Vyc29yfVxyXG4gICAgLy8gc2Nyb2xsTW9kZSA9ICR7dGhpcy5zY3JvbGx9XHJcbiAgICAvLyBzcHJlYWQgPSAke3RoaXMuc3ByZWFkfVxyXG4gICAgLy8gcGFnZSA9ICR7dGhpcy5wYWdlfVxyXG4gICAgLy8gem9vbSA9ICR7dGhpcy56b29tfVxyXG4gICAgLy8gbmFtZWRkZXN0ID0gJHt0aGlzLm5hbWVkZGVzdH1cclxuICAgIC8vIHBhZ2Vtb2RlID0gJHt0aGlzLnBhZ2Vtb2RlfVxyXG4gICAgLy8gcGFnZW1vZGUgPSAke3RoaXMuZXJyb3JPdmVycmlkZX1cclxuICAgIC8vIHBhZ2Vtb2RlID0gJHt0aGlzLmVycm9yQXBwZW5kfVxyXG4gICAgLy8gcGFnZW1vZGUgPSAke3RoaXMuZXJyb3JNZXNzYWdlfVxyXG4gIH1cclxufVxyXG4iXX0=