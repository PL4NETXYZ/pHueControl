import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LightComponent } from './light/light.component';

@Injectable({
  providedIn: 'root'
})
export class LightService {
  private apiUrl = 'https://localhost:7046/lights';

  constructor(private http: HttpClient) { }

  setLightState(id: number, state: any, bridgeAddress: string, username: string): Observable<any> {
    const url = `${this.apiUrl}/${id}/state?BridgeAddress=${bridgeAddress}&Username=${username}`;
    return this.http.put(url, state);
  }

  getLightState(id: number, bridgeAddress: string, username: string): Observable<any> {
    const url = `${this.apiUrl}/${id}?BridgeAddress=${bridgeAddress}&Username=${username}`;
    return this.http.get(url);
}

  getAllLights(bridgeAddress: string, username: string): Observable<any> {
    const url = `${this.apiUrl}?BridgeAddress=${bridgeAddress}&Username=${username}`;
    return this.http.get(url);
  }

  setAllLightsOff(lights: any, bridgeAddress: string, username: string): Observable<any> {
    const url = `${this.apiUrl}/off?BridgeAddress=${bridgeAddress}&Username=${username}`;
    return this.http.post(url, lights);
  }
}
