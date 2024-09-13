import { Component, Input, Output, ViewChild, EventEmitter, } from "@angular/core";
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
        if (typeof _src === "string") {
            this._src = encodeURIComponent(_src);
        }
        else {
            this._src = _src;
        }
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
                pdfViewerOptions =
                    this.iframePDF.nativeElement.contentWindow
                        .PDFViewerApplicationOptions;
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
                pdfViewer =
                    this.iframePDF.nativeElement.contentWindow.PDFViewerApplication;
            }
        }
        return pdfViewer;
    }
    receiveMessage(viewerEvent) {
        if (viewerEvent.data &&
            viewerEvent.data.viewerId &&
            viewerEvent.data.event) {
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
            this.loadingSpin.nativeElement.style.display = "block";
            this.iframePDF.nativeElement.style.display = "none";
            let url = this.getUrlFile();
            let ext = this.getFileExtension(url);
            if (this.isValidFile(ext)) {
                const _urlFile = decodeURIComponent(url);
                const _checkExtWithoutPdf = this.isValidFile(this.getFileExtension(_urlFile.split(".pdf")[0]));
                if (_checkExtWithoutPdf) {
                    _urlFile.replace(".pdf", "");
                }
                this.viewWordBar.nativeElement.style.display = "block";
                this.viewerUrl = `https://docs.google.com/gview?url=${_urlFile}&embedded=true`;
                this.iframeDocx.nativeElement.style.display = "block";
                let countTimeload = 0;
                let checkContent = false;
                setTimeout(() => {
                    do {
                        this.iframeDocx.nativeElement.src = this.viewerUrl;
                        setTimeout(() => {
                            let content = this.iframeDocx.nativeElement?.contentWindow?.document?.getElementsByTagName("body")[0]?.innerHTML;
                            if (content !== "") {
                                checkContent = true;
                                return;
                            }
                            else {
                                countTimeload++;
                            }
                        }, 3000 * countTimeload);
                    } while (countTimeload === 4 || checkContent);
                    if (!checkContent) {
                        this.viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${_urlFile}`;
                        this.iframeDocx.nativeElement.src = this.viewerUrl;
                    }
                    else {
                        alert("Hiện tại chưa xem được file!");
                    }
                });
                setTimeout(() => {
                    this.loadingSpin.nativeElement.style.display = "none";
                }, 3200 * countTimeload);
            }
            else {
                console.log("Định dạng không hợp lệ!");
            }
        }
    }
    downloadFile(blobUrl, filename) {
        var a = document.createElement("a");
        if (!a.click) {
            throw new Error('DownloadManager: "a.click()" is not supported.');
        }
        a.href = blobUrl;
        a.target = "_parent";
        if ("download" in a) {
            a.download = filename;
        }
        (document.body || document.documentElement).appendChild(a);
        a.click();
        a.remove();
    }
    downloadWordFile() {
        console.log("download file!");
        let url = this.getUrlFile();
        this.downloadFile(url, "test");
    }
    closeWordFile() {
        console.log("close File!");
        this.closeFile.emit(true);
    }
    isValidFile(str) {
        switch (str.toLowerCase()) {
            case "pdf":
            case "doc":
            case "docx":
            case "xls":
            case "xlsx":
            case "pptx":
            case "ppt":
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
        // return decodeURIComponent(filename).split("/").pop().split(".").pop();
        return decodeURIComponent(filename).split("?")[0].split(".").pop();
        // const ext = /^.+\.([^.]+)$/.exec(filename);
        // return ext == null ? "" : ext[1];
    }
    ngOnInit() {
        window.addEventListener("message", this.receiveMessage.bind(this), false);
        if (!this.externalWindow) {
            // Load pdf for embedded views
            this.loadPdf();
        }
    }
    refresh() {
        // Needs to be invoked for external window or when needs to reload pdf
        this.loadPdf();
    }
    relaseUrl; // Avoid memory leask with `URL.createObjectURL`
    loadPdf() {
        if (!this._src) {
            return;
        }
        this.viewerUrl = "";
        this.viewWordBar.nativeElement.style.display = "none";
        // console.log(`Tab is - ${this.viewerTab}`);
        // if (this.viewerTab) {
        //   console.log(`Status of window - ${this.viewerTab.closed}`);
        // }
        this.iframeDocx.nativeElement.style.display = "none";
        if (this.externalWindow &&
            (typeof this.viewerTab === "undefined" || this.viewerTab.closed)) {
            this.viewerTab = window.open("", "_blank", this.externalWindowOptions || "");
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
        if (typeof this.viewerId !== "undefined") {
            this.viewerUrl += `&viewerId=${this.viewerId}`;
        }
        if (typeof this.onBeforePrint !== "undefined") {
            this.viewerUrl += `&beforePrint=true`;
        }
        if (typeof this.onAfterPrint !== "undefined") {
            this.viewerUrl += `&afterPrint=true`;
        }
        if (typeof this.onDocumentLoad !== "undefined") {
            this.viewerUrl += `&pagesLoaded=true`;
        }
        if (typeof this.onPageChange !== "undefined") {
            this.viewerUrl += `&pageChange=true`;
        }
        if (typeof this.closeButton !== "undefined") {
            this.viewerUrl += `&closeFile=${this.closeButton}`;
        }
        if (this.downloadFileName) {
            if (!this.downloadFileName.endsWith(".pdf")) {
                this.downloadFileName += ".pdf";
            }
            this.viewerUrl += `&fileName=${this.downloadFileName}`;
        }
        if (typeof this.openFile !== "undefined") {
            this.viewerUrl += `&openFile=${this.openFile}`;
        }
        if (typeof this.download !== "undefined") {
            this.viewerUrl += `&download=${this.download}`;
        }
        if (this.startDownload) {
            this.viewerUrl += `&startDownload=${this.startDownload}`;
        }
        if (typeof this.viewBookmark !== "undefined") {
            this.viewerUrl += `&viewBookmark=${this.viewBookmark}`;
        }
        if (typeof this.print !== "undefined") {
            this.viewerUrl += `&print=${this.print}`;
        }
        if (this.startPrint) {
            this.viewerUrl += `&startPrint=${this.startPrint}`;
        }
        if (typeof this.fullScreen !== "undefined") {
            this.viewerUrl += `&fullScreen=${this.fullScreen}`;
        }
        // if (this.showFullScreen) {
        //   this.viewerUrl += `&showFullScreen=${this.showFullScreen}`;
        // }
        if (typeof this.find !== "undefined") {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfJsViewerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.12", type: PdfJsViewerComponent, selector: "ng2-pdfjs-viewer", inputs: { viewerId: "viewerId", viewerFolder: "viewerFolder", externalWindow: "externalWindow", showSpinner: "showSpinner", downloadFileName: "downloadFileName", openFile: "openFile", download: "download", startDownload: "startDownload", viewBookmark: "viewBookmark", print: "print", startPrint: "startPrint", fullScreen: "fullScreen", find: "find", zoom: "zoom", nameddest: "nameddest", pagemode: "pagemode", lastPage: "lastPage", rotatecw: "rotatecw", rotateccw: "rotateccw", cursor: "cursor", scroll: "scroll", spread: "spread", locale: "locale", useOnlyCssZoom: "useOnlyCssZoom", errorOverride: "errorOverride", errorAppend: "errorAppend", errorMessage: "errorMessage", diagnosticLogs: "diagnosticLogs", externalWindowOptions: "externalWindowOptions", closeButton: "closeButton", page: "page", pdfSrc: "pdfSrc" }, outputs: { onBeforePrint: "onBeforePrint", onAfterPrint: "onAfterPrint", onDocumentLoad: "onDocumentLoad", onPageChange: "onPageChange", closeFile: "closeFile" }, viewQueries: [{ propertyName: "viewWordBar", first: true, predicate: ["viewWordBar"], descendants: true, static: true }, { propertyName: "loadingSpin", first: true, predicate: ["loadingSpin"], descendants: true, static: true }, { propertyName: "iframeDocx", first: true, predicate: ["iframeDocx"], descendants: true, static: true }, { propertyName: "iframePDF", first: true, predicate: ["iframePDF"], descendants: true, static: true }], ngImport: i0, template: `
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
        background-image: linear-gradient(
          hsla(0, 0%, 32%, 0.99),
          hsla(0, 0%, 27%, 0.95)
        );
      }

      #toolbarViewer {
        height: 32px;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
      }

      button {
        background: none;
        width: 53px;
        height: 25px;
        min-width: 16px;
        padding: 2px 6px 0;
        border: 1px solid transparent;
        border-radius: 2px;
        color: hsla(0, 0%, 100%, 0.8);
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

      button:hover {
        background-color: hsla(0, 0%, 0%, 0.12);
        background-image: linear-gradient(
          hsla(0, 0%, 100%, 0.05),
          hsla(0, 0%, 100%, 0)
        );
        background-clip: padding-box;
        border: 1px solid hsla(0, 0%, 0%, 0.35);
        border-color: hsla(0, 0%, 0%, 0.32) hsla(0, 0%, 0%, 0.38)
          hsla(0, 0%, 0%, 0.42);
        box-shadow: 0 1px 0 hsla(0, 0%, 100%, 0.05) inset,
          0 0 1px hsla(0, 0%, 100%, 0.15) inset, 0 1px 0 hsla(0, 0%, 100%, 0.05);
      }

      .loadingSpin {
        display: none;
        position: relative;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.25);
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
        0% {
          -webkit-transform: rotate(0deg);
        }
        100% {
          -webkit-transform: rotate(360deg);
        }
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
    <div #viewWordBar class="toolbar">
      <div id="toolbarContainer">
        <div id="toolbarViewer">
          <button
            id="download"
            (click)="downloadWordFile()"
            class="toolbarButton download"
            title="Download"
            tabindex="34"
            data-l10n-id="download"
          >
            <img
              src="/assets/pdfjs/web/images/toolbarButton-download.png"
              alt="Download"
            />
          </button>

          <button
            id="closeFile"
            (click)="closeWordFile()"
            class="toolbarButton"
            title="Close"
            tabindex="36"
            data-l10n-id="closeFile"
          >
            <img src="/assets/pdfjs/web/images/close-file.png" alt="Close" />
          </button>
        </div>
      </div>
    </div>
    <div #loadingSpin class="loadingSpin">
      <div class="loader"></div>
    </div>
    <iframe
      id="iframeDocx"
      #iframeDocx
      title="ng2-pdfjs-viewer"
      [hidden]="externalWindow || (!externalWindow && !pdfSrc)"
      width="100%"
      height="100%"
    ></iframe>

    <iframe
      id="iframePDF"
      #iframePDF
      title="ng2-pdfjs-viewer"
      [hidden]="externalWindow || (!externalWindow && !pdfSrc)"
      width="100%"
      height="100%"
    ></iframe>
  `, isInline: true, styles: ["\n      .toolbar {\n        position: relative;\n        left: 0;\n        right: 0;\n        z-index: 9999;\n        cursor: default;\n        display: none;\n      }\n\n      #toolbarContainer {\n        width: 100%;\n      }\n\n      #toolbarContainer {\n        position: relative;\n        height: 32px;\n        background-color: #474747;\n        background-image: linear-gradient(\n          hsla(0, 0%, 32%, 0.99),\n          hsla(0, 0%, 27%, 0.95)\n        );\n      }\n\n      #toolbarViewer {\n        height: 32px;\n        display: flex;\n        flex-direction: row;\n        justify-content: flex-end;\n        align-items: center;\n      }\n\n      button {\n        background: none;\n        width: 53px;\n        height: 25px;\n        min-width: 16px;\n        padding: 2px 6px 0;\n        border: 1px solid transparent;\n        border-radius: 2px;\n        color: hsla(0, 0%, 100%, 0.8);\n        font-size: 12px;\n        line-height: 14px;\n        -webkit-user-select: none;\n        -moz-user-select: none;\n        -ms-user-select: none;\n        user-select: none;\n        /* Opera does not support user-select, use <... unselectable=\"on\"> instead */\n        cursor: pointer;\n        transition-property: background-color, border-color, box-shadow;\n        transition-duration: 150ms;\n        transition-timing-function: ease;\n      }\n\n      button:hover {\n        background-color: hsla(0, 0%, 0%, 0.12);\n        background-image: linear-gradient(\n          hsla(0, 0%, 100%, 0.05),\n          hsla(0, 0%, 100%, 0)\n        );\n        background-clip: padding-box;\n        border: 1px solid hsla(0, 0%, 0%, 0.35);\n        border-color: hsla(0, 0%, 0%, 0.32) hsla(0, 0%, 0%, 0.38)\n          hsla(0, 0%, 0%, 0.42);\n        box-shadow: 0 1px 0 hsla(0, 0%, 100%, 0.05) inset,\n          0 0 1px hsla(0, 0%, 100%, 0.15) inset, 0 1px 0 hsla(0, 0%, 100%, 0.05);\n      }\n\n      .loadingSpin {\n        display: none;\n        position: relative;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n        background-color: rgba(0, 0, 0, 0.25);\n        z-index: 1000;\n      }\n\n      .loader {\n        z-index: 1001;\n        position: absolute;\n        left: 50%;\n        top: 50%;\n        transform: translate(-50%, -50%);\n        border: 16px solid #f3f3f3;\n        border-radius: 50%;\n        border-top: 16px solid #3498db;\n        width: 120px;\n        height: 120px;\n        -webkit-animation: spin 2s linear infinite; /* Safari */\n        animation: spin 2s linear infinite;\n      }\n\n      /* Safari */\n      @-webkit-keyframes spin {\n        0% {\n          -webkit-transform: rotate(0deg);\n        }\n        100% {\n          -webkit-transform: rotate(360deg);\n        }\n      }\n\n      @keyframes spin {\n        0% {\n          transform: rotate(0deg);\n        }\n        100% {\n          transform: rotate(360deg);\n        }\n      }\n    "] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfJsViewerComponent, decorators: [{
            type: Component,
            args: [{
                    selector: "ng2-pdfjs-viewer",
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
        background-image: linear-gradient(
          hsla(0, 0%, 32%, 0.99),
          hsla(0, 0%, 27%, 0.95)
        );
      }

      #toolbarViewer {
        height: 32px;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
      }

      button {
        background: none;
        width: 53px;
        height: 25px;
        min-width: 16px;
        padding: 2px 6px 0;
        border: 1px solid transparent;
        border-radius: 2px;
        color: hsla(0, 0%, 100%, 0.8);
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

      button:hover {
        background-color: hsla(0, 0%, 0%, 0.12);
        background-image: linear-gradient(
          hsla(0, 0%, 100%, 0.05),
          hsla(0, 0%, 100%, 0)
        );
        background-clip: padding-box;
        border: 1px solid hsla(0, 0%, 0%, 0.35);
        border-color: hsla(0, 0%, 0%, 0.32) hsla(0, 0%, 0%, 0.38)
          hsla(0, 0%, 0%, 0.42);
        box-shadow: 0 1px 0 hsla(0, 0%, 100%, 0.05) inset,
          0 0 1px hsla(0, 0%, 100%, 0.15) inset, 0 1px 0 hsla(0, 0%, 100%, 0.05);
      }

      .loadingSpin {
        display: none;
        position: relative;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.25);
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
        0% {
          -webkit-transform: rotate(0deg);
        }
        100% {
          -webkit-transform: rotate(360deg);
        }
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
    <div #viewWordBar class="toolbar">
      <div id="toolbarContainer">
        <div id="toolbarViewer">
          <button
            id="download"
            (click)="downloadWordFile()"
            class="toolbarButton download"
            title="Download"
            tabindex="34"
            data-l10n-id="download"
          >
            <img
              src="/assets/pdfjs/web/images/toolbarButton-download.png"
              alt="Download"
            />
          </button>

          <button
            id="closeFile"
            (click)="closeWordFile()"
            class="toolbarButton"
            title="Close"
            tabindex="36"
            data-l10n-id="closeFile"
          >
            <img src="/assets/pdfjs/web/images/close-file.png" alt="Close" />
          </button>
        </div>
      </div>
    </div>
    <div #loadingSpin class="loadingSpin">
      <div class="loader"></div>
    </div>
    <iframe
      id="iframeDocx"
      #iframeDocx
      title="ng2-pdfjs-viewer"
      [hidden]="externalWindow || (!externalWindow && !pdfSrc)"
      width="100%"
      height="100%"
    ></iframe>

    <iframe
      id="iframePDF"
      #iframePDF
      title="ng2-pdfjs-viewer"
      [hidden]="externalWindow || (!externalWindow && !pdfSrc)"
      width="100%"
      height="100%"
    ></iframe>
  `,
                }]
        }], propDecorators: { viewWordBar: [{
                type: ViewChild,
                args: ["viewWordBar", { static: true }]
            }], loadingSpin: [{
                type: ViewChild,
                args: ["loadingSpin", { static: true }]
            }], iframeDocx: [{
                type: ViewChild,
                args: ["iframeDocx", { static: true }]
            }], iframePDF: [{
                type: ViewChild,
                args: ["iframePDF", { static: true }]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsTUFBTSxFQUNOLFNBQVMsRUFDVCxZQUFZLEdBSWIsTUFBTSxlQUFlLENBQUM7O0FBMEt2QixNQUFNLE9BQU8sb0JBQW9CO0lBQ2EsV0FBVyxDQUFhO0lBQ3hCLFdBQVcsQ0FBYTtJQUN6QixVQUFVLENBQWE7SUFDeEIsU0FBUyxDQUFhO0lBQ2hELFFBQVEsQ0FBUztJQUN2QixhQUFhLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7SUFDdEQsWUFBWSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO0lBQ3JELGNBQWMsR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztJQUN2RCxZQUFZLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7SUFDL0MsWUFBWSxDQUFTO0lBQ3JCLGNBQWMsR0FBWSxLQUFLLENBQUM7SUFDaEMsV0FBVyxHQUFZLElBQUksQ0FBQztJQUM1QixnQkFBZ0IsQ0FBUztJQUN6QixRQUFRLEdBQVksSUFBSSxDQUFDO0lBQ3pCLFFBQVEsR0FBWSxJQUFJLENBQUM7SUFDekIsYUFBYSxDQUFVO0lBQ3ZCLFlBQVksR0FBWSxLQUFLLENBQUM7SUFDOUIsS0FBSyxHQUFZLElBQUksQ0FBQztJQUN0QixVQUFVLENBQVU7SUFDcEIsVUFBVSxHQUFZLElBQUksQ0FBQztJQUMzQywwQ0FBMEM7SUFDMUIsSUFBSSxHQUFZLElBQUksQ0FBQztJQUNyQixJQUFJLENBQVM7SUFDYixTQUFTLENBQVM7SUFDbEIsUUFBUSxDQUFTO0lBQ2pCLFFBQVEsQ0FBVTtJQUNsQixRQUFRLENBQVU7SUFDbEIsU0FBUyxDQUFVO0lBQ25CLE1BQU0sQ0FBUztJQUNmLE1BQU0sQ0FBUztJQUNmLE1B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QUs7Z0JBQ1UsUUFBUTtzQkFBdkIsS0FBSztnQkFDVSxhQUFhO3NCQUE1QixLQUFLO2dCQUNVLFlBQVk7c0JBQTNCLEtBQUs7Z0JBQ1UsS0FBSztzQkFBcEIsS0FBSztnQkFDVSxVQUFVO3NCQUF6QixLQUFLO2dCQUNVLFVBQVU7c0JBQXpCLEtBQUs7Z0JBRVUsSUFBSTtzQkFBbkIsS0FBSztnQkFDVSxJQUFJO3NCQUFuQixLQUFLO2dCQUNVLFNBQVM7c0JBQXhCLEtBQUs7Z0JBQ1UsUUFBUTtzQkFBdkIsS0FBSztnQkFDVSxRQUFRO3NCQUF2QixLQUFLO2dCQUNVLFFBQVE7c0JBQXZCLEtBQUs7Z0JBQ1UsU0FBUztzQkFBeEIsS0FBSztnQkFDVSxNQUFNO3NCQUFyQixLQUFLO2dCQUNVLE1BQU07c0JBQXJCLEtBQUs7Z0JBQ1UsTUFBTTtzQkFBckIsS0FBSztnQkFDVSxNQUFNO3NCQUFyQixLQUFLO2dCQUNVLGNBQWM7c0JBQTdCLEtBQUs7Z0JBQ1UsYUFBYTtzQkFBNUIsS0FBSztnQkFDVSxXQUFXO3NCQUExQixLQUFLO2dCQUNVLFlBQVk7c0JBQTNCLEtBQUs7Z0JBQ1UsY0FBYztzQkFBN0IsS0FBSztnQkFFVSxxQkFBcUI7c0JBQXBDLEtBQUs7Z0JBS1UsV0FBVztzQkFBMUIsS0FBSztnQkFDSSxTQUFTO3NCQUFsQixNQUFNO2dCQUtJLElBQUk7c0JBRGQsS0FBSztnQkF5QkssTUFBTTtzQkFEaEIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgQ29tcG9uZW50LFxyXG4gIElucHV0LFxyXG4gIE91dHB1dCxcclxuICBWaWV3Q2hpbGQsXHJcbiAgRXZlbnRFbWl0dGVyLFxyXG4gIEVsZW1lbnRSZWYsXHJcbiAgT25EZXN0cm95LFxyXG4gIE9uSW5pdCxcclxufSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6IFwibmcyLXBkZmpzLXZpZXdlclwiLFxyXG4gIHRlbXBsYXRlOiBgXHJcbiAgICA8c3R5bGU+XHJcbiAgICAgIC50b29sYmFyIHtcclxuICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICAgICAgbGVmdDogMDtcclxuICAgICAgICByaWdodDogMDtcclxuICAgICAgICB6LWluZGV4OiA5OTk5O1xyXG4gICAgICAgIGN1cnNvcjogZGVmYXVsdDtcclxuICAgICAgICBkaXNwbGF5OiBub25lO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAjdG9vbGJhckNvbnRhaW5lciB7XHJcbiAgICAgICAgd2lkdGg6IDEwMCU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICN0b29sYmFyQ29udGFpbmVyIHtcclxuICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICAgICAgaGVpZ2h0OiAzMnB4O1xyXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICM0NzQ3NDc7XHJcbiAgICAgICAgYmFja2dyb3VuZC1pbWFnZTogbGluZWFyLWdyYWRpZW50KFxyXG4gICAgICAgICAgaHNsYSgwLCAwJSwgMzIlLCAwLjk5KSxcclxuICAgICAgICAgIGhzbGEoMCwgMCUsIDI3JSwgMC45NSlcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAjdG9vbGJhclZpZXdlciB7XHJcbiAgICAgICAgaGVpZ2h0OiAzMnB4O1xyXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XHJcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IHJvdztcclxuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtZW5kO1xyXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGJ1dHRvbiB7XHJcbiAgICAgICAgYmFja2dyb3VuZDogbm9uZTtcclxuICAgICAgICB3aWR0aDogNTNweDtcclxuICAgICAgICBoZWlnaHQ6IDI1cHg7XHJcbiAgICAgICAgbWluLXdpZHRoOiAxNnB4O1xyXG4gICAgICAgIHBhZGRpbmc6IDJweCA2cHggMDtcclxuICAgICAgICBib3JkZXI6IDFweCBzb2xpZCB0cmFuc3BhcmVudDtcclxuICAgICAgICBib3JkZXItcmFkaXVzOiAycHg7XHJcbiAgICAgICAgY29sb3I6IGhzbGEoMCwgMCUsIDEwMCUsIDAuOCk7XHJcbiAgICAgICAgZm9udC1zaXplOiAxMnB4O1xyXG4gICAgICAgIGxpbmUtaGVpZ2h0OiAxNHB4O1xyXG4gICAgICAgIC13ZWJraXQtdXNlci1zZWxlY3Q6IG5vbmU7XHJcbiAgICAgICAgLW1vei11c2VyLXNlbGVjdDogbm9uZTtcclxuICAgICAgICAtbXMtdXNlci1zZWxlY3Q6IG5vbmU7XHJcbiAgICAgICAgdXNlci1zZWxlY3Q6IG5vbmU7XHJcbiAgICAgICAgLyogT3BlcmEgZG9lcyBub3Qgc3VwcG9ydCB1c2VyLXNlbGVjdCwgdXNlIDwuLi4gdW5zZWxlY3RhYmxlPVwib25cIj4gaW5zdGVhZCAqL1xyXG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjtcclxuICAgICAgICB0cmFuc2l0aW9uLXByb3BlcnR5OiBiYWNrZ3JvdW5kLWNvbG9yLCBib3JkZXItY29sb3IsIGJveC1zaGFkb3c7XHJcbiAgICAgICAgdHJhbnNpdGlvbi1kdXJhdGlvbjogMTUwbXM7XHJcbiAgICAgICAgdHJhbnNpdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGJ1dHRvbjpob3ZlciB7XHJcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogaHNsYSgwLCAwJSwgMCUsIDAuMTIpO1xyXG4gICAgICAgIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudChcclxuICAgICAgICAgIGhzbGEoMCwgMCUsIDEwMCUsIDAuMDUpLFxyXG4gICAgICAgICAgaHNsYSgwLCAwJSwgMTAwJSwgMClcclxuICAgICAgICApO1xyXG4gICAgICAgIGJhY2tncm91bmQtY2xpcDogcGFkZGluZy1ib3g7XHJcbiAgICAgICAgYm9yZGVyOiAxcHggc29saWQgaHNsYSgwLCAwJSwgMCUsIDAuMzUpO1xyXG4gICAgICAgIGJvcmRlci1jb2xvcjogaHNsYSgwLCAwJSwgMCUsIDAuMzIpIGhzbGEoMCwgMCUsIDAlLCAwLjM4KVxyXG4gICAgICAgICAgaHNsYSgwLCAwJSwgMCUsIDAuNDIpO1xyXG4gICAgICAgIGJveC1zaGFkb3c6IDAgMXB4IDAgaHNsYSgwLCAwJSwgMTAwJSwgMC4wNSkgaW5zZXQsXHJcbiAgICAgICAgICAwIDAgMXB4IGhzbGEoMCwgMCUsIDEwMCUsIDAuMTUpIGluc2V0LCAwIDFweCAwIGhzbGEoMCwgMCUsIDEwMCUsIDAuMDUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAubG9hZGluZ1NwaW4ge1xyXG4gICAgICAgIGRpc3BsYXk6IG5vbmU7XHJcbiAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgICAgIHRvcDogMDtcclxuICAgICAgICBsZWZ0OiAwO1xyXG4gICAgICAgIHdpZHRoOiAxMDAlO1xyXG4gICAgICAgIGhlaWdodDogMTAwJTtcclxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMjUpO1xyXG4gICAgICAgIHotaW5kZXg6IDEwMDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC5sb2FkZXIge1xyXG4gICAgICAgIHotaW5kZXg6IDEwMDE7XHJcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xyXG4gICAgICAgIGxlZnQ6IDUwJTtcclxuICAgICAgICB0b3A6IDUwJTtcclxuICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTtcclxuICAgICAgICBib3JkZXI6IDE2cHggc29saWQgI2YzZjNmMztcclxuICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XHJcbiAgICAgICAgYm9yZGVyLXRvcDogMTZweCBzb2xpZCAjMzQ5OGRiO1xyXG4gICAgICAgIHdpZHRoOiAxMjBweDtcclxuICAgICAgICBoZWlnaHQ6IDEyMHB4O1xyXG4gICAgICAgIC13ZWJraXQtYW5pbWF0aW9uOiBzcGluIDJzIGxpbmVhciBpbmZpbml0ZTsgLyogU2FmYXJpICovXHJcbiAgICAgICAgYW5pbWF0aW9uOiBzcGluIDJzIGxpbmVhciBpbmZpbml0ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyogU2FmYXJpICovXHJcbiAgICAgIEAtd2Via2l0LWtleWZyYW1lcyBzcGluIHtcclxuICAgICAgICAwJSB7XHJcbiAgICAgICAgICAtd2Via2l0LXRyYW5zZm9ybTogcm90YXRlKDBkZWcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAxMDAlIHtcclxuICAgICAgICAgIC13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIEBrZXlmcmFtZXMgc3BpbiB7XHJcbiAgICAgICAgMCUge1xyXG4gICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIDEwMCUge1xyXG4gICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIDwvc3R5bGU+XHJcbiAgICA8ZGl2ICN2aWV3V29yZEJhciBjbGFzcz1cInRvb2xiYXJcIj5cclxuICAgICAgPGRpdiBpZD1cInRvb2xiYXJDb250YWluZXJcIj5cclxuICAgICAgICA8ZGl2IGlkPVwidG9vbGJhclZpZXdlclwiPlxyXG4gICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICBpZD1cImRvd25sb2FkXCJcclxuICAgICAgICAgICAgKGNsaWNrKT1cImRvd25sb2FkV29yZEZpbGUoKVwiXHJcbiAgICAgICAgICAgIGNsYXNzPVwidG9vbGJhckJ1dHRvbiBkb3dubG9hZFwiXHJcbiAgICAgICAgICAgIHRpdGxlPVwiRG93bmxvYWRcIlxyXG4gICAgICAgICAgICB0YWJpbmRleD1cIjM0XCJcclxuICAgICAgICAgICAgZGF0YS1sMTBuLWlkPVwiZG93bmxvYWRcIlxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICA8aW1nXHJcbiAgICAgICAgICAgICAgc3JjPVwiL2Fzc2V0cy9wZGZqcy93ZWIvaW1hZ2VzL3Rvb2xiYXJCdXR0b24tZG93bmxvYWQucG5nXCJcclxuICAgICAgICAgICAgICBhbHQ9XCJEb3dubG9hZFwiXHJcbiAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICA8L2J1dHRvbj5cclxuXHJcbiAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgIGlkPVwiY2xvc2VGaWxlXCJcclxuICAgICAgICAgICAgKGNsaWNrKT1cImNsb3NlV29yZEZpbGUoKVwiXHJcbiAgICAgICAgICAgIGNsYXNzPVwidG9vbGJhckJ1dHRvblwiXHJcbiAgICAgICAgICAgIHRpdGxlPVwiQ2xvc2VcIlxyXG4gICAgICAgICAgICB0YWJpbmRleD1cIjM2XCJcclxuICAgICAgICAgICAgZGF0YS1sMTBuLWlkPVwiY2xvc2VGaWxlXCJcclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgPGltZyBzcmM9XCIvYXNzZXRzL3BkZmpzL3dlYi9pbWFnZXMvY2xvc2UtZmlsZS5wbmdcIiBhbHQ9XCJDbG9zZVwiIC8+XHJcbiAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuICAgIDxkaXYgI2xvYWRpbmdTcGluIGNsYXNzPVwibG9hZGluZ1NwaW5cIj5cclxuICAgICAgPGRpdiBjbGFzcz1cImxvYWRlclwiPjwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgICA8aWZyYW1lXHJcbiAgICAgIGlkPVwiaWZyYW1lRG9jeFwiXHJcbiAgICAgICNpZnJhbWVEb2N4XHJcbiAgICAgIHRpdGxlPVwibmcyLXBkZmpzLXZpZXdlclwiXHJcbiAgICAgIFtoaWRkZW5dPVwiZXh0ZXJuYWxXaW5kb3cgfHwgKCFleHRlcm5hbFdpbmRvdyAmJiAhcGRmU3JjKVwiXHJcbiAgICAgIHdpZHRoPVwiMTAwJVwiXHJcbiAgICAgIGhlaWdodD1cIjEwMCVcIlxyXG4gICAgPjwvaWZyYW1lPlxyXG5cclxuICAgIDxpZnJhbWVcclxuICAgICAgaWQ9XCJpZnJhbWVQREZcIlxyXG4gICAgICAjaWZyYW1lUERGXHJcbiAgICAgIHRpdGxlPVwibmcyLXBkZmpzLXZpZXdlclwiXHJcbiAgICAgIFtoaWRkZW5dPVwiZXh0ZXJuYWxXaW5kb3cgfHwgKCFleHRlcm5hbFdpbmRvdyAmJiAhcGRmU3JjKVwiXHJcbiAgICAgIHdpZHRoPVwiMTAwJVwiXHJcbiAgICAgIGhlaWdodD1cIjEwMCVcIlxyXG4gICAgPjwvaWZyYW1lPlxyXG4gIGAsXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBQZGZKc1ZpZXdlckNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcclxuICBAVmlld0NoaWxkKFwidmlld1dvcmRCYXJcIiwgeyBzdGF0aWM6IHRydWUgfSkgdmlld1dvcmRCYXI6IEVsZW1lbnRSZWY7XHJcbiAgQFZpZXdDaGlsZChcImxvYWRpbmdTcGluXCIsIHsgc3RhdGljOiB0cnVlIH0pIGxvYWRpbmdTcGluOiBFbGVtZW50UmVmO1xyXG4gIEBWaWV3Q2hpbGQoXCJpZnJhbWVEb2N4XCIsIHsgc3RhdGljOiB0cnVlIH0pIGlmcmFtZURvY3g6IEVsZW1lbnRSZWY7XHJcbiAgQFZpZXdDaGlsZChcImlmcmFtZVBERlwiLCB7IHN0YXRpYzogdHJ1ZSB9KSBpZnJhbWVQREY6IEVsZW1lbnRSZWY7XHJcbiAgQElucHV0KCkgcHVibGljIHZpZXdlcklkOiBzdHJpbmc7XHJcbiAgQE91dHB1dCgpIG9uQmVmb3JlUHJpbnQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG4gIEBPdXRwdXQoKSBvbkFmdGVyUHJpbnQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG4gIEBPdXRwdXQoKSBvbkRvY3VtZW50TG9hZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcbiAgQE91dHB1dCgpIG9uUGFnZUNoYW5nZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcbiAgQElucHV0KCkgcHVibGljIHZpZXdlckZvbGRlcjogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBleHRlcm5hbFdpbmRvdzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBzaG93U3Bpbm5lcjogYm9vbGVhbiA9IHRydWU7XHJcbiAgQElucHV0KCkgcHVibGljIGRvd25sb2FkRmlsZU5hbWU6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgb3BlbkZpbGU6IGJvb2xlYW4gPSB0cnVlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBkb3dubG9hZDogYm9vbGVhbiA9IHRydWU7XHJcbiAgQElucHV0KCkgcHVibGljIHN0YXJ0RG93bmxvYWQ6IGJvb2xlYW47XHJcbiAgQElucHV0KCkgcHVibGljIHZpZXdCb29rbWFyazogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBwcmludDogYm9vbGVhbiA9IHRydWU7XHJcbiAgQElucHV0KCkgcHVibGljIHN0YXJ0UHJpbnQ6IGJvb2xlYW47XHJcbiAgQElucHV0KCkgcHVibGljIGZ1bGxTY3JlZW46IGJvb2xlYW4gPSB0cnVlO1xyXG4gIC8vQElucHV0KCkgcHVibGljIHNob3dGdWxsU2NyZWVuOiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBmaW5kOiBib29sZWFuID0gdHJ1ZTtcclxuICBASW5wdXQoKSBwdWJsaWMgem9vbTogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBuYW1lZGRlc3Q6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgcGFnZW1vZGU6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgbGFzdFBhZ2U6IGJvb2xlYW47XHJcbiAgQElucHV0KCkgcHVibGljIHJvdGF0ZWN3OiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyByb3RhdGVjY3c6IGJvb2xlYW47XHJcbiAgQElucHV0KCkgcHVibGljIGN1cnNvcjogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBzY3JvbGw6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgc3ByZWFkOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgcHVibGljIGxvY2FsZTogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyB1c2VPbmx5Q3NzWm9vbTogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBlcnJvck92ZXJyaWRlOiBib29sZWFuID0gZmFsc2U7XHJcbiAgQElucHV0KCkgcHVibGljIGVycm9yQXBwZW5kOiBib29sZWFuID0gdHJ1ZTtcclxuICBASW5wdXQoKSBwdWJsaWMgZXJyb3JNZXNzYWdlOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgcHVibGljIGRpYWdub3N0aWNMb2dzOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgQElucHV0KCkgcHVibGljIGV4dGVybmFsV2luZG93T3B0aW9uczogc3RyaW5nO1xyXG4gIHB1YmxpYyB2aWV3ZXJUYWI6IGFueTtcclxuICBwcml2YXRlIF9zcmM6IHN0cmluZyB8IEJsb2IgfCBVaW50OEFycmF5O1xyXG4gIHByaXZhdGUgX3BhZ2U6IG51bWJlcjtcclxuXHJcbiAgQElucHV0KCkgcHVibGljIGNsb3NlQnV0dG9uOiBib29sZWFuO1xyXG4gIEBPdXRwdXQoKSBjbG9zZUZpbGU6IEV2ZW50RW1pdHRlcjxib29sZWFuPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgdmlld2VyVXJsO1xyXG5cclxuICBASW5wdXQoKVxyXG4gIHB1YmxpYyBzZXQgcGFnZShfcGFnZTogbnVtYmVyKSB7XHJcbiAgICB0aGlzLl9wYWdlID0gX3BhZ2U7XHJcbiAgICBpZiAodGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbikge1xyXG4gICAgICB0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uLnBhZ2UgPSB0aGlzLl9wYWdlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMuZGlhZ25vc3RpY0xvZ3MpXHJcbiAgICAgICAgY29uc29sZS53YXJuKFxyXG4gICAgICAgICAgXCJEb2N1bWVudCBpcyBub3QgbG9hZGVkIHlldCEhIS4gVHJ5IHRvIHNldCBwYWdlIyBhZnRlciBmdWxsIGxvYWQuIElnbm9yZSB0aGlzIHdhcm5pbmcgaWYgeW91IGFyZSBub3Qgc2V0dGluZyBwYWdlIyB1c2luZyAnLicgbm90YXRpb24uIChFLmcuIHBkZlZpZXdlci5wYWdlID0gNTspXCJcclxuICAgICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBwYWdlKCkge1xyXG4gICAgaWYgKHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24pIHtcclxuICAgICAgcmV0dXJuIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24ucGFnZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICh0aGlzLmRpYWdub3N0aWNMb2dzKVxyXG4gICAgICAgIGNvbnNvbGUud2FybihcclxuICAgICAgICAgIFwiRG9jdW1lbnQgaXMgbm90IGxvYWRlZCB5ZXQhISEuIFRyeSB0byByZXRyaWV2ZSBwYWdlIyBhZnRlciBmdWxsIGxvYWQuXCJcclxuICAgICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgQElucHV0KClcclxuICBwdWJsaWMgc2V0IHBkZlNyYyhfc3JjOiBzdHJpbmcgfCBCbG9iIHwgVWludDhBcnJheSkge1xyXG4gICAgaWYgKHR5cGVvZiBfc3JjID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgIHRoaXMuX3NyYyA9IGVuY29kZVVSSUNvbXBvbmVudChfc3JjKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuX3NyYyA9IF9zcmM7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHBkZlNyYygpIHtcclxuICAgIHJldHVybiB0aGlzLl9zcmM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IFBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucygpIHtcclxuICAgIGxldCBwZGZWaWV3ZXJPcHRpb25zID0gbnVsbDtcclxuICAgIGlmICh0aGlzLmV4dGVybmFsV2luZG93KSB7XHJcbiAgICAgIGlmICh0aGlzLnZpZXdlclRhYikge1xyXG4gICAgICAgIHBkZlZpZXdlck9wdGlvbnMgPSB0aGlzLnZpZXdlclRhYi5QREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnM7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICh0aGlzLmlmcmFtZVBERi5uYXRpdmVFbGVtZW50LmNvbnRlbnRXaW5kb3cpIHtcclxuICAgICAgICBwZGZWaWV3ZXJPcHRpb25zID1cclxuICAgICAgICAgIHRoaXMuaWZyYW1lUERGLm5hdGl2ZUVsZW1lbnQuY29udGVudFdpbmRvd1xyXG4gICAgICAgICAgICAuUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcGRmVmlld2VyT3B0aW9ucztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgUERGVmlld2VyQXBwbGljYXRpb24oKSB7XHJcbiAgICBsZXQgcGRmVmlld2VyID0gbnVsbDtcclxuICAgIGlmICh0aGlzLmV4dGVybmFsV2luZG93KSB7XHJcbiAgICAgIGlmICh0aGlzLnZpZXdlclRhYikge1xyXG4gICAgICAgIHBkZlZpZXdlciA9IHRoaXMudmlld2VyVGFiLlBERlZpZXdlckFwcGxpY2F0aW9uO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAodGhpcy5pZnJhbWVQREYubmF0aXZlRWxlbWVudC5jb250ZW50V2luZG93KSB7XHJcbiAgICAgICAgcGRmVmlld2VyID1cclxuICAgICAgICAgIHRoaXMuaWZyYW1lUERGLm5hdGl2ZUVsZW1lbnQuY29udGVudFdpbmRvdy5QREZWaWV3ZXJBcHBsaWNhdGlvbjtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBkZlZpZXdlcjtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZWNlaXZlTWVzc2FnZSh2aWV3ZXJFdmVudCkge1xyXG4gICAgaWYgKFxyXG4gICAgICB2aWV3ZXJFdmVudC5kYXRhICYmXHJcbiAgICAgIHZpZXdlckV2ZW50LmRhdGEudmlld2VySWQgJiZcclxuICAgICAgdmlld2VyRXZlbnQuZGF0YS5ldmVudFxyXG4gICAgKSB7XHJcbiAgICAgIGxldCB2aWV3ZXJJZCA9IHZpZXdlckV2ZW50LmRhdGEudmlld2VySWQ7XHJcbiAgICAgIGxldCBldmVudCA9IHZpZXdlckV2ZW50LmRhdGEuZXZlbnQ7XHJcbiAgICAgIGxldCBwYXJhbSA9IHZpZXdlckV2ZW50LmRhdGEucGFyYW07XHJcbiAgICAgIGlmICh0aGlzLnZpZXdlcklkID09IHZpZXdlcklkKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub25CZWZvcmVQcmludCAmJiBldmVudCA9PSBcImJlZm9yZVByaW50XCIpIHtcclxuICAgICAgICAgIHRoaXMub25CZWZvcmVQcmludC5lbWl0KCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9uQWZ0ZXJQcmludCAmJiBldmVudCA9PSBcImFmdGVyUHJpbnRcIikge1xyXG4gICAgICAgICAgdGhpcy5vbkFmdGVyUHJpbnQuZW1pdCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5vbkRvY3VtZW50TG9hZCAmJiBldmVudCA9PSBcInBhZ2VzTG9hZGVkXCIpIHtcclxuICAgICAgICAgIHRoaXMub25Eb2N1bWVudExvYWQuZW1pdChwYXJhbSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9uUGFnZUNoYW5nZSAmJiBldmVudCA9PSBcInBhZ2VDaGFuZ2VcIikge1xyXG4gICAgICAgICAgdGhpcy5vblBhZ2VDaGFuZ2UuZW1pdChwYXJhbSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAodmlld2VyRXZlbnQuZGF0YSAmJiB2aWV3ZXJFdmVudC5kYXRhLmV2ZW50ID09PSBcImNsb3NlZmlsZVwiKSB7XHJcbiAgICAgIHRoaXMuY2xvc2VGaWxlLmVtaXQodHJ1ZSk7XHJcbiAgICB9IGVsc2UgaWYgKHZpZXdlckV2ZW50LmRhdGEgJiYgdmlld2VyRXZlbnQuZGF0YS5ldmVudCA9PT0gXCJsb2FkZXJFcnJvclwiKSB7XHJcbiAgICAgIHRoaXMubG9hZGluZ1NwaW4ubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xyXG4gICAgICB0aGlzLmlmcmFtZVBERi5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuXHJcbiAgICAgIGxldCB1cmwgPSB0aGlzLmdldFVybEZpbGUoKTtcclxuICAgICAgbGV0IGV4dCA9IHRoaXMuZ2V0RmlsZUV4dGVuc2lvbih1cmwpO1xyXG4gICAgICBpZiAodGhpcy5pc1ZhbGlkRmlsZShleHQpKSB7XHJcbiAgICAgICAgY29uc3QgX3VybEZpbGUgPSBkZWNvZGVVUklDb21wb25lbnQodXJsKTtcclxuICAgICAgICBjb25zdCBfY2hlY2tFeHRXaXRob3V0UGRmID0gdGhpcy5pc1ZhbGlkRmlsZShcclxuICAgICAgICAgIHRoaXMuZ2V0RmlsZUV4dGVuc2lvbihfdXJsRmlsZS5zcGxpdChcIi5wZGZcIilbMF0pXHJcbiAgICAgICAgKTtcclxuICAgICAgICBpZiAoX2NoZWNrRXh0V2l0aG91dFBkZikge1xyXG4gICAgICAgICAgX3VybEZpbGUucmVwbGFjZShcIi5wZGZcIiwgXCJcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudmlld1dvcmRCYXIubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xyXG4gICAgICAgIHRoaXMudmlld2VyVXJsID0gYGh0dHBzOi8vZG9jcy5nb29nbGUuY29tL2d2aWV3P3VybD0ke191cmxGaWxlfSZlbWJlZGRlZD10cnVlYDtcclxuICAgICAgICB0aGlzLmlmcmFtZURvY3gubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xyXG5cclxuICAgICAgICBsZXQgY291bnRUaW1lbG9hZCA9IDA7XHJcbiAgICAgICAgbGV0IGNoZWNrQ29udGVudCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgdGhpcy5pZnJhbWVEb2N4Lm5hdGl2ZUVsZW1lbnQuc3JjID0gdGhpcy52aWV3ZXJVcmw7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgIGxldCBjb250ZW50ID1cclxuICAgICAgICAgICAgICAgIHRoaXMuaWZyYW1lRG9jeC5uYXRpdmVFbGVtZW50Py5jb250ZW50V2luZG93Py5kb2N1bWVudD8uZ2V0RWxlbWVudHNCeVRhZ05hbWUoXHJcbiAgICAgICAgICAgICAgICAgIFwiYm9keVwiXHJcbiAgICAgICAgICAgICAgICApWzBdPy5pbm5lckhUTUw7XHJcbiAgICAgICAgICAgICAgaWYgKGNvbnRlbnQgIT09IFwiXCIpIHtcclxuICAgICAgICAgICAgICAgIGNoZWNrQ29udGVudCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvdW50VGltZWxvYWQrKztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIDMwMDAgKiBjb3VudFRpbWVsb2FkKTtcclxuICAgICAgICAgIH0gd2hpbGUgKGNvdW50VGltZWxvYWQgPT09IDQgfHwgY2hlY2tDb250ZW50KTtcclxuXHJcbiAgICAgICAgICBpZiAoIWNoZWNrQ29udGVudCkge1xyXG4gICAgICAgICAgICB0aGlzLnZpZXdlclVybCA9IGBodHRwczovL3ZpZXcub2ZmaWNlYXBwcy5saXZlLmNvbS9vcC9lbWJlZC5hc3B4P3NyYz0ke191cmxGaWxlfWA7XHJcbiAgICAgICAgICAgIHRoaXMuaWZyYW1lRG9jeC5uYXRpdmVFbGVtZW50LnNyYyA9IHRoaXMudmlld2VyVXJsO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYWxlcnQoXCJIaeG7h24gdOG6oWkgY2jGsGEgeGVtIMSRxrDhu6NjIGZpbGUhXCIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIHRoaXMubG9hZGluZ1NwaW4ubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgfSwgMzIwMCAqIGNvdW50VGltZWxvYWQpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwixJDhu4tuaCBk4bqhbmcga2jDtG5nIGjhu6NwIGzhu4chXCIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBkb3dubG9hZEZpbGUoYmxvYlVybCwgZmlsZW5hbWUpIHtcclxuICAgIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XHJcbiAgICBpZiAoIWEuY2xpY2spIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEb3dubG9hZE1hbmFnZXI6IFwiYS5jbGljaygpXCIgaXMgbm90IHN1cHBvcnRlZC4nKTtcclxuICAgIH1cclxuICAgIGEuaHJlZiA9IGJsb2JVcmw7XHJcbiAgICBhLnRhcmdldCA9IFwiX3BhcmVudFwiO1xyXG4gICAgaWYgKFwiZG93bmxvYWRcIiBpbiBhKSB7XHJcbiAgICAgIGEuZG93bmxvYWQgPSBmaWxlbmFtZTtcclxuICAgIH1cclxuICAgIChkb2N1bWVudC5ib2R5IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkuYXBwZW5kQ2hpbGQoYSk7XHJcbiAgICBhLmNsaWNrKCk7XHJcbiAgICBhLnJlbW92ZSgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRvd25sb2FkV29yZEZpbGUoKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcImRvd25sb2FkIGZpbGUhXCIpO1xyXG4gICAgbGV0IHVybCA9IHRoaXMuZ2V0VXJsRmlsZSgpO1xyXG4gICAgdGhpcy5kb3dubG9hZEZpbGUodXJsLCBcInRlc3RcIik7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY2xvc2VXb3JkRmlsZSgpIHtcclxuICAgIGNvbnNvbGUubG9nKFwiY2xvc2UgRmlsZSFcIik7XHJcbiAgICB0aGlzLmNsb3NlRmlsZS5lbWl0KHRydWUpO1xyXG4gIH1cclxuXHJcbiAgaXNWYWxpZEZpbGUoc3RyKSB7XHJcbiAgICBzd2l0Y2ggKHN0ci50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgIGNhc2UgXCJwZGZcIjpcclxuICAgICAgY2FzZSBcImRvY1wiOlxyXG4gICAgICBjYXNlIFwiZG9jeFwiOlxyXG4gICAgICBjYXNlIFwieGxzXCI6XHJcbiAgICAgIGNhc2UgXCJ4bHN4XCI6XHJcbiAgICAgIGNhc2UgXCJwcHR4XCI6XHJcbiAgICAgIGNhc2UgXCJwcHRcIjpcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIGdldFVybEZpbGUoKSB7XHJcbiAgICBpZiAodGhpcy5fc3JjIGluc3RhbmNlb2YgQmxvYikge1xyXG4gICAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KFVSTC5jcmVhdGVPYmplY3RVUkwodGhpcy5fc3JjKSk7XHJcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3NyYyBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcclxuICAgICAgbGV0IGJsb2IgPSBuZXcgQmxvYihbdGhpcy5fc3JjXSwgeyB0eXBlOiBcImFwcGxpY2F0aW9uL3BkZlwiIH0pO1xyXG4gICAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYikpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX3NyYztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGdldEZpbGVFeHRlbnNpb24oZmlsZW5hbWUpIHtcclxuICAgIC8vIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoZmlsZW5hbWUpLnNwbGl0KFwiL1wiKS5wb3AoKS5zcGxpdChcIi5cIikucG9wKCk7XHJcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGZpbGVuYW1lKS5zcGxpdChcIj9cIilbMF0uc3BsaXQoXCIuXCIpLnBvcCgpO1xyXG4gICAgLy8gY29uc3QgZXh0ID0gL14uK1xcLihbXi5dKykkLy5leGVjKGZpbGVuYW1lKTtcclxuICAgIC8vIHJldHVybiBleHQgPT0gbnVsbCA/IFwiXCIgOiBleHRbMV07XHJcbiAgfVxyXG5cclxuICBuZ09uSW5pdCgpOiB2b2lkIHtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCB0aGlzLnJlY2VpdmVNZXNzYWdlLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgIGlmICghdGhpcy5leHRlcm5hbFdpbmRvdykge1xyXG4gICAgICAvLyBMb2FkIHBkZiBmb3IgZW1iZWRkZWQgdmlld3NcclxuICAgICAgdGhpcy5sb2FkUGRmKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVmcmVzaCgpOiB2b2lkIHtcclxuICAgIC8vIE5lZWRzIHRvIGJlIGludm9rZWQgZm9yIGV4dGVybmFsIHdpbmRvdyBvciB3aGVuIG5lZWRzIHRvIHJlbG9hZCBwZGZcclxuICAgIHRoaXMubG9hZFBkZigpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZWxhc2VVcmw/OiAoKSA9PiB2b2lkOyAvLyBBdm9pZCBtZW1vcnkgbGVhc2sgd2l0aCBgVVJMLmNyZWF0ZU9iamVjdFVSTGBcclxuXHJcbiAgcHJpdmF0ZSBsb2FkUGRmKCkge1xyXG4gICAgaWYgKCF0aGlzLl9zcmMpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy52aWV3ZXJVcmwgPSBcIlwiO1xyXG4gICAgdGhpcy52aWV3V29yZEJhci5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgIC8vIGNvbnNvbGUubG9nKGBUYWIgaXMgLSAke3RoaXMudmlld2VyVGFifWApO1xyXG4gICAgLy8gaWYgKHRoaXMudmlld2VyVGFiKSB7XHJcbiAgICAvLyAgIGNvbnNvbGUubG9nKGBTdGF0dXMgb2Ygd2luZG93IC0gJHt0aGlzLnZpZXdlclRhYi5jbG9zZWR9YCk7XHJcbiAgICAvLyB9XHJcblxyXG4gICAgdGhpcy5pZnJhbWVEb2N4Lm5hdGl2ZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG5cclxuICAgIGlmIChcclxuICAgICAgdGhpcy5leHRlcm5hbFdpbmRvdyAmJlxyXG4gICAgICAodHlwZW9mIHRoaXMudmlld2VyVGFiID09PSBcInVuZGVmaW5lZFwiIHx8IHRoaXMudmlld2VyVGFiLmNsb3NlZClcclxuICAgICkge1xyXG4gICAgICB0aGlzLnZpZXdlclRhYiA9IHdpbmRvdy5vcGVuKFxyXG4gICAgICAgIFwiXCIsXHJcbiAgICAgICAgXCJfYmxhbmtcIixcclxuICAgICAgICB0aGlzLmV4dGVybmFsV2luZG93T3B0aW9ucyB8fCBcIlwiXHJcbiAgICAgICk7XHJcbiAgICAgIGlmICh0aGlzLnZpZXdlclRhYiA9PSBudWxsKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGlhZ25vc3RpY0xvZ3MpXHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFxyXG4gICAgICAgICAgICBcIm5nMi1wZGZqcy12aWV3ZXI6IEZvciAnZXh0ZXJuYWxXaW5kb3cgPSB0cnVlJy4gaS5lIG9wZW5pbmcgaW4gbmV3IHRhYiB0byB3b3JrLCBwb3AtdXBzIHNob3VsZCBiZSBlbmFibGVkLlwiXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMuc2hvd1NwaW5uZXIpIHtcclxuICAgICAgICB0aGlzLnZpZXdlclRhYi5kb2N1bWVudC53cml0ZShgXHJcbiAgICAgICAgICA8c3R5bGU+XHJcbiAgICAgICAgICAubG9hZGVyIHtcclxuICAgICAgICAgICAgcG9zaXRpb246IGZpeGVkO1xyXG4gICAgICAgICAgICBsZWZ0OiA0MCU7XHJcbiAgICAgICAgICAgIHRvcDogNDAlO1xyXG4gICAgICAgICAgICBib3JkZXI6IDE2cHggc29saWQgI2YzZjNmMztcclxuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xyXG4gICAgICAgICAgICBib3JkZXItdG9wOiAxNnB4IHNvbGlkICMzNDk4ZGI7XHJcbiAgICAgICAgICAgIHdpZHRoOiAxMjBweDtcclxuICAgICAgICAgICAgaGVpZ2h0OiAxMjBweDtcclxuICAgICAgICAgICAgYW5pbWF0aW9uOiBzcGluIDJzIGxpbmVhciBpbmZpbml0ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIEBrZXlmcmFtZXMgc3BpbiB7XHJcbiAgICAgICAgICAgIDAlIHtcclxuICAgICAgICAgICAgICB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAxMDAlIHtcclxuICAgICAgICAgICAgICB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICA8L3N0eWxlPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImxvYWRlclwiPjwvZGl2PlxyXG4gICAgICAgIGApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGZpbGVVcmwgPSB0aGlzLmdldFVybEZpbGUoKTtcclxuICAgIC8vIGxldCB0aGlzLnZpZXdlclVybDtcclxuICAgIGlmICh0aGlzLnZpZXdlckZvbGRlcikge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCA9IGAke3RoaXMudmlld2VyRm9sZGVyfS93ZWIvdmlld2VyLmh0bWxgO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgPSBgYXNzZXRzL3BkZmpzL3dlYi92aWV3ZXIuaHRtbGA7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy52aWV3ZXJVcmwgKz0gYD9maWxlPSR7ZmlsZVVybH1gO1xyXG5cclxuICAgIGlmICh0eXBlb2YgdGhpcy52aWV3ZXJJZCAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnZpZXdlcklkPSR7dGhpcy52aWV3ZXJJZH1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uQmVmb3JlUHJpbnQgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZiZWZvcmVQcmludD10cnVlYDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5vbkFmdGVyUHJpbnQgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZhZnRlclByaW50PXRydWVgO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uRG9jdW1lbnRMb2FkICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmcGFnZXNMb2FkZWQ9dHJ1ZWA7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMub25QYWdlQ2hhbmdlICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmcGFnZUNoYW5nZT10cnVlYDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5jbG9zZUJ1dHRvbiAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJmNsb3NlRmlsZT0ke3RoaXMuY2xvc2VCdXR0b259YDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5kb3dubG9hZEZpbGVOYW1lKSB7XHJcbiAgICAgIGlmICghdGhpcy5kb3dubG9hZEZpbGVOYW1lLmVuZHNXaXRoKFwiLnBkZlwiKSkge1xyXG4gICAgICAgIHRoaXMuZG93bmxvYWRGaWxlTmFtZSArPSBcIi5wZGZcIjtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJmZpbGVOYW1lPSR7dGhpcy5kb3dubG9hZEZpbGVOYW1lfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMub3BlbkZpbGUgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZvcGVuRmlsZT0ke3RoaXMub3BlbkZpbGV9YDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5kb3dubG9hZCAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJmRvd25sb2FkPSR7dGhpcy5kb3dubG9hZH1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuc3RhcnREb3dubG9hZCkge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnN0YXJ0RG93bmxvYWQ9JHt0aGlzLnN0YXJ0RG93bmxvYWR9YDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy52aWV3Qm9va21hcmsgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZ2aWV3Qm9va21hcms9JHt0aGlzLnZpZXdCb29rbWFya31gO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLnByaW50ICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmcHJpbnQ9JHt0aGlzLnByaW50fWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5zdGFydFByaW50KSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmc3RhcnRQcmludD0ke3RoaXMuc3RhcnRQcmludH1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmZ1bGxTY3JlZW4gIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZmdWxsU2NyZWVuPSR7dGhpcy5mdWxsU2NyZWVufWA7XHJcbiAgICB9XHJcbiAgICAvLyBpZiAodGhpcy5zaG93RnVsbFNjcmVlbikge1xyXG4gICAgLy8gICB0aGlzLnZpZXdlclVybCArPSBgJnNob3dGdWxsU2NyZWVuPSR7dGhpcy5zaG93RnVsbFNjcmVlbn1gO1xyXG4gICAgLy8gfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmZpbmQgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZmaW5kPSR7dGhpcy5maW5kfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5sYXN0UGFnZSkge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJmxhc3RwYWdlPSR7dGhpcy5sYXN0UGFnZX1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMucm90YXRlY3cpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZyb3RhdGVjdz0ke3RoaXMucm90YXRlY3d9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnJvdGF0ZWNjdykge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnJvdGF0ZWNjdz0ke3RoaXMucm90YXRlY2N3fWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5jdXJzb3IpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZjdXJzb3I9JHt0aGlzLmN1cnNvcn1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuc2Nyb2xsKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmc2Nyb2xsPSR7dGhpcy5zY3JvbGx9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnNwcmVhZCkge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnNwcmVhZD0ke3RoaXMuc3ByZWFkfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5sb2NhbGUpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZsb2NhbGU9JHt0aGlzLmxvY2FsZX1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMudXNlT25seUNzc1pvb20pIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZ1c2VPbmx5Q3NzWm9vbT0ke3RoaXMudXNlT25seUNzc1pvb219YDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5fcGFnZSB8fCB0aGlzLnpvb20gfHwgdGhpcy5uYW1lZGRlc3QgfHwgdGhpcy5wYWdlbW9kZSlcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gXCIjXCI7XHJcbiAgICBpZiAodGhpcy5fcGFnZSkge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnBhZ2U9JHt0aGlzLl9wYWdlfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy56b29tKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmem9vbT0ke3RoaXMuem9vbX1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMubmFtZWRkZXN0KSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmbmFtZWRkZXN0PSR7dGhpcy5uYW1lZGRlc3R9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnBhZ2Vtb2RlKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmcGFnZW1vZGU9JHt0aGlzLnBhZ2Vtb2RlfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5lcnJvck92ZXJyaWRlIHx8IHRoaXMuZXJyb3JBcHBlbmQpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZlcnJvck1lc3NhZ2U9JHt0aGlzLmVycm9yTWVzc2FnZX1gO1xyXG5cclxuICAgICAgaWYgKHRoaXMuZXJyb3JPdmVycmlkZSkge1xyXG4gICAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmZXJyb3JPdmVycmlkZT0ke3RoaXMuZXJyb3JPdmVycmlkZX1gO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLmVycm9yQXBwZW5kKSB7XHJcbiAgICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZlcnJvckFwcGVuZD0ke3RoaXMuZXJyb3JBcHBlbmR9YDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmV4dGVybmFsV2luZG93KSB7XHJcbiAgICAgIHRoaXMudmlld2VyVGFiLmxvY2F0aW9uLmhyZWYgPSB0aGlzLnZpZXdlclVybDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuaWZyYW1lUERGLm5hdGl2ZUVsZW1lbnQuc3JjID0gdGhpcy52aWV3ZXJVcmw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc29sZS5sb2coYFxyXG4gICAgICBwZGZTcmMgPSAke3RoaXMucGRmU3JjfVxyXG4gICAgICBmaWxlVXJsID0gJHtmaWxlVXJsfVxyXG4gICAgICBleHRlcm5hbFdpbmRvdyA9ICR7dGhpcy5leHRlcm5hbFdpbmRvd31cclxuICAgICAgZG93bmxvYWRGaWxlTmFtZSA9ICR7dGhpcy5kb3dubG9hZEZpbGVOYW1lfVxyXG4gICAgYCk7XHJcblxyXG4gICAgLy8gdmlld2VyRm9sZGVyID0gJHt0aGlzLnZpZXdlckZvbGRlcn1cclxuICAgIC8vIG9wZW5GaWxlID0gJHt0aGlzLm9wZW5GaWxlfVxyXG4gICAgLy8gZG93bmxvYWQgPSAke3RoaXMuZG93bmxvYWR9XHJcbiAgICAvLyBzdGFydERvd25sb2FkID0gJHt0aGlzLnN0YXJ0RG93bmxvYWR9XHJcbiAgICAvLyB2aWV3Qm9va21hcmsgPSAke3RoaXMudmlld0Jvb2ttYXJrfVxyXG4gICAgLy8gcHJpbnQgPSAke3RoaXMucHJpbnR9XHJcbiAgICAvLyBzdGFydFByaW50ID0gJHt0aGlzLnN0YXJ0UHJpbnR9XHJcbiAgICAvLyBmdWxsU2NyZWVuID0gJHt0aGlzLmZ1bGxTY3JlZW59XHJcbiAgICAvLyBmaW5kID0gJHt0aGlzLmZpbmR9XHJcbiAgICAvLyBsYXN0UGFnZSA9ICR7dGhpcy5sYXN0UGFnZX1cclxuICAgIC8vIHJvdGF0ZWN3ID0gJHt0aGlzLnJvdGF0ZWN3fVxyXG4gICAgLy8gcm90YXRlY2N3ID0gJHt0aGlzLnJvdGF0ZWNjd31cclxuICAgIC8vIGN1cnNvciA9ICR7dGhpcy5jdXJzb3J9XHJcbiAgICAvLyBzY3JvbGxNb2RlID0gJHt0aGlzLnNjcm9sbH1cclxuICAgIC8vIHNwcmVhZCA9ICR7dGhpcy5zcHJlYWR9XHJcbiAgICAvLyBwYWdlID0gJHt0aGlzLnBhZ2V9XHJcbiAgICAvLyB6b29tID0gJHt0aGlzLnpvb219XHJcbiAgICAvLyBuYW1lZGRlc3QgPSAke3RoaXMubmFtZWRkZXN0fVxyXG4gICAgLy8gcGFnZW1vZGUgPSAke3RoaXMucGFnZW1vZGV9XHJcbiAgICAvLyBwYWdlbW9kZSA9ICR7dGhpcy5lcnJvck92ZXJyaWRlfVxyXG4gICAgLy8gcGFnZW1vZGUgPSAke3RoaXMuZXJyb3JBcHBlbmR9XHJcbiAgICAvLyBwYWdlbW9kZSA9ICR7dGhpcy5lcnJvck1lc3NhZ2V9XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcclxuICAgIHRoaXMucmVsYXNlVXJsPy4oKTtcclxuICB9XHJcbn1cclxuIl19