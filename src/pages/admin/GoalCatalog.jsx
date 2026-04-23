import { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Badge, Button, Card, Col, Input, Modal, Row, Select } from '../../components/ui';

export default function GoalCatalog() {
  const { state, actions } = useApp();
  const { C } = useTheme();
  const [open, setOpen] = useState(false);

  const categoryColor = (cat) => {
    const map = { QA: C.success, Quality: C.success, Performance: C.warning, Delivery: C.accent, Engineering: C.purple, Frontend: C.cyan, Team: C.accent, Certification: C.warning, Reliability: C.danger };
    return map[cat] || C.textMuted;
  };

  return (
    <>
      <PageHeader
        title="Goal Catalog"
        subtitle="Shared library of goals. Entries cannot be deleted; only added."
        actions={<Button icon={Plus} onClick={() => setOpen(true)}>Add goal</Button>}
      />

      <Col gap={8}>
        {state.goalsCatalog.map((g) => (
          <Card key={g.id} hoverable={false}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Row gap={10}>
                <Target size={16} color={categoryColor(g.category)} />
                <Col gap={2}>
                  <div style={{ color: C.text, fontWeight: 600 }}>{g.title}</div>
                  <div style={{ color: C.textMuted, fontSize: 12 }}>Default weight {g.defaultWeight}%</div>
                </Col>
              </Row>
              <Badge color={categoryColor(g.category)} bg={categoryColor(g.category) + '22'}>{g.category}</Badge>
            </Row>
          </Card>
        ))}
      </Col>

      <AddGoalModal open={open} onClose={() => setOpen(false)} catalog={state.goalsCatalog} actions={actions} />
    </>
  );
}

function AddGoalModal({ open, onClose, catalog, actions }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [defaultWeight, setDefaultWeight] = useState(15);
  const categories = [...new Set(catalog.map((g) => g.category))];
  return (
    <Modal open={open} onClose={onClose} title="Add goal to catalog">
      <Input label="Title" value={title} onChange={setTitle} />
      <Select
        label="Category"
        value={category}
        onChange={setCategory}
        options={[{ value: '', label: 'Select or enter below' }, ...categories.map((c) => ({ value: c, label: c }))]}
      />
      <Input label="Or new category" value={category} onChange={setCategory} />
      <Input label="Default weight %" type="number" value={defaultWeight} onChange={(v) => setDefaultWeight(Math.max(0, Math.min(100, Number(v) || 0)))} />
      <Row style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          disabled={!title.trim() || !category.trim()}
          onClick={() => { actions.addCatalogGoal({ title: title.trim(), category: category.trim(), defaultWeight: Number(defaultWeight) }); onClose(); }}
        >Add</Button>
      </Row>
    </Modal>
  );
}
