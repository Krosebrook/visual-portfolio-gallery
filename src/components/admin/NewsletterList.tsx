import React from 'react';
import { Mail, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface NewsletterSub {
  id: string;
  email: string;
  created_at: string;
}

interface NewsletterListProps {
  subscriptions: NewsletterSub[];
  onDelete: (id: string) => void;
}

export function NewsletterList({ subscriptions, onDelete }: NewsletterListProps) {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-serif font-bold tracking-tight">Newsletter Subscriptions</h3>
          <p className="text-sm text-muted-foreground mt-1">Manage your mailing list audience.</p>
        </div>
        <div className="px-4 py-2 bg-zinc-50 border rounded-full text-xs font-bold uppercase tracking-widest">
          {subscriptions.length} Subscribers
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden bg-white">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b text-[11px] uppercase tracking-widest font-bold text-zinc-500">
            <tr>
              <th className="px-6 py-4">Email Address</th>
              <th className="px-6 py-4">Subscribed On</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                  <Mail className="h-8 w-8 mx-auto mb-4 opacity-20" />
                  No subscribers yet.
                </td>
              </tr>
            ) : (
              subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Mail className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{sub.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(sub.created_at), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(sub.id)}
                      className="text-zinc-400 hover:text-destructive hover:bg-destructive/10 rounded-full"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
