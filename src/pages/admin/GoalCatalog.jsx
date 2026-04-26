import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Target, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Badge, Button, Card, Col, ConfirmDialog, EmptyState, Input, Modal, Row, Select } from '../../components/ui';

const TIERS = ['IC', 'MANAGER', 'DIRECTOR'];

export default function GoalCatalog() {
  const { state, actions } = useApp();
  const { C } = useTheme();
  const [editing, setEditing] = useState(null); // null | { id?, ... }
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [groupBy, setGroupBy] = useState('NONE'); // NONE | CATEGORY | TIER

  const categoryColor = (cat) => {
    const map = { QA: C.success, Quality: C.success, Performance: C.warning, Delivery: C.accent, Engineering: C.purple, Frontend: C.cyan, Team: C.accent, Certification: C.warning, Reliability: C.danger };
    return map[cat] || C.textMuted;
  };

  const allCategories = useMemo(
    () => [...new Set(state.goalsCatalog.map((g) => g.category))].sort(),
    [state.goalsCatalog]
  );

  const filtered = useMemo(() => state.goalsCatalog.filter((g) =>
    (categoryFilter === 'ALL' || g.category === categoryFilter) &&
    (tierFilter === 'ALL' || (g.tier || 'IC') === tierFilter)
  ), [state.goalsCatalog, categoryFilter, tierFilter]);

  const grouped = useMemo(() => {
    if (groupBy === 'NONE') return [{ key: null, items: filtered }];
    const key = groupBy === 'CATEGORY' ? 'category' : 'tier';
    const map = new Map();
    for (const g of filtered) {
      const k = g[key] || (key === 'tier' ? 'IC' : 'Uncategorised');
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(g);
    }
    return [...map.entries()].sort(([a], [b]) => String(a).localeCompare(String(b))).map(([k, items]) => ({ key: k, items }));
  }, [filtered, groupBy]);

  const renderGoal = (g) => (
    <Card key={g.id} hoverable={false}>
      <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <Row gap={10} style={{ flex: 1, minWidth: 240 }}>
          <Target size={16} color={categoryColor(g.category)} />
          <Col gap={2}>
            <div style={{ color: C.text, fontWeight: 600 }}>{g.title}</div>
            <div style={{ color: C.textMuted, fontSize: 12 }}>
              Default weight {g.defaultWeight}% · {g.tier || 'IC'}
            </div>
          </Col>
        </Row>
        <Row gap={6}>
          <Badge color={categoryColor(g.category)} bg={categoryColor(g.category) + '22'}>{g.category}</Badge>
          <Button size="sm" variant="ghost" icon={Pencil} onClick={() => setEditing(g)}>Edit</Button>
          <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setConfirmRemove(g)}>Delete</Button>
        </Row>
      </Row>
    </Card>
  );

  return (
    <>
      <PageHeader
        title="Goal Catalog"
        subtitle="Shared library of goals. Filter, group, and edit entries used to assign goals across the org."
        actions={<Button icon={Plus} onClick={() => setEditing({ title: '', category: '', defaultWeight: 15, tier: 'IC' })}>Add goal</Button>}
      />

      <Card hoverable={false} style={{ marginBottom: 16 }}>
        <Row gap={10} style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <Select
              label="Category"
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[{ value: 'ALL', label: 'All categories' }, ...allCategories.map((c) => ({ value: c, label: c }))]}
              style={{ marginBottom: 0 }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <Select
              label="Tier"
              value={tierFilter}
              onChange={setTierFilter}
              options={[{ value: 'ALL', label: 'All tiers' }, ...TIERS.map((t) => ({ value: t, label: t }))]}
              style={{ marginBottom: 0 }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <Select
              label="Group by"
              value={groupBy}
              onChange={setGroupBy}
              options={[
                { value: 'NONE', label: 'No grouping' },
                { value: 'CATEGORY', label: 'Category' },
                { value: 'TIER', label: 'Tier' },
              ]}
              style={{ marginBottom: 0 }}
            />
          </div>
        </Row>
        <div style={{ color: C.textMuted, fontSize: 12, marginTop: 10 }}>
          Showing {filtered.length} of {state.goalsCatalog.length} goals
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={Target} title="No goals match the filters" subtitle="Try widening the category or tier filter." /></Card>
      ) : (
        <Col gap={14}>
          {grouped.map(({ key, items }) => (
            <div key={key ?? '_'}>
              {key !== null && (
                <Row gap={8} style={{ margin: '6px 2px 8px' }}>
                  <div style={{ color: C.text, fontSize: 13, fontWeight: 700 }}>{key}</div>
                  <Badge color={C.textMuted} bg={C.surface}>{items.length}</Badge>
                </Row>
              )}
              <Col gap={8}>
                {items.map(renderGoal)}
              </Col>
            </div>
          ))}
        </Col>
      )}

      <EditModal
        editing={editing}
        catalog={state.goalsCatalog}
        onClose={() => setEditing(null)}
        onSave={(payload) => {
          if (editing?.id) actions.updateCatalogGoal(editing.id, payload);
          else actions.addCatalogGoal(payload);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        onConfirm={() => { if (confirmRemove) actions.removeCatalogGoal(confirmRemove.id); }}
        title="Delete goal from catalog?"
        message={confirmRemove
          ? `Delete "${confirmRemove.title}"? Goals already assigned to employees keep their current state but the entry will no longer be available for new assignments.`
          : ''}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}

function EditModal({ editing, catalog, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [defaultWeight, setDefaultWeight] = useState(15);
  const [tier, setTier] = useState('IC');

  const last = useRef(null);
  useEffect(() => {
    if (editing && last.current !== editing) {
      setTitle(editing.title || '');
      setCategory(editing.category || '');
      setDefaultWeight(editing.defaultWeight ?? 15);
      setTier(editing.tier || 'IC');
      last.current = editing;
    }
    if (!editing) last.current = null;
  }, [editing]);

  const categories = [...new Set(catalog.map((g) => g.category))];
  const valid = title.trim() && category.trim();

  return (
    <Modal open={!!editing} onClose={onClose} title={editing?.id ? 'Edit goal' : 'Add goal to catalog'}>
      <Input label="Title" value={title} onChange={setTitle} />
      <Select
        label="Category"
        value={category}
        onChange={setCategory}
        options={[{ value: '', label: 'Select or enter below' }, ...categories.map((c) => ({ value: c, label: c }))]}
      />
      <Input label="Or new category" value={category} onChange={setCategory} />
      <Select
        label="Tier"
        value={tier}
        onChange={setTier}
        options={TIERS.map((t) => ({ value: t, label: t }))}
      />
      <Input
        label="Default weight %"
        type="number"
        value={defaultWeight}
        onChange={(v) => setDefaultWeight(Math.max(0, Math.min(100, Number(v) || 0)))}
      />
      <Row style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          disabled={!valid}
          onClick={() => onSave({ title: title.trim(), category: category.trim(), defaultWeight: Number(defaultWeight), tier })}
        >
          {editing?.id ? 'Save' : 'Add'}
        </Button>
      </Row>
    </Modal>
  );
}
