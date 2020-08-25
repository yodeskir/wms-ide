import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule, LocationStrategy, HashLocationStrategy } from '@angular/common';
import { NgModule, ErrorHandler } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ColorChromeModule } from 'ngx-color/chrome';
import { ColorSketchModule } from 'ngx-color/sketch'
//import { NgxMapboxGLModule } from 'ngx-mapbox-gl';

import { NgZorroAntdModule } from 'ng-zorro-antd';
import { AppComponent } from './app.component';
import { NavMenuService } from './services/nav-menu.service';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { NavPropsComponent } from './nav-props/nav-props.component';
import { MapComponent } from './map/map.component';
import { ContextMenuModule, ContextMenuService } from 'ngx-contextmenu';
import { DragulaModule } from 'ng2-dragula';
import { AgGridModule } from 'ag-grid-angular';

import { NgScrollbarModule } from 'ngx-scrollbar';
import { WmsGenericComponent } from './wms-components/wms-generic/wms-generic.component';
import { WmsDirective } from './wms-components/wms-generic/wms.directive';
import { WmsInputComponent } from './wms-components/wms-input/wms-input.component';
import { WmsDropdownComponent } from './wms-components/wms-input/wms-dropdown.component';
import { WmsExtentComponent } from './wms-components/wms-input/wms-extent.component';
import { WmsXYComponent } from './wms-components/wms-input/wms-xy.component';
import { WmsSymbolPointComponent } from './wms-components/wms-input/wms-symbolpoint.component';
import { WmsColorSketchComponent } from './wms-components/wms-input/wms-colorsketch.component';
import { WmsRangeColorComponent } from './wms-components/wms-input/wms-rangecolor.component';
import { WmsZoomSliderComponent } from './wms-components/wms-input/wms-zoomslider.component';
import { WmsBlockContainerComponent } from './wms-components/wms-input/wms-blockcontainer.component';
import { MapService } from './services/map.service';
import { NavNewlayerComponent } from './nav-newlayer/nav-newlayer.component';
import { WmsDataInputComponent } from './wms-components/wms-input/wms-datainput.component';
import { WmsProcessingComponent } from './wms-components/wms-input/wms-processing.component';
import { WmsAddProcessingComponent } from './wms-components/wms-input/wms-add-processing.component';

import { NavNewLayerService } from './services/nav-newlayer.service';
import { ImportDatasourceComponent } from './import-datasource/import-datasource.component';
import { TogeomDatasourceComponent } from './togeom-datasource/togeom-datasource.component';
import { ButtonWithmenuComponent } from './button-withmenu/button-withmenu.component';
import { MapStateService } from './services/map-state.service';
//import { MvtMapComponent } from './mvt-map/mvt-map.component';
import { WmsstylePropertiesComponent } from './wmsstyle-properties/wmsstyle-properties.component';
import { WmsstyleItemComponent } from './wmsstyle-item/wmsstyle-item.component';
import { LoginComponent } from './login/login.component';
import { LoginService } from './services/login.service';
import { AuthGuardService } from './services/auth-guard.service';
import { RequestInterceptor } from './services/error-handler.service';
import { MessageService } from './services/message.service';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { LayerDatagridComponent } from './layer-datagrid/layer-datagrid.component';
import { WmsModalService } from './services/wms-modal.service';
import { DomService } from './services/dom.service';
import { WmsModalComponent } from './wms-modal/wms-modal.component';
import { NewfromDatasourceComponent } from './newfrom-datasource/newfrom-datasource.component';
import { ColorbrewerRampComponent } from './colorbrewer-ramp/colorbrewer-ramp.component';
import { SymbolGeneratorComponent } from './symbol-generator/symbol-generator.component';
import { MvtMapComponent } from './mvt-map/mvt-map.component';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    NavPropsComponent,
    WmsModalComponent,
    WmsGenericComponent,
    WmsDirective,
    WmsDataInputComponent,
    WmsInputComponent,
    WmsDropdownComponent,
    WmsExtentComponent,
    WmsXYComponent,
    WmsSymbolPointComponent,
    WmsProcessingComponent,
    WmsAddProcessingComponent,
    WmsColorSketchComponent,
    WmsRangeColorComponent,
    WmsZoomSliderComponent,
    WmsBlockContainerComponent,
    MapComponent,
    NavNewlayerComponent,
    ImportDatasourceComponent,
    TogeomDatasourceComponent,
    ButtonWithmenuComponent,
    MvtMapComponent,
    WmsstylePropertiesComponent,
    WmsstyleItemComponent,
    LoginComponent,
    LayerDatagridComponent,
    NewfromDatasourceComponent,
    ColorbrewerRampComponent,
    SymbolGeneratorComponent
  ],
  entryComponents: [
    WmsDataInputComponent,
    WmsInputComponent,
    WmsDropdownComponent,
    WmsExtentComponent,
    WmsXYComponent,
    WmsSymbolPointComponent,
    WmsColorSketchComponent,
    WmsRangeColorComponent,
    WmsZoomSliderComponent,
    WmsProcessingComponent,
    WmsAddProcessingComponent,
    WmsBlockContainerComponent,
    SymbolGeneratorComponent
  ],
  imports: [
    LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG }),
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    BrowserAnimationsModule,
    AgGridModule.withComponents([]),
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgScrollbarModule,
    ColorChromeModule,
    ColorSketchModule,
    ContextMenuModule.forRoot({
      autoFocus: false,
    }),
    //NgxMapboxGLModule,
    DragulaModule.forRoot(),
    RouterModule.forRoot([
      { path: 'login', component: LoginComponent, pathMatch: 'full' },
      { path: 'wmsmap', component: MapComponent, pathMatch: 'full', canActivate: [AuthGuardService] },
      { path: 'mvtmap', component: MvtMapComponent, pathMatch: 'full', canActivate: [AuthGuardService] }
    ]),
    NgZorroAntdModule.forRoot()
  ],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy },
    MapStateService, AuthGuardService, RequestInterceptor,
    MessageService, LoginService, ContextMenuService,
    NavMenuService, NavNewLayerService, MapService,
    WmsModalService, DomService],
  bootstrap: [AppComponent]
})
export class AppModule { }
