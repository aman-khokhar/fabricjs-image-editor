import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectOptions } from './object-options';

describe('ObjectOptions', () => {
  let component: ObjectOptions;
  let fixture: ComponentFixture<ObjectOptions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObjectOptions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObjectOptions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
