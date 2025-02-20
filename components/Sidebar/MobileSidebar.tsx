// MobileSidebar.tsx
'use client';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button>
          <Menu />
        </button>
      </SheetTrigger>
      <SheetContent side="left">{/* Nội dung menu */}</SheetContent>
    </Sheet>
  );
}
