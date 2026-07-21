import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, Output, ViewChild, EventEmitter, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { concatMap, interval, of, Subscription, take, takeWhile, firstValueFrom } from 'rxjs';
import { renderAsync } from 'docx-preview';
import * as XLSX from 'xlsx';
import { init as initPptxPreview } from 'pptx-preview';

@Component({
	selector: 'ng2-pdfjs-viewer',
	templateUrl: './ng2-pdfjs-viewer.component.html',
	styleUrls: ['./ng2-pdfjs-viewer.component.scss'],
	standalone: true,
	imports: [CommonModule],
})
export class PdfJsViewerComponent implements OnInit, OnDestroy {
	@ViewChild('loadingSpin', { static: true }) loadingSpin: ElementRef;
	@ViewChild('iframeDocx', { static: true }) iframeDocx: ElementRef;
	@ViewChild('docxRenderContainer', { static: true }) docxRenderContainer: ElementRef;
	@ViewChild('pptxFallbackContainer', { static: true }) pptxFallbackContainer: ElementRef;
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

	subscription = new Subscription();
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

	getFileBlob(): Promise<Blob> {
		const isBlob = this._src instanceof Blob || (this._src && typeof this._src === 'object' && ('size' in (this._src as any)) && ('type' in (this._src as any)));
		const isUint8Array = this._src instanceof Uint8Array || (this._src && this._src.constructor && this._src.constructor.name === 'Uint8Array');

		if (isBlob) {
			return Promise.resolve(this._src as Blob);
		} else if (isUint8Array) {
			return Promise.resolve(new Blob([this._src as Uint8Array]));
		} else if (typeof this._src === 'string') {
			const url = decodeURIComponent(this._src);
			return firstValueFrom(this.http.get(url, { responseType: 'blob' }));
		}
		return Promise.reject('Unsupported source type');
	}

	showFallbackUI(ext: string) {
		if (this.loadingSpin && this.loadingSpin.nativeElement) {
			this.loadingSpin.nativeElement.style.display = 'none';
		}

		// Hide iframe
		const iframeEl = this.iframeDocx.nativeElement.querySelector('iframe');
		if (iframeEl) {
			iframeEl.style.display = 'none';
		}

		// Hide docxRenderContainer
		if (this.docxRenderContainer && this.docxRenderContainer.nativeElement) {
			this.docxRenderContainer.nativeElement.style.display = 'none';
		}

		// Show pptxFallbackContainer as the container for the fallback UI
		const container = this.pptxFallbackContainer?.nativeElement;
		if (!container) return;

		container.style.display = 'flex';
		container.style.alignItems = 'center';
		container.style.justifyContent = 'center';
		container.style.flexDirection = 'column';
		container.style.padding = '30px';
		container.style.textAlign = 'center';
		container.style.background = '#f8f9fa';
		container.innerHTML = '';

		const extUpper = (ext || '').toUpperCase();
		const extLower = (ext || '').toLowerCase();

		let downloadUrl = '';
		const isBlob = this._src instanceof Blob || (this._src && typeof this._src === 'object' && ('size' in (this._src as any)) && ('type' in (this._src as any)));
		const isUint8Array = this._src instanceof Uint8Array || (this._src && this._src.constructor && this._src.constructor.name === 'Uint8Array');

		if (isBlob) {
			downloadUrl = URL.createObjectURL(this._src as Blob);
		} else if (isUint8Array) {
			downloadUrl = URL.createObjectURL(new Blob([this._src as Uint8Array]));
		} else if (typeof this._src === 'string') {
			downloadUrl = decodeURIComponent(this._src);
		}

		const fileName = this.downloadFileName
			? (this.downloadFileName.toLowerCase().endsWith('.' + extLower) ? this.downloadFileName : `${this.downloadFileName}.${extLower}`)
			: `file.${extLower}`;

		let message = '';
		if (extLower === 'ppt' || extLower === 'doc') {
			message = `Định dạng <strong>.${extLower}</strong> (Office 97-2003) không được hỗ trợ xem trực tiếp. Hãy tải xuống để xem hoặc chuyển đổi sang định dạng mới hơn (<strong>.pptx</strong>, <strong>.docx</strong>, hoặc <strong>PDF</strong>).`;
		} else {
			message = `Không thể hiển thị tệp <strong>.${extLower}</strong> này trực tiếp. Hãy thử tải xuống để mở trên thiết bị của bạn.`;
		}

		container.innerHTML = `
			<div style="width:64px;height:64px;border-radius:50%;background:#fff3e0;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
				<svg width="32" height="32" fill="none" stroke="#e65100" stroke-width="1.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/>
				</svg>
			</div>
			<h3 style="font-size:15px;font-weight:600;color:#212121;margin:0 0 8px;">Không thể xem ${extUpper}</h3>
			<p style="font-size:13px;color:#757575;max-width:380px;margin:0 0 20px;line-height:1.6;">
				${message}
			</p>
			<a href="${downloadUrl}" download="${fileName}" style="display:inline-flex;align-items:center;gap:8px;padding:0 20px;height:40px;border-radius:8px;background:#e65100;color:#fff;font-size:13px;font-weight:600;text-decoration:none;">
				<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/>
				</svg>
				Tải xuống file ${extUpper}
			</a>
		`;
	}

	loadRemoteOnline(url: string, ext: string) {
		const iframeEl = this.iframeDocx.nativeElement.querySelector('iframe');
		if (iframeEl) {
			iframeEl.style.display = 'block';
		}
		if (this.docxRenderContainer && this.docxRenderContainer.nativeElement) {
			this.docxRenderContainer.nativeElement.style.display = 'none';
		}
		if (this.pptxFallbackContainer && this.pptxFallbackContainer.nativeElement) {
			this.pptxFallbackContainer.nativeElement.style.display = 'none';
		}

		this.subscription.add(
			this.http.head(url, { observe: 'response' }).subscribe({
				next: (response) => {
					if (response.status === 200) {
						const _time = new Date().getTime();
						this.viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${url}&t=${_time}`;
						if (iframeEl) iframeEl.src = this.viewerUrl;
						if (this.loadingSpin && this.loadingSpin.nativeElement) {
							this.loadingSpin.nativeElement.style.display = 'none';
						}
					} else {
						console.warn('HTTP Head status not 200, backing up to offline');
						this.loadOffline(ext);
					}
				},
				error: (err) => {
					console.warn('HTTP Head failed, backing up to offline', err);
					this.loadOffline(ext);
				}
			})
		);
	}

	loadOffline(ext: string) {
		const extLower = (ext || '').toLowerCase();
		if (extLower === 'docx') {
			this.renderDocxOffline();
		} else if (extLower === 'xlsx' || extLower === 'xls') {
			this.renderXlsxOffline(extLower);
		} else if (extLower === 'pptx') {
			this.renderPptxOffline();
		} else {
			this.showFallbackUI(extLower);
		}
	}

	renderDocxOffline() {
		const iframeEl = this.iframeDocx.nativeElement.querySelector('iframe');
		if (iframeEl) {
			iframeEl.style.display = 'none';
		}
		if (this.docxRenderContainer && this.docxRenderContainer.nativeElement) {
			this.docxRenderContainer.nativeElement.style.display = 'block';
			this.docxRenderContainer.nativeElement.innerHTML = '';
		}

		this.getFileBlob()
			.then((blob) => {
				renderAsync(blob, this.docxRenderContainer.nativeElement)
					.then(() => {
						console.log('Docx rendered offline successfully');
						if (this.loadingSpin && this.loadingSpin.nativeElement) {
							this.loadingSpin.nativeElement.style.display = 'none';
						}
					})
					.catch((err) => {
						console.error('Lỗi khi render docx offline, hiển thị nút tải:', err);
						this.showFallbackUI('docx');
					});
			})
			.catch((err) => {
				console.error('Lỗi khi lấy blob tệp tin docx:', err);
				this.showFallbackUI('docx');
			});
	}

	renderXlsxOffline(extLower: string) {
		const iframeEl = this.iframeDocx.nativeElement.querySelector('iframe');
		if (iframeEl) {
			iframeEl.style.display = 'none';
		}
		const container = this.docxRenderContainer?.nativeElement;
		if (container) {
			container.style.display = 'block';
			container.style.padding = '0';
			container.innerHTML = '';
		}

		this.getFileBlob()
			.then((blob) => {
				const reader = new FileReader();
				reader.onload = (e: any) => {
					try {
						const data = new Uint8Array(e.target.result);
						const workbook = XLSX.read(data, { type: 'array', cellStyles: true });
						const sheetNames = workbook.SheetNames;

						// Build tab bar
						const tabBar = sheetNames.map((name, i) =>
							`<div class="xlsx-tab${i === 0 ? ' xlsx-tab-active' : ''}" data-sheet="${i}" style="
								display:inline-block; padding: 6px 18px; cursor:pointer; font-size:13px;
								background:${i === 0 ? '#fff' : '#e8e8e8'};
								color:${i === 0 ? '#1d6f42' : '#555'};
								font-weight:${i === 0 ? '700' : '400'};
								border:1px solid #c8c8c8; border-bottom:${i === 0 ? '2px solid #fff' : '1px solid #c8c8c8'};
								border-radius: 3px 3px 0 0; margin-right:2px; margin-bottom:-1px;
								white-space:nowrap; user-select:none;
							">${name}</div>`
						).join('');

						// Build sheet panels
						const sheetPanels = sheetNames.map((name, i) => {
							const ws = workbook.Sheets[name];
							const html = XLSX.utils.sheet_to_html(ws, { editable: false });
							return `<div class="xlsx-panel" data-sheet="${i}" style="display:${i === 0 ? 'block' : 'none'}; overflow: auto; width:100%; height: calc(100% - 36px);">${html}</div>`;
						}).join('');

						const fullHtml = `
							<div class="xlsx-wrapper" style="display:flex; flex-direction:column; height:100%; font-family: Calibri, Arial, sans-serif;">
								<div class="xlsx-tab-bar" style="
									display:flex; align-items:flex-end; padding: 6px 8px 0;
									background:#f1f1f1; border-bottom:1px solid #c8c8c8; overflow-x:auto; flex-shrink:0;
								">${tabBar}</div>
								<div class="xlsx-content" style="flex:1; overflow:hidden; background:#fff;">
									${sheetPanels}
								</div>
							</div>`;

						if (container) {
							container.innerHTML = fullHtml;

							// Style the generated tables
							container.querySelectorAll('table').forEach((tbl: HTMLTableElement) => {
								tbl.style.cssText = 'border-collapse:collapse; font-family:Calibri,Arial,sans-serif; font-size:13px; min-width:100%;';
							});
							container.querySelectorAll('td, th').forEach((cell: HTMLElement) => {
								cell.style.cssText = 'border:1px solid #d0d0d0; padding:3px 8px; white-space:nowrap; min-width:60px;';
							});
							container.querySelectorAll('tr:first-child td, tr:first-child th').forEach((cell: HTMLElement) => {
								cell.style.background = '#f2f2f2';
								cell.style.fontWeight = '600';
							});

							// Tab click logic
							container.querySelectorAll('.xlsx-tab').forEach((tab: HTMLElement) => {
								tab.addEventListener('click', () => {
									const idx = tab.getAttribute('data-sheet');
									container.querySelectorAll('.xlsx-tab').forEach((t: HTMLElement) => {
										const active = t.getAttribute('data-sheet') === idx;
										t.style.background = active ? '#fff' : '#e8e8e8';
										t.style.fontWeight = active ? '700' : '400';
										t.style.color = active ? '#1d6f42' : '#555';
										t.style.borderBottom = active ? '2px solid #fff' : '1px solid #c8c8c8';
									});
									container.querySelectorAll('.xlsx-panel').forEach((panel: HTMLElement) => {
										panel.style.display = panel.getAttribute('data-sheet') === idx ? 'block' : 'none';
									});
								});
							});
						}

						console.log('Xlsx rendered offline successfully');
						if (this.loadingSpin && this.loadingSpin.nativeElement) {
							this.loadingSpin.nativeElement.style.display = 'none';
						}
					} catch (err) {
						console.error('Lỗi khi parse tệp excel offline, hiển thị nút tải:', err);
						this.showFallbackUI(extLower);
					}
				};
				reader.onerror = (err) => {
					console.error('Lỗi khi đọc file tệp excel:', err);
					this.showFallbackUI(extLower);
				};
				reader.readAsArrayBuffer(blob);
			})
			.catch((err) => {
				console.error('Lỗi khi lấy blob tệp tin excel:', err);
				this.showFallbackUI(extLower);
			});
	}

	renderPptxOffline() {
		const iframeEl = this.iframeDocx.nativeElement.querySelector('iframe');
		if (iframeEl) iframeEl.style.display = 'none';
		if (this.docxRenderContainer && this.docxRenderContainer.nativeElement) {
			this.docxRenderContainer.nativeElement.style.display = 'none';
		}
		const container = this.pptxFallbackContainer?.nativeElement;
		if (!container) return;

		container.style.display = 'flex';
		container.style.background = '#525659';
		container.innerHTML = '';

		this.getFileBlob()
			.then((blob) => {
				blob.arrayBuffer()
					.then((arrayBuffer) => {
						try {
							const containerWidth = container.clientWidth || 900;
							const slideWidth = containerWidth - 40;
							const slideHeight = Math.round(slideWidth * 9 / 16);
							const previewer = initPptxPreview(container, {
								width: slideWidth,
								height: slideHeight,
							});
							previewer.preview(arrayBuffer);
							console.log('PPTX rendered offline successfully');
							if (this.loadingSpin && this.loadingSpin.nativeElement) {
								this.loadingSpin.nativeElement.style.display = 'none';
							}
						} catch (err) {
							console.error('Lỗi khi render pptx offline:', err);
							this.showFallbackUI('pptx');
						}
					})
					.catch((err) => {
						console.error('Lỗi khi đọc blob pptx:', err);
						this.showFallbackUI('pptx');
					});
			})
			.catch((err) => {
				console.error('Lỗi khi lấy blob pptx remote/local:', err);
				this.showFallbackUI('pptx');
			});
	}

	// check view file
	loadDocument() {
		this.loadingSpin.nativeElement.style.display = 'block';
		this.iframePDF.nativeElement.style.display = 'none';
		let url = this.getUrlFile();
		let ext = this.getFileExtension(url);
		console.log(ext);
		const extLower = (ext || '').toLowerCase();

		if (this.isValidFile(extLower)) {
			this.iframeDocx.nativeElement.style.display = 'block';

			const isBlob = this._src instanceof Blob || (this._src && typeof this._src === 'object' && ('size' in (this._src as any)) && ('type' in (this._src as any)));
			const isUint8Array = this._src instanceof Uint8Array || (this._src && this._src.constructor && this._src.constructor.name === 'Uint8Array');
			const isLocalFile = isBlob || isUint8Array;
			if (isLocalFile) {
				this.loadOffline(extLower);
			} else {
				this.loadRemoteOnline(url, extLower);
			}
		} else {
			console.log('Định dạng không hợp lệ!');
			if (this.loadingSpin && this.loadingSpin.nativeElement) {
				this.loadingSpin.nativeElement.style.display = 'none';
			}
		}
	}

	downloadFile() {
		let url = decodeURIComponent(this.getUrlFile());
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

	getUrlFile(): string {
		const isBlob = this._src instanceof Blob || (this._src && typeof this._src === 'object' && ('size' in (this._src as any)) && ('type' in (this._src as any)));
		const isUint8Array = this._src instanceof Uint8Array || (this._src && this._src.constructor && this._src.constructor.name === 'Uint8Array');

		if (isBlob) {
			return encodeURIComponent(URL.createObjectURL(this._src as Blob));
		} else if (isUint8Array) {
			let blob = new Blob([this._src as Uint8Array], { type: 'application/pdf' });
			return encodeURIComponent(URL.createObjectURL(blob));
		} else {
			const srcStr = (this._src || '') as string;
			const _checkExtWithoutPdf = this.isValidFile(this.getFileExtension(srcStr.split('.pdf')[0]));
			if (_checkExtWithoutPdf) {
				this._src = srcStr.split('.pdf')[0] + (srcStr.split('.pdf')[2] ?? '');
			}
			return this._src as string;
		}
	}

	getFileExtension(filename) {
		const isFile = this._src instanceof File || (this._src && typeof this._src === 'object' && ('name' in (this._src as any)));
		if (isFile && (this._src as any).name) {
			const parts = (this._src as any).name.split('.');
			if (parts.length > 1) return parts.pop();
		}
		const isBlob = this._src instanceof Blob || (this._src && typeof this._src === 'object' && ('size' in (this._src as any)) && ('type' in (this._src as any)));
		if (isBlob && (this._src as any).type) {
			const type = (this._src as any).type;
			if (type === 'application/pdf') return 'pdf';
			if (type.includes('word') || type.includes('document')) return 'docx';
			if (type.includes('excel') || type.includes('sheet')) return 'xlsx';
			if (type.includes('presentation') || type.includes('powerpoint')) return 'pptx';
		}

		// Exception for blob URL strings (e.g. blob:https://...)
		const isBlobUrl = typeof this._src === 'string' && (this._src.startsWith('blob:') || decodeURIComponent(this._src).startsWith('blob:'));
		if (isBlobUrl) {
			if (this.downloadFileName) {
				const parts = this.downloadFileName.split('.');
				if (parts.length > 1) return parts.pop();
			}
			return 'pdf'; // Default to pdf for blob URLs if no other type is known
		}

		// Read extension from URL/link first
		let urlToCheck = '';
		if (typeof this._src === 'string') {
			urlToCheck = decodeURIComponent(this._src);
		} else if (filename) {
			urlToCheck = decodeURIComponent(filename);
		}

		if (urlToCheck) {
			const urlPath = urlToCheck.split('?')[0].split('#')[0];
			const parts = urlPath.split('.');
			if (parts.length > 1) {
				const ext = parts.pop();
				if (ext && ext.length <= 5) {
					return ext;
				}
			}
		}

		// Fallback to downloadFileName
		if (this.downloadFileName) {
			const parts = this.downloadFileName.split('.');
			if (parts.length > 1) return parts.pop();
		}

		let ext = decodeURIComponent(filename || '').split('?')[0].split('.').pop();
		if (!ext) {
			ext = decodeURIComponent(filename || '').split('/').pop().split('.').pop();
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

	checkSrc(currentSrc: any) {
		return this._src !== currentSrc;
	}

	public refresh(): void {
		if (this.loadingSpin && this.loadingSpin.nativeElement) {
			this.loadingSpin.nativeElement.style.display = 'none';
		}
		// Needs to be invoked for external window or when needs to reload pdf
		this.iframePDF.nativeElement.style.display = 'block';
		this.iframePDF.nativeElement.src = '';

		this.iframeDocx.nativeElement.style.display = 'none';
		const iframeEl = this.iframeDocx.nativeElement.querySelector('iframe');
		if (iframeEl) {
			iframeEl.src = '';
			iframeEl.style.display = 'block';
		}
		if (this.docxRenderContainer && this.docxRenderContainer.nativeElement) {
			this.docxRenderContainer.nativeElement.style.display = 'none';
			this.docxRenderContainer.nativeElement.innerHTML = '';
		}
		if (this.pptxFallbackContainer && this.pptxFallbackContainer.nativeElement) {
			this.pptxFallbackContainer.nativeElement.style.display = 'none';
		}

		let attempt = 0;
		const _currentSrc = this._src;
		let loaded = false;

		this.subscription.add(
			interval(500)
				.pipe(
					take(4),
					concatMap(() => {
						attempt++;
						console.log(`${attempt}. Reload file!`);
						const changed = this.checkSrc(_currentSrc);
						return of({ changed, attempt });
					}),
					takeWhile(({ changed, attempt }) => !changed && attempt < 4, true),
				)
				.subscribe(({ changed }) => {
					if (changed || !loaded) {
						this.loadPdf();
						loaded = true;
					}
				}),
		);
	}

	private relaseUrl?: () => void; // Avoid memory leask with `URL.createObjectURL`

	private loadLocalPdf(data: Uint8Array) {
		const app = this.PDFViewerApplication;
		if (app && app.initialized) {
			app.open(data);
		} else {
			setTimeout(() => this.loadLocalPdf(data), 50);
		}
	}

	private loadLocalPdfWhenReady() {
		const app = this.PDFViewerApplication;
		if (app && app.initialized) {
			const isBlob = this._src instanceof Blob || (this._src && typeof this._src === 'object' && ('size' in (this._src as any)) && ('type' in (this._src as any)));
			const isUint8Array = this._src instanceof Uint8Array || (this._src && this._src.constructor && this._src.constructor.name === 'Uint8Array');
			const isBlobUrl = typeof this._src === 'string' && (this._src.startsWith('blob:') || decodeURIComponent(this._src).startsWith('blob:'));

			if (isBlob) {
				const reader = new FileReader();
				reader.onload = () => {
					const arrayBuffer = reader.result as ArrayBuffer;
					app.open(new Uint8Array(arrayBuffer));
				};
				reader.readAsArrayBuffer(this._src as Blob);
			} else if (isUint8Array) {
				app.open(this._src as Uint8Array);
			} else if (isBlobUrl) {
				this.getFileBlob()
					.then((blob) => {
						const reader = new FileReader();
						reader.onload = () => {
							const arrayBuffer = reader.result as ArrayBuffer;
							app.open(new Uint8Array(arrayBuffer));
						};
						reader.readAsArrayBuffer(blob);
					})
					.catch((err) => {
						console.error('Lỗi khi lấy blob từ URL:', err);
					});
			}
		} else {
			if (this.externalWindow && (!this.viewerTab || this.viewerTab.closed)) {
				return;
			}
			setTimeout(() => this.loadLocalPdfWhenReady(), 50);
		}
	}

	private loadPdf() {
		if (this.loadingSpin && this.loadingSpin.nativeElement) {
			this.loadingSpin.nativeElement.style.display = 'none';
		}
		if (this.docxRenderContainer && this.docxRenderContainer.nativeElement) {
			this.docxRenderContainer.nativeElement.style.display = 'none';
			this.docxRenderContainer.nativeElement.innerHTML = '';
		}
		if (this.pptxFallbackContainer && this.pptxFallbackContainer.nativeElement) {
			this.pptxFallbackContainer.nativeElement.style.display = 'none';
		}
		if (!this._src) {
			return;
		}

		const ext = (this.getFileExtension('') || '').toLowerCase();
		if (ext && ext !== 'pdf') {
			this.loadDocument();
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

		const isBlob = this._src instanceof Blob || (this._src && typeof this._src === 'object' && ('size' in (this._src as any)) && ('type' in (this._src as any)));
		const isUint8Array = this._src instanceof Uint8Array || (this._src && this._src.constructor && this._src.constructor.name === 'Uint8Array');
		const isBlobUrl = typeof this._src === 'string' && (this._src.startsWith('blob:') || decodeURIComponent(this._src).startsWith('blob:'));
		const isBlobOrUint8Array = isBlob || isUint8Array || isBlobUrl;

		let fileUrl = '';
		if (isBlobOrUint8Array) {
			fileUrl = '';
		} else {
			fileUrl = this.getUrlFile();
		}

		// let this.viewerUrl;
		if (this.viewerFolder) {
			this.viewerUrl = `${this.viewerFolder}/web/viewer.html`;
		} else {
			this.viewerUrl = `assets/pdfjs/web/viewer.html`;
		}

		const _time = new Date().getTime();
		this.viewerUrl += `?file=${fileUrl}&t=${_time}`;

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
			if (isBlobOrUint8Array) {
				this.loadLocalPdfWhenReady();
			}
		} else {
			if (isBlobOrUint8Array) {
				const loadEvent = () => {
					this.iframePDF.nativeElement.removeEventListener('load', loadEvent);
					if (isBlob) {
						const reader = new FileReader();
						reader.onload = () => {
							const arrayBuffer = reader.result as ArrayBuffer;
							this.loadLocalPdf(new Uint8Array(arrayBuffer));
						};
						reader.readAsArrayBuffer(this._src as Blob);
					} else if (isUint8Array) {
						this.loadLocalPdf(this._src as Uint8Array);
					} else if (isBlobUrl) {
						this.getFileBlob()
							.then((blob) => {
								const reader = new FileReader();
								reader.onload = () => {
									const arrayBuffer = reader.result as ArrayBuffer;
									this.loadLocalPdf(new Uint8Array(arrayBuffer));
								};
								reader.readAsArrayBuffer(blob);
							})
							.catch((err) => {
								console.error('Lỗi khi lấy blob từ URL:', err);
							});
					}
				};
				this.iframePDF.nativeElement.addEventListener('load', loadEvent);
			}
			this.iframePDF.nativeElement.src = this.viewerUrl;
		}

		console.log(`
      pdfSrc = ${this.pdfSrc}
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
