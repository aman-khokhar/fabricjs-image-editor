import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsPanel } from './details-panel';

describe('DetailsPanel', () => {
  let component: DetailsPanel;
  let fixture: ComponentFixture<DetailsPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
