import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ObjectOptions } from './object-options';
import { CanvasService } from '../canvas/canvas-service';
import { ImageService } from '../canvas/image-service';
import { BehaviorSubject } from 'rxjs';
import { signal } from '@angular/core';
import { filterArgTypes } from 'storybook/internal/preview-api';

const mockTextbox = {
  type: 'textbox',
  id: 'object-text-1',
  fontWeight: 'normal',
  fontStyle: 'normal',
  underline: false,
  overline: false,
  linethrough: false,
  fontFamily: 'Roboto',
  fontSize: 50,
  strokeWidth: 1,
  stroke: '#000000',
  fill: '#000000',
  backgroundColor: 'transparent',
  textAlign: 'left',
  styles: {},
  selectionStart: 0,
  selectionEnd: 0,
} as any;

const mockBoldTextbox = {
  ...mockTextbox,
  fontWeight: 'bold',
  fontStyle: 'italic',
  underline: true,
  fontFamily: 'Montserrat',
  fontSize: 36,
  textAlign: 'center',
};

const mockImage = {
  type: 'image',
  id: 'object-img-1',
} as any;

class MockCanvasService {
  selectedObject$: any;
  playgroundRect$ = new BehaviorSubject<any>(null).asObservable();
  constructor(obj: any) {
    this.selectedObject$ = new BehaviorSubject<any>(obj).asObservable();
  }
  updateSelectedProps(props: any) {}
}

class MockImageService {
  isCropMode = signal(false);
  updateCropMode(v: boolean) {
    this.isCropMode.set(v);
  }
  applyCrop() {}
  cancelCrop() {}
}

const withObj = (obj: any) => ({
  decorators: [
    applicationConfig({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: CanvasService, useValue: new MockCanvasService(obj) },
        { provide: ImageService, useClass: MockImageService },
      ],
    }),
  ],
  args: {
    ...obj,
  },
  render: () => ({
    template: `
      <div style="background:#707070; padding:4px; display:flex; align-items:center; min-height:42px; flex-wrap:wrap;">
        <app-object-options />
      </div>
    `,
  }),
});

const meta: Meta<ObjectOptions> = {
  title: 'Panels/Object Options',
  component: ObjectOptions,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'editor' },
    docs: {
      description: {
        component: `
The **contextual options bar** that appears when an object is selected.

- **Text/Textbox selected** → shows TextOptions: bold, italic, underline, overline, strikethrough, font family, size, stroke, fill, background color. Textboxes also get alignment controls.
- **Image selected** → shows ImageOptions: crop toggle, apply/cancel crop buttons.
- **Crop rect selected** → shows Apply / Cancel buttons directly.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<ObjectOptions>;

export const NoSelection: Story = {
  name: 'No Selection',
  ...withObj(null),
};

export const TextboxDefault: Story = {
  name: 'Textbox — Default Styles',
  ...withObj(mockTextbox),
  parameters: {
    docs: {
      description: { story: 'Options bar for a freshly added textbox with default styling.' },
    },
  },
};

export const TextboxStyled: Story = {
  name: 'Textbox — Bold Italic Centered',
  ...withObj(mockBoldTextbox),
  parameters: {
    docs: {
      description: {
        story:
          'Options bar reflecting bold, italic, underline, Montserrat font, centered alignment.',
      },
    },
  },
};

export const ImageSelected: Story = {
  name: 'Image — Crop Controls',
  ...withObj(mockImage),
  parameters: {
    docs: {
      description: {
        story:
          'When an image is selected the crop button appears. Click it to toggle crop mode and show Apply/Cancel.',
      },
    },
  },
};
