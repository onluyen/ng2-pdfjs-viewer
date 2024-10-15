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

	// selectFile = {
	// 	title: 'Dạng tài liệu pptx2',
	// 	url: 'https://s3.ap-southeast-1.amazonaws.com/learning-assets.onluyen.vn/LMS/course/66822b6b137a76dac93bce61/668265fef625cf9cda4ef9dc.pptx?X-Amz-Expires=300&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIARNHFJRUSE4WF7AUK%2F20241015%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20241015T014854Z&X-Amz-SignedHeaders=host&X-Amz-Signature=cad943b6a3b5db4e9044856e95177f702c8c23d5beedfcb3e027245f240d44f8',
	// };

	selectFile = {
		title: 'Dạng tài liệu pptx2',
		url: "https://s3.ap-southeast-1.amazonaws.com/learning-assets.onluyen.vn/LMS/course/00000001002561b2d06c96bc/6704f585955b2c6307e14374.pptx?X-Amz-Expires=300&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIARNHFJRUSE4WF7AUK%2F20241015%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20241015T063027Z&X-Amz-SignedHeaders=host&X-Amz-Signature=97754dbb009b95fa6e6011dea73737e1bb17b8bd17dc50acbdad6b0755ff89ee"

	};

	// selectFile = {
	// 	title: 'Dạng tài liệu pdf',
	// 	url: 'https://learning-assets.onluyen.vn/LMS/course/66822b6b137a76dac93bce61/document/66822b93137a76dac93bce65.pdf',
	// };
}
