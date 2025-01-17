import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { PromocionService } from '../service/promocion.service';
import { IPromocion } from '../promocion.model';
import { PromocionFormService } from './promocion-form.service';

import { PromocionUpdateComponent } from './promocion-update.component';

describe('Promocion Management Update Component', () => {
  let comp: PromocionUpdateComponent;
  let fixture: ComponentFixture<PromocionUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let promocionFormService: PromocionFormService;
  let promocionService: PromocionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PromocionUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(PromocionUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(PromocionUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    promocionFormService = TestBed.inject(PromocionFormService);
    promocionService = TestBed.inject(PromocionService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const promocion: IPromocion = { id: 456 };

      activatedRoute.data = of({ promocion });
      comp.ngOnInit();

      expect(comp.promocion).toEqual(promocion);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPromocion>>();
      const promocion = { id: 123 };
      jest.spyOn(promocionFormService, 'getPromocion').mockReturnValue(promocion);
      jest.spyOn(promocionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ promocion });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: promocion }));
      saveSubject.complete();

      // THEN
      expect(promocionFormService.getPromocion).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(promocionService.update).toHaveBeenCalledWith(expect.objectContaining(promocion));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPromocion>>();
      const promocion = { id: 123 };
      jest.spyOn(promocionFormService, 'getPromocion').mockReturnValue({ id: null });
      jest.spyOn(promocionService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ promocion: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: promocion }));
      saveSubject.complete();

      // THEN
      expect(promocionFormService.getPromocion).toHaveBeenCalled();
      expect(promocionService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPromocion>>();
      const promocion = { id: 123 };
      jest.spyOn(promocionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ promocion });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(promocionService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
