import { useMemo } from 'react';
import { Field, inputClass } from '../admin/FormModal';
import {
  ADDRESS_KEYS,
  COUNTRIES,
  listRwandaCells,
  listRwandaDistricts,
  listRwandaProvinces,
  listRwandaSectors,
  listRwandaVillages,
} from '../../lib/rwandaLocations';

function AddressSelect({ label, value, options, onChange, disabled, placeholder }) {
  return (
    <Field label={label}>
      <select
        className={inputClass}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  );
}

export default function RwandaAddressFields({ form, update }) {
  const isRwanda = form.country === 'RWANDA';

  const provinces = useMemo(() => (isRwanda ? listRwandaProvinces() : []), [isRwanda]);
  const districts = useMemo(
    () => (isRwanda ? listRwandaDistricts(form.province) : []),
    [isRwanda, form.province]
  );
  const sectors = useMemo(
    () => (isRwanda ? listRwandaSectors(form.province, form.district) : []),
    [isRwanda, form.province, form.district]
  );
  const cells = useMemo(
    () => (isRwanda ? listRwandaCells(form.province, form.district, form.sector) : []),
    [isRwanda, form.province, form.district, form.sector]
  );
  const villages = useMemo(
    () => (isRwanda ? listRwandaVillages(form.province, form.district, form.sector, form.cell) : []),
    [isRwanda, form.province, form.district, form.sector, form.cell]
  );

  const setCountry = (country) => {
    update('country', country);
    ADDRESS_KEYS.forEach((key) => update(key, ''));
  };

  const setAddressLevel = (key, value) => {
    update(key, value);
    const index = ADDRESS_KEYS.indexOf(key);
    ADDRESS_KEYS.slice(index + 1).forEach((child) => update(child, ''));
  };

  return (
    <div className="space-y-4">
      <Field label="Country *">
        <select
          className={inputClass}
          value={form.country || 'RWANDA'}
          onChange={(e) => setCountry(e.target.value)}
          required
        >
          {COUNTRIES.map((country) => (
            <option key={country.value} value={country.value}>
              {country.label}
            </option>
          ))}
        </select>
      </Field>

      <p className="text-sm font-semibold text-rw-navy">Residential Address</p>

      {isRwanda ? (
        <div className="grid sm:grid-cols-2 gap-4">
          <AddressSelect
            label="Province *"
            value={form.province}
            options={provinces}
            placeholder="Select province"
            onChange={(e) => setAddressLevel('province', e.target.value)}
          />
          <AddressSelect
            label="District *"
            value={form.district}
            options={districts}
            placeholder={form.province ? 'Select district' : 'Choose province first'}
            onChange={(e) => setAddressLevel('district', e.target.value)}
            disabled={!form.province}
          />
          <AddressSelect
            label="Sector *"
            value={form.sector}
            options={sectors}
            placeholder={form.district ? 'Select sector' : 'Choose district first'}
            onChange={(e) => setAddressLevel('sector', e.target.value)}
            disabled={!form.district}
          />
          <AddressSelect
            label="Cell *"
            value={form.cell}
            options={cells}
            placeholder={form.sector ? 'Select cell' : 'Choose sector first'}
            onChange={(e) => setAddressLevel('cell', e.target.value)}
            disabled={!form.sector}
          />
          <AddressSelect
            label="Village *"
            value={form.village}
            options={villages}
            placeholder={form.cell ? 'Select village' : 'Choose cell first'}
            onChange={(e) => setAddressLevel('village', e.target.value)}
            disabled={!form.cell}
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            ['province', 'Province / Region *'],
            ['district', 'District / State *'],
            ['sector', 'Sector / Area *'],
            ['cell', 'Cell / Ward *'],
            ['village', 'Village / Street *'],
          ].map(([key, label]) => (
            <Field key={key} label={label}>
              <input
                className={inputClass}
                value={form[key]}
                onChange={(e) => update(key, e.target.value)}
                required
              />
            </Field>
          ))}
        </div>
      )}

      {isRwanda && form.province && form.district && (
        <p className="text-xs text-slate-500">
          Selected: {form.province} → {form.district}
          {form.sector ? ` → ${form.sector}` : ''}
          {form.cell ? ` → ${form.cell}` : ''}
          {form.village ? ` → ${form.village}` : ''}
        </p>
      )}
    </div>
  );
}
