import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IMobilnost } from '../mobilnost.model';
import { DataUtils } from 'app/core/util/data-util.service';

@Component({
  selector: 'jhi-mobilnost-detail',
  templateUrl: './mobilnost-detail.component.html',
})
export class MobilnostDetailComponent implements OnInit {
  mobilnost: IMobilnost | null = null;

  constructor(protected dataUtils: DataUtils, protected activatedRoute: ActivatedRoute, protected router: Router) {}

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

  previousState(): void {
    window.history.back();
  }
}
