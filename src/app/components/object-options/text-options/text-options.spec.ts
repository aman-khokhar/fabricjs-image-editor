import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextOptions } from './text-options';

describe('TextOptions', () => {
  let component: TextOptions;
  let fixture: ComponentFixture<TextOptions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextOptions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextOptions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
