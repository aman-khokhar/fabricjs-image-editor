import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopPanel } from './top-panel';

describe('TopPanel', () => {
  let component: TopPanel;
  let fixture: ComponentFixture<TopPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
