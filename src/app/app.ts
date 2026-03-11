import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgbConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(ngbConfig: NgbConfig) {
    ngbConfig.animation = false;
  }
}
