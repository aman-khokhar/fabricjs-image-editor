import { Component } from '@angular/core';
import { Canvas } from '../canvas/canvas';
import { SidePanel } from '../side-panel/side-panel';
import { TopPanel } from '../top-panel/top-panel';

@Component({
  selector: 'app-main',
  imports: [Canvas, SidePanel, TopPanel],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {}
