import { TestBed } from '@angular/core/testing';

import { RegistroU } from './registro-u';

describe('RegistroU', () => {
  let service: RegistroU;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegistroU);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
