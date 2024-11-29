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
	selectFile = {
		title: 'Dạng tài liệu pptx2',

		url: 'https%3A%2F%2Fdiy67u2u0u3eb.cloudfront.net%2Fassignment%2F2024%2FFileShare%2F66f11beb1a1ed8fed079d78a%2F67495d20b66f1bf796def8c9.pdf',

		// url: 'https://d10u0oajcer5vm.cloudfront.net/FileShare/assignment/config/673d4a7b774500c2bdf7ac75/6747db3f904ddbc9afac139c.docx.pdf',
	};
	

	selectFile2 = {
		title: 'Dạng tài liệu pptx2',

		url: 'https%3A%2F%2Fdiy67u2u0u3eb.cloudfront.net%2Fassignment%2F2024%2FFileShare%2F66f11beb1a1ed8fed079d78a%2F67495d20b66f1bf796def8c9.pdf',

		// url: 'https://d10u0oajcer5vm.cloudfront.net/FileShare/assignment/config/673d4a7b774500c2bdf7ac75/6747db3f904ddbc9afac139c.docx.pdf',
	};

	testURL = 'https://d10u0oajcer5vm.cloudfront.net/assignment/config/79761508/20241126/6744fc7eee33c881b93da3bb.pdf';

	http = inject(HttpClient);

	ngOnInit() {
		// setTimeout(() => {
		// 	this.http.get(this.testURL, { responseType: 'blob' as 'json', headers: new HttpHeaders(`Content-Type: application/pdf`) }).subscribe((res) => {
		// 		console.log(res);
		// 	});
		// }, 3000);
	}

	swtichFile(index){
		if(index === 1){
			this.selectFile.url = this.selectFile2.url
		}else{
			this.selectFile.url = this.testURL
		}

		console.log(this.selectFile);
		

		this.pdfJs?.refresh();
	}
}
