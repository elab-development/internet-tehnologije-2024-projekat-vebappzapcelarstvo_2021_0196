import { TestBed } from '@angular/core/testing';

import { PublicAPIService } from './public-apiservice';

describe('PublicAPIService', () => {
  let service: PublicAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
