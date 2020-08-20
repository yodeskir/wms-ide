import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MapStateService } from '../services/map-state.service';

@Component({
  selector: 'app-mvt-map',
  templateUrl: './mvt-map.component.html',
  styleUrls: ['./mvt-map.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class MvtMapComponent implements OnInit {

  style = {};
  accessToken = '';
  constructor(protected mapStateService: MapStateService) { }

  ngOnInit() {
    const mapstate = this.mapStateService.getMapState();
    this.accessToken = mapstate.token;
    this.style = {
      version: 8,
      name: 'simple',
      sources: {
        compass: {
          type: 'vector',
          tiles: [
            'http://127.0.0.1:5050/appgiswms/test-mvt?mode=tile&tilemode=gmap&tile={x}+{y}+{z}&layers=Countries110,timezones&map.imagetype=mvt'
          ]
        }
      },
      sprite: 'https://openmaptiles.github.io/osm-bright-gl-style/sprite',
      glyphs: 'https://free.tilehosting.com/fonts/{fontstack}/{range}.pbf?key=RiS4gsgZPZqeeMlIyxFo',
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: {
            'background-color': '#efefef'
          },
          interactive: true
        },
        {
          interactive: true,
          id: 'timezones',
          type: 'line',
          source: 'compass',
          'source-layer': 'timezones',
          paint: {
            'line-color': '#444444',
            'line-width': 0.5,
            'line-opacity': 1
          }
        }
      ]
    };
  }

  public transformRequest(url, resourceType, accessToken) { 
    if(resourceType == 'Source' && url.contains('appgiswms')) {
      return {
       url: url,
       headers: { 'WMS.Auth': accessToken }
     }
    }
  }
}
