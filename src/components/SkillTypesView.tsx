import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

interface SkillType {
  id: string;
  name: string;
  color: string;
}

export function SkillTypesView() {
  const [skillTypes, setSkillTypes] = useState<SkillType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', color: '#3b82f6' });

  useEffect(() => {
    loadSkillTypes();
  }, []);

  const loadSkillTypes = async () => {
    const { data, error } = await supabase
      .from('skill_types')
      .select('*')
      .order('name');

    if (!error && data) {
      setSkillTypes(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await supabase
        .from('skill_types')
        .update(formData)
        .eq('id', editingId);
    } else {
      await supabase
        .from('skill_types')
        .insert([formData]);
    }

    setFormData({ name: '', color: '#3b82f6' });
    setEditingId(null);
    setShowForm(false);
    loadSkillTypes();
  };

  const handleEdit = (skillType: SkillType) => {
    setFormData({ name: skillType.name, color: skillType.color });
    setEditingId(skillType.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Möchten Sie diesen Skill-Type wirklich löschen?')) {
      await supabase.from('skill_types').delete().eq('id', id);
      loadSkillTypes();
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', color: '#3b82f6' });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-8">Lädt...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Skill-Types</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Neuer Skill-Type</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {editingId ? 'Skill-Type bearbeiten' : 'Neuer Skill-Type'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bezeichnung
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                placeholder="z.B. Gesang"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Farbe
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10 w-20 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  placeholder="#3b82f6"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 transition"
              >
                {editingId ? 'Aktualisieren' : 'Erstellen'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skillTypes.map((skillType) => (
          <div
            key={skillType.id}
            className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: skillType.color }}
                />
                <span className="font-medium text-slate-900">{skillType.name}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(skillType)}
                  className="p-1 text-slate-400 hover:text-slate-600 transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(skillType.id)}
                  className="p-1 text-slate-400 hover:text-red-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {skillTypes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-500">Noch keine Skill-Types vorhanden</p>
        </div>
      )}
    </div>
  );
}
