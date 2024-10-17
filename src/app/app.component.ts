import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PdfJsViewerModule } from '../..';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, PdfJsViewerModule],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
})
export class AppComponent {
	title = 'test-18';
	selectFile = {
		title: 'Dạng tài liệu pptx2',
		url: '',
	};
}
