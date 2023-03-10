import dayjs from 'dayjs/esm';
import { Status } from 'app/entities/enumerations/status.model';
import { IZahtjev } from '../zahtjev/zatjev.model';

export interface INatjecaj {
  id: number;
  name?: string | null;
  description?: string | null;
  createDate?: dayjs.Dayjs | null;
  datumOd?: dayjs.Dayjs | null;
  datumDo?: dayjs.Dayjs | null;
  status?: Status | null;
  zahtjevs?: IZahtjev[];
}

export type NewNatjecaj = Omit<INatjecaj, 'id'> & { id: null };
