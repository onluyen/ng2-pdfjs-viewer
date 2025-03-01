import { Component, inject, ViewChild } from '@angular/core';
import { PdfJsViewerModule } from '../..';
import { HttpClient } from '@angular/common/http';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [PdfJsViewerModule],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
})
export class AppComponent {
	@ViewChild('pdfJs') pdfJs: any;
	title = 'test-18';

	selectFile = {
		title: 'Dạng tài liệu pptx2',
		url: null,
	};

	selectFile2 = {
		title: 'Dạng tài liệu pptx2',
		url: null,
	};

	selectFile3 = {
		title: 'Dạng tài liệu pdf',
		url: null,
	};

	http = inject(HttpClient);

	ngOnInit() {
		// setTimeout(() => {
		// 	this.http.get(this.testURL, { responseType: 'blob' as 'json', headers: new HttpHeaders(`Content-Type: application/pdf`) }).subscribe((res) => {
		// 		console.log(res);
		// 	});
		// }, 3000);
	}

	onFileSelected(event: any) {
		const file: File = event.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				this.selectFile = {
					title: file.name,
					url: URL.createObjectURL(file),
				};
				console.log(this.selectFile);
				this.pdfJs?.refresh();
			};
			reader.readAsArrayBuffer(file);
		} else {
			console.log('Please select a valid PDF file.');
		}
	}

	swtichFile(index) {
		if (index === 1) {
			this.selectFile = this.selectFile2;
		} else {
			this.selectFile = this.selectFile3;
		}
		this.pdfJs?.refresh();
		console.log(this.selectFile);
	}
}
