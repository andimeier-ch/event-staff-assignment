import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Edit2, X, Send } from 'lucide-react';

interface Staff {
  id: string;
  name: string;
  email: string;
  skill_id: string;
  is_leader: boolean;
  skills: {
    name: string;
    skill_types: {
      name: string;
      color: string;
    };
  };
}

interface Skill {
  id: string;
  name: string;
  skill_type_id: string;
  skill_types: {
    name: string;
    color: string;
  };
}

export function StaffView({ onSendSurveys }: { onSendSurveys: () => void }) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    skill_id: '',
    is_leader: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [staffResult, skillsResult] = await Promise.all([
      supabase
        .from('staff')
        .select('*, skills(name, skill_types(name, color))')
        .order('name'),
      supabase
        .from('skills')
        .select('*, skill_types(name, color)')
        .order('name')
    ]);

    if (!staffResult.error && staffResult.data) {
      setStaff(staffResult.data as Staff[]);
    }

    if (!skillsResult.error && skillsResult.data) {
      setSkills(skillsResult.data as Skill[]);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await supabase
        .from('staff')
        .update(formData)
        .eq('id', editingId);
    } else {
      await supabase
        .from('staff')
        .insert([formData]);
    }

    setFormData({ name: '', email: '', skill_id: '', is_leader: false });
    setEditingId(null);
    setShowForm(false);
    loadData();
  };

  const handleEdit = (staffMember: Staff) => {
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      skill_id: staffMember.skill_id,
      is_leader: staffMember.is_leader
    });
    setEditingId(staffMember.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Möchten Sie dieses Staff-Mitglied wirklich löschen?')) {
      await supabase.from('staff').delete().eq('id', id);
      loadData();
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', email: '', skill_id: '', is_leader: false });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-8">Lädt...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Staff</h2>
        <div className="flex space-x-3">
          {!showForm && staff.length > 0 && (
            <button
              onClick={onSendSurveys}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <Send className="w-4 h-4" />
              <span>Anfragen versenden</span>
            </button>
          )}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Neuer Staff</span>
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {editingId ? 'Staff bearbeiten' : 'Neuer Staff'}
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
                placeholder="Max Mustermann"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                E-Mail
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                placeholder="max@beispiel.de"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Skill
              </label>
              <select
                value={formData.skill_id}
                onChange={(e) => setFormData({ ...formData, skill_id: e.target.value })}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              >
                <option value="">Bitte wählen...</option>
                {skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name} ({skill.skill_types.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_leader"
                checked={formData.is_leader}
                onChange={(e) => setFormData({ ...formData, is_leader: e.target.checked })}
                className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
              />
              <label htmlFor="is_leader" className="ml-2 text-sm text-slate-700">
                Ist Leader
              </label>
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
        {staff.map((staffMember) => (
          <div
            key={staffMember.id}
            className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="space-y-1 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-slate-900">{staffMember.name}</span>
                  {staffMember.is_leader && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded">
                      Leader
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-500">{staffMember.email}</div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(staffMember)}
                  className="p-1 text-slate-400 hover:text-slate-600 transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(staffMember.id)}
                  className="p-1 text-slate-400 hover:text-red-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-3 border-t border-slate-100">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: staffMember.skills.skill_types.color }}
              />
              <span className="text-sm text-slate-600">
                {staffMember.skills.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {staff.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-500">Noch keine Staff-Mitglieder vorhanden</p>
        </div>
      )}
    </div>
  );
}
