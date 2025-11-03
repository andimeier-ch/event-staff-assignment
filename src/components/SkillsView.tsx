import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  skill_type_id: string;
  skill_types: {
    name: string;
    color: string;
  };
}

interface SkillType {
  id: string;
  name: string;
  color: string;
}

export function SkillsView() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillTypes, setSkillTypes] = useState<SkillType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', skill_type_id: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [skillsResult, skillTypesResult] = await Promise.all([
      supabase
        .from('skills')
        .select('*, skill_types(name, color)')
        .order('name'),
      supabase
        .from('skill_types')
        .select('*')
        .order('name')
    ]);

    if (!skillsResult.error && skillsResult.data) {
      setSkills(skillsResult.data as Skill[]);
    }

    if (!skillTypesResult.error && skillTypesResult.data) {
      setSkillTypes(skillTypesResult.data);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await supabase
        .from('skills')
        .update(formData)
        .eq('id', editingId);
    } else {
      await supabase
        .from('skills')
        .insert([formData]);
    }

    setFormData({ name: '', skill_type_id: '' });
    setEditingId(null);
    setShowForm(false);
    loadData();
  };

  const handleEdit = (skill: Skill) => {
    setFormData({ name: skill.name, skill_type_id: skill.skill_type_id });
    setEditingId(skill.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Möchten Sie diesen Skill wirklich löschen?')) {
      await supabase.from('skills').delete().eq('id', id);
      loadData();
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', skill_type_id: '' });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-8">Lädt...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Skills</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Neuer Skill</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {editingId ? 'Skill bearbeiten' : 'Neuer Skill'}
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
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                placeholder="z.B. Lead-Gesang"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Skill-Type
              </label>
              <select
                value={formData.skill_type_id}
                onChange={(e) => setFormData({ ...formData, skill_type_id: e.target.value })}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              >
                <option value="">Bitte wählen...</option>
                {skillTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
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
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium text-slate-900">{skill.name}</div>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: skill.skill_types.color }}
                  />
                  <span className="text-sm text-slate-500">{skill.skill_types.name}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(skill)}
                  className="p-1 text-slate-400 hover:text-slate-600 transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(skill.id)}
                  className="p-1 text-slate-400 hover:text-red-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {skills.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-500">Noch keine Skills vorhanden</p>
        </div>
      )}
    </div>
  );
}
