import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { StackPanel } from './stack-panel';
import { CanvasService } from '../canvas/canvas-service';
import { BehaviorSubject } from 'rxjs';

// Mock fabric objects for the stories
const mockObjects: any[] = [
  {
    id: 'playground-rect',
    type: 'rect',
    name: 'playground-rect',
    lockMovementX: false,
    lockMovementY: false,
    selectable: false,
  },
  {
    id: 'object-1',
    type: 'rect',
    name: 'rect-1',
    lockMovementX: false,
    lockMovementY: false,
    selectable: true,
  },
  {
    id: 'object-2',
    type: 'text',
    name: 'text-1',
    lockMovementX: false,
    lockMovementY: false,
    selectable: true,
  },
  {
    id: 'object-3',
    type: 'image',
    name: 'image-1',
    lockMovementX: false,
    lockMovementY: false,
    selectable: true,
  },
  {
    id: 'object-4',
    type: 'circle',
    name: 'circle-1',
    lockMovementX: true,
    lockMovementY: true,
    selectable: false,
  },
];

const mockObjectsWithSelected: any[] = [...mockObjects];

// A mock CanvasService that emits preset data
class MockCanvasService {
  private objects$ = new BehaviorSubject(mockObjects);
  private selected$ = new BehaviorSubject<any>(mockObjects[2]); // text-1 selected

  canvasObjects$ = this.objects$.asObservable();
  selectedObject$ = this.selected$.asObservable();
}

const meta: Meta<StackPanel> = {
  title: 'Panels/Stack Panel (Layers)',
  component: StackPanel,
  tags: ['autodocs'],
  parameters: {
    backgrounds: { default: 'editor' },
    docs: {
      description: {
        component: `
The **Layers panel** showing all canvas objects in z-order (top of list = front of canvas).

Features:
- **Click** a layer name to select that object on canvas
- **Drag** layers to reorder z-index
- **Lock/Unlock** objects to prevent accidental edits
- Icons indicate object type (text, shape, image)
- Background layer is always locked at the bottom
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<StackPanel>;

export const Empty: Story = {
  name: 'Empty Canvas',
  render: () => ({
    template: `
      <div style="width: 200px; height: 400px;">
        <app-stack-panel />
      </div>
    `,
  }),
};

export const WithLayers: Story = {
  name: 'With Layers',
  decorators: [
    applicationConfig({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: CanvasService, useClass: MockCanvasService },
      ],
    }),
  ],
  render: () => ({
    template: `
      <div style="width: 200px; height: 400px;">
        <app-stack-panel />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Layers panel populated with a rect, text, image, and a locked circle layer.',
      },
    },
  },
};
