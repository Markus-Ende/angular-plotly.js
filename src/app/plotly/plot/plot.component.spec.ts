import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotComponent } from './plot.component';
import { PlotlyService } from '../plotly.service';
import { SimpleChange } from '@angular/core';


describe('PlotComponent', () => {
    let component: PlotComponent;
    let fixture: ComponentFixture<PlotComponent>;
    let plotlySpy: jasmine.SpyObj<PlotlyService>;
    let windowSpy: jasmine.SpyObj<Window>;

    beforeEach(async(() => {
        const pSpy = jasmine.createSpyObj('PlotlyService', ['newPlot', 'plot']);
        windowSpy = jasmine.createSpyObj('Window', ['addEventListener', 'removeEventListener']);

        TestBed.configureTestingModule({
            declarations: [PlotComponent],
            providers: [
                { provide: PlotlyService, useValue: pSpy },
            ],
        }).compileComponents();

        plotlySpy = TestBed.get(PlotlyService);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PlotComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.plotEl.nativeElement).toBeDefined();
    });

    it('should receive the style from the property', () => {
        component.style = { 'background-color': 'red' };
        fixture.detectChanges();
        expect(component.plotEl.nativeElement.style.backgroundColor).toBe('red');
    });

    it('should add the id in the #plotEl', () => {
        expect(component.plotEl.nativeElement.id).toBe('');
        component.divId = 'some-id';
        fixture.detectChanges();
        expect(component.plotEl.nativeElement.id).toBe('some-id');
        component.divId = undefined;
        fixture.detectChanges();
        expect(component.plotEl.nativeElement.id).toBe('');
    });

    it('should update when change the revision number', () => {
        spyOn(component, 'updatePlot');

        component.revision = 0;
        component.ngOnChanges({'revision': new SimpleChange(null, component.revision, true)});
        fixture.detectChanges();
        expect(component.updatePlot).not.toHaveBeenCalled();

        component.revision = 1;
        component.ngOnChanges({'revision': new SimpleChange(0, component.revision, false)});
        fixture.detectChanges();
        expect(component.updatePlot).toHaveBeenCalled();

        component.revision = 2;
        component.ngOnChanges({'revision': new SimpleChange(1, component.revision, false)});
        fixture.detectChanges();
        expect(component.updatePlot).toHaveBeenCalledTimes(2);
    });

    it('should update the graph when the data changes', (done) => {
        spyOn(component, 'updatePlot');
        component.data = [{ y: [10, 15, 13, 17], type: 'box' }];
        component.createPlot().then(() => {
            component.ngDoCheck();
            expect(component.updatePlot).not.toHaveBeenCalled();

            component.data = [{ y: [11, 15, 13, 17], type: 'box' }];
            component.ngDoCheck();
            expect(component.updatePlot).toHaveBeenCalled();

            component.ngDoCheck();
            expect(component.updatePlot).toHaveBeenCalledTimes(1);

            component.data[0].y[0] = 12;
            component.ngDoCheck();
            expect(component.updatePlot).toHaveBeenCalledTimes(2);
            done();
        });
    });

    it('should update the layout when the object changes', (done) => {
        spyOn(component, 'updatePlot');
        component.layout = {title: 'title one'};
        component.createPlot().then(() => {
            component.ngDoCheck();
            expect(component.updatePlot).not.toHaveBeenCalled();

            component.layout = {title: 'title two'};
            component.ngDoCheck();
            expect(component.updatePlot).toHaveBeenCalled();

            component.layout.title = 'title three ';
            component.ngDoCheck();
            expect(component.updatePlot).toHaveBeenCalledTimes(2);
            done();
        });
    });

    it('should add the className in #plotEl', () => {
        expect(component.getClassName()).toBe('js-plotly-plot');
        expect(component.plotEl.nativeElement.className).toBe('js-plotly-plot');

        component.className = 'some-class';
        fixture.detectChanges();
        expect(component.getClassName()).toBe('js-plotly-plot some-class');
        expect(component.plotEl.nativeElement.className).toBe('js-plotly-plot some-class');

        component.className = ['test2', 'test3'];
        fixture.detectChanges();
        expect(component.getClassName()).toBe('js-plotly-plot test2 test3');
        expect(component.plotEl.nativeElement.className).toBe('js-plotly-plot test2 test3');
    });

    it('should add the gd property to window when passing true to debug', (done) => {
        spyOn(component, 'getWindow').and.callFake(() => windowSpy);
        spyOn(component, 'updatePlot').and.callThrough();

        expect(component.getWindow().gd).toBeUndefined();
        component.plotlyInstance = document.createElement('div') as any;
        component.debug = true;
        fixture.detectChanges();
        component.ngOnChanges({'debug': new SimpleChange(false, component.debug, false)});

        expect(component.updatePlot).toHaveBeenCalled();
        setTimeout(() => {
            expect(component.getWindow().gd).not.toBeUndefined();
            done();
        }, 13);
    });

    it('should add handler into window.resize when useResizeHandler=true', () => {
        spyOn(component, 'getWindow').and.callFake(() => windowSpy);

        expect(component.getWindow().addEventListener).not.toHaveBeenCalled();
        expect(component.resizeHandler).toBeUndefined();

        component.useResizeHandler = true;
        component.updateWindowResizeHandler();
        expect(component.resizeHandler).toBeDefined();

        component.useResizeHandler = false;
        component.updateWindowResizeHandler();
        expect(component.resizeHandler).toBeUndefined();
    });
});
