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
		// url: "https://s3.ap-southeast-1.amazonaws.com/learning-assets.onluyen.vn/LMS/course/00000001002561b2d06c96bc/6704f585955b2c6307e14374.pptx?X-Amz-Expires=300&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIARNHFJRUSE4WF7AUK%2F20241015%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20241015T063027Z&X-Amz-SignedHeaders=host&X-Amz-Signature=97754dbb009b95fa6e6011dea73737e1bb17b8bd17dc50acbdad6b0755ff89ee"


		// url: "https://s3.ap-southeast-1.amazonaws.com/learning-assets.onluyen.vn/LMS/course/66822b6b137a76dac93bce61/668265fef625cf9cda4ef9dc.pptx?X-Amz-Expires=300&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIARNHFJRUSE4WF7AUK%2F20241018%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20241018T014749Z&X-Amz-SignedHeaders=host&X-Amz-Signature=78db9d372ec54729e274dc06c800372beb02b46ba5302609a00b794eeabfbe6c"
	
		url: 'https://diy67u2u0u3eb.cloudfront.net/pdf-2025/assignment/config/50227/20241014/670cd87e76203a79bc69eff5.pdf'
	
		// url: 'https://learning-assets.onluyen.vn/LMS/course/66822b6b137a76dac93bce61/document/66822b93137a76dac93bce65.pdf'
	};
}
