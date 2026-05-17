import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiSupport } from './ai-support';

describe('AiSupport', () => {
  let component: AiSupport;
  let fixture: ComponentFixture<AiSupport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiSupport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiSupport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
