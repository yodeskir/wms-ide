import { Component, OnInit, HostBinding, ViewEncapsulation } from '@angular/core';
import { MapService } from '../services/map.service';
import { LayerdataService } from '../services/layerdata.service';
import { map, each, zipObject, keys } from 'lodash';
import { IDatasource, IGetRowsParams } from 'ag-grid-community';


@Component({
  selector: 'app-layer-datagrid',
  templateUrl: './layer-datagrid.component.html',
  styleUrls: ['./layer-datagrid.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LayerDatagridComponent implements OnInit {
  layerDataVisible = false;
  layerName: string = null;
  datasourceName: string = null;
  IsGridReady = false;
  IsLayerGridChanging = false;
  columnNames: Array<any> = ['none'];
  filterBy = '';
  filterOpType = '';
  filterValue = '';

  private gridApi;
  private defaultColDef;
  private columnDefs;
  private rowModelType;
  private rowSelection;
  private maxBlocksInCache;
  private getRowNodeId;
  private datasource: IDatasource;


  @HostBinding('class.show-data-layer')
  isDataPanelOpen = false;

  constructor(private layerdataService: LayerdataService) {
    this.rowModelType = "infinite";
    this.rowSelection = "multiple";
    this.maxBlocksInCache = 2;
  }

  ngOnInit() {

    this.layerdataService.openLayerDatagridTrigger.subscribe(e => {
      this.layerName = e.layerName;
      this.datasourceName = e.datasourceName;
      this.isDataPanelOpen = e.openDataPanel;
      this.IsGridReady = e.openDataPanel;
      this.applyFilter();

    });

    this.layerdataService.setGridChangingDatasourceTrigger.subscribe(e => {
      this.IsLayerGridChanging = !this.IsLayerGridChanging;
    });

  }

  applyFilter() {
    if (this.IsGridReady && this.IsLayerGridChanging && this.gridApi) {
      var params = { force: true };
      this.gridApi.refreshCells(params);
      this.gridApi.setDatasource(this.getLayerDataSource(this.datasourceName, 0, 100));
    }
  }

  getLayerDataSource(datasourceName, rowStart, rowEnd): IDatasource {
    var rows = [];
    this.datasource = {
      getRows: (params: IGetRowsParams) => {
        this.layerdataService.getLayerData(datasourceName, params.startRow, params.endRow, this.filterBy, this.filterOpType, this.filterValue).subscribe(result => { //params.startRow, params.endRow
          if (result) {
            this.columnDefs = map(result.fields, function (i) {
              return { headerName: i.toUpperCase(), field: i, sortable: false, filter: false };
            });

            each(result.data, function (d) {
              rows.push(zipObject(result.fields, d));
            });

            setTimeout(function () {
              var rowsThisPage = rows.slice(params.startRow, params.endRow);
              var lastRow = -1;
              if (rows.length <= params.endRow) {
                lastRow = rows.length;
              }
              params.successCallback(rowsThisPage, lastRow);
            }, 500);

            this.columnNames = map(this.columnDefs, 'field');
          }
        });
      }
    }
    return this.datasource;
  }

  onGridReady(params) {
    const that = this;
    this.gridApi = params.api;
    params.api.setDatasource(this.getLayerDataSource(this.datasourceName, 0, 100));
  }


  close(): void {
    this.isDataPanelOpen = false;
  }

}
