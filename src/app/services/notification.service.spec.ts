import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { DocumentStorageService } from './document-storage.service';
import { LocalNotifications } from '@capacitor/local-notifications';

describe('NotificationService', () => {
  let service: NotificationService;
  let documentStorageService: jasmine.SpyObj<DocumentStorageService>;

  beforeEach(() => {
    const documentStorageSpy = jasmine.createSpyObj('DocumentStorageService', ['obtenerTodosLosDocumentos']);

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: DocumentStorageService, useValue: documentStorageSpy }
      ]
    });
    service = TestBed.inject(NotificationService);
    documentStorageService = TestBed.inject(DocumentStorageService) as jasmine.SpyObj<DocumentStorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should convert fecha string to Date', () => {
    const fechaStr = '25/12/2024';
    const fecha = (service as any).convertirFechaADate(fechaStr);
    
    expect(fecha).toBeInstanceOf(Date);
    expect(fecha?.getDate()).toBe(25);
    expect(fecha?.getMonth()).toBe(11); // Diciembre es mes 11 (0-indexed)
    expect(fecha?.getFullYear()).toBe(2024);
  });

  it('should handle invalid date format', () => {
    const fecha = (service as any).convertirFechaADate('invalid-date');
    expect(fecha).toBeNull();
  });

  it('should generate notification ID', () => {
    const documentoId = 'test-doc-123';
    const notificationId = (service as any).obtenerNotificationId(documentoId);
    
    expect(typeof notificationId).toBe('number');
    expect(notificationId).toBeGreaterThan(0);
  });
});

