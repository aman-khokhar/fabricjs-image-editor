import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { DetailsPanel } from './details-panel';
import { CanvasService } from '../canvas/canvas-service';
import { BehaviorSubject } from 'rxjs';
import { fabric } from 'fabric';

// Minimal mock fabric-like objects (plain objects that match the shape the template reads)
const mockRect = {
  type: 'rect',
  id: 'object-1',
  angle: 0,
  width: 150,
  height: 100,
  scaleX: 1,
  scaleY: 1,
  left: 200,
  top: 150,
  innerLeft: 50,
  innerTop: 25,
  fill: '#ff6b6b',
  stroke: '#000000',
  strokeWidth: 1,
  opacity: 1,
} as any;

const mockCircle = {
  type: 'circle',
  id: 'object-2',
  angle: 45,
  width: 100,
  height: 100,
  scaleX: 1,
  scaleY: 1,
  left: 300,
  top: 200,
  innerLeft: 100,
  innerTop: 75,
  fill: '#4ecdc4',
  stroke: '#000000',
  strokeWidth: 2,
  radius: 50,
  opacity: 1,
} as any;

const mockEllipse = {
  type: 'ellipse',
  id: 'object-3',
  angle: 0,
  width: 200,
  height: 100,
  scaleX: 1,
  scaleY: 1,
  left: 300,
  top: 200,
  innerLeft: 100,
  innerTop: 75,
  fill: '#ffe66d',
  stroke: '#000000',
  strokeWidth: 1,
  rx: 100,
  ry: 50,
  opacity: 1,
} as any;

const mockText = {
  type: 'text',
  id: 'object-4',
  angle: 0,
  width: 120,
  height: 60,
  scaleX: 1,
  scaleY: 1,
  left: 250,
  top: 180,
  innerLeft: 80,
  innerTop: 50,
  fill: '#000000',
  stroke: '#000000',
  strokeWidth: 1,
  fontSize: 50,
  fontFamily: 'Roboto',
  opacity: 1,
} as any;

class MockCanvasService {
  selectedObject$: any;
  playgroundRect$ = new BehaviorSubject<any>({ left: 150, top: 100 }).asObservable();

  constructor(selected: any) {
    this.selectedObject$ = new BehaviorSubject<any>(selected).asObservable();
  }

  updateSelectedProps(props: any) {}
}

const withSelected = (obj: any) => ({
  decorators: [
    applicationConfig({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: CanvasService, useValue: new MockCanvasService(obj) },
      ],
    }),
  ],
  args: {
    ...obj,
  },
  render: () => ({
    template: `
      <div style="background:#707070; padding:4px; display:flex; align-items:center; height:42px; width: 1100px;">
        <app-details-panel />
      </div>
    `,
  }),
});

const meta: Meta<DetailsPanel> = {
  title: 'Panels/Details Panel',
  component: DetailsPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'editor' },
    docs: {
      description: {
        component: `
The **top toolbar** that shows transform controls for the selected object.

Shows contextually depending on object type:
- **All objects**: angle, X, Y position
- **Shapes (non-line)**: width, height
- **Non-text objects**: stroke width, stroke color
- **Fillable shapes**: fill color
- **Circle**: radius
- **Ellipse**: rx, ry
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<DetailsPanel>;

export const NoSelection: Story = {
  name: 'No Selection',
  ...withSelected(null),
  parameters: {
    docs: { description: { story: 'Nothing selected — toolbar is hidden.' } },
  },
};

export const RectSelected: Story = {
  name: 'Rectangle Selected',
  ...withSelected(mockRect),
};

export const CircleSelected: Story = {
  name: 'Circle Selected',
  ...withSelected(mockCircle),
};

export const EllipseSelected: Story = {
  name: 'Ellipse Selected',
  ...withSelected(mockEllipse),
};

export const TextSelected: Story = {
  name: 'Text Selected',
  ...withSelected(mockText),
  parameters: {
    docs: {
      description: {
        story: 'Text objects hide the W/H/fill/stroke fields and show only angle and position.',
      },
    },
  },
};
