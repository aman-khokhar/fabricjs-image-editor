import { Component, inject } from '@angular/core';
import { CanvasHistoryService } from '../canvas/canvas-history-service';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-history-panel',
  imports: [AsyncPipe, CommonModule],
  templateUrl: './history-panel.html',
  styleUrl: './history-panel.css',
})
export class HistoryPanel {
  historyService = inject(CanvasHistoryService);

  undoStack$ = this.historyService.undoStack$;
  redoStack$ = this.historyService.redoStack$;
}
