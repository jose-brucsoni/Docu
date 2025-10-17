import { TestBed } from '@angular/core/testing';
import { CaptureOcrService } from './capture-io'; 

describe('CaptureOcrService', () => {
  let service: CaptureOcrService;  

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaptureOcrService);  
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
