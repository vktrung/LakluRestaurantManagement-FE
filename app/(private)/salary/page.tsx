'use client';
import SalaryList from './components/SalaryList';
import AddSalaryModal from './components/AddSalaryModal';
import { useState } from 'react';

export default function SalaryPage() {
  return (
    <div className="p-4">
      <SalaryList />
    </div>
  );
}
