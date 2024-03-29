import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IPrijava } from '../prijava.model';
import { DataUtils } from 'app/core/util/data-util.service';
import { IMobilnost, NewMobilnost } from 'app/entities/mobilnost/mobilnost.model';
import { finalize, Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { IUploadFile } from '../upload_files.model';
import { PrijavaService } from '../service/prijava.service';
import { IZahtjev } from 'app/entities/zahtjev/zatjev.model';
import { ZahtjevService } from 'app/entities/zahtjev/service/zahtjev.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ZahtjevModalComponent } from '../../natjecaj/detail/zahtjev-modal/zahtjev-modal.component';
import { FileModalComponent } from './file-modal/file-modal.component';
import { StatusPrijave } from 'app/entities/enumerations/statusprijave.mode';
import { MobilnostService } from 'app/entities/mobilnost/service/mobilnost.service';
import { StatusMobilnosti } from 'app/entities/enumerations/statusmobilnosti.mode';
import { MobilnostFormGroup, MobilnostFormService } from 'app/entities/mobilnost/update/mobilnost-form.service';

@Component({
  selector: 'jhi-prijava-detail',
  templateUrl: './prijava-detail.component.html',
})
export class PrijavaDetailComponent implements OnInit {
  prijava: IPrijava | null = null;
  isSaving = false;
  mobilnostCollection: any;
  prijavaFormService: any;
  uploadFiles?: IUploadFile[];
  zahtjevs: IZahtjev[] | null = [];
  mobilnost: IMobilnost | null = null;

  constructor(
    protected dataUtils: DataUtils,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    private prijavaService: PrijavaService,
    private zahtjevService: ZahtjevService,
    private modalService: NgbModal,
    private mobilnostService: MobilnostService,
    protected mobilnostFormService: MobilnostFormService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ prijava }) => {
      this.prijava = prijava;
    });
    if (this.prijava?.natjecaj?.id) {
      this.zahtjevService.findAllByNatjecajId(this.prijava.natjecaj.id).subscribe(result => {
        this.zahtjevs = result.body;
      });
    }
  }

  editForm: MobilnostFormGroup = this.mobilnostFormService.createMobilnostFormGroup();

  onModalHidden(): void {
    window.location.reload();
  }

  urediFile(file: Pick<IUploadFile, 'id'>): void {
    const modalRef = this.modalService.open(FileModalComponent, { centered: true });

    modalRef.componentInstance.uploadFile = file;

    modalRef.result.then(
      yes => {
        console.log('Ok click');
      },
      cancel => {
        console.log('cancel Click');
        window.location.reload();
      }
    );
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  previousState(): void {
    window.history.back();
  }
  createMobilnost(prijava: Pick<IPrijava, 'id' | 'natjecaj' | 'statusPrijave'>): void {
    // Set the prijava.statusPrijave to PRIHVACEN for the Prijava entity
    prijava.statusPrijave = StatusPrijave.PRIHVACEN;
    console.log(prijava.statusPrijave);

    const partialUpdatePrijava = {
      id: prijava.id!,
      statusPrijave: prijava.statusPrijave || null,
    };

    this.prijavaService.partialUpdate(partialUpdatePrijava).subscribe(() => {
      console.log(prijava.statusPrijave);
      this.save();
    });
  }

  save(): void {
    this.isSaving = true;
    const prijava = this.prijavaFormService.getPrijava(this.editForm);
    if (prijava.id !== null) {
      this.subscribeToSaveResponse(this.prijavaService.update(prijava));
    } else {
      this.subscribeToSaveResponse(this.prijavaService.create(prijava));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPrijava>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  createNewMobilnost(prijava: Pick<IPrijava, 'id' | 'natjecaj' | 'trajanjeOd' | 'trajanjeDo' | 'statusPrijave' | 'user'>): void {
    // Set the prihvacen field to true for the Prijava entity
    prijava.statusPrijave = StatusPrijave.PRIHVACEN;
    console.log(prijava.statusPrijave);

    const PartialUpdatePrijava = {
      id: prijava.id,
      statusPrijave: prijava.statusPrijave,
    };

    this.prijavaService.partialUpdate(PartialUpdatePrijava).subscribe(() => {
      console.log(prijava.statusPrijave);
      this.saveMobilnost(prijava);
      this.save();
    });
  }

  saveMobilnost(prijava: Pick<IPrijava, 'id' | 'natjecaj' | 'trajanjeOd' | 'trajanjeDo' | 'statusPrijave' | 'user'>): void {
    const newMobilnost: NewMobilnost = {
      mobilnostName: 'Mobilnost za ' + prijava.natjecaj?.name,
      prijava: prijava,
      id: null,
      natjecaj: prijava.natjecaj,
      user: prijava.user,
      trajanjeOd: prijava.trajanjeOd,
      trajanjeDo: prijava.trajanjeDo,
    };

    const mobilnost = this.mobilnostFormService.getMobilnost(this.editForm);
    mobilnost.mobilnostName = this.mobilnost?.mobilnostName;
    mobilnost.natjecaj = this.mobilnost?.natjecaj;
    mobilnost.prijava = this.mobilnost?.prijava;
    mobilnost.user = this.mobilnost?.user;
    mobilnost.trajanjeOd = this.mobilnost?.trajanjeOd;
    mobilnost.trajanjeOd = this.mobilnost?.trajanjeDo;

    this.mobilnostService.create(newMobilnost).subscribe(() => {
      console.log('Mobilnost created successfully');
    });
  }

  odbijPrijavu(prijava: Pick<IPrijava, 'id' | 'statusPrijave'>): void {
    // set the prihvacen field to true for the Prijava entity
    prijava.statusPrijave = StatusPrijave.ODBIJEN;
    console.log(prijava.statusPrijave);

    const PartialUpdatePrijava = {
      id: prijava.id,
      statusPrijave: prijava.statusPrijave,
    };

    this.prijavaService.partialUpdate(PartialUpdatePrijava).subscribe(() => {
      console.log(prijava.statusPrijave);
      this.save();
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
}
