import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HistoryPanel } from './history-panel';
import { CanvasHistoryService } from '../canvas/canvas-history-service';
import { BehaviorSubject } from 'rxjs';

class MockHistoryService {
  private undo$ = new BehaviorSubject([
    { name: 'Open', data: {} },
    { name: 'rect-1 added', data: {} },
    { name: 'text-1 added', data: {} },
    { name: 'text-1 modified', data: {} },
    { name: 'image-1 added', data: {} },
    { name: 'Locked circle-1', data: {} },
  ]);
  private redo$ = new BehaviorSubject([
    { name: 'circle-1 removed', data: {} },
    { name: 'Layer order updated 2 -> 3', data: {} },
  ]);

  undoStack$ = this.undo$.asObservable();
  redoStack$ = this.redo$.asObservable();
}

class MockHistoryServiceEmpty {
  private undo$ = new BehaviorSubject([{ name: 'Open', data: {} }]);
  private redo$ = new BehaviorSubject([]);

  undoStack$ = this.undo$.asObservable();
  redoStack$ = this.redo$.asObservable();
}

const meta: Meta<HistoryPanel> = {
  title: 'Panels/History Panel',
  component: HistoryPanel,
  tags: ['autodocs'],
  parameters: {
    backgrounds: { default: 'editor' },
    docs: {
      description: {
        component: `
The **History panel** shows a timeline of canvas actions.

- **Active item** (highlighted) = current state
- Items below = undo history
- Items greyed out = redo stack (undone actions)
- Use **Ctrl+Z** to undo, **Ctrl+Alt+Z** to redo
- Up to 50 history entries are kept
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<HistoryPanel>;

export const Empty: Story = {
  name: 'Fresh Canvas',
  decorators: [
    applicationConfig({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: CanvasHistoryService, useClass: MockHistoryServiceEmpty },
      ],
    }),
  ],
  render: () => ({
    template: `<div style="width:200px;height:250px;"><app-history-panel /></div>`,
  }),
};

export const WithHistory: Story = {
  name: 'With History & Redo Stack',
  decorators: [
    applicationConfig({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: CanvasHistoryService, useClass: MockHistoryService },
      ],
    }),
  ],
  render: () => ({
    template: `<div style="width:200px;height:250px;"><app-history-panel /></div>`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'History panel with 6 undo states and 2 redo states. The active (current) state is highlighted.',
      },
    },
  },
};
