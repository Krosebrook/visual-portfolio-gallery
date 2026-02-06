import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface InquiryListProps {
  inquiries: Inquiry[];
  onDelete: (id: string) => void;
}

export function InquiryList({ inquiries, onDelete }: InquiryListProps) {
  return (
    <div className="p-8">
      <div className="rounded-2xl border overflow-hidden max-w-6xl mx-auto">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Sender</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((inquiry) => (
              <TableRow key={inquiry.id}>
                <TableCell className="whitespace-nowrap text-zinc-400 text-xs font-mono">
                  {inquiry.createdAt ? format(new Date(inquiry.createdAt), 'yyyy.MM.dd') : '-'}
                </TableCell>
                <TableCell>
                  <div className="font-bold text-zinc-900">{inquiry.name}</div>
                  <div className="text-xs text-zinc-400">{inquiry.email}</div>
                </TableCell>
                <TableCell className="font-medium text-zinc-700">{inquiry.subject}</TableCell>
                <TableCell className="max-w-md truncate text-zinc-500 text-sm">{inquiry.message}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDelete(inquiry.id)}
                    className="hover:bg-destructive/5 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
