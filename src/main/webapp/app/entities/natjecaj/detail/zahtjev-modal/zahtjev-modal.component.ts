import { HttpResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ZahtjevService } from 'app/entities/zahtjev/service/zahtjev.service';
import { ZahtjevFormGroup, ZahtjevFormService } from 'app/entities/zahtjev/update/zahtjev-form.service';
import { IZahtjev } from 'app/entities/zahtjev/zatjev.model';
import { finalize, Observable } from 'rxjs';
import { INatjecaj } from '../../natjecaj.model';

@Component({
  selector: 'jhi-zahtjev-modal',
  templateUrl: './zahtjev-modal.component.html',
  styleUrls: ['./zahtjev-modal.component.scss'],
})
export class ZahtjevModalComponent implements OnInit {
  numberOfEntities: number | null = null;
  numZahtjevsToCreate = 1;
  isSaving = false;
  zahtjev: IZahtjev | null = null;

  editForm: ZahtjevFormGroup = this.zahtjevFormService.createZahtjevFormGroup();

  constructor(
    private zahtjevService: ZahtjevService,
    protected zahtjevFormService: ZahtjevFormService,
    public modal: NgbActiveModal,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {}

  @Input() natjecaj: INatjecaj | undefined;

  onCreateZahtjevsSubmit() {
    for (let i = 0; i < this.numZahtjevsToCreate; i++) {
      this.isSaving = true;
      const zahtjev = this.zahtjevFormService.getZahtjev(this.editForm);
      zahtjev.natjecaj = this.natjecaj; // set the same natjecaj value for all Zahtjevs
      // set any other properties for the Zahtjev entity here
      //staro   this.zahtjevService.create(zahtjev).subscribe(() => {
      // handle successful creation of the Zahtjev entity
      //staro   });

      if (zahtjev.id == null) {
        this.subscribeToSaveResponse(this.zahtjevService.create(zahtjev));
      }
    }
    this.modal.dismiss();
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IZahtjev>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  previousState(): void {
    window.history.back();
  }
}
