import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCalendar } from '@angular/material/datepicker';
import { DateAdapter } from '@angular/material/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Custom calendar header for Angular Material Datepicker.
 * Renders the year as plain text (not a button) to prevent the user
 * from navigating from month-view to multi-year-view.
 * Use with: <mat-datepicker [calendarHeaderComponent]="MonthPickerHeaderComponent">
 */
@Component({
  selector: 'month-picker-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  styles: [`
    .mph-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 8px 0;
    }
    .mph-period {
      font-weight: 500;
      font-size: 14px;
      line-height: 1;
      color: rgba(0, 0, 0, .87);
      user-select: none;
    }
  `],
  template: `
    <div class="mph-row">
      <button mat-icon-button (click)="previousYear()" aria-label="Previous year">
        <mat-icon>chevron_left</mat-icon>
      </button>
      <span class="mph-period">{{ periodLabel }}</span>
      <button mat-icon-button (click)="nextYear()" aria-label="Next year">
        <mat-icon>chevron_right</mat-icon>
      </button>
    </div>
  `,
})
export class MonthPickerHeaderComponent<D> implements OnDestroy {
  private readonly destroyed = new Subject<void>();

  constructor(
    private readonly calendar: MatCalendar<D>,
    private readonly dateAdapter: DateAdapter<D>,
    cdr: ChangeDetectorRef,
  ) {
    // Re-render whenever the calendar's active date changes
    calendar.stateChanges.pipe(takeUntil(this.destroyed)).subscribe(() => cdr.markForCheck());
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  get periodLabel(): string {
    return String(this.dateAdapter.getYear(this.calendar.activeDate));
  }

  previousYear(): void {
    this.calendar.activeDate = this.dateAdapter.addCalendarYears(this.calendar.activeDate, -1);
  }

  nextYear(): void {
    this.calendar.activeDate = this.dateAdapter.addCalendarYears(this.calendar.activeDate, 1);
  }
}
