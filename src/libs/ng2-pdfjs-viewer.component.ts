import { HttpClient } from '@angular/common/http';
import { Component, Input, Output, ViewChild, EventEmitter, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
	selector: 'ng2-pdfjs-viewer',
	templateUrl: './ng2-pdfjs-viewer.component.html',
	styleUrls: ['./ng2-pdfjs-viewer.component.scss'],
})
export class PdfJsViewerComponent implements OnInit, OnDestroy {
	@ViewChild('loadingSpin', { static: true }) loadingSpin: ElementRef;
	@ViewChild('iframeDocx', { static: true }) iframeDocx: ElementRef;
	@ViewChild('iframePDF', { static: true }) iframePDF: ElementRef;
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

	subscription: Subscription;
	private listener: (event: MessageEvent) => void;

	@Input()
	public set page(_page: number) {
		this._page = _page;
		if (this.PDFViewerApplication) {
			this.PDFViewerApplication.page = this._page;
		} else {
			if (this.diagnosticLogs)
				console.warn(
					"Document is not loaded yet!!!. Try to set page# after full load. Ignore this warning if you are not setting page# using '.' notation. (E.g. pdfViewer.page = 5;)",
				);
		}
	}

	public get page() {
		if (this.PDFViewerApplication) {
			return this.PDFViewerApplication.page;
		} else {
			if (this.diagnosticLogs) console.warn('Document is not loaded yet!!!. Try to retrieve page# after full load.');
		}
	}

	@Input()
	public set pdfSrc(_src: string | Blob | Uint8Array) {
		if (typeof _src === 'string') {
			this._src = encodeURIComponent(_src);
		} else {
			this._src = _src;
		}
	}

	constructor(private http: HttpClient) {}

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
			if (this.iframePDF.nativeElement.contentWindow) {
				pdfViewerOptions = this.iframePDF.nativeElement.contentWindow.PDFViewerApplicationOptions;
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
			if (this.iframePDF.nativeElement.contentWindow) {
				pdfViewer = this.iframePDF.nativeElement.contentWindow.PDFViewerApplication;
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
				if (this.onBeforePrint && event == 'beforePrint') {
					this.onBeforePrint.emit();
				} else if (this.onAfterPrint && event == 'afterPrint') {
					this.onAfterPrint.emit();
				} else if (this.onDocumentLoad && event == 'pagesLoaded') {
					this.onDocumentLoad.emit(param);
				} else if (this.onPageChange && event == 'pageChange') {
					this.onPageChange.emit(param);
				}
			}
		}
		if (viewerEvent.data && viewerEvent.data.event === 'closefile') {
			this.closeFile.emit(true);
		} else if (viewerEvent.data && viewerEvent.data.event === 'loaderError') {
			this.loadDocument();
		}
	}

	// check view file
	loadDocument() {
		this.loadingSpin.nativeElement.style.display = 'block';
		this.iframePDF.nativeElement.style.display = 'none';
		let url = this.getUrlFile();
		let ext = this.getFileExtension(url);
		console.log(ext);
		if (this.isValidFile(ext)) {
			const _checkExtWithoutPdf = this.isValidFile(this.getFileExtension(url.split('.pdf')[0]));
			if (_checkExtWithoutPdf) {
				url.replace('.pdf', '');
			}

			this.iframeDocx.nativeElement.style.display = 'block';
			this.subscription = this.http.head(url, { observe: 'response' }).subscribe({
				next: (response) => {

					console.log(response);
					

					if (response.status === 200) {
						this.viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${url}`;
						this.iframeDocx.nativeElement.querySelector('iframe').src = this.viewerUrl;
					} else {
						console.error('1. Lỗi khi tải tài liệu, chuyển sang google view!');
						this.viewerUrl = `https://docs.google.com/gview?url=${url}&embedded=true`;
						this.iframeDocx.nativeElement.querySelector('iframe').src = this.viewerUrl;
					}

					if (this.loadingSpin && this.loadingSpin.nativeElement) {
						this.loadingSpin.nativeElement.style.display = 'none';
					}
				},
				error: (err) => {

					console.log(err);
					

					console.error('2. Lỗi khi tải tài liệu, chuyển sang google view!');
					this.viewerUrl = `https://docs.google.com/gview?url=${url}&embedded=true`;
					this.iframeDocx.nativeElement.querySelector('iframe').src = this.viewerUrl;

					if (this.loadingSpin && this.loadingSpin.nativeElement) {
						this.loadingSpin.nativeElement.style.display = 'none';
					}
				},
			});
		} else {
			alert('Định dạng không hợp lệ!');
		}
	}

	downloadFile() {
		let url = this.getUrlFile();
		if (url) {
			fetch(url).then((t) => {
				return t.blob().then((b) => {
					const a = document.createElement('a');
					a.href = URL.createObjectURL(b);
					a.setAttribute('download', this.downloadFileName ? `${this.downloadFileName}.${this.getFileExtension(url)}` : `download_file.${this.getFileExtension(url)}`);
					a.click();
					a.remove();
				});
			});
		}
	}

	public closeWordFile() {
		console.log('close File!');
		this.closeFile.emit(true);
	}

	isValidFile(str) {
		switch (str.toLowerCase()) {
			case 'pdf':
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
		} else if (this._src instanceof Uint8Array) {
			let blob = new Blob([this._src], { type: 'application/pdf' });
			return encodeURIComponent(URL.createObjectURL(blob));
		} else {
			return this._src;
		}
	}

	getFileExtension(filename) {
		let ext = decodeURIComponent(filename).split('?')[0].split('.').pop();
		if (!ext) {
			ext = decodeURIComponent(filename).split('/').pop().split('.').pop();
		}
		return ext;
	}

	ngOnInit(): void {
		this.listener = this.receiveMessage.bind(this);
		window.addEventListener('message', this.listener, false);

		if (!this.externalWindow) {
			// Load pdf for embedded views
			this.loadPdf();
		}
	}

	public refresh(): void {
		// Needs to be invoked for external window or when needs to reload pdf
		this.loadPdf();
	}

	private relaseUrl?: () => void; // Avoid memory leask with `URL.createObjectURL`

	private loadPdf() {
		if (!this._src) {
			return;
		}
		this.viewerUrl = '';
		// console.log(`Tab is - ${this.viewerTab}`);
		// if (this.viewerTab) {
		//   console.log(`Status of window - ${this.viewerTab.closed}`);
		// }

		this.iframeDocx.nativeElement.style.display = 'none';

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
			// if (!this.downloadFileName.endsWith(".pdf")) {
			// 	this.downloadFileName += ".pdf";
			// }
			this.viewerUrl += `&fileName=${this.downloadFileName}.pdf`;
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

		if (this._page || this.zoom || this.nameddest || this.pagemode) this.viewerUrl += '#';
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
			this.iframePDF.nativeElement.src = this.viewerUrl;
		}

		console.log(`
      pdfSrc = ${this.pdfSrc}
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

	ngOnDestroy(): void {
		this.relaseUrl?.();
		this.subscription?.unsubscribe();
		window.removeEventListener('message', this.listener, false); 
	}
}
