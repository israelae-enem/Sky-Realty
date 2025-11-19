'use client';

import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

import FormDialog from '@/components/dialogs/FormDialog';
import LeadForm from '@/components/forms/LeadForm';


export const leadColumns: ColumnDef<any>[] = [
  { header: '#', cell: ({ row }) => <p className="text-14-medium">{row.index + 1}</p> },
  { accessorKey: 'name', header: 'Lead Name', cell: ({ row }) => <p>{row.original.name ?? '—'}</p> },
  { accessorKey: 'email', header: 'Email', cell: ({ row }) => <p>{row.original.email ?? '—'}</p> },
  { accessorKey: 'phone', header: 'Phone', cell: ({ row }) => <p>{row.original.phone ?? '—'}</p> },

  {
    accessorKey: 'created_at',
    header: 'Created On',
    cell: ({ row }) => <p>{row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : '—'}</p>,
  },
  {
    id: 'actions',
    header: () => <div className="pl-4">Actions</div>,
    cell: ({ row }) => {
      const lead = row.original;

      const handleDelete = async () => {
        if (!confirm('Delete this lead?')) return;
        const { error } = await supabase.from('leads').delete().eq('id', lead.id);
        if (error) {
          toast.error('Failed to delete lead');
          return;
        }
        toast.success('Lead deleted');
        window.location.reload();
      };

      return (
        <div className="flex gap-2">
          {/* Create button */}
          <FormDialog trigger={<button className="text-sm px-2 py-1 rounded bg-green-600 text-white">Create</button>} title="Add Lead">
            <LeadForm onSuccess={() => window.location.reload()} />
          </FormDialog>

          {/* Edit button */}
          <FormDialog trigger={<button className="text-sm px-2 py-1 rounded border">Edit</button>} title="Edit Lead">
            <LeadForm  onSuccess={() => window.location.reload()} />
          </FormDialog>

          {/* Delete button */}
          <button onClick={handleDelete} className="text-sm px-2 py-1 rounded bg-red-600 text-white">
            Delete
          </button>
        </div>
      );
    },
  },
];