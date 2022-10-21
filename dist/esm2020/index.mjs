import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfJsViewerComponent } from './src/ng2-pdfjs-viewer.component';
import * as i0 from "@angular/core";
export * from './src/ng2-pdfjs-viewer.component';
export class PdfJsViewerModule {
    static forRoot() {
        return {
            ngModule: PdfJsViewerModule
        };
    }
}
PdfJsViewerModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: PdfJsViewerModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
PdfJsViewerModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: PdfJsViewerModule, declarations: [PdfJsViewerComponent], imports: [CommonModule], exports: [PdfJsViewerComponent] });
PdfJsViewerModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: PdfJsViewerModule, imports: [[
            CommonModule
        ]] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: PdfJsViewerModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule
                    ],
                    declarations: [
                        PdfJsViewerComponent
                    ],
                    exports: [
                        PdfJsViewerComponent
                    ]
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUF1QixNQUFNLGVBQWUsQ0FBQztBQUM5RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7O0FBRXhFLGNBQWMsa0NBQWtDLENBQUM7QUFhakQsTUFBTSxPQUFPLGlCQUFpQjtJQUM1QixNQUFNLENBQUMsT0FBTztRQUNaLE9BQU87WUFDTCxRQUFRLEVBQUUsaUJBQWlCO1NBQzVCLENBQUM7SUFDSixDQUFDOzsrR0FMVSxpQkFBaUI7Z0hBQWpCLGlCQUFpQixpQkFOMUIsb0JBQW9CLGFBSHBCLFlBQVksYUFNWixvQkFBb0I7Z0hBR1gsaUJBQWlCLFlBVm5CO1lBQ1AsWUFBWTtTQUNiOzRGQVFVLGlCQUFpQjtrQkFYN0IsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUU7d0JBQ1AsWUFBWTtxQkFDYjtvQkFDRCxZQUFZLEVBQUU7d0JBQ1osb0JBQW9CO3FCQUNyQjtvQkFDRCxPQUFPLEVBQUU7d0JBQ1Asb0JBQW9CO3FCQUNyQjtpQkFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlLCBNb2R1bGVXaXRoUHJvdmlkZXJzIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgUGRmSnNWaWV3ZXJDb21wb25lbnQgfSBmcm9tICcuL3NyYy9uZzItcGRmanMtdmlld2VyLmNvbXBvbmVudCc7XG5cbmV4cG9ydCAqIGZyb20gJy4vc3JjL25nMi1wZGZqcy12aWV3ZXIuY29tcG9uZW50JztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIENvbW1vbk1vZHVsZVxuICBdLFxuICBkZWNsYXJhdGlvbnM6IFtcbiAgICBQZGZKc1ZpZXdlckNvbXBvbmVudFxuICBdLFxuICBleHBvcnRzOiBbXG4gICAgUGRmSnNWaWV3ZXJDb21wb25lbnRcbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBQZGZKc1ZpZXdlck1vZHVsZSB7XG4gIHN0YXRpYyBmb3JSb290KCk6IE1vZHVsZVdpdGhQcm92aWRlcnM8UGRmSnNWaWV3ZXJNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IFBkZkpzVmlld2VyTW9kdWxlXG4gICAgfTtcbiAgfVxufVxuIl19