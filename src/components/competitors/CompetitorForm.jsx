/**
 * Competitor Form Component
 * 
 * Form for adding and editing competitor profiles.
 */

import { useState } from 'react';
import { Button, Input, TextArea, Toggle } from '../ui';

export default function CompetitorForm({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    website: initialData?.website || '',
    description: initialData?.description || '',
    notes: initialData?.notes || '',
    is_active: initialData?.is_active ?? true,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Update field
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Validate
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Competitor name is required';
    }

    if (formData.website && !formData.website.startsWith('http')) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Competitor Name"
        placeholder="e.g., Acme Corp"
        value={formData.name}
        onChange={(e) => updateField('name', e.target.value)}
        error={errors.name}
        required
      />

      <Input
        label="Website"
        placeholder="https://example.com"
        value={formData.website}
        onChange={(e) => updateField('website', e.target.value)}
        error={errors.website}
        helper="Optional: Their main website"
      />

      <TextArea
        label="Description"
        placeholder="Brief description of this competitor..."
        value={formData.description}
        onChange={(e) => updateField('description', e.target.value)}
        rows={2}
      />

      <TextArea
        label="Notes"
        placeholder="Any internal notes about this competitor..."
        value={formData.notes}
        onChange={(e) => updateField('notes', e.target.value)}
        rows={2}
      />

      <div className="flex items-center justify-between py-2">
        <div>
          <p className="text-sm font-medium text-gray-700">Active</p>
          <p className="text-xs text-gray-500">Track this competitor</p>
        </div>
        <Toggle
          checked={formData.is_active}
          onChange={(checked) => updateField('is_active', checked)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {isEdit ? 'Save Changes' : 'Add Competitor'}
        </Button>
      </div>
    </form>
  );
}
