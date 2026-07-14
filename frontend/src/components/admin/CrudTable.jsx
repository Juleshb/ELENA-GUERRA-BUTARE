import { Pencil, Trash2 } from 'lucide-react';
import { AdminBadge, AdminEmpty } from './AdminUI';

export default function CrudTable({ columns, rows, onEdit, onDelete }) {
  if (!rows?.length) {
    return <AdminEmpty message="No items yet. Create one to get started." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {columns.map((col) => (
              <th key={col.key} className="px-5 py-3.5 font-medium">
                {col.label}
              </th>
            ))}
            <th className="px-5 py-3.5 w-28 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50/80 transition">
              {columns.map((col) => (
                <td key={col.key} className="px-5 py-3.5 text-slate-700">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
              <td className="px-5 py-3.5">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onEdit(row)}
                    className="p-2 rounded-lg text-rw-blue-600 hover:bg-rw-blue-50 transition"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => onDelete(row.id)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { AdminBadge };
