import * as i0 from '@angular/core';
import { EventEmitter, Component, ViewChild, Input, Output, NgModule } from '@angular/core';
import * as i1 from '@angular/common';
import { CommonModule } from '@angular/common';

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

class PdfJsViewerModule {
    static forRoot() {
        return {
            ngModule: PdfJsViewerModule,
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfJsViewerModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "17.3.12", ngImport: i0, type: PdfJsViewerModule, declarations: [PdfJsViewerComponent], imports: [CommonModule], exports: [PdfJsViewerComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfJsViewerModule, imports: [CommonModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfJsViewerModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule],
                    declarations: [PdfJsViewerComponent],
                    exports: [PdfJsViewerComponent],
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { PdfJsViewerComponent, PdfJsViewerModule };
//# sourceMappingURL=onluyen-pdf-viewer.mjs.map
