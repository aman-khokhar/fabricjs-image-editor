import type { Meta, StoryObj } from '@storybook/angular';
import { SidePanel } from './side-panel';

const meta: Meta<SidePanel> = {
  title: 'Panels/Side Panel',
  component: SidePanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'editor' },
    docs: {
      description: {
        component: `
The vertical toolbar on the left. Contains tool buttons that open popovers for:
- **Pan** — drag to pan the canvas, scroll to zoom
- **Shapes** — rectangle, circle, ellipse, triangle, line
- **Text** — draggable Text and Textbox elements
- **Images** — drag placeholder images onto the canvas

Click a tool button to toggle its popover. Clicking the active tool again closes it.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<SidePanel>;

export const Default: Story = {
  name: 'Default',
  render: () => ({
    template: `
      <div style="width: 48px; height: 400px; background-color: #707070;">
        <app-side-panel />
      </div>
    `,
  }),
};

export const WithShapePopoverOpen: Story = {
  name: 'Shape Popover Open',
  render: () => ({
    template: `
      <div style="width: 48px; height: 400px; background-color: #707070; margin-left: 100px;">
        <app-side-panel />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Click the shapes icon to see the shape picker popover.',
      },
    },
  },
};
