import { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Calculator,
  Package
} from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { StockDiscrepancy } from '../types';

const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9 BUS01', '9 SCI01', '9 Voc 101', '10 BUS01', '10 SCI01', '10 Voc 01'];

export function DayEndReport() {
  const {
    redemptions,
    voucherStock,
    dayEndReports,
    createDayEndReport,
    updateDayEndReport,
    completeStockCount,
    getCurrentStock,
    getDayEndReport,
    setActiveView
  } = useStore();

  // Fetch staff from API (now comes from users table)
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch('/api/staff');
        if (response.ok) {
          const data = await response.json();
          setStaff(data);
        }
      } catch (error) {
        console.error('Failed to fetch staff:', error);
      }
    };
    fetchStaff();
  }, []);

  // Fetch locations from API (now comes from outlets table)
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations');
        if (response.ok) {
          const data = await response.json();
          setLocations(data);
        }
      } catch (error) {
        console.error('Failed to fetch locations:', error);
      }
    };
    fetchLocations();
  }, []);

  const [selectedLocation, setSelectedLocation] = useState(locations[0]?.name || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [stockCountMode, setStockCountMode] = useState(false);
  const [actualStock, setActualStock] = useState<Record<string, number>>({});
  const [, setDiscrepancies] = useState<StockDiscrepancy[]>([]);
  const [countedBy, setCountedBy] = useState('');

  // Force re-render when reports change
  const [refreshKey, setRefreshKey] = useState(0);

  // Use useMemo to recalculate when dependencies change
  const existingReport = useMemo(() => {
    return getDayEndReport(selectedDate, selectedLocation);
  }, [selectedDate, selectedLocation, dayEndReports, refreshKey]);

  const dayRedemptions = useMemo(() => {
    return redemptions.filter(
      r => r.date === selectedDate && r.location === selectedLocation
    );
  }, [redemptions, selectedDate, selectedLocation]);

  const totalValue = useMemo(() => {
    return dayRedemptions.reduce((sum) => {
      // Calculate value based on booklist - simplified for now
      return sum + 500; // Placeholder
    }, 0);
  }, [dayRedemptions]);

  useEffect(() => {
    if (stockCountMode && existingReport) {
      const initialStock: Record<string, number> = {};
      GRADES.forEach(grade => {
        // Use opening stock from the day-end report as expected
        const stockEntry = existingReport.openingStock.find(s => s.grade === grade);
        const expected = stockEntry?.openingStock || 0;
        initialStock[grade] = expected;
      });
      setActualStock(initialStock);
    }
  }, [stockCountMode, selectedLocation, selectedDate, existingReport]);

  // Set initial countedBy when staff loads
  useEffect(() => {
    if (staff.length > 0 && !countedBy) {
      setCountedBy(staff[0].id);
    }
  }, [staff, countedBy]);

  const handleCreateDayEnd = () => {
    console.log('Create Day End clicked', { selectedDate, selectedLocation, existingReport });

    if (existingReport) {
      alert('Day end report already exists for this date and location.');
      return;
    }

    if (!selectedLocation) {
      alert('Please select a location.');
      return;
    }

    if (!staff || staff.length === 0) {
      alert('No staff available. Please add staff in Settings.');
      return;
    }

    try {
      console.log('Creating day end report...');
      // Get opening stock from stock management (previous day's closing stock)
      const openingStock = GRADES.map(grade => {
        // Get the most recent stock entry before the selected date
        const previousStock = voucherStock
          .filter(s => s.grade === grade && s.location === selectedLocation && s.date < selectedDate)
          .sort((a, b) => b.date.localeCompare(a.date))[0];

        // Get today's stock entry if it exists (to include received stock)
        const todayStock = voucherStock.find(
          s => s.grade === grade && s.location === selectedLocation && s.date === selectedDate
        );

        // Opening stock = previous day's closing stock
        const baseOpening = previousStock?.closingStock || 0;
        // If there's a stock entry for today, use its opening stock (which includes received)
        const actualOpening = todayStock?.openingStock || baseOpening;

        return {
          id: '',
          voucherId: `VCH - ${grade} `,
          grade,
          openingStock: actualOpening,
          received: todayStock?.received || 0,
          redeemed: todayStock?.redeemed || 0,
          closingStock: todayStock?.closingStock || actualOpening, // Will be updated during stock count
          date: selectedDate,
          location: selectedLocation,
        };
      });

      // Closing stock will be set during physical stock count
      const closingStock = openingStock.map(s => ({
        ...s,
        closingStock: s.openingStock, // Same as opening until stock count is done
      }));

      const reportData = {
        date: selectedDate,
        location: selectedLocation,
        staffId: staff[0]?.id || '',
        openingStock,
        closingStock,
        totalRedemptions: dayRedemptions.length,
        totalValue,
        stockCounted: false,
      };

      console.log('Report data:', reportData);
      createDayEndReport(reportData);

      // Force component to refresh to show the new report
      setTimeout(() => {
        setRefreshKey(prev => prev + 1);
        console.log('Day end report created successfully');
      }, 100);
    } catch (error) {
      console.error('Error creating day end report:', error);
      alert('Error creating day end report. Please check the console for details.');
    }
  };

  const handleStockCount = () => {
    const newDiscrepancies: StockDiscrepancy[] = [];

    if (!existingReport) return;

    // Get expected stock from opening stock in the report
    GRADES.forEach(grade => {
      const stockEntry = existingReport.openingStock.find(s => s.grade === grade);
      const expected = stockEntry?.openingStock || 0;
      const actual = actualStock[grade] || 0;
      const difference = actual - expected;

      // Update closing stock in the report
      const updatedClosingStock = existingReport.closingStock.map(s =>
        s.grade === grade ? { ...s, closingStock: actual } : s
      );

      updateDayEndReport(existingReport.id, {
        closingStock: updatedClosingStock,
      });

      if (difference !== 0) {
        newDiscrepancies.push({
          voucherId: `VCH - ${grade} `,
          grade,
          expectedStock: expected,
          actualStock: actual,
          difference,
        });
      }
    });

    setDiscrepancies(newDiscrepancies);

    if (existingReport) {
      completeStockCount(existingReport.id, newDiscrepancies, countedBy);
      updateDayEndReport(existingReport.id, {
        completedAt: new Date().toISOString(),
      });
    }

    setStockCountMode(false);
  };

  if (stockCountMode) {
    return (
      <div className="day-end-report">
        <header className="page-header">
          <div>
            <h1>Stock Count</h1>
            <p className="subtitle">Count actual stock for {format(new Date(selectedDate), 'MMM d, yyyy')}</p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => setStockCountMode(false)}
          >
            Cancel Count
          </button>
        </header>

        <div className="stock-count-form card">
          <div className="card-header">
            <h3><Package size={20} /> Enter Actual Stock Count</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label>Counted By</label>
              <select
                value={countedBy}
                onChange={(e) => setCountedBy(e.target.value)}
              >
                {staff.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="stock-count-grid">
              {GRADES.map(grade => {
                const expected = getCurrentStock(grade, selectedLocation);
                return (
                  <div key={grade} className="stock-count-item">
                    <label>
                      <strong>{grade}</strong>
                      <span className="expected-stock">Opening Stock: {expected}</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={actualStock[grade] || ''}
                      onChange={(e) => setActualStock({
                        ...actualStock,
                        [grade]: parseInt(e.target.value) || 0
                      })}
                      placeholder="Enter actual count"
                    />
                    {actualStock[grade] !== undefined && actualStock[grade] !== expected && (
                      <span className={`difference ${(actualStock[grade] - expected) > 0 ? 'positive' : 'negative'} `}>
                        {(actualStock[grade] - expected) > 0 ? '+' : ''}{actualStock[grade] - expected}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="form-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setStockCountMode(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleStockCount}
              >
                <CheckCircle size={18} /> Complete Stock Count
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="day-end-report">
      <header className="page-header">
        <div>
          <h1>Day End Report</h1>
          <p className="subtitle">Generate and manage daily reports with stock reconciliation</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => setActiveView('dashboard')}
        >
          Back to Dashboard
        </button>
      </header>

      <div className="report-filters card">
        <div className="card-body">
          <div className="form-grid">
            <div className="form-group">
              <label><MapPin size={16} /> Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                {locations.map(l => (
                  <option key={l.id} value={l.name}>{l.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label><Calendar size={16} /> Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {!existingReport ? (
        <div className="create-report card">
          <div className="card-body">
            <div className="day-summary">
              <h3>Daily Summary</h3>
              <div className="summary-stats">
                <div className="summary-stat">
                  <span className="stat-label">Total Redemptions</span>
                  <span className="stat-value">{dayRedemptions.length}</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Total Value</span>
                  <span className="stat-value">MVR {totalValue.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button
                className="btn btn-primary"
                onClick={handleCreateDayEnd}
              >
                <FileText size={18} /> Create Day End Report
              </button>
              {dayRedemptions.length === 0 && (
                <p className="hint" style={{ marginTop: '12px', textAlign: 'center' }}>
                  No redemptions for this date. You can still create a day end report for stock reconciliation.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="report-details">
          <div className="report-header card">
            <div className="card-body">
              <div className="report-info">
                <div>
                  <h3>Day End Report - {format(new Date(selectedDate), 'MMM d, yyyy')}</h3>
                  <p className="report-meta">
                    Location: {selectedLocation} •
                    Redemptions: {existingReport.totalRedemptions} •
                    Value: MVR {existingReport.totalValue.toLocaleString()}
                  </p>
                </div>
                <div className="report-status">
                  {existingReport.stockCounted ? (
                    <span className="status-badge delivered">
                      <CheckCircle size={16} /> Stock Counted
                    </span>
                  ) : (
                    <span className="status-badge pending">
                      <AlertCircle size={16} /> Pending Count
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="stock-reconciliation card">
            <div className="card-header">
              <h3>Stock Reconciliation</h3>
              {!existingReport.stockCounted && (
                <button
                  className="btn btn-primary btn-small"
                  onClick={() => setStockCountMode(true)}
                >
                  <Calculator size={16} /> Start Stock Count
                </button>
              )}
            </div>
            <div className="card-body">
              <div className="info-note">
                <AlertCircle size={16} />
                <span><strong>Note:</strong> Stock balancing is separate from voucher redemptions. Stock count is done independently.</span>
              </div>
              <div className="stock-table">
                <div className="table-header">
                  <span>Grade</span>
                  <span>Opening Stock</span>
                  <span>Expected Closing</span>
                  <span>Actual Count</span>
                  <span>Difference</span>
                </div>
                {GRADES.map(grade => {
                  const openingStock = existingReport.openingStock.find(s => s.grade === grade);
                  const closingStock = existingReport.closingStock.find(s => s.grade === grade);
                  const discrepancy = existingReport.discrepancies?.find(d => d.grade === grade);
                  const expected = openingStock?.openingStock || 0;
                  const actual = discrepancy?.actualStock || (existingReport.stockCounted ? closingStock?.closingStock : expected);
                  const diff = (actual || 0) - expected;

                  return (
                    <div key={grade} className="table-row">
                      <span><strong>{grade}</strong></span>
                      <span>{openingStock?.openingStock || 0}</span>
                      <span>{expected}</span>
                      <span className={existingReport.stockCounted ? 'actual-count' : ''}>
                        {existingReport.stockCounted ? actual : '-'}
                      </span>
                      <span className={diff !== 0 ? (diff > 0 ? 'text-success' : 'text-danger') : ''}>
                        {existingReport.stockCounted ? (diff > 0 ? `+ ${diff} ` : diff) : '-'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {existingReport.stockCounted && existingReport.discrepancies && existingReport.discrepancies.length > 0 && (
                <div className="discrepancies-alert">
                  <AlertCircle size={20} />
                  <div>
                    <strong>Discrepancies Found:</strong>
                    <ul>
                      {existingReport.discrepancies.map((d, i) => (
                        <li key={i}>
                          {d.grade}: Expected {d.expectedStock}, Actual {d.actualStock}
                          ({d.difference > 0 ? '+' : ''}{d.difference})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {existingReport.stockCounted && existingReport.discrepancies && existingReport.discrepancies.length === 0 && (
                <div className="no-discrepancies">
                  <CheckCircle size={20} />
                  <span>Stock count matches expected values. No discrepancies.</span>
                </div>
              )}
            </div>
          </div>

          <div className="redemptions-list card">
            <div className="card-header">
              <h3>Redemptions for the Day</h3>
            </div>
            <div className="card-body">
              {dayRedemptions.length === 0 ? (
                <div className="empty-state">
                  <FileText size={48} />
                  <p>No redemptions for this date</p>
                </div>
              ) : (
                <div className="redemptions-table">
                  <div className="table-header">
                    <span>Voucher ID</span>
                    <span>Student</span>
                    <span>School</span>
                    <span>Grade</span>
                    <span>Status</span>
                  </div>
                  {dayRedemptions.map(r => (
                    <div key={r.id} className="table-row">
                      <span>#{r.voucherId}</span>
                      <span>{r.studentName}</span>
                      <span>{r.school}</span>
                      <span>{r.studentClass}</span>
                      <span className={`status - badge ${r.deliveryStatus} `}>
                        {r.deliveryStatus}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

