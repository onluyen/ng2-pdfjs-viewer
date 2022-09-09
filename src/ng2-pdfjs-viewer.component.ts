import { Component, Input, Output, ViewChild, EventEmitter, ElementRef } from '@angular/core';

@Component({
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
})
export class PdfJsViewerComponent {
  @ViewChild('viewWordBar', { static: true }) viewWordBar: ElementRef;
  @ViewChild('iframe', { static: true }) iframe: ElementRef;
  @Input() public viewerId: string;
  @Output() onBeforePrint: EventEmitter<any> = new EventEmitter();
  @Output() onAfterPrint: EventEmitter<any> = new EventEmitter();
  @Output() onDocumentLoad: EventEmitter<any> = new EventEmitter();
  @Output() onPageChange: EventEmitter<any> = new EventEmitter();
  @Input() public viewerFolder: string;
  @Input() public externalWindow: boolean = false;
  @Input() public showSpinner: boolean = true;
  @Input() public downloadFileName: string;
  @Input() public openFile: boolean = true;
  @Input() public download: boolean = true;
  @Input() public startDownload: boolean;
  @Input() public viewBookmark: boolean = false;
  @Input() public print: boolean = true;
  @Input() public startPrint: boolean;
  @Input() public fullScreen: boolean = true;
  //@Input() public showFullScreen: boolean;
  @Input() public find: boolean = true;
  @Input() public zoom: string;
  @Input() public nameddest: string;
  @Input() public pagemode: string;
  @Input() public lastPage: boolean;
  @Input() public rotatecw: boolean;
  @Input() public rotateccw: boolean;
  @Input() public cursor: string;
  @Input() public scroll: string;
  @Input() public spread: string;
  @Input() public locale: string;
  @Input() public useOnlyCssZoom: boolean = false;
  @Input() public errorOverride: boolean = false;
  @Input() public errorAppend: boolean = true;
  @Input() public errorMessage: string;
  @Input() public diagnosticLogs: boolean = true;

  @Input() public externalWindowOptions: string;
  public viewerTab: any;
  private _src: string | Blob | Uint8Array;
  private _page: number;

  @Input() public closeButton: boolean;
  @Output() closeFile: EventEmitter<boolean> = new EventEmitter();

  viewerUrl;

  @Input()
  public set page(_page: number) {
    this._page = _page;
    if (this.PDFViewerApplication) {
      this.PDFViewerApplication.page = this._page;
    } else {
      if (this.diagnosticLogs) console.warn("Document is not loaded yet!!!. Try to set page# after full load. Ignore this warning if you are not setting page# using '.' notation. (E.g. pdfViewer.page = 5;)");
    }
  }

  public get page() {
    if (this.PDFViewerApplication) {
      return this.PDFViewerApplication.page;
    } else {
      if (this.diagnosticLogs) console.warn("Document is not loaded yet!!!. Try to retrieve page# after full load.");
    }
  }

  @Input()
  public set pdfSrc(_src: string | Blob | Uint8Array) {
    this._src = _src;
  }

  public get pdfSrc() {
    return this._src;
  }

  public get PDFViewerApplicationOptions() {
    let pdfViewerOptions = null;
    if (this.externalWindow) {
      if (this.viewerTab) {
        pdfViewerOptions = this.viewerTab.PDFViewerApplicationOptions;
      }
    } else {
      if (this.iframe.nativeElement.contentWindow) {
        pdfViewerOptions = this.iframe.nativeElement.contentWindow.PDFViewerApplicationOptions;
      }
    }
    return pdfViewerOptions;
  }

  public get PDFViewerApplication() {
    let pdfViewer = null;
    if (this.externalWindow) {
      if (this.viewerTab) {
        pdfViewer = this.viewerTab.PDFViewerApplication;
      }
    } else {
      if (this.iframe.nativeElement.contentWindow) {
        pdfViewer = this.iframe.nativeElement.contentWindow.PDFViewerApplication;
      }
    }
    return pdfViewer;
  }

  public receiveMessage(viewerEvent) {
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
    } else if (viewerEvent.data && viewerEvent.data.event === "loaderError") {
      console.log('load docx!');
      let url = this.getUrlFile();
      let ext = this.getFileExtension(url.split('.pdf')[0]);
      if (this.isValidFile(ext)) {
        this.viewWordBar.nativeElement.style.display = 'block';
        this.viewerUrl = `https://docs.google.com/gview?url=${url.split('.pdf')[0]}&embedded=true`;
        if (this.externalWindow) {
          this.viewerTab.location.href = this.viewerUrl;
        } else {
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


  public downloadWordFile() {
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

  public closeWordFile() {
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
    } else if (this._src instanceof Uint8Array) {
      let blob = new Blob([this._src], { type: "application/pdf" });
      return encodeURIComponent(URL.createObjectURL(blob));
    } else {
      return this._src;
    }
  }

  getFileExtension(filename) {
    const ext = /^.+\.([^.]+)$/.exec(filename);
    return ext == null ? '' : ext[1];
  }

  ngOnInit(): void {
    window.addEventListener("message", this.receiveMessage.bind(this), false);
    if (!this.externalWindow) { // Load pdf for embedded views
      this.loadPdf();
    }
  }

  public refresh(): void { // Needs to be invoked for external window or when needs to reload pdf
    this.loadPdf();
  }

  private loadPdf() {
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
        if (this.diagnosticLogs) console.error("ng2-pdfjs-viewer: For 'externalWindow = true'. i.e opening in new tab to work, pop-ups should be enabled.");
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
    } else {
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

    if (this._page || this.zoom || this.nameddest || this.pagemode) this.viewerUrl += "#"
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
    } else {
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