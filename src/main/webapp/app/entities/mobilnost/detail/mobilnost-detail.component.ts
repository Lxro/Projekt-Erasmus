import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IMobilnost } from '../mobilnost.model';
import { DataUtils } from 'app/core/util/data-util.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { UploadFileService } from './upload/upload-files-service.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IUploadFile } from 'app/entities/prijava/upload_files.model';
import { FileModalComponent } from './file-modal/file-modal.component';
import { IUploadFileAdmin } from '../upload_files_admin.model';
import { AdminFileModalComponent } from './admin-file-modal/admin-file-modal.component';
import { Observable, finalize } from 'rxjs';
import { MobilnostService } from '../service/mobilnost.service';
import { MobilnostFormGroup, MobilnostFormService } from '../update/mobilnost-form.service';
import { StatusMobilnosti } from 'app/entities/enumerations/statusmobilnosti.mode';

@Component({
  selector: 'jhi-mobilnost-detail',
  templateUrl: './mobilnost-detail.component.html',
})
export class MobilnostDetailComponent implements OnInit {
  mobilnost: IMobilnost | null = null;
  uploadFiles?: IUploadFile[];
  isSaving = false;

  editForm: MobilnostFormGroup = this.mobilnostFormService.createMobilnostFormGroup();

  constructor(
    protected dataUtils: DataUtils,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    private http: HttpClient,
    private uploadFileService: UploadFileService,
    private modalService: NgbModal,
    private mobilnostService: MobilnostService,
    private mobilnostFormService: MobilnostFormService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ mobilnost }) => {
      this.mobilnost = mobilnost;
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }
  uploadajFajl(mobilnost: Pick<IMobilnost, 'id'>) {
    const mobilnostId = mobilnost;
    if (mobilnostId) {
      const route = `/mobilnost/${mobilnostId.id}/upload`;
      this.router.navigate([route], { state: { mobilnost: mobilnostId.id } });
    }
  }
  uploadajFajlAdmin(mobilnost: Pick<IMobilnost, 'id'>) {
    const mobilnostId = mobilnost;
    if (mobilnostId) {
      const route = `/mobilnost/${mobilnostId.id}/upload-admin`;
      this.router.navigate([route], { state: { mobilnost: mobilnostId.id } });
    }
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
  urediFileAdmin(adminfile: Pick<IUploadFileAdmin, 'id'>): void {
    const modalRef = this.modalService.open(AdminFileModalComponent, { centered: true });

    modalRef.componentInstance.uploadFileAdmin = adminfile;

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

  deleteFile(fileId: number): void {
    this.uploadFileService.deleteFile(fileId).subscribe(() => {
      this.mobilnost!.uploadFiles = this.mobilnost?.uploadFiles!.filter(uploadFile => uploadFile.id !== fileId);
    });
    window.location.reload();
  }

  onModalHidden(): void {
    window.location.reload();
  }

  previousState(): void {
    window.history.back();
  }

  prihvatiMobilnost(mobilnost: Pick<IMobilnost, 'id' | 'statusMobilnosti'>): void {
    // set the prihvacen field to true for the Prijava entity
    mobilnost.statusMobilnosti = StatusMobilnosti.ZATVORENA;
    console.log(mobilnost.statusMobilnosti);

    const PartialUpdatePrijava = {
      id: mobilnost.id,
      statusMobilnosti: mobilnost.statusMobilnosti,
    };

    this.mobilnostService.partialUpdate(PartialUpdatePrijava).subscribe(() => {
      console.log(mobilnost.statusMobilnosti);
      this.save();
    });
  }

  neispravnaMobilnost(mobilnost: Pick<IMobilnost, 'id' | 'statusMobilnosti'>): void {
    // set the prihvacen field to true for the Prijava entity
    mobilnost.statusMobilnosti = StatusMobilnosti.NEISPRAVNA;
    console.log(mobilnost.statusMobilnosti);

    const PartialUpdatePrijava = {
      id: mobilnost.id,
      statusMobilnosti: mobilnost.statusMobilnosti,
    };

    this.mobilnostService.partialUpdate(PartialUpdatePrijava).subscribe(() => {
      console.log(mobilnost.statusMobilnosti);
      this.save();
    });
  }

  save(): void {
    this.isSaving = true;
    const prijava = this.mobilnostFormService.getMobilnost(this.editForm);
    if (prijava.id !== null) {
      this.subscribeToSaveResponse(this.mobilnostService.update(prijava));
    } else {
      this.subscribeToSaveResponse(this.mobilnostService.create(prijava));
    }
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
  protected subscribeToSaveResponse(result: Observable<HttpResponse<IMobilnost>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }
}
