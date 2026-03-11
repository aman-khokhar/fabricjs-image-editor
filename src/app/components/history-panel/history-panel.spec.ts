import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryPanel } from './history-panel';

describe('HistoryPanel', () => {
  let component: HistoryPanel;
  let fixture: ComponentFixture<HistoryPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
