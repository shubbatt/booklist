import { useState, useEffect } from 'react';
import {
  User,
  Phone,
  GraduationCap,
  MapPin,
  BookOpen,
  Save,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  FileText
} from 'lucide-react';
import { useStore } from '../store';
import { CustomizationType, DeliveryStatus } from '../types';

const STEPS = [
  { id: 1, title: 'Voucher Info', icon: FileText },
  { id: 2, title: 'Parent & Student', icon: User },
  { id: 3, title: 'Booklist', icon: BookOpen },
  { id: 4, title: 'Customization', icon: MapPin },
  { id: 5, title: 'Delivery', icon: Check },
  { id: 6, title: 'Review', icon: Save },
];

export function NewRedemption() {
  const {
    booklists,
    schools,
    optionItems,
    currentDraftId,
    addRedemption,
    setActiveView,
    addSchool,
    addLocation,
    createDraft,
    updateDraft,
    getDraft,
    deleteDraft,
    getLatestDraft,
    setCurrentDraftId
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

  // Initialize form data with default values from option items
  const getInitialFormData = () => {
    const initialOptions: Record<string, boolean> = {};
    optionItems.forEach(item => {
      if (item.enabled) {
        initialOptions[item.key] = item.defaultChecked;
      }
    });

    return {
      voucherId: '',
      staffId: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      parentName: '',
      contactNo: '',
      studentName: '',
      school: '',
      studentClass: '',
      booklistId: '',
      singleRuled: 4,
      doubleRuled: 5,
      squareRuled: 2,
      additionalItems: '',
      ...initialOptions,
      customization: 'standard' as CustomizationType,
      comments: '',
      deliveryDate: '',
      collectionDate: '',
      deliveryStatus: 'pending' as DeliveryStatus,
    };
  };

  // Load draft or create new one
  const loadDraft = () => {
    // If there's a specific draft ID to load, use it
    if (currentDraftId) {
      const draft = getDraft(currentDraftId);
      if (draft) {
        return {
          formData: { ...getInitialFormData(), ...draft.formData },
          currentStep: draft.currentStep,
          draftId: draft.id,
        };
      }
    }

    // Otherwise, get the latest draft
    const latestDraft = getLatestDraft();
    if (latestDraft && !currentDraftId) {
      return {
        formData: { ...getInitialFormData(), ...latestDraft.formData },
        currentStep: latestDraft.currentStep,
        draftId: latestDraft.id,
      };
    }

    // No draft found, start fresh
    return {
      formData: getInitialFormData(),
      currentStep: 1,
      draftId: null,
    };
  };

  const initialData = loadDraft();
  const [currentStep, setCurrentStep] = useState(initialData.currentStep);
  const [formData, setFormData] = useState(initialData.formData);
  const [draftId, setDraftId] = useState<string | null>(initialData.draftId);

  const [newSchool, setNewSchool] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [showNewSchool, setShowNewSchool] = useState(false);
  const [showNewLocation, setShowNewLocation] = useState(false);

  // Create draft on mount if not exists
  useEffect(() => {
    if (!draftId) {
      const newDraftId = createDraft(formData, currentStep);
      setDraftId(newDraftId);
      setCurrentDraftId(newDraftId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save draft when form data or step changes
  useEffect(() => {
    if (draftId) {
      const timeoutId = setTimeout(() => {
        updateDraft(draftId, formData, currentStep);
      }, 500); // Debounce auto-save

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, currentStep, draftId]);

  // Initialize form with default values when data is available
  useEffect(() => {
    if (staff.length > 0 && !formData.staffId) {
      setFormData(prev => ({ ...prev, staffId: staff[0].id }));
    }
    if (locations.length > 0 && !formData.location) {
      setFormData(prev => ({ ...prev, location: locations[0].name }));
    }
    if (schools.length > 0 && !formData.school) {
      setFormData(prev => ({ ...prev, school: schools[0].name }));
    }
    if (booklists.length > 0 && !formData.booklistId) {
      setFormData(prev => ({ ...prev, booklistId: booklists[0].id }));
    }
  }, [staff, locations, schools, booklists]);

  const selectedBooklist = booklists.find(b => b.id === formData.booklistId);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.voucherId && formData.staffId && formData.date && formData.location);
      case 2:
        return !!(formData.parentName && formData.contactNo && formData.studentName && formData.school);
      case 3:
        return !!formData.booklistId;
      case 4:
      case 5:
        return true; // Optional steps
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      addRedemption(formData as any);
      // Delete draft after successful submission
      if (draftId) {
        deleteDraft(draftId);
        setCurrentDraftId(null);
      }
      setActiveView('redemptions');
    }
  };

  const handleCancel = () => {
    // Keep draft when canceling so user can resume later
    setActiveView('dashboard');
  };

  const handleAddSchool = () => {
    if (newSchool.trim()) {
      addSchool(newSchool.trim());
      setFormData({ ...formData, school: newSchool.trim() });
      setNewSchool('');
      setShowNewSchool(false);
    }
  };

  const handleAddLocation = () => {
    if (newLocation.trim()) {
      addLocation(newLocation.trim());
      setFormData({ ...formData, location: newLocation.trim() });
      setNewLocation('');
      setShowNewLocation(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h3><FileText size={20} /> Voucher & Location Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Voucher ID *</label>
                <input
                  type="text"
                  value={formData.voucherId}
                  onChange={(e) => setFormData({ ...formData, voucherId: e.target.value })}
                  placeholder="e.g., 3519"
                  required
                />
              </div>
              <div className="form-group">
                <label>Staff *</label>
                <select
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                  required
                >
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Location *</label>
                {showNewLocation ? (
                  <div className="input-with-action">
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Enter new location"
                    />
                    <button type="button" onClick={handleAddLocation} className="btn btn-small">Add</button>
                    <button type="button" onClick={() => setShowNewLocation(false)} className="btn btn-small btn-secondary">Cancel</button>
                  </div>
                ) : (
                  <div className="input-with-action">
                    <select
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    >
                      {locations.map(l => (
                        <option key={l.id} value={l.name}>{l.name}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => setShowNewLocation(true)} className="btn btn-small">+</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h3><User size={20} /> Parent & Student Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Parent Name *</label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  placeholder="Enter parent's full name"
                  required
                />
              </div>
              <div className="form-group">
                <label><Phone size={16} /> Contact Number *</label>
                <input
                  type="tel"
                  value={formData.contactNo}
                  onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                  placeholder="e.g., 9752344"
                  required
                />
              </div>
              <div className="form-group">
                <label><GraduationCap size={16} /> Student Name *</label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="Enter student's full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>School *</label>
                {showNewSchool ? (
                  <div className="input-with-action">
                    <input
                      type="text"
                      value={newSchool}
                      onChange={(e) => setNewSchool(e.target.value)}
                      placeholder="Enter new school name"
                    />
                    <button type="button" onClick={handleAddSchool} className="btn btn-small">Add</button>
                    <button type="button" onClick={() => setShowNewSchool(false)} className="btn btn-small btn-secondary">Cancel</button>
                  </div>
                ) : (
                  <div className="input-with-action">
                    <select
                      value={formData.school}
                      onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                      required
                    >
                      {schools.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => setShowNewSchool(true)} className="btn btn-small">+</button>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Class/Grade</label>
                <input
                  type="text"
                  value={formData.studentClass}
                  onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })}
                  placeholder="e.g., Grade 1A"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h3><BookOpen size={20} /> Booklist Selection</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Select Booklist *</label>
                <select
                  value={formData.booklistId}
                  onChange={(e) => setFormData({ ...formData, booklistId: e.target.value })}
                  className="booklist-select"
                  required
                >
                  {booklists.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.code} - {b.name} (MVR {b.totalAmount})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedBooklist && (
              <div className="booklist-preview">
                <h4>Items in {selectedBooklist.grade}</h4>
                <div className="booklist-items">
                  {selectedBooklist.items.slice(0, 6).map(item => (
                    <div key={item.id} className="booklist-item-preview">
                      <span>{item.name}</span>
                      <span>x{item.quantity}</span>
                    </div>
                  ))}
                  {selectedBooklist.items.length > 6 && (
                    <div className="booklist-item-preview more">
                      +{selectedBooklist.items.length - 6} more items
                    </div>
                  )}
                </div>
                <div className="booklist-total-preview">
                  Total: <strong>MVR {selectedBooklist.totalAmount}</strong>
                </div>
              </div>
            )}

            <div className="exercise-books">
              <h4>Exercise Book Customization</h4>
              <p className="hint">Adjust quantities if different from standard</p>
              <div className="form-grid three-col">
                <div className="form-group">
                  <label>Single-ruled</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.singleRuled}
                    onChange={(e) => setFormData({ ...formData, singleRuled: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label>Double-ruled</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.doubleRuled}
                    onChange={(e) => setFormData({ ...formData, doubleRuled: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label>Square-ruled</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.squareRuled}
                    onChange={(e) => setFormData({ ...formData, squareRuled: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h3>Options & Customization</h3>
            <div className="checkbox-grid">
              {optionItems
                .filter(item => item.enabled)
                .map((item) => (
                  <label key={item.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(formData as any)[item.key] || false}
                      onChange={(e) => setFormData({
                        ...formData,
                        [item.key]: e.target.checked
                      } as any)}
                    />
                    <span>{item.name}</span>
                  </label>
                ))}
            </div>

            <div className="form-group">
              <label>Customization Type</label>
              <select
                value={formData.customization}
                onChange={(e) => setFormData({ ...formData, customization: e.target.value as CustomizationType })}
              >
                <option value="standard">Standard (Only Voucher)</option>
                <option value="customized_design">Customized Design</option>
                <option value="cellophane_only">Cellophane Only + Text Book</option>
                <option value="text_book">Text Book</option>
                <option value="customized_design_text_book">Customized Design + Text Book</option>
              </select>
            </div>

            <div className="form-group">
              <label>Additional Items / Comments</label>
              <textarea
                value={formData.additionalItems}
                onChange={(e) => setFormData({ ...formData, additionalItems: e.target.value })}
                placeholder="e.g., 8 single 120 to 300 — 4 single 200 to 300"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Comments</label>
              <textarea
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                placeholder="Any special instructions or notes..."
                rows={3}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <h3>Delivery Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Expected Delivery Date</label>
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Delivery Status</label>
                <select
                  value={formData.deliveryStatus}
                  onChange={(e) => setFormData({ ...formData, deliveryStatus: e.target.value as DeliveryStatus })}
                >
                  <option value="pending">Pending</option>
                  <option value="wrapping">Wrapping</option>
                  <option value="delivered">Delivered</option>
                  <option value="collected">Collected</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="step-content">
            <h3>Review & Submit</h3>
            <div className="review-section">
              <div className="review-item">
                <strong>Voucher ID:</strong>
                <span>{formData.voucherId}</span>
              </div>
              <div className="review-item">
                <strong>Location:</strong>
                <span>{formData.location}</span>
              </div>
              <div className="review-item">
                <strong>Parent Name:</strong>
                <span>{formData.parentName}</span>
              </div>
              <div className="review-item">
                <strong>Contact:</strong>
                <span>{formData.contactNo}</span>
              </div>
              <div className="review-item">
                <strong>Student Name:</strong>
                <span>{formData.studentName}</span>
              </div>
              <div className="review-item">
                <strong>School:</strong>
                <span>{formData.school}</span>
              </div>
              <div className="review-item">
                <strong>Class:</strong>
                <span>{formData.studentClass || 'N/A'}</span>
              </div>
              <div className="review-item">
                <strong>Booklist:</strong>
                <span>{selectedBooklist?.code} - {selectedBooklist?.grade}</span>
              </div>
              <div className="review-item">
                <strong>Total Amount:</strong>
                <span className="amount">MVR {selectedBooklist?.totalAmount || 0}</span>
              </div>
              <div className="review-item">
                <strong>Delivery Status:</strong>
                <span className={`status-badge ${formData.deliveryStatus}`}>
                  {formData.deliveryStatus}
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="new-redemption">
      <header className="page-header">
        <div>
          <h1>New Voucher Redemption</h1>
          <p className="subtitle">Step {currentStep} of {STEPS.length}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {draftId && (
            <span className="draft-indicator" style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              fontStyle: 'italic'
            }}>
              Draft saved
            </span>
          )}
          <button
            className="btn btn-secondary"
            onClick={handleCancel}
          >
            <X size={18} /> Cancel
          </button>
        </div>
      </header>

      {/* Step Progress Indicator */}
      <div className="step-progress">
        {STEPS.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className={`step-indicator ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
              <div className="step-icon">
                {isCompleted ? (
                  <Check size={20} />
                ) : (
                  <StepIcon size={20} />
                )}
              </div>
              <span className="step-title">{step.title}</span>
              {index < STEPS.length - 1 && <div className="step-connector" />}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="redemption-form step-form">
        <div className="form-section step-section">
          {renderStepContent()}
        </div>

        <div className="form-actions step-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft size={18} /> Previous
          </button>

          <div className="step-indicators-text">
            Step {currentStep} of {STEPS.length}
            {draftId && <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>• Auto-saved</span>}
          </div>

          {currentStep < STEPS.length ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
            >
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!validateStep(currentStep)}
            >
              <Save size={18} /> Submit Voucher
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
