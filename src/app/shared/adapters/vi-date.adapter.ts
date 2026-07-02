import { Injectable } from '@angular/core';
import { NativeDateAdapter, MatDateFormats } from '@angular/material/core';

// Sentinel object dùng để nhận biết format cho input field
const VI_DATE_INPUT_FORMAT = { __vi_month_input__: true } as const;

/** Tên tháng tiếng Việt theo từng style */
const VI_MONTH_NAMES: Record<'long' | 'short' | 'narrow', string[]> = {
  long: [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
  ],
  short: [
    'Th 1', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6',
    'Th 7', 'Th 8', 'Th 9', 'Th 10', 'Th 11', 'Th 12',
  ],
  narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
};

/**
 * Custom date adapter:
 * - Hiển thị ngày dạng MM-yyyy trong ô input
 * - Tên tháng tiếng Việt trong datepicker calendar
 */
@Injectable()
export class ViDateAdapter extends NativeDateAdapter {
  override getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    return VI_MONTH_NAMES[style];
  }

  override format(date: Date, displayFormat: any): string {
    if (displayFormat && (displayFormat as any).__vi_month_input__) {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}-${year}`;
    }
    return super.format(date, displayFormat);
  }
}

/** MAT_DATE_FORMATS tương ứng với ViDateAdapter */
export const VI_MONTH_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: VI_DATE_INPUT_FORMAT,
  },
  display: {
    dateInput: VI_DATE_INPUT_FORMAT,
    monthYearLabel: { year: 'numeric', month: 'short' } as any,
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' } as any,
    monthYearA11yLabel: { year: 'numeric', month: 'long' } as any,
  },
};
