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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsTUFBTSxFQUNOLFNBQVMsRUFDVCxZQUFZLEdBSWIsTUFBTSxlQUFlLENBQUM7O0FBMEt2QixNQUFNLE9BQU8sb0JBQW9CO0lBQ2EsV0FBVyxDQUFhO0lBQ3hCLFdBQVcsQ0FBYTtJQUN6QixVQUFVLENBQWE7SUFDeEIsU0FBUyxDQUFhO0lBQ2hELFFBQVEsQ0FBUztJQUN2QixhQUFhLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7SUFDdEQsWUFBWSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO0lBQ3JELGNBQWMsR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztJQUN2RCxZQUFZLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7SUFDL0MsWUFBWSxDQUFTO0lBQ3JCLGNBQWMsR0FBWSxLQUFLLENBQUM7SUFDaEMsV0FBVyxHQUFZLElBQUksQ0FBQztJQUM1QixnQkFBZ0IsQ0FBUztJQUN6QixRQUFRLEdBQVksSUFBSSxDQUFDO0lBQ3pCLFFBQVEsR0FBWSxJQUFJLENBQUM7SUFDekIsYUFBYSxDQUFVO0lBQ3ZCLFlBQVksR0FBWSxLQUFLLENBQUM7SUFDOUIsS0FBSyxHQUFZLElBQUksQ0FBQztJQUN0QixVQUFVLENBQVU7SUFDcEIsVUFBVSxHQUFZLElBQUksQ0FBQztJQUMzQywwQ0FBMEM7SUFDMUIsSUFBSSxHQUFZLElBQUksQ0FBQztJQUNyQixJQUFJLENBQVM7SUFDYixTQUFTLENBQVM7SUFDbEIsUUFBUSxDQUFTO0lBQ2pCLFFBQVEsQ0FBVTtJQUNsQixRQUFRLENBQVU7SUFDbEIsU0FBUyxDQUFVO0lBQ25CLE1BQU0sQ0FBUztJQUNmLE1BQU0sQ0FBUztJQUNmLE1B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LEtBQUs7Z0JBQ1UsYUFBYTtzQkFBNUIsS0FBSztnQkFDVSxZQUFZO3NCQUEzQixLQUFLO2dCQUNVLEtBQUs7c0JBQXBCLEtBQUs7Z0JBQ1UsVUFBVTtzQkFBekIsS0FBSztnQkFDVSxVQUFVO3NCQUF6QixLQUFLO2dCQUVVLElBQUk7c0JBQW5CLEtBQUs7Z0JBQ1UsSUFBSTtzQkFBbkIsS0FBSztnQkFDVSxTQUFTO3NCQUF4QixLQUFLO2dCQUNVLFFBQVE7c0JBQXZCLEtBQUs7Z0JBQ1UsUUFBUTtzQkFBdkIsS0FBSztnQkFDVSxRQUFRO3NCQUF2QixLQUFLO2dCQUNVLFNBQVM7c0JBQXhCLEtBQUs7Z0JBQ1UsTUFBTTtzQkFBckIsS0FBSztnQkFDVSxNQUFNO3NCQUFyQixLQUFLO2dCQUNVLE1BQU07c0JBQXJCLEtBQUs7Z0JBQ1UsTUFBTTtzQkFBckIsS0FBSztnQkFDVSxjQUFjO3NCQUE3QixLQUFLO2dCQUNVLGFBQWE7c0JBQTVCLEtBQUs7Z0JBQ1UsV0FBVztzQkFBMUIsS0FBSztnQkFDVSxZQUFZO3NCQUEzQixLQUFLO2dCQUNVLGNBQWM7c0JBQTdCLEtBQUs7Z0JBRVUscUJBQXFCO3NCQUFwQyxLQUFLO2dCQUtVLFdBQVc7c0JBQTFCLEtBQUs7Z0JBQ0ksU0FBUztzQkFBbEIsTUFBTTtnQkFLSSxJQUFJO3NCQURkLEtBQUs7Z0JBeUJLLE1BQU07c0JBRGhCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xyXG4gIENvbXBvbmVudCxcclxuICBJbnB1dCxcclxuICBPdXRwdXQsXHJcbiAgVmlld0NoaWxkLFxyXG4gIEV2ZW50RW1pdHRlcixcclxuICBFbGVtZW50UmVmLFxyXG4gIE9uRGVzdHJveSxcclxuICBPbkluaXQsXHJcbn0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiBcIm5nMi1wZGZqcy12aWV3ZXJcIixcclxuICB0ZW1wbGF0ZTogYFxyXG4gICAgPHN0eWxlPlxyXG4gICAgICAudG9vbGJhciB7XHJcbiAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgICAgIGxlZnQ6IDA7XHJcbiAgICAgICAgcmlnaHQ6IDA7XHJcbiAgICAgICAgei1pbmRleDogOTk5OTtcclxuICAgICAgICBjdXJzb3I6IGRlZmF1bHQ7XHJcbiAgICAgICAgZGlzcGxheTogbm9uZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgI3Rvb2xiYXJDb250YWluZXIge1xyXG4gICAgICAgIHdpZHRoOiAxMDAlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAjdG9vbGJhckNvbnRhaW5lciB7XHJcbiAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgICAgIGhlaWdodDogMzJweDtcclxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDc0NzQ3O1xyXG4gICAgICAgIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudChcclxuICAgICAgICAgIGhzbGEoMCwgMCUsIDMyJSwgMC45OSksXHJcbiAgICAgICAgICBoc2xhKDAsIDAlLCAyNyUsIDAuOTUpXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgI3Rvb2xiYXJWaWV3ZXIge1xyXG4gICAgICAgIGhlaWdodDogMzJweDtcclxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xyXG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XHJcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBmbGV4LWVuZDtcclxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBidXR0b24ge1xyXG4gICAgICAgIGJhY2tncm91bmQ6IG5vbmU7XHJcbiAgICAgICAgd2lkdGg6IDUzcHg7XHJcbiAgICAgICAgaGVpZ2h0OiAyNXB4O1xyXG4gICAgICAgIG1pbi13aWR0aDogMTZweDtcclxuICAgICAgICBwYWRkaW5nOiAycHggNnB4IDA7XHJcbiAgICAgICAgYm9yZGVyOiAxcHggc29saWQgdHJhbnNwYXJlbnQ7XHJcbiAgICAgICAgYm9yZGVyLXJhZGl1czogMnB4O1xyXG4gICAgICAgIGNvbG9yOiBoc2xhKDAsIDAlLCAxMDAlLCAwLjgpO1xyXG4gICAgICAgIGZvbnQtc2l6ZTogMTJweDtcclxuICAgICAgICBsaW5lLWhlaWdodDogMTRweDtcclxuICAgICAgICAtd2Via2l0LXVzZXItc2VsZWN0OiBub25lO1xyXG4gICAgICAgIC1tb3otdXNlci1zZWxlY3Q6IG5vbmU7XHJcbiAgICAgICAgLW1zLXVzZXItc2VsZWN0OiBub25lO1xyXG4gICAgICAgIHVzZXItc2VsZWN0OiBub25lO1xyXG4gICAgICAgIC8qIE9wZXJhIGRvZXMgbm90IHN1cHBvcnQgdXNlci1zZWxlY3QsIHVzZSA8Li4uIHVuc2VsZWN0YWJsZT1cIm9uXCI+IGluc3RlYWQgKi9cclxuICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XHJcbiAgICAgICAgdHJhbnNpdGlvbi1wcm9wZXJ0eTogYmFja2dyb3VuZC1jb2xvciwgYm9yZGVyLWNvbG9yLCBib3gtc2hhZG93O1xyXG4gICAgICAgIHRyYW5zaXRpb24tZHVyYXRpb246IDE1MG1zO1xyXG4gICAgICAgIHRyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uOiBlYXNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBidXR0b246aG92ZXIge1xyXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IGhzbGEoMCwgMCUsIDAlLCAwLjEyKTtcclxuICAgICAgICBiYWNrZ3JvdW5kLWltYWdlOiBsaW5lYXItZ3JhZGllbnQoXHJcbiAgICAgICAgICBoc2xhKDAsIDAlLCAxMDAlLCAwLjA1KSxcclxuICAgICAgICAgIGhzbGEoMCwgMCUsIDEwMCUsIDApXHJcbiAgICAgICAgKTtcclxuICAgICAgICBiYWNrZ3JvdW5kLWNsaXA6IHBhZGRpbmctYm94O1xyXG4gICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIGhzbGEoMCwgMCUsIDAlLCAwLjM1KTtcclxuICAgICAgICBib3JkZXItY29sb3I6IGhzbGEoMCwgMCUsIDAlLCAwLjMyKSBoc2xhKDAsIDAlLCAwJSwgMC4zOClcclxuICAgICAgICAgIGhzbGEoMCwgMCUsIDAlLCAwLjQyKTtcclxuICAgICAgICBib3gtc2hhZG93OiAwIDFweCAwIGhzbGEoMCwgMCUsIDEwMCUsIDAuMDUpIGluc2V0LFxyXG4gICAgICAgICAgMCAwIDFweCBoc2xhKDAsIDAlLCAxMDAlLCAwLjE1KSBpbnNldCwgMCAxcHggMCBoc2xhKDAsIDAlLCAxMDAlLCAwLjA1KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLmxvYWRpbmdTcGluIHtcclxuICAgICAgICBkaXNwbGF5OiBub25lO1xyXG4gICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICAgICAgICB0b3A6IDA7XHJcbiAgICAgICAgbGVmdDogMDtcclxuICAgICAgICB3aWR0aDogMTAwJTtcclxuICAgICAgICBoZWlnaHQ6IDEwMCU7XHJcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjI1KTtcclxuICAgICAgICB6LWluZGV4OiAxMDAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAubG9hZGVyIHtcclxuICAgICAgICB6LWluZGV4OiAxMDAxO1xyXG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgICAgICBsZWZ0OiA1MCU7XHJcbiAgICAgICAgdG9wOiA1MCU7XHJcbiAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XHJcbiAgICAgICAgYm9yZGVyOiAxNnB4IHNvbGlkICNmM2YzZjM7XHJcbiAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xyXG4gICAgICAgIGJvcmRlci10b3A6IDE2cHggc29saWQgIzM0OThkYjtcclxuICAgICAgICB3aWR0aDogMTIwcHg7XHJcbiAgICAgICAgaGVpZ2h0OiAxMjBweDtcclxuICAgICAgICAtd2Via2l0LWFuaW1hdGlvbjogc3BpbiAycyBsaW5lYXIgaW5maW5pdGU7IC8qIFNhZmFyaSAqL1xyXG4gICAgICAgIGFuaW1hdGlvbjogc3BpbiAycyBsaW5lYXIgaW5maW5pdGU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qIFNhZmFyaSAqL1xyXG4gICAgICBALXdlYmtpdC1rZXlmcmFtZXMgc3BpbiB7XHJcbiAgICAgICAgMCUge1xyXG4gICAgICAgICAgLXdlYmtpdC10cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgMTAwJSB7XHJcbiAgICAgICAgICAtd2Via2l0LXRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBAa2V5ZnJhbWVzIHNwaW4ge1xyXG4gICAgICAgIDAlIHtcclxuICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAxMDAlIHtcclxuICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICA8L3N0eWxlPlxyXG4gICAgPGRpdiAjdmlld1dvcmRCYXIgY2xhc3M9XCJ0b29sYmFyXCI+XHJcbiAgICAgIDxkaXYgaWQ9XCJ0b29sYmFyQ29udGFpbmVyXCI+XHJcbiAgICAgICAgPGRpdiBpZD1cInRvb2xiYXJWaWV3ZXJcIj5cclxuICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgaWQ9XCJkb3dubG9hZFwiXHJcbiAgICAgICAgICAgIChjbGljayk9XCJkb3dubG9hZFdvcmRGaWxlKClcIlxyXG4gICAgICAgICAgICBjbGFzcz1cInRvb2xiYXJCdXR0b24gZG93bmxvYWRcIlxyXG4gICAgICAgICAgICB0aXRsZT1cIkRvd25sb2FkXCJcclxuICAgICAgICAgICAgdGFiaW5kZXg9XCIzNFwiXHJcbiAgICAgICAgICAgIGRhdGEtbDEwbi1pZD1cImRvd25sb2FkXCJcclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgPGltZ1xyXG4gICAgICAgICAgICAgIHNyYz1cIi9hc3NldHMvcGRmanMvd2ViL2ltYWdlcy90b29sYmFyQnV0dG9uLWRvd25sb2FkLnBuZ1wiXHJcbiAgICAgICAgICAgICAgYWx0PVwiRG93bmxvYWRcIlxyXG4gICAgICAgICAgICAvPlxyXG4gICAgICAgICAgPC9idXR0b24+XHJcblxyXG4gICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICBpZD1cImNsb3NlRmlsZVwiXHJcbiAgICAgICAgICAgIChjbGljayk9XCJjbG9zZVdvcmRGaWxlKClcIlxyXG4gICAgICAgICAgICBjbGFzcz1cInRvb2xiYXJCdXR0b25cIlxyXG4gICAgICAgICAgICB0aXRsZT1cIkNsb3NlXCJcclxuICAgICAgICAgICAgdGFiaW5kZXg9XCIzNlwiXHJcbiAgICAgICAgICAgIGRhdGEtbDEwbi1pZD1cImNsb3NlRmlsZVwiXHJcbiAgICAgICAgICA+XHJcbiAgICAgICAgICAgIDxpbWcgc3JjPVwiL2Fzc2V0cy9wZGZqcy93ZWIvaW1hZ2VzL2Nsb3NlLWZpbGUucG5nXCIgYWx0PVwiQ2xvc2VcIiAvPlxyXG4gICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgICA8ZGl2ICNsb2FkaW5nU3BpbiBjbGFzcz1cImxvYWRpbmdTcGluXCI+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJsb2FkZXJcIj48L2Rpdj5cclxuICAgIDwvZGl2PlxyXG4gICAgPGlmcmFtZVxyXG4gICAgICBpZD1cImlmcmFtZURvY3hcIlxyXG4gICAgICAjaWZyYW1lRG9jeFxyXG4gICAgICB0aXRsZT1cIm5nMi1wZGZqcy12aWV3ZXJcIlxyXG4gICAgICBbaGlkZGVuXT1cImV4dGVybmFsV2luZG93IHx8ICghZXh0ZXJuYWxXaW5kb3cgJiYgIXBkZlNyYylcIlxyXG4gICAgICB3aWR0aD1cIjEwMCVcIlxyXG4gICAgICBoZWlnaHQ9XCIxMDAlXCJcclxuICAgID48L2lmcmFtZT5cclxuXHJcbiAgICA8aWZyYW1lXHJcbiAgICAgIGlkPVwiaWZyYW1lUERGXCJcclxuICAgICAgI2lmcmFtZVBERlxyXG4gICAgICB0aXRsZT1cIm5nMi1wZGZqcy12aWV3ZXJcIlxyXG4gICAgICBbaGlkZGVuXT1cImV4dGVybmFsV2luZG93IHx8ICghZXh0ZXJuYWxXaW5kb3cgJiYgIXBkZlNyYylcIlxyXG4gICAgICB3aWR0aD1cIjEwMCVcIlxyXG4gICAgICBoZWlnaHQ9XCIxMDAlXCJcclxuICAgID48L2lmcmFtZT5cclxuICBgLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgUGRmSnNWaWV3ZXJDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XHJcbiAgQFZpZXdDaGlsZChcInZpZXdXb3JkQmFyXCIsIHsgc3RhdGljOiB0cnVlIH0pIHZpZXdXb3JkQmFyOiBFbGVtZW50UmVmO1xyXG4gIEBWaWV3Q2hpbGQoXCJsb2FkaW5nU3BpblwiLCB7IHN0YXRpYzogdHJ1ZSB9KSBsb2FkaW5nU3BpbjogRWxlbWVudFJlZjtcclxuICBAVmlld0NoaWxkKFwiaWZyYW1lRG9jeFwiLCB7IHN0YXRpYzogdHJ1ZSB9KSBpZnJhbWVEb2N4OiBFbGVtZW50UmVmO1xyXG4gIEBWaWV3Q2hpbGQoXCJpZnJhbWVQREZcIiwgeyBzdGF0aWM6IHRydWUgfSkgaWZyYW1lUERGOiBFbGVtZW50UmVmO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyB2aWV3ZXJJZDogc3RyaW5nO1xyXG4gIEBPdXRwdXQoKSBvbkJlZm9yZVByaW50OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuICBAT3V0cHV0KCkgb25BZnRlclByaW50OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuICBAT3V0cHV0KCkgb25Eb2N1bWVudExvYWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG4gIEBPdXRwdXQoKSBvblBhZ2VDaGFuZ2U6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyB2aWV3ZXJGb2xkZXI6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgZXh0ZXJuYWxXaW5kb3c6IGJvb2xlYW4gPSBmYWxzZTtcclxuICBASW5wdXQoKSBwdWJsaWMgc2hvd1NwaW5uZXI6IGJvb2xlYW4gPSB0cnVlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBkb3dubG9hZEZpbGVOYW1lOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgcHVibGljIG9wZW5GaWxlOiBib29sZWFuID0gdHJ1ZTtcclxuICBASW5wdXQoKSBwdWJsaWMgZG93bmxvYWQ6IGJvb2xlYW4gPSB0cnVlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBzdGFydERvd25sb2FkOiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyB2aWV3Qm9va21hcms6IGJvb2xlYW4gPSBmYWxzZTtcclxuICBASW5wdXQoKSBwdWJsaWMgcHJpbnQ6IGJvb2xlYW4gPSB0cnVlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBzdGFydFByaW50OiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBmdWxsU2NyZWVuOiBib29sZWFuID0gdHJ1ZTtcclxuICAvL0BJbnB1dCgpIHB1YmxpYyBzaG93RnVsbFNjcmVlbjogYm9vbGVhbjtcclxuICBASW5wdXQoKSBwdWJsaWMgZmluZDogYm9vbGVhbiA9IHRydWU7XHJcbiAgQElucHV0KCkgcHVibGljIHpvb206IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgbmFtZWRkZXN0OiBzdHJpbmc7XHJcbiAgQElucHV0KCkgcHVibGljIHBhZ2Vtb2RlOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgcHVibGljIGxhc3RQYWdlOiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyByb3RhdGVjdzogYm9vbGVhbjtcclxuICBASW5wdXQoKSBwdWJsaWMgcm90YXRlY2N3OiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBjdXJzb3I6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgc2Nyb2xsOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgcHVibGljIHNwcmVhZDogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBsb2NhbGU6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgdXNlT25seUNzc1pvb206IGJvb2xlYW4gPSBmYWxzZTtcclxuICBASW5wdXQoKSBwdWJsaWMgZXJyb3JPdmVycmlkZTogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBlcnJvckFwcGVuZDogYm9vbGVhbiA9IHRydWU7XHJcbiAgQElucHV0KCkgcHVibGljIGVycm9yTWVzc2FnZTogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBkaWFnbm9zdGljTG9nczogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gIEBJbnB1dCgpIHB1YmxpYyBleHRlcm5hbFdpbmRvd09wdGlvbnM6IHN0cmluZztcclxuICBwdWJsaWMgdmlld2VyVGFiOiBhbnk7XHJcbiAgcHJpdmF0ZSBfc3JjOiBzdHJpbmcgfCBCbG9iIHwgVWludDhBcnJheTtcclxuICBwcml2YXRlIF9wYWdlOiBudW1iZXI7XHJcblxyXG4gIEBJbnB1dCgpIHB1YmxpYyBjbG9zZUJ1dHRvbjogYm9vbGVhbjtcclxuICBAT3V0cHV0KCkgY2xvc2VGaWxlOiBFdmVudEVtaXR0ZXI8Ym9vbGVhbj4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gIHZpZXdlclVybDtcclxuXHJcbiAgQElucHV0KClcclxuICBwdWJsaWMgc2V0IHBhZ2UoX3BhZ2U6IG51bWJlcikge1xyXG4gICAgdGhpcy5fcGFnZSA9IF9wYWdlO1xyXG4gICAgaWYgKHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24pIHtcclxuICAgICAgdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbi5wYWdlID0gdGhpcy5fcGFnZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICh0aGlzLmRpYWdub3N0aWNMb2dzKVxyXG4gICAgICAgIGNvbnNvbGUud2FybihcclxuICAgICAgICAgIFwiRG9jdW1lbnQgaXMgbm90IGxvYWRlZCB5ZXQhISEuIFRyeSB0byBzZXQgcGFnZSMgYWZ0ZXIgZnVsbCBsb2FkLiBJZ25vcmUgdGhpcyB3YXJuaW5nIGlmIHlvdSBhcmUgbm90IHNldHRpbmcgcGFnZSMgdXNpbmcgJy4nIG5vdGF0aW9uLiAoRS5nLiBwZGZWaWV3ZXIucGFnZSA9IDU7KVwiXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgcGFnZSgpIHtcclxuICAgIGlmICh0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uLnBhZ2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAodGhpcy5kaWFnbm9zdGljTG9ncylcclxuICAgICAgICBjb25zb2xlLndhcm4oXHJcbiAgICAgICAgICBcIkRvY3VtZW50IGlzIG5vdCBsb2FkZWQgeWV0ISEhLiBUcnkgdG8gcmV0cmlldmUgcGFnZSMgYWZ0ZXIgZnVsbCBsb2FkLlwiXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIEBJbnB1dCgpXHJcbiAgcHVibGljIHNldCBwZGZTcmMoX3NyYzogc3RyaW5nIHwgQmxvYiB8IFVpbnQ4QXJyYXkpIHtcclxuICAgIGlmICh0eXBlb2YgX3NyYyA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICB0aGlzLl9zcmMgPSBlbmNvZGVVUklDb21wb25lbnQoX3NyYyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLl9zcmMgPSBfc3JjO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBwZGZTcmMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3JjO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBQREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnMoKSB7XHJcbiAgICBsZXQgcGRmVmlld2VyT3B0aW9ucyA9IG51bGw7XHJcbiAgICBpZiAodGhpcy5leHRlcm5hbFdpbmRvdykge1xyXG4gICAgICBpZiAodGhpcy52aWV3ZXJUYWIpIHtcclxuICAgICAgICBwZGZWaWV3ZXJPcHRpb25zID0gdGhpcy52aWV3ZXJUYWIuUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAodGhpcy5pZnJhbWVQREYubmF0aXZlRWxlbWVudC5jb250ZW50V2luZG93KSB7XHJcbiAgICAgICAgcGRmVmlld2VyT3B0aW9ucyA9XHJcbiAgICAgICAgICB0aGlzLmlmcmFtZVBERi5uYXRpdmVFbGVtZW50LmNvbnRlbnRXaW5kb3dcclxuICAgICAgICAgICAgLlBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBkZlZpZXdlck9wdGlvbnM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IFBERlZpZXdlckFwcGxpY2F0aW9uKCkge1xyXG4gICAgbGV0IHBkZlZpZXdlciA9IG51bGw7XHJcbiAgICBpZiAodGhpcy5leHRlcm5hbFdpbmRvdykge1xyXG4gICAgICBpZiAodGhpcy52aWV3ZXJUYWIpIHtcclxuICAgICAgICBwZGZWaWV3ZXIgPSB0aGlzLnZpZXdlclRhYi5QREZWaWV3ZXJBcHBsaWNhdGlvbjtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMuaWZyYW1lUERGLm5hdGl2ZUVsZW1lbnQuY29udGVudFdpbmRvdykge1xyXG4gICAgICAgIHBkZlZpZXdlciA9XHJcbiAgICAgICAgICB0aGlzLmlmcmFtZVBERi5uYXRpdmVFbGVtZW50LmNvbnRlbnRXaW5kb3cuUERGVmlld2VyQXBwbGljYXRpb247XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBwZGZWaWV3ZXI7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVjZWl2ZU1lc3NhZ2Uodmlld2VyRXZlbnQpIHtcclxuICAgIGlmIChcclxuICAgICAgdmlld2VyRXZlbnQuZGF0YSAmJlxyXG4gICAgICB2aWV3ZXJFdmVudC5kYXRhLnZpZXdlcklkICYmXHJcbiAgICAgIHZpZXdlckV2ZW50LmRhdGEuZXZlbnRcclxuICAgICkge1xyXG4gICAgICBsZXQgdmlld2VySWQgPSB2aWV3ZXJFdmVudC5kYXRhLnZpZXdlcklkO1xyXG4gICAgICBsZXQgZXZlbnQgPSB2aWV3ZXJFdmVudC5kYXRhLmV2ZW50O1xyXG4gICAgICBsZXQgcGFyYW0gPSB2aWV3ZXJFdmVudC5kYXRhLnBhcmFtO1xyXG4gICAgICBpZiAodGhpcy52aWV3ZXJJZCA9PSB2aWV3ZXJJZCkge1xyXG4gICAgICAgIGlmICh0aGlzLm9uQmVmb3JlUHJpbnQgJiYgZXZlbnQgPT0gXCJiZWZvcmVQcmludFwiKSB7XHJcbiAgICAgICAgICB0aGlzLm9uQmVmb3JlUHJpbnQuZW1pdCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5vbkFmdGVyUHJpbnQgJiYgZXZlbnQgPT0gXCJhZnRlclByaW50XCIpIHtcclxuICAgICAgICAgIHRoaXMub25BZnRlclByaW50LmVtaXQoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMub25Eb2N1bWVudExvYWQgJiYgZXZlbnQgPT0gXCJwYWdlc0xvYWRlZFwiKSB7XHJcbiAgICAgICAgICB0aGlzLm9uRG9jdW1lbnRMb2FkLmVtaXQocGFyYW0pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5vblBhZ2VDaGFuZ2UgJiYgZXZlbnQgPT0gXCJwYWdlQ2hhbmdlXCIpIHtcclxuICAgICAgICAgIHRoaXMub25QYWdlQ2hhbmdlLmVtaXQocGFyYW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHZpZXdlckV2ZW50LmRhdGEgJiYgdmlld2VyRXZlbnQuZGF0YS5ldmVudCA9PT0gXCJjbG9zZWZpbGVcIikge1xyXG4gICAgICB0aGlzLmNsb3NlRmlsZS5lbWl0KHRydWUpO1xyXG4gICAgfSBlbHNlIGlmICh2aWV3ZXJFdmVudC5kYXRhICYmIHZpZXdlckV2ZW50LmRhdGEuZXZlbnQgPT09IFwibG9hZGVyRXJyb3JcIikge1xyXG4gICAgICB0aGlzLmxvYWRpbmdTcGluLm5hdGl2ZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxuICAgICAgdGhpcy5pZnJhbWVQREYubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcblxyXG4gICAgICBsZXQgdXJsID0gdGhpcy5nZXRVcmxGaWxlKCk7XHJcbiAgICAgIGxldCBleHQgPSB0aGlzLmdldEZpbGVFeHRlbnNpb24odXJsKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLmlzVmFsaWRGaWxlKGV4dCkpIHtcclxuICAgICAgICBjb25zdCBfdXJsRmlsZSA9IGRlY29kZVVSSUNvbXBvbmVudCh1cmwpO1xyXG4gICAgICAgIGNvbnN0IF9jaGVja0V4dFdpdGhvdXRQZGYgPSB0aGlzLmlzVmFsaWRGaWxlKFxyXG4gICAgICAgICAgdGhpcy5nZXRGaWxlRXh0ZW5zaW9uKF91cmxGaWxlLnNwbGl0KFwiLnBkZlwiKVswXSlcclxuICAgICAgICApO1xyXG4gICAgICAgIGlmIChfY2hlY2tFeHRXaXRob3V0UGRmKSB7XHJcbiAgICAgICAgICBfdXJsRmlsZS5yZXBsYWNlKFwiLnBkZlwiLCBcIlwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy52aWV3V29yZEJhci5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbiAgICAgICAgdGhpcy52aWV3ZXJVcmwgPSBgaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZ3ZpZXc/dXJsPSR7X3VybEZpbGV9JmVtYmVkZGVkPXRydWVgO1xyXG4gICAgICAgIHRoaXMuaWZyYW1lRG9jeC5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcblxyXG4gICAgICAgIGxldCBjb3VudFRpbWVsb2FkID0gMDtcclxuICAgICAgICBsZXQgY2hlY2tDb250ZW50ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICB0aGlzLmlmcmFtZURvY3gubmF0aXZlRWxlbWVudC5zcmMgPSB0aGlzLnZpZXdlclVybDtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgbGV0IGNvbnRlbnQgPVxyXG4gICAgICAgICAgICAgICAgdGhpcy5pZnJhbWVEb2N4Lm5hdGl2ZUVsZW1lbnQ/LmNvbnRlbnRXaW5kb3c/LmRvY3VtZW50Py5nZXRFbGVtZW50c0J5VGFnTmFtZShcclxuICAgICAgICAgICAgICAgICAgXCJib2R5XCJcclxuICAgICAgICAgICAgICAgIClbMF0/LmlubmVySFRNTDtcclxuICAgICAgICAgICAgICBpZiAoY29udGVudCAhPT0gXCJcIikge1xyXG4gICAgICAgICAgICAgICAgY2hlY2tDb250ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY291bnRUaW1lbG9hZCsrO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgMzAwMCAqIGNvdW50VGltZWxvYWQpO1xyXG4gICAgICAgICAgfSB3aGlsZSAoY291bnRUaW1lbG9hZCA9PT0gNCB8fCBjaGVja0NvbnRlbnQpO1xyXG5cclxuICAgICAgICAgIGlmICghY2hlY2tDb250ZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMudmlld2VyVXJsID0gYGh0dHBzOi8vdmlldy5vZmZpY2VhcHBzLmxpdmUuY29tL29wL2VtYmVkLmFzcHg/c3JjPSR7X3VybEZpbGV9YDtcclxuICAgICAgICAgICAgdGhpcy5pZnJhbWVEb2N4Lm5hdGl2ZUVsZW1lbnQuc3JjID0gdGhpcy52aWV3ZXJVcmw7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBhbGVydChcIkhp4buHbiB04bqhaSBjaMawYSB4ZW0gxJHGsOG7o2MgZmlsZSFcIik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5sb2FkaW5nU3Bpbi5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICB9LCAzMjAwICogY291bnRUaW1lbG9hZCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCLEkOG7i25oIGThuqFuZyBraMO0bmcgaOG7o3AgbOG7hyFcIik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGRvd25sb2FkRmlsZShibG9iVXJsLCBmaWxlbmFtZSkge1xyXG4gICAgdmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcclxuICAgIGlmICghYS5jbGljaykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Rvd25sb2FkTWFuYWdlcjogXCJhLmNsaWNrKClcIiBpcyBub3Qgc3VwcG9ydGVkLicpO1xyXG4gICAgfVxyXG4gICAgYS5ocmVmID0gYmxvYlVybDtcclxuICAgIGEudGFyZ2V0ID0gXCJfcGFyZW50XCI7XHJcbiAgICBpZiAoXCJkb3dubG9hZFwiIGluIGEpIHtcclxuICAgICAgYS5kb3dubG9hZCA9IGZpbGVuYW1lO1xyXG4gICAgfVxyXG4gICAgKGRvY3VtZW50LmJvZHkgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KS5hcHBlbmRDaGlsZChhKTtcclxuICAgIGEuY2xpY2soKTtcclxuICAgIGEucmVtb3ZlKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZG93bmxvYWRXb3JkRmlsZSgpIHtcclxuICAgIGNvbnNvbGUubG9nKFwiZG93bmxvYWQgZmlsZSFcIik7XHJcbiAgICBsZXQgdXJsID0gdGhpcy5nZXRVcmxGaWxlKCk7XHJcbiAgICB0aGlzLmRvd25sb2FkRmlsZSh1cmwsIFwidGVzdFwiKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBjbG9zZVdvcmRGaWxlKCkge1xyXG4gICAgY29uc29sZS5sb2coXCJjbG9zZSBGaWxlIVwiKTtcclxuICAgIHRoaXMuY2xvc2VGaWxlLmVtaXQodHJ1ZSk7XHJcbiAgfVxyXG5cclxuICBpc1ZhbGlkRmlsZShzdHIpIHtcclxuICAgIHN3aXRjaCAoc3RyLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgY2FzZSBcImRvY1wiOlxyXG4gICAgICBjYXNlIFwiZG9jeFwiOlxyXG4gICAgICBjYXNlIFwieGxzXCI6XHJcbiAgICAgIGNhc2UgXCJ4bHN4XCI6XHJcbiAgICAgIGNhc2UgXCJwcHR4XCI6XHJcbiAgICAgIGNhc2UgXCJwcHRcIjpcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIGdldFVybEZpbGUoKSB7XHJcbiAgICBpZiAodGhpcy5fc3JjIGluc3RhbmNlb2YgQmxvYikge1xyXG4gICAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KFVSTC5jcmVhdGVPYmplY3RVUkwodGhpcy5fc3JjKSk7XHJcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3NyYyBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcclxuICAgICAgbGV0IGJsb2IgPSBuZXcgQmxvYihbdGhpcy5fc3JjXSwgeyB0eXBlOiBcImFwcGxpY2F0aW9uL3BkZlwiIH0pO1xyXG4gICAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYikpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX3NyYztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGdldEZpbGVFeHRlbnNpb24oZmlsZW5hbWUpIHtcclxuICAgIC8vIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoZmlsZW5hbWUpLnNwbGl0KFwiL1wiKS5wb3AoKS5zcGxpdChcIi5cIikucG9wKCk7XHJcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGZpbGVuYW1lKS5zcGxpdChcIj9cIilbMF0uc3BsaXQoXCIuXCIpLnBvcCgpO1xyXG4gICAgLy8gY29uc3QgZXh0ID0gL14uK1xcLihbXi5dKykkLy5leGVjKGZpbGVuYW1lKTtcclxuICAgIC8vIHJldHVybiBleHQgPT0gbnVsbCA/IFwiXCIgOiBleHRbMV07XHJcbiAgfVxyXG5cclxuICBuZ09uSW5pdCgpOiB2b2lkIHtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCB0aGlzLnJlY2VpdmVNZXNzYWdlLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgIGlmICghdGhpcy5leHRlcm5hbFdpbmRvdykge1xyXG4gICAgICAvLyBMb2FkIHBkZiBmb3IgZW1iZWRkZWQgdmlld3NcclxuICAgICAgdGhpcy5sb2FkUGRmKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVmcmVzaCgpOiB2b2lkIHtcclxuICAgIC8vIE5lZWRzIHRvIGJlIGludm9rZWQgZm9yIGV4dGVybmFsIHdpbmRvdyBvciB3aGVuIG5lZWRzIHRvIHJlbG9hZCBwZGZcclxuICAgIHRoaXMubG9hZFBkZigpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZWxhc2VVcmw/OiAoKSA9PiB2b2lkOyAvLyBBdm9pZCBtZW1vcnkgbGVhc2sgd2l0aCBgVVJMLmNyZWF0ZU9iamVjdFVSTGBcclxuXHJcbiAgcHJpdmF0ZSBsb2FkUGRmKCkge1xyXG4gICAgaWYgKCF0aGlzLl9zcmMpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy52aWV3ZXJVcmwgPSBcIlwiO1xyXG4gICAgdGhpcy52aWV3V29yZEJhci5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgIC8vIGNvbnNvbGUubG9nKGBUYWIgaXMgLSAke3RoaXMudmlld2VyVGFifWApO1xyXG4gICAgLy8gaWYgKHRoaXMudmlld2VyVGFiKSB7XHJcbiAgICAvLyAgIGNvbnNvbGUubG9nKGBTdGF0dXMgb2Ygd2luZG93IC0gJHt0aGlzLnZpZXdlclRhYi5jbG9zZWR9YCk7XHJcbiAgICAvLyB9XHJcblxyXG4gICAgdGhpcy5pZnJhbWVEb2N4Lm5hdGl2ZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG5cclxuICAgIGlmIChcclxuICAgICAgdGhpcy5leHRlcm5hbFdpbmRvdyAmJlxyXG4gICAgICAodHlwZW9mIHRoaXMudmlld2VyVGFiID09PSBcInVuZGVmaW5lZFwiIHx8IHRoaXMudmlld2VyVGFiLmNsb3NlZClcclxuICAgICkge1xyXG4gICAgICB0aGlzLnZpZXdlclRhYiA9IHdpbmRvdy5vcGVuKFxyXG4gICAgICAgIFwiXCIsXHJcbiAgICAgICAgXCJfYmxhbmtcIixcclxuICAgICAgICB0aGlzLmV4dGVybmFsV2luZG93T3B0aW9ucyB8fCBcIlwiXHJcbiAgICAgICk7XHJcbiAgICAgIGlmICh0aGlzLnZpZXdlclRhYiA9PSBudWxsKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGlhZ25vc3RpY0xvZ3MpXHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFxyXG4gICAgICAgICAgICBcIm5nMi1wZGZqcy12aWV3ZXI6IEZvciAnZXh0ZXJuYWxXaW5kb3cgPSB0cnVlJy4gaS5lIG9wZW5pbmcgaW4gbmV3IHRhYiB0byB3b3JrLCBwb3AtdXBzIHNob3VsZCBiZSBlbmFibGVkLlwiXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMuc2hvd1NwaW5uZXIpIHtcclxuICAgICAgICB0aGlzLnZpZXdlclRhYi5kb2N1bWVudC53cml0ZShgXHJcbiAgICAgICAgICA8c3R5bGU+XHJcbiAgICAgICAgICAubG9hZGVyIHtcclxuICAgICAgICAgICAgcG9zaXRpb246IGZpeGVkO1xyXG4gICAgICAgICAgICBsZWZ0OiA0MCU7XHJcbiAgICAgICAgICAgIHRvcDogNDAlO1xyXG4gICAgICAgICAgICBib3JkZXI6IDE2cHggc29saWQgI2YzZjNmMztcclxuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xyXG4gICAgICAgICAgICBib3JkZXItdG9wOiAxNnB4IHNvbGlkICMzNDk4ZGI7XHJcbiAgICAgICAgICAgIHdpZHRoOiAxMjBweDtcclxuICAgICAgICAgICAgaGVpZ2h0OiAxMjBweDtcclxuICAgICAgICAgICAgYW5pbWF0aW9uOiBzcGluIDJzIGxpbmVhciBpbmZpbml0ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIEBrZXlmcmFtZXMgc3BpbiB7XHJcbiAgICAgICAgICAgIDAlIHtcclxuICAgICAgICAgICAgICB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAxMDAlIHtcclxuICAgICAgICAgICAgICB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICA8L3N0eWxlPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImxvYWRlclwiPjwvZGl2PlxyXG4gICAgICAgIGApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGZpbGVVcmwgPSB0aGlzLmdldFVybEZpbGUoKTtcclxuICAgIC8vIGxldCB0aGlzLnZpZXdlclVybDtcclxuICAgIGlmICh0aGlzLnZpZXdlckZvbGRlcikge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCA9IGAke3RoaXMudmlld2VyRm9sZGVyfS93ZWIvdmlld2VyLmh0bWxgO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgPSBgYXNzZXRzL3BkZmpzL3dlYi92aWV3ZXIuaHRtbGA7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy52aWV3ZXJVcmwgKz0gYD9maWxlPSR7ZmlsZVVybH1gO1xyXG5cclxuICAgIGlmICh0eXBlb2YgdGhpcy52aWV3ZXJJZCAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnZpZXdlcklkPSR7dGhpcy52aWV3ZXJJZH1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uQmVmb3JlUHJpbnQgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZiZWZvcmVQcmludD10cnVlYDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5vbkFmdGVyUHJpbnQgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZhZnRlclByaW50PXRydWVgO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uRG9jdW1lbnRMb2FkICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmcGFnZXNMb2FkZWQ9dHJ1ZWA7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMub25QYWdlQ2hhbmdlICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmcGFnZUNoYW5nZT10cnVlYDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5jbG9zZUJ1dHRvbiAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJmNsb3NlRmlsZT0ke3RoaXMuY2xvc2VCdXR0b259YDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5kb3dubG9hZEZpbGVOYW1lKSB7XHJcbiAgICAgIGlmICghdGhpcy5kb3dubG9hZEZpbGVOYW1lLmVuZHNXaXRoKFwiLnBkZlwiKSkge1xyXG4gICAgICAgIHRoaXMuZG93bmxvYWRGaWxlTmFtZSArPSBcIi5wZGZcIjtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJmZpbGVOYW1lPSR7dGhpcy5kb3dubG9hZEZpbGVOYW1lfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMub3BlbkZpbGUgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZvcGVuRmlsZT0ke3RoaXMub3BlbkZpbGV9YDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5kb3dubG9hZCAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJmRvd25sb2FkPSR7dGhpcy5kb3dubG9hZH1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuc3RhcnREb3dubG9hZCkge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnN0YXJ0RG93bmxvYWQ9JHt0aGlzLnN0YXJ0RG93bmxvYWR9YDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy52aWV3Qm9va21hcmsgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZ2aWV3Qm9va21hcms9JHt0aGlzLnZpZXdCb29rbWFya31gO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLnByaW50ICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmcHJpbnQ9JHt0aGlzLnByaW50fWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5zdGFydFByaW50KSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmc3RhcnRQcmludD0ke3RoaXMuc3RhcnRQcmludH1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmZ1bGxTY3JlZW4gIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZmdWxsU2NyZWVuPSR7dGhpcy5mdWxsU2NyZWVufWA7XHJcbiAgICB9XHJcbiAgICAvLyBpZiAodGhpcy5zaG93RnVsbFNjcmVlbikge1xyXG4gICAgLy8gICB0aGlzLnZpZXdlclVybCArPSBgJnNob3dGdWxsU2NyZWVuPSR7dGhpcy5zaG93RnVsbFNjcmVlbn1gO1xyXG4gICAgLy8gfVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmZpbmQgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZmaW5kPSR7dGhpcy5maW5kfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5sYXN0UGFnZSkge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJmxhc3RwYWdlPSR7dGhpcy5sYXN0UGFnZX1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMucm90YXRlY3cpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZyb3RhdGVjdz0ke3RoaXMucm90YXRlY3d9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnJvdGF0ZWNjdykge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnJvdGF0ZWNjdz0ke3RoaXMucm90YXRlY2N3fWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5jdXJzb3IpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZjdXJzb3I9JHt0aGlzLmN1cnNvcn1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuc2Nyb2xsKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmc2Nyb2xsPSR7dGhpcy5zY3JvbGx9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnNwcmVhZCkge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnNwcmVhZD0ke3RoaXMuc3ByZWFkfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5sb2NhbGUpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZsb2NhbGU9JHt0aGlzLmxvY2FsZX1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMudXNlT25seUNzc1pvb20pIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZ1c2VPbmx5Q3NzWm9vbT0ke3RoaXMudXNlT25seUNzc1pvb219YDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5fcGFnZSB8fCB0aGlzLnpvb20gfHwgdGhpcy5uYW1lZGRlc3QgfHwgdGhpcy5wYWdlbW9kZSlcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gXCIjXCI7XHJcbiAgICBpZiAodGhpcy5fcGFnZSkge1xyXG4gICAgICB0aGlzLnZpZXdlclVybCArPSBgJnBhZ2U9JHt0aGlzLl9wYWdlfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy56b29tKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmem9vbT0ke3RoaXMuem9vbX1gO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMubmFtZWRkZXN0KSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmbmFtZWRkZXN0PSR7dGhpcy5uYW1lZGRlc3R9YDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnBhZ2Vtb2RlKSB7XHJcbiAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmcGFnZW1vZGU9JHt0aGlzLnBhZ2Vtb2RlfWA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5lcnJvck92ZXJyaWRlIHx8IHRoaXMuZXJyb3JBcHBlbmQpIHtcclxuICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZlcnJvck1lc3NhZ2U9JHt0aGlzLmVycm9yTWVzc2FnZX1gO1xyXG5cclxuICAgICAgaWYgKHRoaXMuZXJyb3JPdmVycmlkZSkge1xyXG4gICAgICAgIHRoaXMudmlld2VyVXJsICs9IGAmZXJyb3JPdmVycmlkZT0ke3RoaXMuZXJyb3JPdmVycmlkZX1gO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLmVycm9yQXBwZW5kKSB7XHJcbiAgICAgICAgdGhpcy52aWV3ZXJVcmwgKz0gYCZlcnJvckFwcGVuZD0ke3RoaXMuZXJyb3JBcHBlbmR9YDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmV4dGVybmFsV2luZG93KSB7XHJcbiAgICAgIHRoaXMudmlld2VyVGFiLmxvY2F0aW9uLmhyZWYgPSB0aGlzLnZpZXdlclVybDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuaWZyYW1lUERGLm5hdGl2ZUVsZW1lbnQuc3JjID0gdGhpcy52aWV3ZXJVcmw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc29sZS5sb2coYFxyXG4gICAgICBwZGZTcmMgPSAke3RoaXMucGRmU3JjfVxyXG4gICAgICBmaWxlVXJsID0gJHtmaWxlVXJsfVxyXG4gICAgICBleHRlcm5hbFdpbmRvdyA9ICR7dGhpcy5leHRlcm5hbFdpbmRvd31cclxuICAgICAgZG93bmxvYWRGaWxlTmFtZSA9ICR7dGhpcy5kb3dubG9hZEZpbGVOYW1lfVxyXG4gICAgYCk7XHJcblxyXG4gICAgLy8gdmlld2VyRm9sZGVyID0gJHt0aGlzLnZpZXdlckZvbGRlcn1cclxuICAgIC8vIG9wZW5GaWxlID0gJHt0aGlzLm9wZW5GaWxlfVxyXG4gICAgLy8gZG93bmxvYWQgPSAke3RoaXMuZG93bmxvYWR9XHJcbiAgICAvLyBzdGFydERvd25sb2FkID0gJHt0aGlzLnN0YXJ0RG93bmxvYWR9XHJcbiAgICAvLyB2aWV3Qm9va21hcmsgPSAke3RoaXMudmlld0Jvb2ttYXJrfVxyXG4gICAgLy8gcHJpbnQgPSAke3RoaXMucHJpbnR9XHJcbiAgICAvLyBzdGFydFByaW50ID0gJHt0aGlzLnN0YXJ0UHJpbnR9XHJcbiAgICAvLyBmdWxsU2NyZWVuID0gJHt0aGlzLmZ1bGxTY3JlZW59XHJcbiAgICAvLyBmaW5kID0gJHt0aGlzLmZpbmR9XHJcbiAgICAvLyBsYXN0UGFnZSA9ICR7dGhpcy5sYXN0UGFnZX1cclxuICAgIC8vIHJvdGF0ZWN3ID0gJHt0aGlzLnJvdGF0ZWN3fVxyXG4gICAgLy8gcm90YXRlY2N3ID0gJHt0aGlzLnJvdGF0ZWNjd31cclxuICAgIC8vIGN1cnNvciA9ICR7dGhpcy5jdXJzb3J9XHJcbiAgICAvLyBzY3JvbGxNb2RlID0gJHt0aGlzLnNjcm9sbH1cclxuICAgIC8vIHNwcmVhZCA9ICR7dGhpcy5zcHJlYWR9XHJcbiAgICAvLyBwYWdlID0gJHt0aGlzLnBhZ2V9XHJcbiAgICAvLyB6b29tID0gJHt0aGlzLnpvb219XHJcbiAgICAvLyBuYW1lZGRlc3QgPSAke3RoaXMubmFtZWRkZXN0fVxyXG4gICAgLy8gcGFnZW1vZGUgPSAke3RoaXMucGFnZW1vZGV9XHJcbiAgICAvLyBwYWdlbW9kZSA9ICR7dGhpcy5lcnJvck92ZXJyaWRlfVxyXG4gICAgLy8gcGFnZW1vZGUgPSAke3RoaXMuZXJyb3JBcHBlbmR9XHJcbiAgICAvLyBwYWdlbW9kZSA9ICR7dGhpcy5lcnJvck1lc3NhZ2V9XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcclxuICAgIHRoaXMucmVsYXNlVXJsPy4oKTtcclxuICB9XHJcbn1cclxuIl19