import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StackPanel } from './stack-panel';

describe('StackPanel', () => {
  let component: StackPanel;
  let fixture: ComponentFixture<StackPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StackPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StackPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
