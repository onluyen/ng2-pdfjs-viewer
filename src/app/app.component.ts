import { Component, inject, ViewChild } from '@angular/core';
import { PdfJsViewerModule } from '../..';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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

	selectFile: { title: string; url: any } = {
		title: 'Dạng tài liệu pptx2',

		url: 'https://learning-assets.onluyen.vn/LMS/course/6aa41b177c1a166872e37254/6aa41b9e696b05a4ff3fa804.docx',

		// url: "https://resource-onluyen.s3.ap-southeast-1.amazonaws.com/document-folder/69fd635dbe3183723a893dc6.docx?X-Amz-Expires=300&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIARNHFJRUSNWHCRSXN%2F20260928%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260928T083406Z&X-Amz-SignedHeaders=host&X-Amz-Signature=0f0d95faa9ab007753cea295d495e71d8cc06eba91ffc5978e0ba9ccd00d7771"

	};

	selectFile2 = {
		title: 'Dạng tài liệu pptx2',

		url: 'https://d1bqydm276v5q5.cloudfront.net/assignment/2024/FileShare/673d55b1774500c2bdf7acc0/674811d81d564ef4bb8d9c8f.xlsx',

		// url: 'https://d10u0oajcer5vm.cloudfront.net/FileShare/assignment/config/673d4a7b774500c2bdf7ac75/6747db3f904ddbc9afac139c.docx.pdf',
	};

	selectFile3 = {
		title: 'Dạng tài liệu pdf',

		url: 'https://d1bqydm276v5q5.cloudfront.net/assignment/2024/FileShare/673d55b1774500c2bdf7acc0/674811d8f6568baaca5ba5b0.pdf',

		// url: 'https://d10u0oajcer5vm.cloudfront.net/FileShare/assignment/config/673d4a7b774500c2bdf7ac75/6747db3f904ddbc9afac139c.docx.pdf',
	};

	http = inject(HttpClient);

	ngOnInit() {
		// setTimeout(() => {
		// 	this.http.get(this.testURL, { responseType: 'blob' as 'json', headers: new HttpHeaders(`Content-Type: application/pdf`) }).subscribe((res) => {
		// 		console.log(res);
		// 	});
		// }, 3000);
	}

	swtichFile(index) {
		if (index === 1) {
			// this.selectFile = this.selectFile2;
		} else {
			this.selectFile = this.selectFile3;
		}
		this.pdfJs?.refresh();
		console.log(this.selectFile);
	}

	onFileSelected(event: any) {
		const file = event.target.files?.[0];
		if (file) {
			this.selectFile = {
				title: file.name,
				url: file,
			};
			setTimeout(() => {
				this.pdfJs?.refresh();
			}, 0);
		}
	}
}
