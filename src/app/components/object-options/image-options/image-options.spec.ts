import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageOptions } from './image-options';

describe('ImageOptions', () => {
  let component: ImageOptions;
  let fixture: ComponentFixture<ImageOptions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageOptions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageOptions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
