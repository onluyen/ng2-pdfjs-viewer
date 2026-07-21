import { Component, inject, ViewChild } from '@angular/core';
import { PdfJsViewerComponent } from '../libs/ng2-pdfjs-viewer.component';
import { HttpClient } from '@angular/common/http';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [PdfJsViewerComponent],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
})
export class AppComponent {
	@ViewChild('pdfJs') pdfJs: any;
	title = 'test-18';

	selectFile: { title: string; url: any } = {
		title: 'Dạng tài liệu pptx2',

		url: 'https://diy67u2u0u3eb.cloudfront.net/FileShare/assignment/config/6598c9da3b16bfc47f7a7ac9/67af01f9680ab3e31132c561.docx',

		// url: 'https://d10u0oajcer5vm.cloudfront.net/FileShare/assignment/config/673d4a7b774500c2bdf7ac75/6747db3f904ddbc9afac139c.docx.pdf',
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
			this.selectFile = this.selectFile2;
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
