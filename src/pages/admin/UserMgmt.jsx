import { useEffect, useState } from 'react';
import { Plus, Edit, UserX, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Avatar, Badge, Button, Card, Col, Input, Modal, Row, Select } from '../../components/ui';
import { ROLES, canManagePeople, USER_STATUS } from '../../lib/roles';

// Smallest populated list first — matches the org pyramid from the top.
const ROLE_ORDER = [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.MANAGER, ROLES.EMPLOYEE];

export default function UserMgmt() {
  const { state, actions, pageParams } = useApp();
  const { C } = useTheme();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [roleFilter, setRoleFilter] = useState(pageParams?.filter || 'ALL');

  const roleColor = (r) => r === ROLES.ADMIN ? C.purple : r === ROLES.DIRECTOR ? C.cyan : r === ROLES.MANAGER ? C.accent : C.textMuted;

  const visibleUsers = state.users.filter((u) =>
    (showInactive || u.status !== USER_STATUS.INACTIVE) &&
    (roleFilter === 'ALL' || u.role === roleFilter)
  );

  const usersByRole = ROLE_ORDER
    .map((role) => ({ role, users: visibleUsers.filter((u) => u.role === role) }))
    .filter((s) => s.users.length > 0);

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="Add, edit, and deactivate users. Deactivation is soft — the audit trail is preserved."
        actions={<Button icon={Plus} onClick={() => setAddOpen(true)}>Add user</Button>}
      />

      <Row gap={6} style={{ marginBottom: 14, flexWrap: 'wrap' }}>
        {['ALL', ...ROLE_ORDER].map((f) => (
          <button
            key={f}
            onClick={() => setRoleFilter(f)}
            style={{
              padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              cursor: 'pointer',
              background: roleFilter === f ? C.accent : 'transparent',
              color: roleFilter === f ? '#fff' : C.textMuted,
              border: `1px solid ${roleFilter === f ? C.accent : C.border}`,
            }}
          >{f}</button>
        ))}
        <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, color: C.textMuted, fontSize: 12, cursor: 'pointer' }}>
          <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} /> Show inactive
        </label>
      </Row>

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
                    {['Name', 'Team / Group', 'Manager', 'Email', 'Status', ''].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: 10, color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...users].sort((a, b) => a.name.localeCompare(b.name)).map((u) => {
                    const mgr = state.users.find((x) => x.id === u.managerId);
                    const isInactive = u.status === USER_STATUS.INACTIVE;
                    const isPending = u.pendingApproval;
                    return (
                      <tr key={u.id} style={{ opacity: isInactive ? 0.55 : 1 }}>
                        <td style={{ padding: 10, borderBottom: `1px solid ${C.border}` }}>
                          <Row gap={8}>
                            <Avatar name={u.name} color={u.avatar} size={28} />
                            <Col gap={2}>
                              <span style={{ color: C.text }}>{u.name}</span>
                              {u.title && <span style={{ color: C.textSub, fontSize: 11 }}>{u.title}</span>}
                            </Col>
                          </Row>
                        </td>
                        <td style={{ padding: 10, borderBottom: `1px solid ${C.border}`, color: C.textMuted }}>{u.group || '—'}</td>
                        <td style={{ padding: 10, borderBottom: `1px solid ${C.border}`, color: C.textMuted }}>{mgr?.name || '—'}</td>
                        <td style={{ padding: 10, borderBottom: `1px solid ${C.border}`, color: C.textMuted }}>{u.email}</td>
                        <td style={{ padding: 10, borderBottom: `1px solid ${C.border}` }}>
                          {isPending
                            ? <Badge color={C.warning} bg={C.warningDim}>Pending admin approval</Badge>
                            : isInactive
                              ? <Badge color={C.textMuted} bg={C.surface}>Inactive</Badge>
                              : <Badge color={C.success} bg={C.successDim}>Active</Badge>}
                        </td>
                        <td style={{ padding: 10, borderBottom: `1px solid ${C.border}`, textAlign: 'right' }}>
                          <Row gap={6} style={{ justifyContent: 'flex-end' }}>
                            <Button size="sm" variant="ghost" icon={Edit} onClick={() => setEditing(u)}>Edit</Button>
                            {isInactive
                              ? <Button size="sm" variant="ghost" icon={UserCheck} onClick={() => actions.reactivateUser(u.id)}>Reactivate</Button>
                              : <Button size="sm" variant="ghost" icon={UserX} onClick={() => actions.deactivateUser(u.id)}>Deactivate</Button>}
                          </Row>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </div>
        ))}
        {usersByRole.length === 0 && <Card>No users match the current filter.</Card>}
      </Col>

      <AddUserModal open={addOpen} onClose={() => setAddOpen(false)} state={state} actions={actions} />
      <EditUserModal user={editing} onClose={() => setEditing(null)} state={state} actions={actions} />
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
    ...state.users.filter((u) => canManagePeople(u.role) && u.status !== USER_STATUS.INACTIVE)
      .map((u) => ({ value: u.id, label: `${u.name} (${u.role})` })),
  ];

  const requiresManager = role === ROLES.EMPLOYEE || role === ROLES.MANAGER;
  const managerOk = !requiresManager || !!managerId;
  const emailOk = email.includes('@');

  return (
    <Modal open={open} onClose={onClose} title="Add user">
      <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
        Assigning a manager requires that manager to already exist. Deactivation later is always soft.
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
            actions.addUser({ name, email, role, group, managerId: managerId || null, dept: 'Engineering', avatar: '#5b8def', title: role }, ROLES.ADMIN);
            onClose();
          }}
        >Create</Button>
      </Row>
    </Modal>
  );
}

function EditUserModal({ user, onClose, state, actions }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [group, setGroup] = useState('');
  const [managerId, setManagerId] = useState('');

  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setEmail(user.email || '');
    setTitle(user.title || '');
    setGroup(user.group || '');
    setManagerId(user.managerId || '');
  }, [user]);

  if (!user) return null;

  const managerOptions = [
    { value: '', label: '— no manager —' },
    ...state.users.filter((u) => canManagePeople(u.role) && u.id !== user.id && u.status !== USER_STATUS.INACTIVE)
      .map((u) => ({ value: u.id, label: `${u.name} (${u.role})` })),
  ];

  return (
    <Modal open={!!user} onClose={onClose} title={`Edit ${user.name}`}>
      <Input label="Full name" value={name} onChange={setName} />
      <Input label="Email" type="email" value={email} onChange={setEmail} />
      <Input label="Title" value={title} onChange={setTitle} />
      <Select label="Group / team" value={group} onChange={setGroup} options={[{ value: '', label: '—' }, ...state.groups.map((g) => ({ value: g.name, label: g.name }))]} />
      <Select label="Manager" value={managerId} onChange={setManagerId} options={managerOptions} />
      <Row style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => {
            actions.updateUser(user.id, { name, email, title, group, managerId: managerId || null });
            onClose();
          }}
        >Save</Button>
      </Row>
    </Modal>
  );
}
