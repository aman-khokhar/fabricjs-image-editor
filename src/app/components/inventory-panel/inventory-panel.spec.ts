import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryPanel } from './inventory-panel';

describe('InventoryPanel', () => {
  let component: InventoryPanel;
  let fixture: ComponentFixture<InventoryPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
