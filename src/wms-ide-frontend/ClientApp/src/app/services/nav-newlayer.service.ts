import { Injectable, Output, EventEmitter, OnDestroy } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient, HttpRequest } from '@angular/common/http';


@Injectable()
export class NavNewLayerService implements OnDestroy {

  baseUrl = environment.baseUrl;
  isOpen = false;

  @Output() toggleNewLayerChange: EventEmitter<boolean> = new EventEmitter();
  @Output() toggleImportPanelChange: EventEmitter<boolean> = new EventEmitter();
  @Output() updateLayersMenuChange: EventEmitter<void> = new EventEmitter();
  @Output() getSourceFieldsChange: EventEmitter<any> = new EventEmitter();
  @Output() setRampColorValuesChange: EventEmitter<any> = new EventEmitter();

  constructor(private http: HttpClient) {
  }
  
  toggleNewLayerPanel(open) {
    if (open == null) {
        this.isOpen =  !this.isOpen;
    } else { this.isOpen = open; }

    this.toggleNewLayerChange.emit(this.isOpen);
  }

  toggleImportPanel(open) {
    this.toggleImportPanelChange.emit(open);
  }

  updateLayersMenu() {
    this.updateLayersMenuChange.emit();
  }

  uploadFile(formData: FormData): Observable<any> {
    const req = new HttpRequest('POST', `${this.baseUrl}/import/`, formData, {
      
    });
    return this.http.request(req);
  }

  listLayerDataSources(username): Observable<any> {
    const urlpath = `${this.baseUrl}/layers/all/${username}`;
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    return this.http.get<any>(urlpath, { headers: headers });
  }
  
  getSourceFields(username, layername, projection) {
    this.getSourceFieldsChange.emit({u: username, l: layername, p: projection});
  }

  setRampColorValues(numClasses, rampColors) {
    this.setRampColorValuesChange.emit({'numClasses': numClasses, 'rampColors': rampColors});
  }

  ngOnDestroy(): void {
    this.toggleNewLayerChange = null;
    this.toggleImportPanelChange = null;
    this.updateLayersMenuChange = null;
    this.getSourceFieldsChange = null;
  }

}
