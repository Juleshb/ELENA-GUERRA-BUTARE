import {
  getProvinces,
  getDistricts,
  getSectors,
  getCells,
  getVillages,
} from 'rwanda-locations';

export const COUNTRIES = [
  { value: 'RWANDA', label: 'Rwanda' },
  { value: 'OTHER', label: 'Other country' },
];

export function listRwandaProvinces() {
  return getProvinces();
}

export function listRwandaDistricts(province) {
  if (!province) return [];
  try {
    return getDistricts(province);
  } catch {
    return [];
  }
}

export function listRwandaSectors(province, district) {
  if (!province || !district) return [];
  try {
    return getSectors(province, district);
  } catch {
    return [];
  }
}

export function listRwandaCells(province, district, sector) {
  if (!province || !district || !sector) return [];
  try {
    return getCells(province, district, sector);
  } catch {
    return [];
  }
}

export function listRwandaVillages(province, district, sector, cell) {
  if (!province || !district || !sector || !cell) return [];
  try {
    return getVillages(province, district, sector, cell);
  } catch {
    return [];
  }
}

export const ADDRESS_KEYS = ['province', 'district', 'sector', 'cell', 'village'];

export function emptyAddress() {
  return {
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
  };
}
