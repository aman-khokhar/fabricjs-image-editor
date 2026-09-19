import type { Meta, StoryObj } from '@storybook/angular';
import { Canvas } from './canvas';

const meta: Meta<Canvas> = {
  title: 'Editor/Full Canvas',
  component: Canvas,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Fabric.js Image Editor

The full editor canvas. Supports:
- **Drag & drop** shapes, text, and images from the sidebar
- **Select & transform** objects (move, scale, rotate)
- **Layer management** in the Layers panel (right)
- **Undo/Redo** via Ctrl+Z / Ctrl+Alt+Z (up to 50 steps)
- **Pan & zoom** with the hand tool
- **Image cropping**
- **Text styling** — bold, italic, underline, per-character styles
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<Canvas>;

export const Default: Story = {
  name: 'Full Editor',
  render: () => ({
    template: `
      <div style="width: 100vw; height: 100vh; display: flex;">
        <div style="width: 3%; height: 100%; background-color: #707070;">
          <app-side-panel />
        </div>
        <div style="width: 97%; height: 100%;">
          <app-canvas />
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'The complete editor with sidebar and canvas. Fully interactive.',
      },
    },
  },
};

export const CanvasOnly: Story = {
  name: 'Canvas Only',
  render: () => ({
    template: `<div style="width:100vw;height:100vh;"><app-canvas /></div>`,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Canvas without the sidebar — useful for embedding in other layouts.',
      },
    },
  },
};
