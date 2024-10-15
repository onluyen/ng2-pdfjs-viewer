import { Component, Input, Output, ViewChild, EventEmitter } from "@angular/core";
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
                // Hiển thị thanh công cụ và iframe
                this.viewWordBar.nativeElement.style.display = "block";
                this.iframeDocx.nativeElement.style.display = "block";
                // Đặt URL ban đầu cho iframe
                this.viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${_urlFile}`;
                this.iframeDocx.nativeElement.src = this.viewerUrl;
                // Đảm bảo rằng loading spinner sẽ tắt khi iframe tải xong
                this.iframeDocx.nativeElement.onload = () => {
                    const content = this.iframeDocx.nativeElement?.contentWindow?.document?.body?.innerHTML;
                    console.log("content: " + content);
                    if (!content) {
                        this.viewerUrl = `https://docs.google.com/gview?url=${_urlFile}&embedded=true`;
                        this.iframeDocx.nativeElement.src = this.viewerUrl;
                    }
                    // Đảm bảo spinner tắt khi tải xong bất kỳ URL nào
                    if (this.loadingSpin && this.loadingSpin.nativeElement) {
                        this.loadingSpin.nativeElement.style.display = "none";
                    }
                };
                // Dự phòng: Tắt spinner sau khoảng thời gian tối đa (ví dụ: 10 giây)
                setTimeout(() => {
                    if (this.loadingSpin && this.loadingSpin.nativeElement) {
                        this.loadingSpin.nativeElement.style.display = "none";
                    }
                }, 10000);
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
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.12", type: PdfJsViewerComponent, selector: "ng2-pdfjs-viewer", inputs: { viewerId: "viewerId", viewerFolder: "viewerFolder", externalWindow: "externalWindow", showSpinner: "showSpinner", downloadFileName: "downloadFileName", openFile: "openFile", download: "download", startDownload: "startDownload", viewBookmark: "viewBookmark", print: "print", startPrint: "startPrint", fullScreen: "fullScreen", find: "find", zoom: "zoom", nameddest: "nameddest", pagemode: "pagemode", lastPage: "lastPage", rotatecw: "rotatecw", rotateccw: "rotateccw", cursor: "cursor", scroll: "scroll", spread: "spread", locale: "locale", useOnlyCssZoom: "useOnlyCssZoom", errorOverride: "errorOverride", errorAppend: "errorAppend", errorMessage: "errorMessage", diagnosticLogs: "diagnosticLogs", externalWindowOptions: "externalWindowOptions", closeButton: "closeButton", page: "page", pdfSrc: "pdfSrc" }, outputs: { onBeforePrint: "onBeforePrint", onAfterPrint: "onAfterPrint", onDocumentLoad: "onDocumentLoad", onPageChange: "onPageChange", closeFile: "closeFile" }, viewQueries: [{ propertyName: "viewWordBar", first: true, predicate: ["viewWordBar"], descendants: true, static: true }, { propertyName: "loadingSpin", first: true, predicate: ["loadingSpin"], descendants: true, static: true }, { propertyName: "iframeDocx", first: true, predicate: ["iframeDocx"], descendants: true, static: true }, { propertyName: "iframePDF", first: true, predicate: ["iframePDF"], descendants: true, static: true }], ngImport: i0, template: "<div #viewWordBar class=\"toolbar\">\r\n\t<div id=\"toolbarContainer\">\r\n\t\t<div id=\"toolbarViewer\">\r\n\t\t\t<button id=\"download\" (click)=\"downloadWordFile()\" class=\"toolbarButton download\" title=\"Download\" tabindex=\"34\" data-l10n-id=\"download\">\r\n\t\t\t\t<img src=\"/assets/pdfjs/web/images/toolbarButton-download.png\" alt=\"Download\" />\r\n\t\t\t</button>\r\n\r\n\t\t\t<button id=\"closeFile\" (click)=\"closeWordFile()\" class=\"toolbarButton\" title=\"Close\" tabindex=\"36\" data-l10n-id=\"closeFile\">\r\n\t\t\t\t<img src=\"/assets/pdfjs/web/images/close-file.png\" alt=\"Close\" />\r\n\t\t\t</button>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n<div #loadingSpin class=\"loadingSpin\">\r\n\t<div class=\"loader\"></div>\r\n</div>\r\n<iframe id=\"iframeDocx\" #iframeDocx title=\"ng2-pdfjs-viewer\" [hidden]=\"externalWindow || (!externalWindow && !pdfSrc)\" width=\"100%\" height=\"100%\"></iframe>\r\n\r\n<iframe id=\"iframePDF\" #iframePDF title=\"ng2-pdfjs-viewer\" [hidden]=\"externalWindow || (!externalWindow && !pdfSrc)\" width=\"100%\" height=\"100%\"></iframe>\r\n", styles: [".toolbar{position:relative;left:0;right:0;z-index:9999;cursor:default;display:none}#toolbarContainer{width:100%}#toolbarContainer{position:relative;height:32px;background-color:#474747;background-image:linear-gradient(#525252fc,#454545f2)}#toolbarViewer{height:32px;display:flex;flex-direction:row;justify-content:flex-end;align-items:center}button{background:none;width:53px;height:25px;min-width:16px;padding:2px 6px 0;border:1px solid transparent;border-radius:2px;color:#fffc;font-size:12px;line-height:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer;transition-property:background-color,border-color,box-shadow;transition-duration:.15s;transition-timing-function:ease}button:hover{background-color:#0000001f;background-image:linear-gradient(#ffffff0d,#fff0);background-clip:padding-box;border:1px solid hsla(0,0%,0%,.35);border-color:hsla(0,0%,0%,.32) hsla(0,0%,0%,.38) hsla(0,0%,0%,.42);box-shadow:0 1px #ffffff0d inset,0 0 1px #ffffff26 inset,0 1px #ffffff0d}.loadingSpin{display:none;position:relative;top:0;left:0;width:100%;height:100%;background-color:#00000040;z-index:1000}.loader{z-index:1001;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border:16px solid #f3f3f3;border-radius:50%;border-top:16px solid #3498db;width:120px;height:120px;-webkit-animation:spin 2s linear infinite;animation:spin 2s linear infinite}@-webkit-keyframes spin{0%{-webkit-transform:rotate(0deg)}to{-webkit-transform:rotate(360deg)}}@keyframes spin{0%{transform:rotate(0)}to{transform:rotate(360deg)}}\n"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfJsViewerComponent, decorators: [{
            type: Component,
            args: [{ selector: "ng2-pdfjs-viewer", template: "<div #viewWordBar class=\"toolbar\">\r\n\t<div id=\"toolbarContainer\">\r\n\t\t<div id=\"toolbarViewer\">\r\n\t\t\t<button id=\"download\" (click)=\"downloadWordFile()\" class=\"toolbarButton download\" title=\"Download\" tabindex=\"34\" data-l10n-id=\"download\">\r\n\t\t\t\t<img src=\"/assets/pdfjs/web/images/toolbarButton-download.png\" alt=\"Download\" />\r\n\t\t\t</button>\r\n\r\n\t\t\t<button id=\"closeFile\" (click)=\"closeWordFile()\" class=\"toolbarButton\" title=\"Close\" tabindex=\"36\" data-l10n-id=\"closeFile\">\r\n\t\t\t\t<img src=\"/assets/pdfjs/web/images/close-file.png\" alt=\"Close\" />\r\n\t\t\t</button>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n<div #loadingSpin class=\"loadingSpin\">\r\n\t<div class=\"loader\"></div>\r\n</div>\r\n<iframe id=\"iframeDocx\" #iframeDocx title=\"ng2-pdfjs-viewer\" [hidden]=\"externalWindow || (!externalWindow && !pdfSrc)\" width=\"100%\" height=\"100%\"></iframe>\r\n\r\n<iframe id=\"iframePDF\" #iframePDF title=\"ng2-pdfjs-viewer\" [hidden]=\"externalWindow || (!externalWindow && !pdfSrc)\" width=\"100%\" height=\"100%\"></iframe>\r\n", styles: [".toolbar{position:relative;left:0;right:0;z-index:9999;cursor:default;display:none}#toolbarContainer{width:100%}#toolbarContainer{position:relative;height:32px;background-color:#474747;background-image:linear-gradient(#525252fc,#454545f2)}#toolbarViewer{height:32px;display:flex;flex-direction:row;justify-content:flex-end;align-items:center}button{background:none;width:53px;height:25px;min-width:16px;padding:2px 6px 0;border:1px solid transparent;border-radius:2px;color:#fffc;font-size:12px;line-height:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer;transition-property:background-color,border-color,box-shadow;transition-duration:.15s;transition-timing-function:ease}button:hover{background-color:#0000001f;background-image:linear-gradient(#ffffff0d,#fff0);background-clip:padding-box;border:1px solid hsla(0,0%,0%,.35);border-color:hsla(0,0%,0%,.32) hsla(0,0%,0%,.38) hsla(0,0%,0%,.42);box-shadow:0 1px #ffffff0d inset,0 0 1px #ffffff26 inset,0 1px #ffffff0d}.loadingSpin{display:none;position:relative;top:0;left:0;width:100%;height:100%;background-color:#00000040;z-index:1000}.loader{z-index:1001;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border:16px solid #f3f3f3;border-radius:50%;border-top:16px solid #3498db;width:120px;height:120px;-webkit-animation:spin 2s linear infinite;animation:spin 2s linear infinite}@-webkit-keyframes spin{0%{-webkit-transform:rotate(0deg)}to{-webkit-transform:rotate(360deg)}}@keyframes spin{0%{transform:rotate(0)}to{transform:rotate(360deg)}}\n"] }]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQudHMiLCIuLi8uLi8uLi9zcmMvbmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBaUMsTUFBTSxlQUFlLENBQUM7O0FBT2pILE1BQU0sT0FBTyxvQkFBb0I7SUFDWSxXQUFXLENBQWE7SUFDeEIsV0FBVyxDQUFhO0lBQ3pCLFVBQVUsQ0FBYTtJQUN4QixTQUFTLENBQWE7SUFDaEQsUUFBUSxDQUFTO0lBQ3ZCLGFBQWEsR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztJQUN0RCxZQUFZLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7SUFDckQsY0FBYyxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO0lBQ3ZELFlBQVksR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztJQUMvQyxZQUFZLENBQVM7SUFDckIsY0FBYyxHQUFZLEtBQUssQ0FBQztJQUNoQyxXQUFXLEdBQVksSUFBSSxDQUFDO0lBQzVCLGdCQUFnQixDQUFTO0lBQ3pCLFFBQVEsR0FBWSxJQUFJLENBQUM7SUFDekIsUUFBUSxHQUFZLElBQUksQ0FBQztJQUN6QixhQUFhLENBQVU7SUFDdkIsWUFBWSxHQUFZLEtBQUssQ0FBQztJQUM5QixLQUFLLEdBQVksSUFBSSxDQUFDO0lBQ3RCLFVBQVUsQ0FBVTtJQUNwQixVQUFVLEdBQVksSUFBSSxDQUFDO0lBQzNDLDBDQUEwQztJQUMxQixJQUFJLEdBQVksSUFBSSxDQUFDO0lBQ3JCLElBQUksQ0FBUztJQUNiLFNBQVMsQ0FBUztJQUNsQixRQUFRLENBQVM7SUFDakIsUUFBUSxDQUFVO0lBQ2xCLFFBQVEsQ0FBVTtJQUNsQixT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Q1UsUUFBUTtzQkFBdkIsS0FBSztnQkFDVSxRQUFRO3NCQUF2QixLQUFLO2dCQUNVLFFBQVE7c0JBQXZCLEtBQUs7Z0JBQ1UsU0FBUztzQkFBeEIsS0FBSztnQkFDVSxNQUFNO3NCQUFyQixLQUFLO2dCQUNVLE1BQU07c0JBQXJCLEtBQUs7Z0JBQ1UsTUFBTTtzQkFBckIsS0FBSztnQkFDVSxNQUFNO3NCQUFyQixLQUFLO2dCQUNVLGNBQWM7c0JBQTdCLEtBQUs7Z0JBQ1UsYUFBYTtzQkFBNUIsS0FBSztnQkFDVSxXQUFXO3NCQUExQixLQUFLO2dCQUNVLFlBQVk7c0JBQTNCLEtBQUs7Z0JBQ1UsY0FBYztzQkFBN0IsS0FBSztnQkFFVSxxQkFBcUI7c0JBQXBDLEtBQUs7Z0JBS1UsV0FBVztzQkFBMUIsS0FBSztnQkFDSSxTQUFTO3NCQUFsQixNQUFNO2dCQUtJLElBQUk7c0JBRGQsS0FBSztnQkFzQkssTUFBTTtzQkFEaEIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIE91dHB1dCwgVmlld0NoaWxkLCBFdmVudEVtaXR0ZXIsIEVsZW1lbnRSZWYsIE9uRGVzdHJveSwgT25Jbml0IH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcclxuXHJcbkBDb21wb25lbnQoe1xyXG5cdHNlbGVjdG9yOiBcIm5nMi1wZGZqcy12aWV3ZXJcIixcclxuXHR0ZW1wbGF0ZVVybDogXCIuL25nMi1wZGZqcy12aWV3ZXIuY29tcG9uZW50Lmh0bWxcIixcclxuXHRzdHlsZVVybHM6IFtcIi4vbmcyLXBkZmpzLXZpZXdlci5jb21wb25lbnQuc2Nzc1wiXSxcclxufSlcclxuZXhwb3J0IGNsYXNzIFBkZkpzVmlld2VyQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xyXG5cdEBWaWV3Q2hpbGQoXCJ2aWV3V29yZEJhclwiLCB7IHN0YXRpYzogdHJ1ZSB9KSB2aWV3V29yZEJhcjogRWxlbWVudFJlZjtcclxuXHRAVmlld0NoaWxkKFwibG9hZGluZ1NwaW5cIiwgeyBzdGF0aWM6IHRydWUgfSkgbG9hZGluZ1NwaW46IEVsZW1lbnRSZWY7XHJcblx0QFZpZXdDaGlsZChcImlmcmFtZURvY3hcIiwgeyBzdGF0aWM6IHRydWUgfSkgaWZyYW1lRG9jeDogRWxlbWVudFJlZjtcclxuXHRAVmlld0NoaWxkKFwiaWZyYW1lUERGXCIsIHsgc3RhdGljOiB0cnVlIH0pIGlmcmFtZVBERjogRWxlbWVudFJlZjtcclxuXHRASW5wdXQoKSBwdWJsaWMgdmlld2VySWQ6IHN0cmluZztcclxuXHRAT3V0cHV0KCkgb25CZWZvcmVQcmludDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblx0QE91dHB1dCgpIG9uQWZ0ZXJQcmludDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblx0QE91dHB1dCgpIG9uRG9jdW1lbnRMb2FkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHRAT3V0cHV0KCkgb25QYWdlQ2hhbmdlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHRASW5wdXQoKSBwdWJsaWMgdmlld2VyRm9sZGVyOiBzdHJpbmc7XHJcblx0QElucHV0KCkgcHVibGljIGV4dGVybmFsV2luZG93OiBib29sZWFuID0gZmFsc2U7XHJcblx0QElucHV0KCkgcHVibGljIHNob3dTcGlubmVyOiBib29sZWFuID0gdHJ1ZTtcclxuXHRASW5wdXQoKSBwdWJsaWMgZG93bmxvYWRGaWxlTmFtZTogc3RyaW5nO1xyXG5cdEBJbnB1dCgpIHB1YmxpYyBvcGVuRmlsZTogYm9vbGVhbiA9IHRydWU7XHJcblx0QElucHV0KCkgcHVibGljIGRvd25sb2FkOiBib29sZWFuID0gdHJ1ZTtcclxuXHRASW5wdXQoKSBwdWJsaWMgc3RhcnREb3dubG9hZDogYm9vbGVhbjtcclxuXHRASW5wdXQoKSBwdWJsaWMgdmlld0Jvb2ttYXJrOiBib29sZWFuID0gZmFsc2U7XHJcblx0QElucHV0KCkgcHVibGljIHByaW50OiBib29sZWFuID0gdHJ1ZTtcclxuXHRASW5wdXQoKSBwdWJsaWMgc3RhcnRQcmludDogYm9vbGVhbjtcclxuXHRASW5wdXQoKSBwdWJsaWMgZnVsbFNjcmVlbjogYm9vbGVhbiA9IHRydWU7XHJcblx0Ly9ASW5wdXQoKSBwdWJsaWMgc2hvd0Z1bGxTY3JlZW46IGJvb2xlYW47XHJcblx0QElucHV0KCkgcHVibGljIGZpbmQ6IGJvb2xlYW4gPSB0cnVlO1xyXG5cdEBJbnB1dCgpIHB1YmxpYyB6b29tOiBzdHJpbmc7XHJcblx0QElucHV0KCkgcHVibGljIG5hbWVkZGVzdDogc3RyaW5nO1xyXG5cdEBJbnB1dCgpIHB1YmxpYyBwYWdlbW9kZTogc3RyaW5nO1xyXG5cdEBJbnB1dCgpIHB1YmxpYyBsYXN0UGFnZTogYm9vbGVhbjtcclxuXHRASW5wdXQoKSBwdWJsaWMgcm90YXRlY3c6IGJvb2xlYW47XHJcblx0QElucHV0KCkgcHVibGljIHJvdGF0ZWNjdzogYm9vbGVhbjtcclxuXHRASW5wdXQoKSBwdWJsaWMgY3Vyc29yOiBzdHJpbmc7XHJcblx0QElucHV0KCkgcHVibGljIHNjcm9sbDogc3RyaW5nO1xyXG5cdEBJbnB1dCgpIHB1YmxpYyBzcHJlYWQ6IHN0cmluZztcclxuXHRASW5wdXQoKSBwdWJsaWMgbG9jYWxlOiBzdHJpbmc7XHJcblx0QElucHV0KCkgcHVibGljIHVzZU9ubHlDc3Nab29tOiBib29sZWFuID0gZmFsc2U7XHJcblx0QElucHV0KCkgcHVibGljIGVycm9yT3ZlcnJpZGU6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHRASW5wdXQoKSBwdWJsaWMgZXJyb3JBcHBlbmQ6IGJvb2xlYW4gPSB0cnVlO1xyXG5cdEBJbnB1dCgpIHB1YmxpYyBlcnJvck1lc3NhZ2U6IHN0cmluZztcclxuXHRASW5wdXQoKSBwdWJsaWMgZGlhZ25vc3RpY0xvZ3M6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuXHRASW5wdXQoKSBwdWJsaWMgZXh0ZXJuYWxXaW5kb3dPcHRpb25zOiBzdHJpbmc7XHJcblx0cHVibGljIHZpZXdlclRhYjogYW55O1xyXG5cdHByaXZhdGUgX3NyYzogc3RyaW5nIHwgQmxvYiB8IFVpbnQ4QXJyYXk7XHJcblx0cHJpdmF0ZSBfcGFnZTogbnVtYmVyO1xyXG5cclxuXHRASW5wdXQoKSBwdWJsaWMgY2xvc2VCdXR0b246IGJvb2xlYW47XHJcblx0QE91dHB1dCgpIGNsb3NlRmlsZTogRXZlbnRFbWl0dGVyPGJvb2xlYW4+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuXHR2aWV3ZXJVcmw7XHJcblxyXG5cdEBJbnB1dCgpXHJcblx0cHVibGljIHNldCBwYWdlKF9wYWdlOiBudW1iZXIpIHtcclxuXHRcdHRoaXMuX3BhZ2UgPSBfcGFnZTtcclxuXHRcdGlmICh0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uKSB7XHJcblx0XHRcdHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24ucGFnZSA9IHRoaXMuX3BhZ2U7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpZiAodGhpcy5kaWFnbm9zdGljTG9ncylcclxuXHRcdFx0XHRjb25zb2xlLndhcm4oXHJcblx0XHRcdFx0XHRcIkRvY3VtZW50IGlzIG5vdCBsb2FkZWQgeWV0ISEhLiBUcnkgdG8gc2V0IHBhZ2UjIGFmdGVyIGZ1bGwgbG9hZC4gSWdub3JlIHRoaXMgd2FybmluZyBpZiB5b3UgYXJlIG5vdCBzZXR0aW5nIHBhZ2UjIHVzaW5nICcuJyBub3RhdGlvbi4gKEUuZy4gcGRmVmlld2VyLnBhZ2UgPSA1OylcIixcclxuXHRcdFx0XHQpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHVibGljIGdldCBwYWdlKCkge1xyXG5cdFx0aWYgKHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24pIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24ucGFnZTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGlmICh0aGlzLmRpYWdub3N0aWNMb2dzKSBjb25zb2xlLndhcm4oXCJEb2N1bWVudCBpcyBub3QgbG9hZGVkIHlldCEhIS4gVHJ5IHRvIHJldHJpZXZlIHBhZ2UjIGFmdGVyIGZ1bGwgbG9hZC5cIik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRASW5wdXQoKVxyXG5cdHB1YmxpYyBzZXQgcGRmU3JjKF9zcmM6IHN0cmluZyB8IEJsb2IgfCBVaW50OEFycmF5KSB7XHJcblx0XHRpZiAodHlwZW9mIF9zcmMgPT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0dGhpcy5fc3JjID0gZW5jb2RlVVJJQ29tcG9uZW50KF9zcmMpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5fc3JjID0gX3NyYztcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHB1YmxpYyBnZXQgcGRmU3JjKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3NyYztcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBnZXQgUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zKCkge1xyXG5cdFx0bGV0IHBkZlZpZXdlck9wdGlvbnMgPSBudWxsO1xyXG5cdFx0aWYgKHRoaXMuZXh0ZXJuYWxXaW5kb3cpIHtcclxuXHRcdFx0aWYgKHRoaXMudmlld2VyVGFiKSB7XHJcblx0XHRcdFx0cGRmVmlld2VyT3B0aW9ucyA9IHRoaXMudmlld2VyVGFiLlBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucztcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aWYgKHRoaXMuaWZyYW1lUERGLm5hdGl2ZUVsZW1lbnQuY29udGVudFdpbmRvdykge1xyXG5cdFx0XHRcdHBkZlZpZXdlck9wdGlvbnMgPSB0aGlzLmlmcmFtZVBERi5uYXRpdmVFbGVtZW50LmNvbnRlbnRXaW5kb3cuUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcGRmVmlld2VyT3B0aW9ucztcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBnZXQgUERGVmlld2VyQXBwbGljYXRpb24oKSB7XHJcblx0XHRsZXQgcGRmVmlld2VyID0gbnVsbDtcclxuXHRcdGlmICh0aGlzLmV4dGVybmFsV2luZG93KSB7XHJcblx0XHRcdGlmICh0aGlzLnZpZXdlclRhYikge1xyXG5cdFx0XHRcdHBkZlZpZXdlciA9IHRoaXMudmlld2VyVGFiLlBERlZpZXdlckFwcGxpY2F0aW9uO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpZiAodGhpcy5pZnJhbWVQREYubmF0aXZlRWxlbWVudC5jb250ZW50V2luZG93KSB7XHJcblx0XHRcdFx0cGRmVmlld2VyID0gdGhpcy5pZnJhbWVQREYubmF0aXZlRWxlbWVudC5jb250ZW50V2luZG93LlBERlZpZXdlckFwcGxpY2F0aW9uO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcGRmVmlld2VyO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHJlY2VpdmVNZXNzYWdlKHZpZXdlckV2ZW50KSB7XHJcblx0XHRpZiAodmlld2VyRXZlbnQuZGF0YSAmJiB2aWV3ZXJFdmVudC5kYXRhLnZpZXdlcklkICYmIHZpZXdlckV2ZW50LmRhdGEuZXZlbnQpIHtcclxuXHRcdFx0bGV0IHZpZXdlcklkID0gdmlld2VyRXZlbnQuZGF0YS52aWV3ZXJJZDtcclxuXHRcdFx0bGV0IGV2ZW50ID0gdmlld2VyRXZlbnQuZGF0YS5ldmVudDtcclxuXHRcdFx0bGV0IHBhcmFtID0gdmlld2VyRXZlbnQuZGF0YS5wYXJhbTtcclxuXHRcdFx0aWYgKHRoaXMudmlld2VySWQgPT0gdmlld2VySWQpIHtcclxuXHRcdFx0XHRpZiAodGhpcy5vbkJlZm9yZVByaW50ICYmIGV2ZW50ID09IFwiYmVmb3JlUHJpbnRcIikge1xyXG5cdFx0XHRcdFx0dGhpcy5vbkJlZm9yZVByaW50LmVtaXQoKTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKHRoaXMub25BZnRlclByaW50ICYmIGV2ZW50ID09IFwiYWZ0ZXJQcmludFwiKSB7XHJcblx0XHRcdFx0XHR0aGlzLm9uQWZ0ZXJQcmludC5lbWl0KCk7XHJcblx0XHRcdFx0fSBlbHNlIGlmICh0aGlzLm9uRG9jdW1lbnRMb2FkICYmIGV2ZW50ID09IFwicGFnZXNMb2FkZWRcIikge1xyXG5cdFx0XHRcdFx0dGhpcy5vbkRvY3VtZW50TG9hZC5lbWl0KHBhcmFtKTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKHRoaXMub25QYWdlQ2hhbmdlICYmIGV2ZW50ID09IFwicGFnZUNoYW5nZVwiKSB7XHJcblx0XHRcdFx0XHR0aGlzLm9uUGFnZUNoYW5nZS5lbWl0KHBhcmFtKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGlmICh2aWV3ZXJFdmVudC5kYXRhICYmIHZpZXdlckV2ZW50LmRhdGEuZXZlbnQgPT09IFwiY2xvc2VmaWxlXCIpIHtcclxuXHRcdFx0dGhpcy5jbG9zZUZpbGUuZW1pdCh0cnVlKTtcclxuXHRcdH0gZWxzZSBpZiAodmlld2VyRXZlbnQuZGF0YSAmJiB2aWV3ZXJFdmVudC5kYXRhLmV2ZW50ID09PSBcImxvYWRlckVycm9yXCIpIHtcclxuXHRcdFx0dGhpcy5sb2FkaW5nU3Bpbi5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcblx0XHRcdHRoaXMuaWZyYW1lUERGLm5hdGl2ZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG5cclxuXHRcdFx0bGV0IHVybCA9IHRoaXMuZ2V0VXJsRmlsZSgpO1xyXG5cdFx0XHRsZXQgZXh0ID0gdGhpcy5nZXRGaWxlRXh0ZW5zaW9uKHVybCk7XHJcblx0XHRcdGlmICh0aGlzLmlzVmFsaWRGaWxlKGV4dCkpIHtcclxuXHRcdFx0XHRjb25zdCBfdXJsRmlsZSA9IGRlY29kZVVSSUNvbXBvbmVudCh1cmwpO1xyXG5cdFx0XHRcdGNvbnN0IF9jaGVja0V4dFdpdGhvdXRQZGYgPSB0aGlzLmlzVmFsaWRGaWxlKHRoaXMuZ2V0RmlsZUV4dGVuc2lvbihfdXJsRmlsZS5zcGxpdChcIi5wZGZcIilbMF0pKTtcclxuXHRcdFx0XHRpZiAoX2NoZWNrRXh0V2l0aG91dFBkZikge1xyXG5cdFx0XHRcdFx0X3VybEZpbGUucmVwbGFjZShcIi5wZGZcIiwgXCJcIik7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQvLyBIaeG7g24gdGjhu4sgdGhhbmggY8O0bmcgY+G7pSB2w6AgaWZyYW1lXHJcblx0XHRcdFx0dGhpcy52aWV3V29yZEJhci5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcblx0XHRcdFx0dGhpcy5pZnJhbWVEb2N4Lm5hdGl2ZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxuXHJcblx0XHRcdFx0Ly8gxJDhurd0IFVSTCBiYW4gxJHhuqd1IGNobyBpZnJhbWVcclxuXHRcdFx0XHR0aGlzLnZpZXdlclVybCA9IGBodHRwczovL3ZpZXcub2ZmaWNlYXBwcy5saXZlLmNvbS9vcC9lbWJlZC5hc3B4P3NyYz0ke191cmxGaWxlfWA7XHJcblx0XHRcdFx0dGhpcy5pZnJhbWVEb2N4Lm5hdGl2ZUVsZW1lbnQuc3JjID0gdGhpcy52aWV3ZXJVcmw7XHJcblxyXG5cdFx0XHRcdC8vIMSQ4bqjbSBi4bqjbyBy4bqxbmcgbG9hZGluZyBzcGlubmVyIHPhur0gdOG6r3Qga2hpIGlmcmFtZSB04bqjaSB4b25nXHJcblx0XHRcdFx0dGhpcy5pZnJhbWVEb2N4Lm5hdGl2ZUVsZW1lbnQub25sb2FkID0gKCkgPT4ge1xyXG5cdFx0XHRcdFx0Y29uc3QgY29udGVudCA9IHRoaXMuaWZyYW1lRG9jeC5uYXRpdmVFbGVtZW50Py5jb250ZW50V2luZG93Py5kb2N1bWVudD8uYm9keT8uaW5uZXJIVE1MO1xyXG5cclxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiY29udGVudDogXCIgKyBjb250ZW50KTtcclxuXHRcdFx0XHRcdFxyXG5cclxuXHRcdFx0XHRcdGlmICghY29udGVudCkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLnZpZXdlclVybCA9IGBodHRwczovL2RvY3MuZ29vZ2xlLmNvbS9ndmlldz91cmw9JHtfdXJsRmlsZX0mZW1iZWRkZWQ9dHJ1ZWA7XHJcblx0XHRcdFx0XHRcdHRoaXMuaWZyYW1lRG9jeC5uYXRpdmVFbGVtZW50LnNyYyA9IHRoaXMudmlld2VyVXJsO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdC8vIMSQ4bqjbSBi4bqjbyBzcGlubmVyIHThuq90IGtoaSB04bqjaSB4b25nIGLhuqV0IGvhu7MgVVJMIG7DoG9cclxuXHRcdFx0XHRcdGlmICh0aGlzLmxvYWRpbmdTcGluICYmIHRoaXMubG9hZGluZ1NwaW4ubmF0aXZlRWxlbWVudCkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLmxvYWRpbmdTcGluLm5hdGl2ZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH07XHJcblxyXG5cdFx0XHRcdC8vIEThu7EgcGjDsm5nOiBU4bqvdCBzcGlubmVyIHNhdSBraG/huqNuZyB0aOG7nWkgZ2lhbiB04buRaSDEkWEgKHbDrSBk4bulOiAxMCBnacOieSlcclxuXHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcclxuXHRcdFx0XHRcdGlmICh0aGlzLmxvYWRpbmdTcGluICYmIHRoaXMubG9hZGluZ1NwaW4ubmF0aXZlRWxlbWVudCkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLmxvYWRpbmdTcGluLm5hdGl2ZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0sIDEwMDAwKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyhcIsSQ4buLbmggZOG6oW5nIGtow7RuZyBo4bujcCBs4buHIVwiKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZG93bmxvYWRGaWxlKGJsb2JVcmwsIGZpbGVuYW1lKSB7XHJcblx0XHR2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xyXG5cdFx0aWYgKCFhLmNsaWNrKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcignRG93bmxvYWRNYW5hZ2VyOiBcImEuY2xpY2soKVwiIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XHJcblx0XHR9XHJcblx0XHRhLmhyZWYgPSBibG9iVXJsO1xyXG5cdFx0YS50YXJnZXQgPSBcIl9wYXJlbnRcIjtcclxuXHRcdGlmIChcImRvd25sb2FkXCIgaW4gYSkge1xyXG5cdFx0XHRhLmRvd25sb2FkID0gZmlsZW5hbWU7XHJcblx0XHR9XHJcblx0XHQoZG9jdW1lbnQuYm9keSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpLmFwcGVuZENoaWxkKGEpO1xyXG5cdFx0YS5jbGljaygpO1xyXG5cdFx0YS5yZW1vdmUoKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBkb3dubG9hZFdvcmRGaWxlKCkge1xyXG5cdFx0Y29uc29sZS5sb2coXCJkb3dubG9hZCBmaWxlIVwiKTtcclxuXHRcdGxldCB1cmwgPSB0aGlzLmdldFVybEZpbGUoKTtcclxuXHRcdHRoaXMuZG93bmxvYWRGaWxlKHVybCwgXCJ0ZXN0XCIpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGNsb3NlV29yZEZpbGUoKSB7XHJcblx0XHRjb25zb2xlLmxvZyhcImNsb3NlIEZpbGUhXCIpO1xyXG5cdFx0dGhpcy5jbG9zZUZpbGUuZW1pdCh0cnVlKTtcclxuXHR9XHJcblxyXG5cdGlzVmFsaWRGaWxlKHN0cikge1xyXG5cdFx0c3dpdGNoIChzdHIudG9Mb3dlckNhc2UoKSkge1xyXG5cdFx0XHRjYXNlIFwicGRmXCI6XHJcblx0XHRcdGNhc2UgXCJkb2NcIjpcclxuXHRcdFx0Y2FzZSBcImRvY3hcIjpcclxuXHRcdFx0Y2FzZSBcInhsc1wiOlxyXG5cdFx0XHRjYXNlIFwieGxzeFwiOlxyXG5cdFx0XHRjYXNlIFwicHB0eFwiOlxyXG5cdFx0XHRjYXNlIFwicHB0XCI6XHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHRnZXRVcmxGaWxlKCkge1xyXG5cdFx0aWYgKHRoaXMuX3NyYyBpbnN0YW5jZW9mIEJsb2IpIHtcclxuXHRcdFx0cmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChVUkwuY3JlYXRlT2JqZWN0VVJMKHRoaXMuX3NyYykpO1xyXG5cdFx0fSBlbHNlIGlmICh0aGlzLl9zcmMgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XHJcblx0XHRcdGxldCBibG9iID0gbmV3IEJsb2IoW3RoaXMuX3NyY10sIHsgdHlwZTogXCJhcHBsaWNhdGlvbi9wZGZcIiB9KTtcclxuXHRcdFx0cmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9zcmM7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRnZXRGaWxlRXh0ZW5zaW9uKGZpbGVuYW1lKSB7XHJcblx0XHRsZXQgZXh0ID0gZGVjb2RlVVJJQ29tcG9uZW50KGZpbGVuYW1lKS5zcGxpdChcIj9cIilbMF0uc3BsaXQoXCIuXCIpLnBvcCgpO1xyXG5cclxuXHRcdGlmICghZXh0KSB7XHJcblx0XHRcdGV4dCA9IGRlY29kZVVSSUNvbXBvbmVudChmaWxlbmFtZSkuc3BsaXQoXCIvXCIpLnBvcCgpLnNwbGl0KFwiLlwiKS5wb3AoKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGZpbGVuYW1lKS5zcGxpdChcIi9cIikucG9wKCkuc3BsaXQoXCIuXCIpLnBvcCgpO1xyXG5cdFx0Ly8gcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChmaWxlbmFtZSkuc3BsaXQoXCI/XCIpWzBdLnNwbGl0KFwiLlwiKS5wb3AoKTtcclxuXHRcdC8vIGNvbnN0IGV4dCA9IC9eLitcXC4oW14uXSspJC8uZXhlYyhmaWxlbmFtZSk7XHJcblx0XHQvLyByZXR1cm4gZXh0ID09IG51bGwgPyBcIlwiIDogZXh0WzFdO1xyXG5cdFx0Y29uc29sZS5sb2coXCJleHQ6IFwiICsgZXh0KTtcclxuXHJcblx0XHRyZXR1cm4gZXh0O1xyXG5cdH1cclxuXHJcblx0bmdPbkluaXQoKTogdm9pZCB7XHJcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5yZWNlaXZlTWVzc2FnZS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcblx0XHRpZiAoIXRoaXMuZXh0ZXJuYWxXaW5kb3cpIHtcclxuXHRcdFx0Ly8gTG9hZCBwZGYgZm9yIGVtYmVkZGVkIHZpZXdzXHJcblx0XHRcdHRoaXMubG9hZFBkZigpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHVibGljIHJlZnJlc2goKTogdm9pZCB7XHJcblx0XHQvLyBOZWVkcyB0byBiZSBpbnZva2VkIGZvciBleHRlcm5hbCB3aW5kb3cgb3Igd2hlbiBuZWVkcyB0byByZWxvYWQgcGRmXHJcblx0XHR0aGlzLmxvYWRQZGYoKTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgcmVsYXNlVXJsPzogKCkgPT4gdm9pZDsgLy8gQXZvaWQgbWVtb3J5IGxlYXNrIHdpdGggYFVSTC5jcmVhdGVPYmplY3RVUkxgXHJcblxyXG5cdHByaXZhdGUgbG9hZFBkZigpIHtcclxuXHRcdGlmICghdGhpcy5fc3JjKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdHRoaXMudmlld2VyVXJsID0gXCJcIjtcclxuXHRcdHRoaXMudmlld1dvcmRCYXIubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcblx0XHQvLyBjb25zb2xlLmxvZyhgVGFiIGlzIC0gJHt0aGlzLnZpZXdlclRhYn1gKTtcclxuXHRcdC8vIGlmICh0aGlzLnZpZXdlclRhYikge1xyXG5cdFx0Ly8gICBjb25zb2xlLmxvZyhgU3RhdHVzIG9mIHdpbmRvdyAtICR7dGhpcy52aWV3ZXJUYWIuY2xvc2VkfWApO1xyXG5cdFx0Ly8gfVxyXG5cclxuXHRcdHRoaXMuaWZyYW1lRG9jeC5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuXHJcblx0XHRpZiAodGhpcy5leHRlcm5hbFdpbmRvdyAmJiAodHlwZW9mIHRoaXMudmlld2VyVGFiID09PSBcInVuZGVmaW5lZFwiIHx8IHRoaXMudmlld2VyVGFiLmNsb3NlZCkpIHtcclxuXHRcdFx0dGhpcy52aWV3ZXJUYWIgPSB3aW5kb3cub3BlbihcIlwiLCBcIl9ibGFua1wiLCB0aGlzLmV4dGVybmFsV2luZG93T3B0aW9ucyB8fCBcIlwiKTtcclxuXHRcdFx0aWYgKHRoaXMudmlld2VyVGFiID09IG51bGwpIHtcclxuXHRcdFx0XHRpZiAodGhpcy5kaWFnbm9zdGljTG9ncykgY29uc29sZS5lcnJvcihcIm5nMi1wZGZqcy12aWV3ZXI6IEZvciAnZXh0ZXJuYWxXaW5kb3cgPSB0cnVlJy4gaS5lIG9wZW5pbmcgaW4gbmV3IHRhYiB0byB3b3JrLCBwb3AtdXBzIHNob3VsZCBiZSBlbmFibGVkLlwiKTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICh0aGlzLnNob3dTcGlubmVyKSB7XHJcblx0XHRcdFx0dGhpcy52aWV3ZXJUYWIuZG9jdW1lbnQud3JpdGUoYFxyXG4gICAgICAgICAgPHN0eWxlPlxyXG4gICAgICAgICAgLmxvYWRlciB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcclxuICAgICAgICAgICAgbGVmdDogNDAlO1xyXG4gICAgICAgICAgICB0b3A6IDQwJTtcclxuICAgICAgICAgICAgYm9yZGVyOiAxNnB4IHNvbGlkICNmM2YzZjM7XHJcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcclxuICAgICAgICAgICAgYm9yZGVyLXRvcDogMTZweCBzb2xpZCAjMzQ5OGRiO1xyXG4gICAgICAgICAgICB3aWR0aDogMTIwcHg7XHJcbiAgICAgICAgICAgIGhlaWdodDogMTIwcHg7XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbjogc3BpbiAycyBsaW5lYXIgaW5maW5pdGU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBAa2V5ZnJhbWVzIHNwaW4ge1xyXG4gICAgICAgICAgICAwJSB7XHJcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgMTAwJSB7XHJcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgPC9zdHlsZT5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJsb2FkZXJcIj48L2Rpdj5cclxuICAgICAgICBgKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGxldCBmaWxlVXJsID0gdGhpcy5nZXRVcmxGaWxlKCk7XHJcblx0XHQvLyBsZXQgdGhpcy52aWV3ZXJVcmw7XHJcblx0XHRpZiAodGhpcy52aWV3ZXJGb2xkZXIpIHtcclxuXHRcdFx0dGhpcy52aWV3ZXJVcmwgPSBgJHt0aGlzLnZpZXdlckZvbGRlcn0vd2ViL3ZpZXdlci5odG1sYDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMudmlld2VyVXJsID0gYGFzc2V0cy9wZGZqcy93ZWIvdmlld2VyLmh0bWxgO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMudmlld2VyVXJsICs9IGA/ZmlsZT0ke2ZpbGVVcmx9YDtcclxuXHJcblx0XHRpZiAodHlwZW9mIHRoaXMudmlld2VySWQgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuXHRcdFx0dGhpcy52aWV3ZXJVcmwgKz0gYCZ2aWV3ZXJJZD0ke3RoaXMudmlld2VySWR9YDtcclxuXHRcdH1cclxuXHRcdGlmICh0eXBlb2YgdGhpcy5vbkJlZm9yZVByaW50ICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcblx0XHRcdHRoaXMudmlld2VyVXJsICs9IGAmYmVmb3JlUHJpbnQ9dHJ1ZWA7XHJcblx0XHR9XHJcblx0XHRpZiAodHlwZW9mIHRoaXMub25BZnRlclByaW50ICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcblx0XHRcdHRoaXMudmlld2VyVXJsICs9IGAmYWZ0ZXJQcmludD10cnVlYDtcclxuXHRcdH1cclxuXHRcdGlmICh0eXBlb2YgdGhpcy5vbkRvY3VtZW50TG9hZCAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0XHR0aGlzLnZpZXdlclVybCArPSBgJnBhZ2VzTG9hZGVkPXRydWVgO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHR5cGVvZiB0aGlzLm9uUGFnZUNoYW5nZSAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0XHR0aGlzLnZpZXdlclVybCArPSBgJnBhZ2VDaGFuZ2U9dHJ1ZWA7XHJcblx0XHR9XHJcblx0XHRpZiAodHlwZW9mIHRoaXMuY2xvc2VCdXR0b24gIT09IFwidW5kZWZpbmVkXCIpIHtcclxuXHRcdFx0dGhpcy52aWV3ZXJVcmwgKz0gYCZjbG9zZUZpbGU9JHt0aGlzLmNsb3NlQnV0dG9ufWA7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMuZG93bmxvYWRGaWxlTmFtZSkge1xyXG5cdFx0XHQvLyBpZiAoIXRoaXMuZG93bmxvYWRGaWxlTmFtZS5lbmRzV2l0aChcIi5wZGZcIikpIHtcclxuXHRcdFx0Ly8gXHR0aGlzLmRvd25sb2FkRmlsZU5hbWUgKz0gXCIucGRmXCI7XHJcblx0XHRcdC8vIH1cclxuXHRcdFx0dGhpcy52aWV3ZXJVcmwgKz0gYCZmaWxlTmFtZT0ke3RoaXMuZG93bmxvYWRGaWxlTmFtZX0ucGRmYDtcclxuXHRcdH1cclxuXHRcdGlmICh0eXBlb2YgdGhpcy5vcGVuRmlsZSAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0XHR0aGlzLnZpZXdlclVybCArPSBgJm9wZW5GaWxlPSR7dGhpcy5vcGVuRmlsZX1gO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHR5cGVvZiB0aGlzLmRvd25sb2FkICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcblx0XHRcdHRoaXMudmlld2VyVXJsICs9IGAmZG93bmxvYWQ9JHt0aGlzLmRvd25sb2FkfWA7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5zdGFydERvd25sb2FkKSB7XHJcblx0XHRcdHRoaXMudmlld2VyVXJsICs9IGAmc3RhcnREb3dubG9hZD0ke3RoaXMuc3RhcnREb3dubG9hZH1gO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHR5cGVvZiB0aGlzLnZpZXdCb29rbWFyayAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0XHR0aGlzLnZpZXdlclVybCArPSBgJnZpZXdCb29rbWFyaz0ke3RoaXMudmlld0Jvb2ttYXJrfWA7XHJcblx0XHR9XHJcblx0XHRpZiAodHlwZW9mIHRoaXMucHJpbnQgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuXHRcdFx0dGhpcy52aWV3ZXJVcmwgKz0gYCZwcmludD0ke3RoaXMucHJpbnR9YDtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLnN0YXJ0UHJpbnQpIHtcclxuXHRcdFx0dGhpcy52aWV3ZXJVcmwgKz0gYCZzdGFydFByaW50PSR7dGhpcy5zdGFydFByaW50fWA7XHJcblx0XHR9XHJcblx0XHRpZiAodHlwZW9mIHRoaXMuZnVsbFNjcmVlbiAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0XHR0aGlzLnZpZXdlclVybCArPSBgJmZ1bGxTY3JlZW49JHt0aGlzLmZ1bGxTY3JlZW59YDtcclxuXHRcdH1cclxuXHRcdC8vIGlmICh0aGlzLnNob3dGdWxsU2NyZWVuKSB7XHJcblx0XHQvLyAgIHRoaXMudmlld2VyVXJsICs9IGAmc2hvd0Z1bGxTY3JlZW49JHt0aGlzLnNob3dGdWxsU2NyZWVufWA7XHJcblx0XHQvLyB9XHJcblx0XHRpZiAodHlwZW9mIHRoaXMuZmluZCAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0XHR0aGlzLnZpZXdlclVybCArPSBgJmZpbmQ9JHt0aGlzLmZpbmR9YDtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLmxhc3RQYWdlKSB7XHJcblx0XHRcdHRoaXMudmlld2VyVXJsICs9IGAmbGFzdHBhZ2U9JHt0aGlzLmxhc3RQYWdlfWA7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5yb3RhdGVjdykge1xyXG5cdFx0XHR0aGlzLnZpZXdlclVybCArPSBgJnJvdGF0ZWN3PSR7dGhpcy5yb3RhdGVjd31gO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMucm90YXRlY2N3KSB7XHJcblx0XHRcdHRoaXMudmlld2VyVXJsICs9IGAmcm90YXRlY2N3PSR7dGhpcy5yb3RhdGVjY3d9YDtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLmN1cnNvcikge1xyXG5cdFx0XHR0aGlzLnZpZXdlclVybCArPSBgJmN1cnNvcj0ke3RoaXMuY3Vyc29yfWA7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5zY3JvbGwpIHtcclxuXHRcdFx0dGhpcy52aWV3ZXJVcmwgKz0gYCZzY3JvbGw9JHt0aGlzLnNjcm9sbH1gO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMuc3ByZWFkKSB7XHJcblx0XHRcdHRoaXMudmlld2VyVXJsICs9IGAmc3ByZWFkPSR7dGhpcy5zcHJlYWR9YDtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLmxvY2FsZSkge1xyXG5cdFx0XHR0aGlzLnZpZXdlclVybCArPSBgJmxvY2FsZT0ke3RoaXMubG9jYWxlfWA7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy51c2VPbmx5Q3NzWm9vbSkge1xyXG5cdFx0XHR0aGlzLnZpZXdlclVybCArPSBgJnVzZU9ubHlDc3Nab29tPSR7dGhpcy51c2VPbmx5Q3NzWm9vbX1gO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0aGlzLl9wYWdlIHx8IHRoaXMuem9vbSB8fCB0aGlzLm5hbWVkZGVzdCB8fCB0aGlzLnBhZ2Vtb2RlKSB0aGlzLnZpZXdlclVybCArPSBcIiNcIjtcclxuXHRcdGlmICh0aGlzLl9wYWdlKSB7XHJcblx0XHRcdHRoaXMudmlld2VyVXJsICs9IGAmcGFnZT0ke3RoaXMuX3BhZ2V9YDtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLnpvb20pIHtcclxuXHRcdFx0dGhpcy52aWV3ZXJVcmwgKz0gYCZ6b29tPSR7dGhpcy56b29tfWA7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5uYW1lZGRlc3QpIHtcclxuXHRcdFx0dGhpcy52aWV3ZXJVcmwgKz0gYCZuYW1lZGRlc3Q9JHt0aGlzLm5hbWVkZGVzdH1gO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMucGFnZW1vZGUpIHtcclxuXHRcdFx0dGhpcy52aWV3ZXJVcmwgKz0gYCZwYWdlbW9kZT0ke3RoaXMucGFnZW1vZGV9YDtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLmVycm9yT3ZlcnJpZGUgfHwgdGhpcy5lcnJvckFwcGVuZCkge1xyXG5cdFx0XHR0aGlzLnZpZXdlclVybCArPSBgJmVycm9yTWVzc2FnZT0ke3RoaXMuZXJyb3JNZXNzYWdlfWA7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5lcnJvck92ZXJyaWRlKSB7XHJcblx0XHRcdFx0dGhpcy52aWV3ZXJVcmwgKz0gYCZlcnJvck92ZXJyaWRlPSR7dGhpcy5lcnJvck92ZXJyaWRlfWA7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKHRoaXMuZXJyb3JBcHBlbmQpIHtcclxuXHRcdFx0XHR0aGlzLnZpZXdlclVybCArPSBgJmVycm9yQXBwZW5kPSR7dGhpcy5lcnJvckFwcGVuZH1gO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMuZXh0ZXJuYWxXaW5kb3cpIHtcclxuXHRcdFx0dGhpcy52aWV3ZXJUYWIubG9jYXRpb24uaHJlZiA9IHRoaXMudmlld2VyVXJsO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5pZnJhbWVQREYubmF0aXZlRWxlbWVudC5zcmMgPSB0aGlzLnZpZXdlclVybDtcclxuXHRcdH1cclxuXHJcblx0XHRjb25zb2xlLmxvZyhgXHJcbiAgICAgIHBkZlNyYyA9ICR7dGhpcy5wZGZTcmN9XHJcbiAgICAgIGZpbGVVcmwgPSAke2ZpbGVVcmx9XHJcbiAgICAgIGV4dGVybmFsV2luZG93ID0gJHt0aGlzLmV4dGVybmFsV2luZG93fVxyXG4gICAgICBkb3dubG9hZEZpbGVOYW1lID0gJHt0aGlzLmRvd25sb2FkRmlsZU5hbWV9XHJcbiAgICBgKTtcclxuXHJcblx0XHQvLyB2aWV3ZXJGb2xkZXIgPSAke3RoaXMudmlld2VyRm9sZGVyfVxyXG5cdFx0Ly8gb3BlbkZpbGUgPSAke3RoaXMub3BlbkZpbGV9XHJcblx0XHQvLyBkb3dubG9hZCA9ICR7dGhpcy5kb3dubG9hZH1cclxuXHRcdC8vIHN0YXJ0RG93bmxvYWQgPSAke3RoaXMuc3RhcnREb3dubG9hZH1cclxuXHRcdC8vIHZpZXdCb29rbWFyayA9ICR7dGhpcy52aWV3Qm9va21hcmt9XHJcblx0XHQvLyBwcmludCA9ICR7dGhpcy5wcmludH1cclxuXHRcdC8vIHN0YXJ0UHJpbnQgPSAke3RoaXMuc3RhcnRQcmludH1cclxuXHRcdC8vIGZ1bGxTY3JlZW4gPSAke3RoaXMuZnVsbFNjcmVlbn1cclxuXHRcdC8vIGZpbmQgPSAke3RoaXMuZmluZH1cclxuXHRcdC8vIGxhc3RQYWdlID0gJHt0aGlzLmxhc3RQYWdlfVxyXG5cdFx0Ly8gcm90YXRlY3cgPSAke3RoaXMucm90YXRlY3d9XHJcblx0XHQvLyByb3RhdGVjY3cgPSAke3RoaXMucm90YXRlY2N3fVxyXG5cdFx0Ly8gY3Vyc29yID0gJHt0aGlzLmN1cnNvcn1cclxuXHRcdC8vIHNjcm9sbE1vZGUgPSAke3RoaXMuc2Nyb2xsfVxyXG5cdFx0Ly8gc3ByZWFkID0gJHt0aGlzLnNwcmVhZH1cclxuXHRcdC8vIHBhZ2UgPSAke3RoaXMucGFnZX1cclxuXHRcdC8vIHpvb20gPSAke3RoaXMuem9vbX1cclxuXHRcdC8vIG5hbWVkZGVzdCA9ICR7dGhpcy5uYW1lZGRlc3R9XHJcblx0XHQvLyBwYWdlbW9kZSA9ICR7dGhpcy5wYWdlbW9kZX1cclxuXHRcdC8vIHBhZ2Vtb2RlID0gJHt0aGlzLmVycm9yT3ZlcnJpZGV9XHJcblx0XHQvLyBwYWdlbW9kZSA9ICR7dGhpcy5lcnJvckFwcGVuZH1cclxuXHRcdC8vIHBhZ2Vtb2RlID0gJHt0aGlzLmVycm9yTWVzc2FnZX1cclxuXHR9XHJcblxyXG5cdG5nT25EZXN0cm95KCk6IHZvaWQge1xyXG5cdFx0dGhpcy5yZWxhc2VVcmw/LigpO1xyXG5cdH1cclxufVxyXG4iLCI8ZGl2ICN2aWV3V29yZEJhciBjbGFzcz1cInRvb2xiYXJcIj5cclxuXHQ8ZGl2IGlkPVwidG9vbGJhckNvbnRhaW5lclwiPlxyXG5cdFx0PGRpdiBpZD1cInRvb2xiYXJWaWV3ZXJcIj5cclxuXHRcdFx0PGJ1dHRvbiBpZD1cImRvd25sb2FkXCIgKGNsaWNrKT1cImRvd25sb2FkV29yZEZpbGUoKVwiIGNsYXNzPVwidG9vbGJhckJ1dHRvbiBkb3dubG9hZFwiIHRpdGxlPVwiRG93bmxvYWRcIiB0YWJpbmRleD1cIjM0XCIgZGF0YS1sMTBuLWlkPVwiZG93bmxvYWRcIj5cclxuXHRcdFx0XHQ8aW1nIHNyYz1cIi9hc3NldHMvcGRmanMvd2ViL2ltYWdlcy90b29sYmFyQnV0dG9uLWRvd25sb2FkLnBuZ1wiIGFsdD1cIkRvd25sb2FkXCIgLz5cclxuXHRcdFx0PC9idXR0b24+XHJcblxyXG5cdFx0XHQ8YnV0dG9uIGlkPVwiY2xvc2VGaWxlXCIgKGNsaWNrKT1cImNsb3NlV29yZEZpbGUoKVwiIGNsYXNzPVwidG9vbGJhckJ1dHRvblwiIHRpdGxlPVwiQ2xvc2VcIiB0YWJpbmRleD1cIjM2XCIgZGF0YS1sMTBuLWlkPVwiY2xvc2VGaWxlXCI+XHJcblx0XHRcdFx0PGltZyBzcmM9XCIvYXNzZXRzL3BkZmpzL3dlYi9pbWFnZXMvY2xvc2UtZmlsZS5wbmdcIiBhbHQ9XCJDbG9zZVwiIC8+XHJcblx0XHRcdDwvYnV0dG9uPlxyXG5cdFx0PC9kaXY+XHJcblx0PC9kaXY+XHJcbjwvZGl2PlxyXG48ZGl2ICNsb2FkaW5nU3BpbiBjbGFzcz1cImxvYWRpbmdTcGluXCI+XHJcblx0PGRpdiBjbGFzcz1cImxvYWRlclwiPjwvZGl2PlxyXG48L2Rpdj5cclxuPGlmcmFtZSBpZD1cImlmcmFtZURvY3hcIiAjaWZyYW1lRG9jeCB0aXRsZT1cIm5nMi1wZGZqcy12aWV3ZXJcIiBbaGlkZGVuXT1cImV4dGVybmFsV2luZG93IHx8ICghZXh0ZXJuYWxXaW5kb3cgJiYgIXBkZlNyYylcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCI+PC9pZnJhbWU+XHJcblxyXG48aWZyYW1lIGlkPVwiaWZyYW1lUERGXCIgI2lmcmFtZVBERiB0aXRsZT1cIm5nMi1wZGZqcy12aWV3ZXJcIiBbaGlkZGVuXT1cImV4dGVybmFsV2luZG93IHx8ICghZXh0ZXJuYWxXaW5kb3cgJiYgIXBkZlNyYylcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCI+PC9pZnJhbWU+XHJcbiJdfQ==