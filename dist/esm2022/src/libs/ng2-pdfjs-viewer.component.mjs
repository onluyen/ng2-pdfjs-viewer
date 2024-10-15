import { Component, Input, Output, ViewChild, EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
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
                this.iframeDocx.nativeElement.style.display = "block";
                this.viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${_urlFile}`;
                this.iframeDocx.nativeElement.src = this.viewerUrl;
                this.iframeDocx.nativeElement.addEventListener("load", () => {
                    const content = this.iframeDocx.nativeElement?.contentWindow?.document?.body?.innerHTML;
                    console.log("content: " + content);
                    if (!content) {
                        this.viewerUrl = `https://docs.google.com/gview?url=${_urlFile}&embedded=true`;
                        this.iframeDocx.nativeElement.src = this.viewerUrl;
                    }
                    setTimeout(() => {
                        if (this.loadingSpin && this.loadingSpin.nativeElement) {
                            this.loadingSpin.nativeElement.style.display = "none";
                        }
                    }, 1000);
                });
                // setTimeout(() => {
                // 	if (this.loadingSpin && this.loadingSpin.nativeElement) {
                // 		this.loadingSpin.nativeElement.style.display = "none";
                // 	}
                // }, 3000);
            }
            else {
                console.log("Định dạng không hợp lệ!");
            }
        }
    }
    downloadFile() {
        let url = this.getUrlFile();
        if (url) {
            fetch(url).then((t) => {
                return t.blob().then((b) => {
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(b);
                    a.setAttribute("download", this.downloadFileName ? `${this.downloadFileName}.${this.getFileExtension(url)}` : `download_file.${this.getFileExtension(url)}`);
                    a.click();
                    a.remove();
                });
            });
        }
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
        let ext = decodeURIComponent(filename).split("?")[0].split(".").pop();
        if (!ext) {
            ext = decodeURIComponent(filename).split("/").pop().split(".").pop();
        }
        // return decodeURIComponent(filename).split("/").pop().split(".").pop();
        // return decodeURIComponent(filename).split("?")[0].split(".").pop();
        // const ext = /^.+\.([^.]+)$/.exec(filename);
        // return ext == null ? "" : ext[1];
        console.log("ext: " + ext);
        return ext;
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
        if (this.externalWindow && (typeof this.viewerTab === "undefined" || this.viewerTab.closed)) {
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
            // if (!this.downloadFileName.endsWith(".pdf")) {
            // 	this.downloadFileName += ".pdf";
            // }
            this.viewerUrl += `&fileName=${this.downloadFileName}.pdf`;
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
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.12", type: PdfJsViewerComponent, selector: "ng2-pdfjs-viewer", inputs: { viewerId: "viewerId", viewerFolder: "viewerFolder", externalWindow: "externalWindow", showSpinner: "showSpinner", downloadFileName: "downloadFileName", openFile: "openFile", download: "download", startDownload: "startDownload", viewBookmark: "viewBookmark", print: "print", startPrint: "startPrint", fullScreen: "fullScreen", find: "find", zoom: "zoom", nameddest: "nameddest", pagemode: "pagemode", lastPage: "lastPage", rotatecw: "rotatecw", rotateccw: "rotateccw", cursor: "cursor", scroll: "scroll", spread: "spread", locale: "locale", useOnlyCssZoom: "useOnlyCssZoom", errorOverride: "errorOverride", errorAppend: "errorAppend", errorMessage: "errorMessage", diagnosticLogs: "diagnosticLogs", externalWindowOptions: "externalWindowOptions", closeButton: "closeButton", page: "page", pdfSrc: "pdfSrc" }, outputs: { onBeforePrint: "onBeforePrint", onAfterPrint: "onAfterPrint", onDocumentLoad: "onDocumentLoad", onPageChange: "onPageChange", closeFile: "closeFile" }, viewQueries: [{ propertyName: "viewWordBar", first: true, predicate: ["viewWordBar"], descendants: true, static: true }, { propertyName: "loadingSpin", first: true, predicate: ["loadingSpin"], descendants: true, static: true }, { propertyName: "iframeDocx", first: true, predicate: ["iframeDocx"], descendants: true, static: true }, { propertyName: "iframePDF", first: true, predicate: ["iframePDF"], descendants: true, static: true }], ngImport: i0, template: "<div #viewWordBar class=\"toolbar\">\r\n\t<div id=\"toolbarContainer\">\r\n\t\t<div id=\"toolbarViewer\">\r\n\t\t\t<button id=\"download\" (click)=\"downloadFile()\" class=\"toolbarButton download\" title=\"Download\" tabindex=\"34\" data-l10n-id=\"download\">\r\n\t\t\t\t<img src=\"/assets/pdfjs/web/images/toolbarButton-download.png\" alt=\"Download\" />\r\n\t\t\t</button>\r\n\r\n\t\t\t<button *ngIf=\"closeButton\" id=\"closeFile\" (click)=\"closeWordFile()\" class=\"toolbarButton\" title=\"Close\" tabindex=\"36\" data-l10n-id=\"closeFile\">\r\n\t\t\t\t<img src=\"/assets/pdfjs/web/images/close-file.png\" alt=\"Close\" />\r\n\t\t\t</button>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n<div #loadingSpin class=\"loadingSpin\">\r\n\t<div class=\"loader\"></div>\r\n</div>\r\n<iframe id=\"iframeDocx\" #iframeDocx title=\"ng2-pdfjs-viewer\" [hidden]=\"externalWindow || (!externalWindow && !pdfSrc)\" width=\"100%\" height=\"100%\"></iframe>\r\n\r\n<iframe id=\"iframePDF\" #iframePDF title=\"ng2-pdfjs-viewer\" [hidden]=\"externalWindow || (!externalWindow && !pdfSrc)\" width=\"100%\" height=\"100%\"></iframe>\r\n", styles: [".toolbar{position:relative;left:0;right:0;z-index:9999;cursor:default;display:none}#toolbarContainer{width:100%}#toolbarContainer{position:relative;height:32px;background-color:#474747;background-image:linear-gradient(#525252fc,#454545f2)}#toolbarViewer{height:32px;display:flex;flex-direction:row;justify-content:flex-end;align-items:center}button{background:none;width:53px;height:25px;min-width:16px;padding:2px 6px 0;border:1px solid transparent;border-radius:2px;color:#fffc;font-size:12px;line-height:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer;transition-property:background-color,border-color,box-shadow;transition-duration:.15s;transition-timing-function:ease}button:hover{background-color:#0000001f;background-image:linear-gradient(#ffffff0d,#fff0);background-clip:padding-box;border:1px solid hsla(0,0%,0%,.35);border-color:hsla(0,0%,0%,.32) hsla(0,0%,0%,.38) hsla(0,0%,0%,.42);box-shadow:0 1px #ffffff0d inset,0 0 1px #ffffff26 inset,0 1px #ffffff0d}.loadingSpin{display:none;position:absolute;top:0;left:0;width:100%;height:100%;background-color:#fff;z-index:1000}.loader{z-index:1001;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border:16px solid #f3f3f3;border-radius:50%;border-top:16px solid #3498db;width:120px;height:120px;-webkit-animation:spin 2s linear infinite;animation:spin 2s linear infinite}@-webkit-keyframes spin{0%{-webkit-transform:rotate(0deg)}to{-webkit-transform:rotate(360deg)}}@keyframes spin{0%{transform:rotate(0)}to{transform:rotate(360deg)}}\n"], dependencies: [{ kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfJsViewerComponent, decorators: [{
            type: Component,
            args: [{ selector: "ng2-pdfjs-viewer", template: "<div #viewWordBar class=\"toolbar\">\r\n\t<div id=\"toolbarContainer\">\r\n\t\t<div id=\"toolbarViewer\">\r\n\t\t\t<button id=\"download\" (click)=\"downloadFile()\" class=\"toolbarButton download\" title=\"Download\" tabindex=\"34\" data-l10n-id=\"download\">\r\n\t\t\t\t<img src=\"/assets/pdfjs/web/images/toolbarButton-download.png\" alt=\"Download\" />\r\n\t\t\t</button>\r\n\r\n\t\t\t<button *ngIf=\"closeButton\" id=\"closeFile\" (click)=\"closeWordFile()\" class=\"toolbarButton\" title=\"Close\" tabindex=\"36\" data-l10n-id=\"closeFile\">\r\n\t\t\t\t<img src=\"/assets/pdfjs/web/images/close-file.png\" alt=\"Close\" />\r\n\t\t\t</button>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n<div #loadingSpin class=\"loadingSpin\">\r\n\t<div class=\"loader\"></div>\r\n</div>\r\n<iframe id=\"iframeDocx\" #iframeDocx title=\"ng2-pdfjs-viewer\" [hidden]=\"externalWindow || (!externalWindow && !pdfSrc)\" width=\"100%\" height=\"100%\"></iframe>\r\n\r\n<iframe id=\"iframePDF\" #iframePDF title=\"ng2-pdfjs-viewer\" [hidden]=\"externalWindow || (!externalWindow && !pdfSrc)\" width=\"100%\" height=\"100%\"></iframe>\r\n", styles: [".toolbar{position:relative;left:0;right:0;z-index:9999;cursor:default;display:none}#toolbarContainer{width:100%}#toolbarContainer{position:relative;height:32px;background-color:#474747;background-image:linear-gradient(#525252fc,#454545f2)}#toolbarViewer{height:32px;display:flex;flex-direction:row;justify-content:flex-end;align-items:center}button{background:none;width:53px;height:25px;min-width:16px;padding:2px 6px 0;border:1px solid transparent;border-radius:2px;color:#fffc;font-size:12px;line-height:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer;transition-property:background-color,border-color,box-shadow;transition-duration:.15s;transition-timing-function:ease}button:hover{background-color:#0000001f;background-image:linear-gradient(#ffffff0d,#fff0);background-clip:padding-box;border:1px solid hsla(0,0%,0%,.35);border-color:hsla(0,0%,0%,.32) hsla(0,0%,0%,.38) hsla(0,0%,0%,.42);box-shadow:0 1px #ffffff0d inset,0 0 1px #ffffff26 inset,0 1px #ffffff0d}.loadingSpin{display:none;position:absolute;top:0;left:0;width:100%;height:100%;background-color:#fff;z-index:1000}.loader{z-index:1001;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border:16px solid #f3f3f3;border-radius:50%;border-top:16px solid #3498db;width:120px;height:120px;-webkit-animation:spin 2s linear infinite;animation:spin 2s linear infinite}@-webkit-keyframes spin{0%{-webkit-transform:rotate(0deg)}to{-webkit-transform:rotate(360deg)}}@keyframes spin{0%{transform:rotate(0)}to{transform:rotate(360deg)}}\n"] }]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGlicy9uZzItcGRmanMtdmlld2VyLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uL3NyYy9saWJzL25nMi1wZGZqcy12aWV3ZXIuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQWlDLE1BQU0sZUFBZSxDQUFDOzs7QUFPakgsTUFBTSxPQUFPLG9CQUFvQjtJQUNZLFdBQVcsQ0FBYTtJQUN4QixXQUFXLENBQWE7SUFDekIsVUFBVSxDQUFhO0lBQ3hCLFNBQVMsQ0FBYTtJQUNoRCxRQUFRLENBQVM7SUFDdkIsYUFBYSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO0lBQ3RELFlBQVksR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztJQUNyRCxjQUFjLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7SUFDdkQsWUFBWSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO0lBQy9DLFlBQVksQ0FBUztJQUNyQixjQUFjLEdBQVksS0FBSyxDQUFDO0lBQ2hDLFdBQVcsR0FBWSxJQUFJLENBQUM7SUFDNUIsZ0JBQWdCLENBQVM7SUFDekIsUUFBUSxHQUFZLElBQUksQ0FBQztJQUN6QixRQUFRLEdBQVksSUFBSSxDQUFDO0lBQ3pCLGFBQWEsQ0FBVTtJQUN2QixZQUFZLEdBQVksS0FBSyxDQUFDO0lBQzlCLEtBQUssR0FBWSxJQUFJLENBQUM7SUFDdEIsVUFBVSxDQUFVO0lBQ3BCLFVBQVUsR0FBWSxJQUFJLENBQUM7SUFDM0MsMENBQTBDO0lBQzFCLElBQUksR0FBWSxJQUFJLENBQUM7SUFDckIsSUFBSSxDQUFTO0lBQ2IsU0FBUyxDQUFTO0lBQ2xCLFFBQVEsQ0FBUztJQUNqQixRQUFRLENBQVU7SUFDbEIs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Z0JBQ1UsTUFBTTtzQkFBckIsS0FBSztnQkFDVSxNQUFNO3NCQUFyQixLQUFLO2dCQUNVLE1BQU07c0JBQXJCLEtBQUs7Z0JBQ1UsY0FBYztzQkFBN0IsS0FBSztnQkFDVSxhQUFhO3NCQUE1QixLQUFLO2dCQUNVLFdBQVc7c0JBQTFCLEtBQUs7Z0JBQ1UsWUFBWTtzQkFBM0IsS0FBSztnQkFDVSxjQUFjO3NCQUE3QixLQUFLO2dCQUVVLHFCQUFxQjtzQkFBcEMsS0FBSztnQkFLVSxXQUFXO3NCQUExQixLQUFLO2dCQUNJLFNBQVM7c0JBQWxCLE1BQU07Z0JBS0ksSUFBSTtzQkFEZCxLQUFLO2dCQXNCSyxNQUFNO3NCQURoQixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgT3V0cHV0LCBWaWV3Q2hpbGQsIEV2ZW50RW1pdHRlciwgRWxlbWVudFJlZiwgT25EZXN0cm95LCBPbkluaXQgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5cclxuQENvbXBvbmVudCh7XHJcblx0c2VsZWN0b3I6IFwibmcyLXBkZmpzLXZpZXdlclwiLFxyXG5cdHRlbXBsYXRlVXJsOiBcIi4vbmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQuaHRtbFwiLFxyXG5cdHN0eWxlVXJsczogW1wiLi9uZzItcGRmanMtdmlld2VyLmNvbXBvbmVudC5zY3NzXCJdLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgUGRmSnNWaWV3ZXJDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XHJcblx0QFZpZXdDaGlsZChcInZpZXdXb3JkQmFyXCIsIHsgc3RhdGljOiB0cnVlIH0pIHZpZXdXb3JkQmFyOiBFbGVtZW50UmVmO1xyXG5cdEBWaWV3Q2hpbGQoXCJsb2FkaW5nU3BpblwiLCB7IHN0YXRpYzogdHJ1ZSB9KSBsb2FkaW5nU3BpbjogRWxlbWVudFJlZjtcclxuXHRAVmlld0NoaWxkKFwiaWZyYW1lRG9jeFwiLCB7IHN0YXRpYzogdHJ1ZSB9KSBpZnJhbWVEb2N4OiBFbGVtZW50UmVmO1xyXG5cdEBWaWV3Q2hpbGQoXCJpZnJhbWVQREZcIiwgeyBzdGF0aWM6IHRydWUgfSkgaWZyYW1lUERGOiBFbGVtZW50UmVmO1xyXG5cdEBJbnB1dCgpIHB1YmxpYyB2aWV3ZXJJZDogc3RyaW5nO1xyXG5cdEBPdXRwdXQoKSBvbkJlZm9yZVByaW50OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHRAT3V0cHV0KCkgb25BZnRlclByaW50OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHRAT3V0cHV0KCkgb25Eb2N1bWVudExvYWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cdEBPdXRwdXQoKSBvblBhZ2VDaGFuZ2U6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cdEBJbnB1dCgpIHB1YmxpYyB2aWV3ZXJGb2xkZXI6IHN0cmluZztcclxuXHRASW5wdXQoKSBwdWJsaWMgZXh0ZXJuYWxXaW5kb3c6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHRASW5wdXQoKSBwdWJsaWMgc2hvd1NwaW5uZXI6IGJvb2xlYW4gPSB0cnVlO1xyXG5cdEBJbnB1dCgpIHB1YmxpYyBkb3dubG9hZEZpbGVOYW1lOiBzdHJpbmc7XHJcblx0QElucHV0KCkgcHVibGljIG9wZW5GaWxlOiBib29sZWFuID0gdHJ1ZTtcclxuXHRASW5wdXQoKSBwdWJsaWMgZG93bmxvYWQ6IGJvb2xlYW4gPSB0cnVlO1xyXG5cdEBJbnB1dCgpIHB1YmxpYyBzdGFydERvd25sb2FkOiBib29sZWFuO1xyXG5cdEBJbnB1dCgpIHB1YmxpYyB2aWV3Qm9va21hcms6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHRASW5wdXQoKSBwdWJsaWMgcHJpbnQ6IGJvb2xlYW4gPSB0cnVlO1xyXG5cdEBJbnB1dCgpIHB1YmxpYyBzdGFydFByaW50OiBib29sZWFuO1xyXG5cdEBJbnB1dCgpIHB1YmxpYyBmdWxsU2NyZWVuOiBib29sZWFuID0gdHJ1ZTtcclxuXHQvL0BJbnB1dCgpIHB1YmxpYyBzaG93RnVsbFNjcmVlbjogYm9vbGVhbjtcclxuXHRASW5wdXQoKSBwdWJsaWMgZmluZDogYm9vbGVhbiA9IHRydWU7XHJcblx0QElucHV0KCkgcHVibGljIHpvb206IHN0cmluZztcclxuXHRASW5wdXQoKSBwdWJsaWMgbmFtZWRkZXN0OiBzdHJpbmc7XHJcblx0QElucHV0KCkgcHVibGljIHBhZ2Vtb2RlOiBzdHJpbmc7XHJcblx0QElucHV0KCkgcHVibGljIGxhc3RQYWdlOiBib29sZWFuO1xyXG5cdEBJbnB1dCgpIHB1YmxpYyByb3RhdGVjdzogYm9vbGVhbjtcclxuXHRASW5wdXQoKSBwdWJsaWMgcm90YXRlY2N3OiBib29sZWFuO1xyXG5cdEBJbnB1dCgpIHB1YmxpYyBjdXJzb3I6IHN0cmluZztcclxuXHRASW5wdXQoKSBwdWJsaWMgc2Nyb2xsOiBzdHJpbmc7XHJcblx0QElucHV0KCkgcHVibGljIHNwcmVhZDogc3RyaW5nO1xyXG5cdEBJbnB1dCgpIHB1YmxpYyBsb2NhbGU6IHN0cmluZztcclxuXHRASW5wdXQoKSBwdWJsaWMgdXNlT25seUNzc1pvb206IGJvb2xlYW4gPSBmYWxzZTtcclxuXHRASW5wdXQoKSBwdWJsaWMgZXJyb3JPdmVycmlkZTogYm9vbGVhbiA9IGZhbHNlO1xyXG5cdEBJbnB1dCgpIHB1YmxpYyBlcnJvckFwcGVuZDogYm9vbGVhbiA9IHRydWU7XHJcblx0QElucHV0KCkgcHVibGljIGVycm9yTWVzc2FnZTogc3RyaW5nO1xyXG5cdEBJbnB1dCgpIHB1YmxpYyBkaWFnbm9zdGljTG9nczogYm9vbGVhbiA9IHRydWU7XHJcblxyXG5cdEBJbnB1dCgpIHB1YmxpYyBleHRlcm5hbFdpbmRvd09wdGlvbnM6IHN0cmluZztcclxuXHRwdWJsaWMgdmlld2VyVGFiOiBhbnk7XHJcblx0cHJpdmF0ZSBfc3JjOiBzdHJpbmcgfCBCbG9iIHwgVWludDhBcnJheTtcclxuXHRwcml2YXRlIF9wYWdlOiBudW1iZXI7XHJcblxyXG5cdEBJbnB1dCgpIHB1YmxpYyBjbG9zZUJ1dHRvbjogYm9vbGVhbjtcclxuXHRAT3V0cHV0KCkgY2xvc2VGaWxlOiBFdmVudEVtaXR0ZXI8Ym9vbGVhbj4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG5cdHZpZXdlclVybDtcclxuXHJcblx0QElucHV0KClcclxuXHRwdWJsaWMgc2V0IHBhZ2UoX3BhZ2U6IG51bWJlcikge1xyXG5cdFx0dGhpcy5fcGFnZSA9IF9wYWdlO1xyXG5cdFx0aWYgKHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24pIHtcclxuXHRcdFx0dGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbi5wYWdlID0gdGhpcy5fcGFnZTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGlmICh0aGlzLmRpYWdub3N0aWNMb2dzKVxyXG5cdFx0XHRcdGNvbnNvbGUud2FybihcclxuXHRcdFx0XHRcdFwiRG9jdW1lbnQgaXMgbm90IGxvYWRlZCB5ZXQhISEuIFRyeSB0byBzZXQgcGFnZSMgYWZ0ZXIgZnVsbCBsb2FkLiBJZ25vcmUgdGhpcyB3YXJuaW5nIGlmIHlvdSBhcmUgbm90IHNldHRpbmcgcGFnZSMgdXNpbmcgJy4nIG5vdGF0aW9uLiAoRS5nLiBwZGZWaWV3ZXIucGFnZSA9IDU7KVwiLFxyXG5cdFx0XHRcdCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZ2V0IHBhZ2UoKSB7XHJcblx0XHRpZiAodGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbikge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbi5wYWdlO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aWYgKHRoaXMuZGlhZ25vc3RpY0xvZ3MpIGNvbnNvbGUud2FybihcIkRvY3VtZW50IGlzIG5vdCBsb2FkZWQgeWV0ISEhLiBUcnkgdG8gcmV0cmlldmUgcGFnZSMgYWZ0ZXIgZnVsbCBsb2FkLlwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdEBJbnB1dCgpXHJcblx0cHVibGljIHNldCBwZGZTcmMoX3NyYzogc3RyaW5nIHwgQmxvYiB8IFVpbnQ4QXJyYXkpIHtcclxuXHRcdGlmICh0eXBlb2YgX3NyYyA9PT0gXCJzdHJpbmdcIikge1xyXG5cdFx0XHR0aGlzLl9zcmMgPSBlbmNvZGVVUklDb21wb25lbnQoX3NyYyk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLl9zcmMgPSBfc3JjO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHVibGljIGdldCBwZGZTcmMoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fc3JjO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGdldCBQREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnMoKSB7XHJcblx0XHRsZXQgcGRmVmlld2VyT3B0aW9ucyA9IG51bGw7XHJcblx0XHRpZiAodGhpcy5leHRlcm5hbFdpbmRvdykge1xyXG5cdFx0XHRpZiAodGhpcy52aWV3ZXJUYWIpIHtcclxuXHRcdFx0XHRwZGZWaWV3ZXJPcHRpb25zID0gdGhpcy52aWV3ZXJUYWIuUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpZiAodGhpcy5pZnJhbWVQREYubmF0aXZlRWxlbWVudC5jb250ZW50V2luZG93KSB7XHJcblx0XHRcdFx0cGRmVmlld2VyT3B0aW9ucyA9IHRoaXMuaWZyYW1lUERGLm5hdGl2ZUVsZW1lbnQuY29udGVudFdpbmRvdy5QREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnM7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBwZGZWaWV3ZXJPcHRpb25zO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGdldCBQREZWaWV3ZXJBcHBsaWNhdGlvbigpIHtcclxuXHRcdGxldCBwZGZWaWV3ZXIgPSBudWxsO1xyXG5cdFx0aWYgKHRoaXMuZXh0ZXJuYWxXaW5kb3cpIHtcclxuXHRcdFx0aWYgKHRoaXMudmlld2VyVGFiKSB7XHJcblx0XHRcdFx0cGRmVmlld2VyID0gdGhpcy52aWV3ZXJUYWIuUERGVmlld2VyQXBwbGljYXRpb247XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGlmICh0aGlzLmlmcmFtZVBERi5uYXRpdmVFbGVtZW50LmNvbnRlbnRXaW5kb3cpIHtcclxuXHRcdFx0XHRwZGZWaWV3ZXIgPSB0aGlzLmlmcmFtZVBERi5uYXRpdmVFbGVtZW50LmNvbnRlbnRXaW5kb3cuUERGVmlld2VyQXBwbGljYXRpb247XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBwZGZWaWV3ZXI7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcmVjZWl2ZU1lc3NhZ2Uodmlld2VyRXZlbnQpIHtcclxuXHRcdGlmICh2aWV3ZXJFdmVudC5kYXRhICYmIHZpZXdlckV2ZW50LmRhdGEudmlld2VySWQgJiYgdmlld2VyRXZlbnQuZGF0YS5ldmVudCkge1xyXG5cdFx0XHRsZXQgdmlld2VySWQgPSB2aWV3ZXJFdmVudC5kYXRhLnZpZXdlcklkO1xyXG5cdFx0XHRsZXQgZXZlbnQgPSB2aWV3ZXJFdmVudC5kYXRhLmV2ZW50O1xyXG5cdFx0XHRsZXQgcGFyYW0gPSB2aWV3ZXJFdmVudC5kYXRhLnBhcmFtO1xyXG5cdFx0XHRpZiAodGhpcy52aWV3ZXJJZCA9PSB2aWV3ZXJJZCkge1xyXG5cdFx0XHRcdGlmICh0aGlzLm9uQmVmb3JlUHJpbnQgJiYgZXZlbnQgPT0gXCJiZWZvcmVQcmludFwiKSB7XHJcblx0XHRcdFx0XHR0aGlzLm9uQmVmb3JlUHJpbnQuZW1pdCgpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAodGhpcy5vbkFmdGVyUHJpbnQgJiYgZXZlbnQgPT0gXCJhZnRlclByaW50XCIpIHtcclxuXHRcdFx0XHRcdHRoaXMub25BZnRlclByaW50LmVtaXQoKTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKHRoaXMub25Eb2N1bWVudExvYWQgJiYgZXZlbnQgPT0gXCJwYWdlc0xvYWRlZFwiKSB7XHJcblx0XHRcdFx0XHR0aGlzLm9uRG9jdW1lbnRMb2FkLmVtaXQocGFyYW0pO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAodGhpcy5vblBhZ2VDaGFuZ2UgJiYgZXZlbnQgPT0gXCJwYWdlQ2hhbmdlXCIpIHtcclxuXHRcdFx0XHRcdHRoaXMub25QYWdlQ2hhbmdlLmVtaXQocGFyYW0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0aWYgKHZpZXdlckV2ZW50LmRhdGEgJiYgdmlld2VyRXZlbnQuZGF0YS5ldmVudCA9PT0gXCJjbG9zZWZpbGVcIikge1xyXG5cdFx0XHR0aGlzLmNsb3NlRmlsZS5lbWl0KHRydWUpO1xyXG5cdFx0fSBlbHNlIGlmICh2aWV3ZXJFdmVudC5kYXRhICYmIHZpZXdlckV2ZW50LmRhdGEuZXZlbnQgPT09IFwibG9hZGVyRXJyb3JcIikge1xyXG5cdFx0XHR0aGlzLmxvYWRpbmdTcGluLm5hdGl2ZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxuXHRcdFx0dGhpcy5pZnJhbWVQREYubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcblxyXG5cdFx0XHRsZXQgdXJsID0gdGhpcy5nZXRVcmxGaWxlKCk7XHJcblx0XHRcdGxldCBleHQgPSB0aGlzLmdldEZpbGVFeHRlbnNpb24odXJsKTtcclxuXHRcdFx0aWYgKHRoaXMuaXNWYWxpZEZpbGUoZXh0KSkge1xyXG5cdFx0XHRcdGNvbnN0IF91cmxGaWxlID0gZGVjb2RlVVJJQ29tcG9uZW50KHVybCk7XHJcblx0XHRcdFx0Y29uc3QgX2NoZWNrRXh0V2l0aG91dFBkZiA9IHRoaXMuaXNWYWxpZEZpbGUodGhpcy5nZXRGaWxlRXh0ZW5zaW9uKF91cmxGaWxlLnNwbGl0KFwiLnBkZlwiKVswXSkpO1xyXG5cdFx0XHRcdGlmIChfY2hlY2tFeHRXaXRob3V0UGRmKSB7XHJcblx0XHRcdFx0XHRfdXJsRmlsZS5yZXBsYWNlKFwiLnBkZlwiLCBcIlwiKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHRoaXMudmlld1dvcmRCYXIubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xyXG5cdFx0XHRcdHRoaXMuaWZyYW1lRG9jeC5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcblx0XHRcdFx0dGhpcy52aWV3ZXJVcmwgPSBgaHR0cHM6Ly92aWV3Lm9mZmljZWFwcHMubGl2ZS5jb20vb3AvZW1iZWQuYXNweD9zcmM9JHtfdXJsRmlsZX1gO1xyXG5cdFx0XHRcdHRoaXMuaWZyYW1lRG9jeC5uYXRpdmVFbGVtZW50LnNyYyA9IHRoaXMudmlld2VyVXJsO1xyXG5cclxuXHRcdFx0XHR0aGlzLmlmcmFtZURvY3gubmF0aXZlRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCAoKSA9PiB7XHJcblx0XHRcdFx0XHRjb25zdCBjb250ZW50ID0gdGhpcy5pZnJhbWVEb2N4Lm5hdGl2ZUVsZW1lbnQ/LmNvbnRlbnRXaW5kb3c/LmRvY3VtZW50Py5ib2R5Py5pbm5lckhUTUw7XHJcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcImNvbnRlbnQ6IFwiICsgY29udGVudCk7XHJcblx0XHRcdFx0XHRpZiAoIWNvbnRlbnQpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy52aWV3ZXJVcmwgPSBgaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZ3ZpZXc/dXJsPSR7X3VybEZpbGV9JmVtYmVkZGVkPXRydWVgO1xyXG5cdFx0XHRcdFx0XHR0aGlzLmlmcmFtZURvY3gubmF0aXZlRWxlbWVudC5zcmMgPSB0aGlzLnZpZXdlclVybDtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMubG9hZGluZ1NwaW4gJiYgdGhpcy5sb2FkaW5nU3Bpbi5uYXRpdmVFbGVtZW50KSB7XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5sb2FkaW5nU3Bpbi5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSwgMTAwMCk7XHJcblx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdC8vIHNldFRpbWVvdXQoKCkgPT4ge1xyXG5cdFx0XHRcdC8vIFx0aWYgKHRoaXMubG9hZGluZ1NwaW4gJiYgdGhpcy5sb2FkaW5nU3Bpbi5uYXRpdmVFbGVtZW50KSB7XHJcblx0XHRcdFx0Ly8gXHRcdHRoaXMubG9hZGluZ1NwaW4ubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcblx0XHRcdFx0Ly8gXHR9XHJcblx0XHRcdFx0Ly8gfSwgMzAwMCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coXCLEkOG7i25oIGThuqFuZyBraMO0bmcgaOG7o3AgbOG7hyFcIik7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGRvd25sb2FkRmlsZSgpIHtcclxuXHRcdGxldCB1cmwgPSB0aGlzLmdldFVybEZpbGUoKTtcclxuXHRcdGlmICh1cmwpIHtcclxuXHRcdFx0ZmV0Y2godXJsKS50aGVuKCh0KSA9PiB7XHJcblx0XHRcdFx0cmV0dXJuIHQuYmxvYigpLnRoZW4oKGIpID0+IHtcclxuXHRcdFx0XHRcdGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcclxuXHRcdFx0XHRcdGEuaHJlZiA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYik7XHJcblx0XHRcdFx0XHRhLnNldEF0dHJpYnV0ZShcImRvd25sb2FkXCIsIHRoaXMuZG93bmxvYWRGaWxlTmFtZSA/IGAke3RoaXMuZG93bmxvYWRGaWxlTmFtZX0uJHt0aGlzLmdldEZpbGVFeHRlbnNpb24odXJsKX1gIDogYGRvd25sb2FkX2ZpbGUuJHt0aGlzLmdldEZpbGVFeHRlbnNpb24odXJsKX1gKTtcclxuXHRcdFx0XHRcdGEuY2xpY2soKTtcclxuXHRcdFx0XHRcdGEucmVtb3ZlKCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHVibGljIGNsb3NlV29yZEZpbGUoKSB7XHJcblx0XHRjb25zb2xlLmxvZyhcImNsb3NlIEZpbGUhXCIpO1xyXG5cdFx0dGhpcy5jbG9zZUZpbGUuZW1pdCh0cnVlKTtcclxuXHR9XHJcblxyXG5cdGlzVmFsaWRGaWxlKHN0cikge1xyXG5cdFx0c3dpdGNoIChzdHIudG9Mb3dlckNhc2UoKSkge1xyXG5cdFx0XHRjYXNlIFwicGRmXCI6XHJcblx0XHRcdGNhc2UgXCJkb2NcIjpcclxuXHRcdFx0Y2FzZSBcImRvY3hcIjpcclxuXHRcdFx0Y2FzZSBcInhsc1wiOlxyXG5cdFx0XHRjYXNlIFwieGxzeFwiOlxyXG5cdFx0XHRjYXNlIFwicHB0eFwiOlxyXG5cdFx0XHRjYXNlIFwicHB0XCI6XHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHRnZXRVcmxGaWxlKCkge1xyXG5cdFx0aWYgKHRoaXMuX3NyYyBpbnN0YW5jZW9mIEJsb2IpIHtcclxuXHRcdFx0cmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChVUkwuY3JlYXRlT2JqZWN0VVJMKHRoaXMuX3NyYykpO1xyXG5cdFx0fSBlbHNlIGlmICh0aGlzLl9zcmMgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XHJcblx0XHRcdGxldCBibG9iID0gbmV3IEJsb2IoW3RoaXMuX3NyY10sIHsgdHlwZTogXCJhcHBsaWNhdGlvbi9wZGZcIiB9KTtcclxuXHRcdFx0cmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9zcmM7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRnZXRGaWxlRXh0ZW5zaW9uKGZpbGVuYW1lKSB7XHJcblx0XHRsZXQgZXh0ID0gZGVjb2RlVVJJQ29tcG9uZW50KGZpbGVuYW1lKS5zcGxpdChcIj9cIilbMF0uc3BsaXQoXCIuXCIpLnBvcCgpO1xyXG5cclxuXHRcdGlmICghZXh0KSB7XHJcblx0XHRcdGV4dCA9IGRlY29kZVVSSUNvbXBvbmVudChmaWxlbmFtZSkuc3BsaXQoXCIvXCIpLnBvcCgpLnNwbGl0KFwiLlwiKS5wb3AoKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGZpbGVuYW1lKS5zcGxpdChcIi9cIikucG9wKCkuc3BsaXQoXCIuXCIpLnBvcCgpO1xyXG5cdFx0Ly8gcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChmaWxlbmFtZSkuc3BsaXQoXCI/XCIpWzBdLnNwbGl0KFwiLlwiKS5wb3AoKTtcclxuXHRcdC8vIGNvbnN0IGV4dCA9IC9eLitcXC4oW14uXSspJC8uZXhlYyhmaWxlbmFtZSk7XHJcblx0XHQvLyByZXR1cm4gZXh0ID09IG51bGwgPyBcIlwiIDogZXh0WzFdO1xyXG5cdFx0Y29uc29sZS5sb2coXCJleHQ6IFwiICsgZXh0KTtcclxuXHJcblx0XHRyZXR1cm4gZXh0O1xyXG5cdH1cclxuXHJcblx0bmdPbkluaXQoKTogdm9pZCB7XHJcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5yZWNlaXZlTWVzc2FnZS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcblx0XHRpZiAoIXRoaXMuZXh0ZXJuYWxXaW5kb3cpIHtcclxuXHRcdFx0Ly8gTG9hZCBwZGYgZm9yIGVtYmVkZGVkIHZpZXdzXHJcblx0XHRcdHRoaXMubG9hZFBkZigpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHVibGljIHJlZnJlc2goKTogdm9pZCB7XHJcblx0XHQvLyBOZWVkcyB0byBiZSBpbnZva2VkIGZvciBleHRlcm5hbCB3aW5kb3cgb3Igd2hlbiBuZWVkcyB0byByZWxvYWQgcGRmXHJcblx0XHR0aGlzLmxvYWRQZGYoKTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgcmVsYXNlVXJsPzogKCkgPT4gdm9pZDsgLy8gQXZvaWQgbWVtb3J5IGxlYXNrIHdpdGggYFVSTC5jcmVhdGVPYmplY3RVUkxgXHJcblxyXG5cdHByaXZhdGUgbG9hZFBkZigpIHtcclxuXHRcdGlmICghdGhpcy5fc3JjKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdHRoaXMudmlld2VyVXJsID0gXCJcIjtcclxuXHRcdHRoaXMudmlld1dvcmRCYXIubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcblx0XHQvLyBjb25zb2xlLmxvZyhgVGFiIGlzIC0gJHt0aGlzLnZpZXdlclRhYn1gKTtcclxuXHRcdC8vIGlmICh0aGlzLnZpZXdlclRhYikge1xyXG5cdFx0Ly8gICBjb25zb2xlLmxvZyhgU3RhdHVzIG9mIHdpbmRvdyAtICR7dGhpcy52aWV3ZXJUYWIuY2xvc2VkfWApO1xyXG5cdFx0Ly8gfVxyXG5cclxuXHRcdHRoaXMuaWZyYW1lRG9jeC5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuXHJcblx0XHRpZiAodGhpcy5leHRlcm5hbFdpbmRvdyAmJiAodHlwZW9mIHRoaXMudmlld2VyVGFiID09PSBcInVuZGVmaW5lZFwiIHx8IHRoaXMudmlld2VyVGFiLmNsb3NlZCkpIHtcclxuXHRcdFx0dGhpcy52aWV3ZXJUYWIgPSB3aW5kb3cub3BlbihcIlwiLCBcIl9ibGFua1wiLCB0aGlzLmV4dGVybmFsV2luZG93T3B0aW9ucyB8fCBcIlwiKTtcclxuXHRcdFx0aWYgKHRoaXMudmlld2VyVGFiID09IG51bGwpIHtcclxuXHRcdFx0XHRpZiAodGhpcy5kaWFnbm9zdGljTG9ncykgY29uc29sZS5lcnJvcihcIm5nMi1wZGZqcy12aWV3ZXI6IEZvciAnZXh0ZXJuYWxXaW5kb3cgPSB0cnVlJy4gaS5lIG9wZW5pbmcgaW4gbmV3IHRhYiB0byB3b3JrLCBwb3AtdXBzIHNob3VsZCBiZSBlbmFibGVkLlwiKTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICh0aGlzLnNob3dTcGlubmVyKSB7XHJcblx0XHRcdFx0dGhpcy52aWV3ZXJUYWIuZG9jdW1lbnQud3JpdGUoYFxyXG4gICAgICAgICAgPHN0eWxlPlxyXG4gICAgICAgICAgLmxvYWRlciB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcclxuICAgICAgICAgICAgbGVmdDogNDAlO1xyXG4gICAgICAgICAgICB0b3A6IDQwJTtcclxuICAgICAgICAgICAgYm9yZGVyOiAxNnB4IHNvbGlkICNmM2YzZjM7XHJcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcclxuICAgICAgICAgICAgYm9yZGVyLXRvcDogMTZweCBzb2xpZCAjMzQ5OGRiO1xyXG4gICAgICAgICAgICB3aWR0aDogMTIwcHg7XHJcbiAgICAgICAgICAgIGhlaWdodDogMTIwcHg7XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbjogc3BpbiAycyBsaW5lYXIgaW5maW5pdGU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBAa2V5ZnJhbWVzIHNwaW4ge1xyXG4gICAgICAgICAgICAwJSB7XHJcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgMTAwJSB7XHJcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgPC9zdHlsZT5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJsb2FkZXJcIj48L2Rpdj5cclxuICAgICAgICBgKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGxldCBmaWxlVXJsID0gdGhpcy5nZXRVcmxGaWxlKCk7XHJcblx0XHQvLyBsZXQgdGhpcy52aWV3ZXJVcmw7XHJcblx0XHRpZiAodGhpcy52aWV3ZXJGb2xkZXIpIHtcclxuXHRcdFx0dGhpcy52aWV3ZXJVcmwgPSBgJHt0aGlzLnZpZXdlckZvbGRlcn0vd2ViL3ZpZXdlci5odG1sYDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMudmlld2VyVXJsID0gYGFzc2V0cy9wZGZqcy93ZWIvdmlld2VyLmh0bWxgO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMudmlld2VyVXJsICs9IGA/ZmlsZT0ke2ZpbGVVcmx9YDtcclxuXHJcblx0XHRpZiAodHlwZW9mIHRoaXMudmlld2VySWQgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuXHRcdFx0dGhpcy52aWV3ZXJVcmwgKz0gYCZ2aWV3ZXJJZD0ke3RoaXMudmlld2VySWR9YDtcclxuXHRcdH1cclxuXHRcdGlmICh0eXBlb2YgdGhpcy5vbkJlZm9yZVByaW50ICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcblx0XHRcdHRoaXMudmlld2VyVXJsICs9IGAmYmVmb3JlUHJpbnQ9dHJ1ZWA7XHJcblx0XHR9XHJcblx0XHRpZiAodHlwZW9mIHRoaXMub25BZnRlclByaW50ICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcblx0XHRcdHRoaXMudmlld2VyVXJsICs9IGAmYWZ0ZXJQcmludD10cnVlYDtcclxuXHRcdH1cclxuXHRcdGlmICh0eXBlb2YgdGhpcy5vbkRvY3VtZW50TG9hZCAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0XHR0aGlzLnZpZXdlclVybCArPSBgJnBhZ2VzTG9hZGVkPXRydWVgO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHR5cGVvZiB0aGlzLm9uUGFnZUNoYW5nZSAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0XHR0aGlzLnZpZXdlclVybCArPSBgJnBhZ2VDaGFuZ2U9dHJ1ZWA7XHJcblx0XHR9XHJcblx0XHRpZiAodHlwZW9mIHRoaXMuY2xvc2VCdXR0b24gIT09IFwidW5kZWZpbmVkXCIpIHtcclxuXHRcdFx0dGhpcy52aWV3ZXJVcmwgKz0gYCZjbG9zZUZpbGU9JHt0aGlzLmNsb3NlQnV0dG9ufWA7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMuZG93bmxvYWRGaWxlTmFtZSkge1xyXG5cdFx0XHQvLyBpZiAoIXRoaXMuZG93bmxvYWRGaWxlTmFtZS5lbmRzV2l0aChcIi5wZGZcIikpIHtcclxuXHRcdFx0Ly8gXHR0aGlzLmRvd25sb2FkRmlsZU5hbWUgKz0gXCIucGRmXCI7XHJcblx0XHRcdC8vIH1cclxuXHRcdFx0dGhpcy52aWV3ZXJVcmwgKz0gYCZmaWxlTmFtZT0ke3RoaXMuZG93bmxvYWRGaWxlTmFtZX0ucGRmYDtcclxuXHRcdH1cclxuXHRcdGlmICh0eXBlb2YgdGhpcy5vcGVuRmlsZSAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0XHR0aGlzLnZpZXdlclVybCArPSBgJm9wZW5GaWxlPSR7dGhpcy5vcGVuRmlsZX1gO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHR5cGVvZiB0aGlzLmRvd25sb2FkICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcblx0XHRcdHRoaXMudmlld2VyVXJsICs9IGAmZG93bmxvYWQ9JHt0aGlzLmRvd25sb2FkfWA7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5zdGFydERvd25sb2FkKSB7XHJcblx0XHRcdHRoaXMudmlld2VyVXJsICs9IGAmc3RhcnREb3dubG9hZD0ke3RoaXMuc3RhcnREb3dubG9hZH1gO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHR5cGVvZiB0aGlzLnZpZXdCb29rbWFyayAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0XHR0aGlzLnZpZXdlclVybCArPSBgJnZpZXdCb29rbWFyaz0ke3RoaXMudmlld0Jvb2ttYXJrfWA7XHJcblx0XHR9XHJcblx0XHRpZiAodHlwZW9mIHRoaXMucHJpbnQgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuXHRcdFx0dGhpcy52aWV3ZXJVcmwgKz0gYCZwcmludD0ke3RoaXMucHJpbnR9YDtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLnN0YXJ0UHJpbnQpIHtcclxuXHRcdFx0dGhpcy52aWV3ZXJVcmwgKz0gYCZzdGFydFByaW50PSR7dGhpcy5zdGFydFByaW50fWA7XHJcblx0XHR9XHJcblx0XHRpZiAodHlwZW9mIHRoaXMuZnVsbFNjcmVlbiAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0XHR0aGlzLnZpZXdlclVybCArPSBgJmZ1bGxTY3JlZW49JHt0aGlzLmZ1bGxTY3JlZW59YDtcclxuXHRcdH1cclxuXHRcdC8vIGlmICh0aGlzLnNob3dGdWxsU2NyZWVuKSB7XHJcblx0XHQvLyAgIHRoaXMudmlld2VyVXJsICs9IGAmc2hvd0Z1bGxTY3JlZW49JHt0aGlzLnNob3dGdWxsU2NyZWVufWA7XHJcblx0XHQvLyB9XHJcblx0XHRpZiAodHlwZW9mIHRoaXMuZmluZCAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0XHR0aGlzLnZpZXdlclVybCArPSBgJmZpbmQ9JHt0aGlzLmZpbmR9YDtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLmxhc3RQYWdlKSB7XHJcblx0XHRcdHRoaXMudmlld2VyVXJsICs9IGAmbGFzdHBhZ2U9JHt0aGlzLmxhc3RQYWdlfWA7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5yb3RhdGVjdykge1xyXG5cdFx0XHR0aGlzLnZpZXdlclVybCArPSBgJnJvdGF0ZWN3PSR7dGhpcy5yb3RhdGVjd31gO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMucm90YXRlY2N3KSB7XHJcblx0XHRcdHRoaXMudmlld2VyVXJsICs9IGAmcm90YXRlY2N3PSR7dGhpcy5yb3RhdGVjY3d9YDtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLmN1cnNvcikge1xyXG5cdFx0XHR0aGlzLnZpZXdlclVybCArPSBgJmN1cnNvcj0ke3RoaXMuY3Vyc29yfWA7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5zY3JvbGwpIHtcclxuXHRcdFx0dGhpcy52aWV3ZXJVcmwgKz0gYCZzY3JvbGw9JHt0aGlzLnNjcm9sbH1gO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMuc3ByZWFkKSB7XHJcblx0XHRcdHRoaXMudmlld2VyVXJsICs9IGAmc3ByZWFkPSR7dGhpcy5zcHJlYWR9YDtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLmxvY2FsZSkge1xyXG5cdFx0XHR0aGlzLnZpZXdlclVybCArPSBgJmxvY2FsZT0ke3RoaXMubG9jYWxlfWA7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy51c2VPbmx5Q3NzWm9vbSkge1xyXG5cdFx0XHR0aGlzLnZpZXdlclVybCArPSBgJnVzZU9ubHlDc3Nab29tPSR7dGhpcy51c2VPbmx5Q3NzWm9vbX1gO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0aGlzLl9wYWdlIHx8IHRoaXMuem9vbSB8fCB0aGlzLm5hbWVkZGVzdCB8fCB0aGlzLnBhZ2Vtb2RlKSB0aGlzLnZpZXdlclVybCArPSBcIiNcIjtcclxuXHRcdGlmICh0aGlzLl9wYWdlKSB7XHJcblx0XHRcdHRoaXMudmlld2VyVXJsICs9IGAmcGFnZT0ke3RoaXMuX3BhZ2V9YDtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLnpvb20pIHtcclxuXHRcdFx0dGhpcy52aWV3ZXJVcmwgKz0gYCZ6b29tPSR7dGhpcy56b29tfWA7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5uYW1lZGRlc3QpIHtcclxuXHRcdFx0dGhpcy52aWV3ZXJVcmwgKz0gYCZuYW1lZGRlc3Q9JHt0aGlzLm5hbWVkZGVzdH1gO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMucGFnZW1vZGUpIHtcclxuXHRcdFx0dGhpcy52aWV3ZXJVcmwgKz0gYCZwYWdlbW9kZT0ke3RoaXMucGFnZW1vZGV9YDtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLmVycm9yT3ZlcnJpZGUgfHwgdGhpcy5lcnJvckFwcGVuZCkge1xyXG5cdFx0XHR0aGlzLnZpZXdlclVybCArPSBgJmVycm9yTWVzc2FnZT0ke3RoaXMuZXJyb3JNZXNzYWdlfWA7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5lcnJvck92ZXJyaWRlKSB7XHJcblx0XHRcdFx0dGhpcy52aWV3ZXJVcmwgKz0gYCZlcnJvck92ZXJyaWRlPSR7dGhpcy5lcnJvck92ZXJyaWRlfWA7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKHRoaXMuZXJyb3JBcHBlbmQpIHtcclxuXHRcdFx0XHR0aGlzLnZpZXdlclVybCArPSBgJmVycm9yQXBwZW5kPSR7dGhpcy5lcnJvckFwcGVuZH1gO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMuZXh0ZXJuYWxXaW5kb3cpIHtcclxuXHRcdFx0dGhpcy52aWV3ZXJUYWIubG9jYXRpb24uaHJlZiA9IHRoaXMudmlld2VyVXJsO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5pZnJhbWVQREYubmF0aXZlRWxlbWVudC5zcmMgPSB0aGlzLnZpZXdlclVybDtcclxuXHRcdH1cclxuXHJcblx0XHRjb25zb2xlLmxvZyhgXHJcbiAgICAgIHBkZlNyYyA9ICR7dGhpcy5wZGZTcmN9XHJcbiAgICAgIGZpbGVVcmwgPSAke2ZpbGVVcmx9XHJcbiAgICAgIGV4dGVybmFsV2luZG93ID0gJHt0aGlzLmV4dGVybmFsV2luZG93fVxyXG4gICAgICBkb3dubG9hZEZpbGVOYW1lID0gJHt0aGlzLmRvd25sb2FkRmlsZU5hbWV9XHJcbiAgICBgKTtcclxuXHJcblx0XHQvLyB2aWV3ZXJGb2xkZXIgPSAke3RoaXMudmlld2VyRm9sZGVyfVxyXG5cdFx0Ly8gb3BlbkZpbGUgPSAke3RoaXMub3BlbkZpbGV9XHJcblx0XHQvLyBkb3dubG9hZCA9ICR7dGhpcy5kb3dubG9hZH1cclxuXHRcdC8vIHN0YXJ0RG93bmxvYWQgPSAke3RoaXMuc3RhcnREb3dubG9hZH1cclxuXHRcdC8vIHZpZXdCb29rbWFyayA9ICR7dGhpcy52aWV3Qm9va21hcmt9XHJcblx0XHQvLyBwcmludCA9ICR7dGhpcy5wcmludH1cclxuXHRcdC8vIHN0YXJ0UHJpbnQgPSAke3RoaXMuc3RhcnRQcmludH1cclxuXHRcdC8vIGZ1bGxTY3JlZW4gPSAke3RoaXMuZnVsbFNjcmVlbn1cclxuXHRcdC8vIGZpbmQgPSAke3RoaXMuZmluZH1cclxuXHRcdC8vIGxhc3RQYWdlID0gJHt0aGlzLmxhc3RQYWdlfVxyXG5cdFx0Ly8gcm90YXRlY3cgPSAke3RoaXMucm90YXRlY3d9XHJcblx0XHQvLyByb3RhdGVjY3cgPSAke3RoaXMucm90YXRlY2N3fVxyXG5cdFx0Ly8gY3Vyc29yID0gJHt0aGlzLmN1cnNvcn1cclxuXHRcdC8vIHNjcm9sbE1vZGUgPSAke3RoaXMuc2Nyb2xsfVxyXG5cdFx0Ly8gc3ByZWFkID0gJHt0aGlzLnNwcmVhZH1cclxuXHRcdC8vIHBhZ2UgPSAke3RoaXMucGFnZX1cclxuXHRcdC8vIHpvb20gPSAke3RoaXMuem9vbX1cclxuXHRcdC8vIG5hbWVkZGVzdCA9ICR7dGhpcy5uYW1lZGRlc3R9XHJcblx0XHQvLyBwYWdlbW9kZSA9ICR7dGhpcy5wYWdlbW9kZX1cclxuXHRcdC8vIHBhZ2Vtb2RlID0gJHt0aGlzLmVycm9yT3ZlcnJpZGV9XHJcblx0XHQvLyBwYWdlbW9kZSA9ICR7dGhpcy5lcnJvckFwcGVuZH1cclxuXHRcdC8vIHBhZ2Vtb2RlID0gJHt0aGlzLmVycm9yTWVzc2FnZX1cclxuXHR9XHJcblxyXG5cdG5nT25EZXN0cm95KCk6IHZvaWQge1xyXG5cdFx0dGhpcy5yZWxhc2VVcmw/LigpO1xyXG5cdH1cclxufVxyXG4iLCI8ZGl2ICN2aWV3V29yZEJhciBjbGFzcz1cInRvb2xiYXJcIj5cclxuXHQ8ZGl2IGlkPVwidG9vbGJhckNvbnRhaW5lclwiPlxyXG5cdFx0PGRpdiBpZD1cInRvb2xiYXJWaWV3ZXJcIj5cclxuXHRcdFx0PGJ1dHRvbiBpZD1cImRvd25sb2FkXCIgKGNsaWNrKT1cImRvd25sb2FkRmlsZSgpXCIgY2xhc3M9XCJ0b29sYmFyQnV0dG9uIGRvd25sb2FkXCIgdGl0bGU9XCJEb3dubG9hZFwiIHRhYmluZGV4PVwiMzRcIiBkYXRhLWwxMG4taWQ9XCJkb3dubG9hZFwiPlxyXG5cdFx0XHRcdDxpbWcgc3JjPVwiL2Fzc2V0cy9wZGZqcy93ZWIvaW1hZ2VzL3Rvb2xiYXJCdXR0b24tZG93bmxvYWQucG5nXCIgYWx0PVwiRG93bmxvYWRcIiAvPlxyXG5cdFx0XHQ8L2J1dHRvbj5cclxuXHJcblx0XHRcdDxidXR0b24gKm5nSWY9XCJjbG9zZUJ1dHRvblwiIGlkPVwiY2xvc2VGaWxlXCIgKGNsaWNrKT1cImNsb3NlV29yZEZpbGUoKVwiIGNsYXNzPVwidG9vbGJhckJ1dHRvblwiIHRpdGxlPVwiQ2xvc2VcIiB0YWJpbmRleD1cIjM2XCIgZGF0YS1sMTBuLWlkPVwiY2xvc2VGaWxlXCI+XHJcblx0XHRcdFx0PGltZyBzcmM9XCIvYXNzZXRzL3BkZmpzL3dlYi9pbWFnZXMvY2xvc2UtZmlsZS5wbmdcIiBhbHQ9XCJDbG9zZVwiIC8+XHJcblx0XHRcdDwvYnV0dG9uPlxyXG5cdFx0PC9kaXY+XHJcblx0PC9kaXY+XHJcbjwvZGl2PlxyXG48ZGl2ICNsb2FkaW5nU3BpbiBjbGFzcz1cImxvYWRpbmdTcGluXCI+XHJcblx0PGRpdiBjbGFzcz1cImxvYWRlclwiPjwvZGl2PlxyXG48L2Rpdj5cclxuPGlmcmFtZSBpZD1cImlmcmFtZURvY3hcIiAjaWZyYW1lRG9jeCB0aXRsZT1cIm5nMi1wZGZqcy12aWV3ZXJcIiBbaGlkZGVuXT1cImV4dGVybmFsV2luZG93IHx8ICghZXh0ZXJuYWxXaW5kb3cgJiYgIXBkZlNyYylcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCI+PC9pZnJhbWU+XHJcblxyXG48aWZyYW1lIGlkPVwiaWZyYW1lUERGXCIgI2lmcmFtZVBERiB0aXRsZT1cIm5nMi1wZGZqcy12aWV3ZXJcIiBbaGlkZGVuXT1cImV4dGVybmFsV2luZG93IHx8ICghZXh0ZXJuYWxXaW5kb3cgJiYgIXBkZlNyYylcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCI+PC9pZnJhbWU+XHJcbiJdfQ==