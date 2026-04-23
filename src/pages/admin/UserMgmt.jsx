import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Avatar, Badge, Button, Card, Col, Input, Modal, Row, Select } from '../../components/ui';
import { ROLES, canManagePeople } from '../../lib/roles';

// Smallest populated list first — matches the org pyramid from the top.
const ROLE_ORDER = [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.MANAGER, ROLES.EMPLOYEE];

export default function UserMgmt() {
  const { state, actions } = useApp();
  const { C } = useTheme();
  const [open, setOpen] = useState(false);

  const roleColor = (r) => r === ROLES.ADMIN ? C.purple : r === ROLES.DIRECTOR ? C.cyan : r === ROLES.MANAGER ? C.accent : C.textMuted;

  const usersByRole = ROLE_ORDER
    .map((role) => ({ role, users: state.users.filter((u) => u.role === role) }))
    .filter((s) => s.users.length > 0);

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="Users cannot be modified or removed after creation — this preserves the audit trail."
        actions={<Button icon={Plus} onClick={() => setOpen(true)}>Add user</Button>}
      />

      <Col gap={20}>
        {usersByRole.map(({ role, users }) => (
          <div key={role}>
            <Row style={{ marginBottom: 10 }} gap={8}>
              <Badge color={roleColor(role)} bg={roleColor(role) + '22'}>{role}</Badge>
              <div style={{ color: C.textMuted, fontSize: 12 }}>{users.length} user{users.length === 1 ? '' : 's'}</div>
            </Row>
            <Card hoverable={false}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Name', 'Team / Group', 'Manager', 'Email'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: 10, color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...users].sort((a, b) => a.name.localeCompare(b.name)).map((u) => {
                    const mgr = state.users.find((x) => x.id === u.managerId);
                    return (
                      <tr key={u.id}>
                        <td style={{ padding: 10, borderBottom: `1px solid ${C.border}` }}>
                          <Row gap={8}><Avatar name={u.name} color={u.avatar} size={28} /><span style={{ color: C.text }}>{u.name}</span></Row>
                        </td>
                        <td style={{ padding: 10, borderBottom: `1px solid ${C.border}`, color: C.textMuted }}>{u.group || '—'}</td>
                        <td style={{ padding: 10, borderBottom: `1px solid ${C.border}`, color: C.textMuted }}>{mgr?.name || '—'}</td>
                        <td style={{ padding: 10, borderBottom: `1px solid ${C.border}`, color: C.textMuted }}>{u.email}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </div>
        ))}
      </Col>

      <AddUserModal open={open} onClose={() => setOpen(false)} state={state} actions={actions} />
    </>
  );
}

function AddUserModal({ open, onClose, state, actions }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(ROLES.EMPLOYEE);
  const [group, setGroup] = useState(state.groups[0]?.name || '');
  const [managerId, setManagerId] = useState('');

  const managerOptions = [
    { value: '', label: 'Select manager' },
    ...state.users.filter((u) => canManagePeople(u.role)).map((u) => ({ value: u.id, label: `${u.name} (${u.role})` })),
  ];

  const requiresManager = role === ROLES.EMPLOYEE || role === ROLES.MANAGER;
  const managerOk = !requiresManager || !!managerId;
  const emailOk = email.includes('@');

  return (
    <Modal open={open} onClose={onClose} title="Add user">
      <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
        Once created, users cannot be deleted or edited. Assigning a manager requires that manager to already exist.
      </p>
      <Input label="Full name" value={name} onChange={setName} />
      <Input label="Email" type="email" value={email} onChange={setEmail} />
      <Select label="Role" value={role} onChange={setRole} options={Object.values(ROLES).map((r) => ({ value: r, label: r }))} />
      <Select label="Group / team" value={group} onChange={setGroup} options={state.groups.map((g) => ({ value: g.name, label: g.name }))} />
      {requiresManager && <Select label="Manager" value={managerId} onChange={setManagerId} options={managerOptions} />}
      <Row style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          disabled={!name || !emailOk || !managerOk}
          onClick={() => {
            actions.addUser({ name, email, role, group, managerId: managerId || null, dept: 'Engineering', avatar: '#5b8def', title: role });
            onClose();
          }}
        >Create</Button>
      </Row>
    </Modal>
  );
}
