import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionDocuPage } from './gestion-docu.page';

describe('GestionDocuPage', () => {
  let component: GestionDocuPage;
  let fixture: ComponentFixture<GestionDocuPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionDocuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
