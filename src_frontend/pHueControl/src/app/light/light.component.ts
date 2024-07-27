import { Component } from '@angular/core';
import { LightService } from '../light.service';
import { Light } from './light';

@Component({
  selector: 'app-light',
  templateUrl: './light.component.html',
  styleUrls: ['./light.component.scss']
})
export class LightComponent {  
  color: string = '';
  brightness: number = 0;
  hue: number = 0;
  saturation: number = 0;
  state: string  = '';
  id: number = 0;
  getLightState: any;
  bridgeAddress: string = '';
  username: string = '';
  lights: Light[] = [];
  lightIds: number[] = [];

  constructor(private controlService: LightService) {}

  rgbaToRgb(rgba: string): { r: number, g: number, b: number } {
    let [r, g, b] = rgba.slice(5, -1).split(',').map(Number);
    return { r, g, b };
}

  rgbToHsv({ r, g, b }: { r: number, g: number, b: number, a?: number }): { h: number, s: number, v: number } {
    r /= 255, g /= 255, b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h: number = 0, s: number = 0, v = max;
    let d = max - min;
    s = max == 0 ? 0 : d / max;
    if (max != min) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h, s, v };
}

rgbToXyY(r: number, g: number, b: number): {x: number, y: number} {
  // First calculate X, Y and Z
  let X = 0.4124*r + 0.3576*g + 0.1805*b;
  let Y = 0.2126*r + 0.7152*g + 0.0722*b;
  let Z = 0.0193*r + 0.1192*g + 0.9505*b;

  // Then normalize to get x and y
  let x = X / (X + Y + Z);
  let y = Y / (X + Y + Z);

  return {x, y};
}

  scaleHue(h: number) {
    return Math.floor(h * 65535);
  }

  onAllLightsOff() {
    this.controlService.setAllLightsOff(this.lightIds, this.bridgeAddress, this.username).subscribe(response => {
      if (response.success) {
        console.log('All lights turned off successfully');
      } else {
        console.error('Failed to turn off all lights');
      }
    });
  }

  onSubmit() {
    console.log('Hex Color:', this.color);
    let rgbColor = this.rgbaToRgb(this.color);
    console.log('RGB Color:', rgbColor);
    let xy = this.rgbToXyY(rgbColor.r, rgbColor.g, rgbColor.b);


    let hsvColor = this.rgbToHsv(rgbColor);
    let hue = this.scaleHue(hsvColor.h);
    let sat = Math.round(hsvColor.s * 254);
    let bri = Math.round(hsvColor.v * 254);

    const lightState = {
      on: this.state === 'true',
      hue: hue,
      sat: sat,
      bri: bri,
      x: xy.x,
      y: xy.y
    }

    this.controlService.setLightState(this.id, lightState, this.bridgeAddress, this.username).subscribe(response => {
      console.log('Light state set successfully:', response);
    }, error => {
      console.error('Error setting light state:', error);
    })
  }

  SetLightTestStateClicked() {
    const lightStateTest = {
      on: true,
      sat: 254,
      bri: 254,
      hue: 0
    }
  this.controlService.setLightState(this.id, lightStateTest, this.bridgeAddress, this.username).subscribe(response => {
    console.log('Light state set successfully:', response);
  }, error => {
    console.error('Error setting light state:', error);
  })
}

  GetLightStateClicked() {
    this.controlService.getLightState(this.id, this.bridgeAddress, this.username).subscribe(response => {
    this.getLightState = response;
    console.log('Light state get successfully:', response);
    }, error => {
      console.error('Error getting light state:', error);
    })
  }

  GetAllLights() {
    this.controlService.getAllLights(this.bridgeAddress, this.username).subscribe(response => {
      for (let id in response) {
        this.lights.push({ id: +id, name: response[id].name });
      }
    console.log('Light state get successfully:', response);

    this.lightIds = this.lights.map(light => light.id);

    }, error => {
      console.error('Error getting light state:', error);
    })
  }

  onBridgeAddressChange(): void {
    if (this.bridgeAddress === '' || this.username === '') {
      this.lights = [];
    } else {
      this.GetAllLights();
    }
  }
  
  onUsernameChange(): void {
    if (this.bridgeAddress === '' || this.username === '') {
      this.lights = [];
    } else {
      this.GetAllLights();
    }
  }
}
