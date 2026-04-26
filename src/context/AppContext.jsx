import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { buildInitialState } from '../data/seed';
import { loadState, saveState } from '../lib/storage';
import { genId } from '../lib/ids';
import { APPROVAL_STATUS, APPROVAL_TYPES, ROLES } from '../lib/roles';
import { computePromotionEligibility, computeRating, goalStatus } from '../lib/compute';
import { isOverdue } from '../lib/format';

const AppContext = createContext(null);
// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);

// --- Reducer ---------------------------------------------------------------
const reducer = (state, action) => {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;

    case 'UPDATE_GOAL': {
      const { userId, goalId, patch } = action;
      return {
        ...state,
        empGoals: {
          ...state.empGoals,
          [userId]: state.empGoals[userId].map((g) => (g.id === goalId ? { ...g, ...patch } : g)),
        },
      };
    }

    case 'ADD_GOAL_UPDATE': {
      const { userId, goalId, update } = action;
      return {
        ...state,
        empGoals: {
          ...state.empGoals,
          [userId]: state.empGoals[userId].map((g) =>
            g.id === goalId
              ? { ...g, completion: update.pct, updates: [...g.updates, update] }
              : g
          ),
        },
      };
    }

    case 'ADD_GOAL_FILE': {
      const { userId, goalId, file } = action;
      return {
        ...state,
        empGoals: {
          ...state.empGoals,
          [userId]: state.empGoals[userId].map((g) =>
            g.id === goalId ? { ...g, files: [...g.files, file] } : g
          ),
        },
      };
    }

    case 'ADD_EMP_GOAL': {
      const { userId, goal } = action;
      return {
        ...state,
        empGoals: { ...state.empGoals, [userId]: [...(state.empGoals[userId] || []), goal] },
      };
    }

    case 'REMOVE_EMP_GOAL': {
      const { userId, goalId } = action;
      return {
        ...state,
        empGoals: {
          ...state.empGoals,
          [userId]: state.empGoals[userId].filter((g) => g.id !== goalId),
        },
      };
    }

    case 'SET_LIFE_EVENTS': {
      const { userId, events } = action;
      return { ...state, lifeEvents: { ...state.lifeEvents, [userId]: events } };
    }

    case 'ADD_APPROVAL':
      return { ...state, approvals: [...state.approvals, action.approval] };

    case 'UPDATE_APPROVAL':
      return {
        ...state,
        approvals: state.approvals.map((a) => (a.id === action.id ? { ...a, ...action.patch } : a)),
      };

    case 'ADD_CATALOG_GOAL':
      return { ...state, goalsCatalog: [...state.goalsCatalog, action.goal] };

    case 'UPDATE_CATALOG_GOAL':
      return {
        ...state,
        goalsCatalog: state.goalsCatalog.map((g) => (g.id === action.id ? { ...g, ...action.patch } : g)),
      };

    case 'REMOVE_CATALOG_GOAL':
      return {
        ...state,
        goalsCatalog: state.goalsCatalog.filter((g) => g.id !== action.id),
      };

    case 'ADD_USER': {
      const email = (action.user.email || '').toLowerCase();
      return {
        ...state,
        users: [...state.users, { ...action.user, email }],
        passwords: { ...state.passwords, [email]: 'Demo1234!' },
      };
    }

    case 'UPDATE_USER': {
      const existing = state.users.find((u) => u.id === action.id);
      const next = { ...state, users: state.users.map((u) => (u.id === action.id ? { ...u, ...action.patch } : u)) };
      // Email is the login key, so the password map must follow rename.
      if (existing && action.patch.email && action.patch.email !== existing.email) {
        const newEmail = action.patch.email.toLowerCase();
        const oldPwd = state.passwords[existing.email] ?? 'Demo1234!';
        const passwords = { ...state.passwords, [newEmail]: oldPwd };
        delete passwords[existing.email];
        next.passwords = passwords;
      }
      return next;
    }

    case 'ADD_PERIOD':
      return { ...state, periods: [...state.periods, action.period] };

    case 'UPDATE_PERIOD':
      return {
        ...state,
        periods: state.periods.map((p) =>
          p.id === action.id ? { ...p, ...action.patch } : action.patch.isActive ? { ...p, isActive: false } : p
        ),
      };

    case 'ADD_GROUP':
      return { ...state, groups: [...state.groups, action.group] };

    case 'UPDATE_GROUP':
      return { ...state, groups: state.groups.map((g) => (g.id === action.id ? { ...g, ...action.patch } : g)) };

    case 'ADD_PROMOTION':
      return { ...state, promotions: [...state.promotions, action.promotion] };

    case 'UPDATE_PROMOTION':
      return {
        ...state,
        promotions: state.promotions.map((p) => (p.id === action.id ? { ...p, ...action.patch } : p)),
      };

    case 'ADD_ONE_ON_ONE':
      return { ...state, oneOnOnes: [...(state.oneOnOnes || []), action.oneOnOne] };

    case 'UPDATE_ONE_ON_ONE':
      return {
        ...state,
        oneOnOnes: (state.oneOnOnes || []).map((o) => (o.id === action.id ? { ...o, ...action.patch } : o)),
      };

    case 'ADD_FEEDBACK':
      return { ...state, feedback: [...(state.feedback || []), action.feedback] };

    case 'ADD_LIFE_EVENT_TYPE':
      return { ...state, lifeEventTypes: [...(state.lifeEventTypes || []), action.lifeEventType] };

    case 'UPDATE_LIFE_EVENT_TYPE':
      return {
        ...state,
        lifeEventTypes: (state.lifeEventTypes || []).map((t) => (t.id === action.id ? { ...t, ...action.patch } : t)),
      };

    case 'REMOVE_LIFE_EVENT_TYPE':
      return {
        ...state,
        lifeEventTypes: (state.lifeEventTypes || []).filter((t) => t.id !== action.id),
      };

    case 'RESET':
      return buildInitialState();

    default:
      return state;
  }
};

// --- Provider --------------------------------------------------------------
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => loadState() || buildInitialState());
  const [user, setUser] = useState(null);
  const [page, setPageInternal] = useState('dashboard');
  const [pageParams, setPageParams] = useState({});
  const [managerMode, setManagerMode] = useState(true); // managers default to their manager surface
  const [toast, setToast] = useState(null);

  // Navigate with optional query-like params consumed by the target page.
  const setPage = useCallback((target, params = {}) => {
    setPageInternal(target);
    setPageParams(params);
  }, []);

  useEffect(() => { saveState(state); }, [state]);

  // --- Toast helper --------------------------------------------------------
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // --- Auth ----------------------------------------------------------------
  const login = useCallback((email, password) => {
    const key = (email || '').trim().toLowerCase();
    const u = state.users.find((x) => x.email?.toLowerCase() === key);
    if (!u || state.passwords[key] !== password) return { ok: false, reason: 'invalid' };
    if (u.status === 'INACTIVE') return { ok: false, reason: 'inactive' };
    if (u.pendingApproval) return { ok: false, reason: 'pending' };
    setUser(u);
    setPage('dashboard');
    // Managers/Directors default to manager surface on login.
    setManagerMode(u.role === ROLES.MANAGER || u.role === ROLES.DIRECTOR);
    return { ok: true };
  }, [state.users, state.passwords, setPage]);

  const logout = useCallback(() => { setUser(null); setPage('dashboard'); }, [setPage]);

  // --- Lookups -------------------------------------------------------------
  const findUser = useCallback((id) => state.users.find((u) => u.id === id), [state.users]);

  const teamFor = useCallback(
    // Inactive users stay in state for audit but do not appear in active views.
    (managerId) => state.users.filter((u) => u.managerId === managerId && u.status !== 'INACTIVE'),
    [state.users]
  );

  const goalTitle = useCallback(
    (eg) => {
      if (eg.customTitle) return eg.customTitle;
      const g = state.goalsCatalog.find((c) => c.id === eg.goalId);
      return g ? g.title : 'Untitled goal';
    },
    [state.goalsCatalog]
  );

  const activePeriod = useMemo(
    () => state.periods.find((p) => p.isActive) || state.periods[state.periods.length - 1],
    [state.periods]
  );

  // --- Derived: enriched goals for UI --------------------------------------
  const goalsFor = useCallback(
    (userId) => {
      const raw = state.empGoals[userId] || [];
      return raw.map((g) => ({
        ...g,
        title: goalTitle(g),
        status: goalStatus(g.completion),
        overdue: isOverdue(g.dueDate, g.completion),
      }));
    },
    [state.empGoals, goalTitle]
  );

  const eligibilityFor = useCallback(
    (userId) => {
      const history = state.ratingHistory[userId] || [];
      const goals = goalsFor(userId);
      const approvedSP = goals.filter((g) => g.selfProposed && g.proposalStatus === APPROVAL_STATUS.APPROVED).length;
      return computePromotionEligibility({
        history,
        selfProposedApprovedCount: approvedSP,
        currentGoals: goals,
      });
    },
    [state.ratingHistory, goalsFor]
  );

  // --- Actions (thin wrappers over dispatch + side effects) ----------------
  const actions = useMemo(() => ({
    // Employee: log a progress update
    addGoalUpdate: (userId, goalId, pct, note) => {
      dispatch({ type: 'ADD_GOAL_UPDATE', userId, goalId, update: { pct, note, date: new Date().toISOString().slice(0, 10) } });
      showToast('Progress saved');
    },
    addGoalFile: (userId, goalId, file) => {
      dispatch({ type: 'ADD_GOAL_FILE', userId, goalId, file });
      showToast('File attached');
    },
    requestWeightChange: (userId, goalId, newWeight, reason) => {
      const emp = findUser(userId);
      dispatch({
        type: 'ADD_APPROVAL',
        approval: {
          id: genId('appr'), type: APPROVAL_TYPES.WEIGHT_CHANGE,
          employeeId: userId, managerId: emp.managerId, status: APPROVAL_STATUS.PENDING,
          date: new Date().toISOString().slice(0, 10),
          detail: `Change weight of "${goalId}" to ${newWeight}% — ${reason || ''}`,
          payload: { goalId, newWeight },
        },
      });
      showToast('Weight-change request sent to manager');
    },
    // Employee: self-proposed goal
    proposeSelfGoal: (userId, { title, category, weight, dueDate, note }) => {
      const emp = findUser(userId);
      const goal = {
        id: genId('eg'),
        goalId: 'self_proposed',
        customTitle: title,
        category,
        completion: 0,
        weight: weight || 10,
        dueDate,
        updates: [],
        files: [],
        periodId: state.periods.find((p) => p.isActive)?.id,
        selfProposed: true,
        proposalStatus: APPROVAL_STATUS.PENDING,
        proposedOn: new Date().toISOString().slice(0, 10),
      };
      dispatch({ type: 'ADD_EMP_GOAL', userId, goal });
      dispatch({
        type: 'ADD_APPROVAL',
        approval: {
          id: genId('appr'), type: APPROVAL_TYPES.SELF_PROPOSED_GOAL,
          employeeId: userId, managerId: emp.managerId, status: APPROVAL_STATUS.PENDING,
          date: new Date().toISOString().slice(0, 10),
          detail: title,
          payload: { goalRowId: goal.id, note },
        },
      });
      showToast('Self-proposed goal sent to manager');
    },

    // Life events
    setLifeEvents: (userId, events) => dispatch({ type: 'SET_LIFE_EVENTS', userId, events }),
    addLifeEvent: (userId, ev) => {
      const emp = findUser(userId);
      const event = { ...ev, id: genId('le'), status: APPROVAL_STATUS.PENDING };
      dispatch({ type: 'SET_LIFE_EVENTS', userId, events: [...(state.lifeEvents[userId] || []), event] });
      dispatch({
        type: 'ADD_APPROVAL',
        approval: {
          id: genId('appr'), type: APPROVAL_TYPES.LIFE_EVENT,
          employeeId: userId, managerId: emp.managerId, status: APPROVAL_STATUS.PENDING,
          date: new Date().toISOString().slice(0, 10),
          detail: `${ev.type} — ${ev.desc}`,
          lifeEventId: event.id,
        },
      });
      showToast('Life event submitted for approval');
    },

    // Manager: assign a catalog goal
    assignGoal: (employeeId, goalId, weight, dueDate) => {
      const meta = state.goalsCatalog.find((g) => g.id === goalId);
      const goal = {
        id: genId('eg'), goalId,
        completion: 0, weight: weight ?? meta?.defaultWeight ?? 20,
        dueDate, updates: [], files: [],
        periodId: state.periods.find((p) => p.isActive)?.id,
        selfProposed: false,
      };
      dispatch({ type: 'ADD_EMP_GOAL', userId: employeeId, goal });
      showToast('Goal assigned');
    },

    // Approval decisions
    decideApproval: (approvalId, approve) => {
      const appr = state.approvals.find((a) => a.id === approvalId);
      if (!appr) return;
      const newStatus = approve ? APPROVAL_STATUS.APPROVED : APPROVAL_STATUS.REJECTED;
      dispatch({ type: 'UPDATE_APPROVAL', id: approvalId, patch: { status: newStatus } });

      // Cascade side-effects
      if (appr.type === APPROVAL_TYPES.WEIGHT_CHANGE && approve && appr.payload) {
        dispatch({
          type: 'UPDATE_GOAL',
          userId: appr.employeeId,
          goalId: appr.payload.goalId,
          patch: { weight: appr.payload.newWeight },
        });
      }
      if (appr.type === APPROVAL_TYPES.LIFE_EVENT) {
        const evs = (state.lifeEvents[appr.employeeId] || []).map((e) =>
          e.id === appr.lifeEventId ? { ...e, status: newStatus, reviewedBy: appr.managerId } : e
        );
        dispatch({ type: 'SET_LIFE_EVENTS', userId: appr.employeeId, events: evs });
      }
      if (appr.type === APPROVAL_TYPES.SELF_PROPOSED_GOAL && appr.payload) {
        if (approve) {
          dispatch({
            type: 'UPDATE_GOAL',
            userId: appr.employeeId,
            goalId: appr.payload.goalRowId,
            patch: { proposalStatus: APPROVAL_STATUS.APPROVED },
          });
        } else {
          dispatch({ type: 'REMOVE_EMP_GOAL', userId: appr.employeeId, goalId: appr.payload.goalRowId });
        }
      }
      if (appr.type === APPROVAL_TYPES.TEAM_LINK && approve && appr.payload) {
        dispatch({ type: 'UPDATE_USER', id: appr.employeeId, patch: { managerId: appr.payload.newManagerId } });
      }
      if (appr.type === APPROVAL_TYPES.ROLE_CHANGE && approve && appr.payload) {
        const { newRole, newTitle, newManagerId } = appr.payload;
        dispatch({
          type: 'UPDATE_USER',
          id: appr.employeeId,
          patch: { role: newRole, title: newTitle, managerId: newManagerId ?? undefined },
        });
      }
      if (appr.type === APPROVAL_TYPES.NEW_USER) {
        dispatch({
          type: 'UPDATE_USER',
          id: appr.employeeId,
          patch: approve
            ? { pendingApproval: false, status: 'ACTIVE' }
            : { pendingApproval: false, status: 'INACTIVE' },
        });
      }
      showToast(approve ? 'Approved' : 'Rejected');
    },

    // Promotions
    recommendPromotion: (employeeId, recommendedBy, reason, targetTitle = null) => {
      dispatch({
        type: 'ADD_PROMOTION',
        promotion: {
          id: genId('promo'), employeeId, recommendedBy, reason, targetTitle,
          status: 'RECOMMENDED', date: new Date().toISOString().slice(0, 10),
        },
      });
      showToast('Promotion recommended — director will review');
    },
    decidePromotion: (promotionId, approve) => {
      dispatch({
        type: 'UPDATE_PROMOTION', id: promotionId,
        patch: { status: approve ? 'APPROVED' : 'REJECTED', decidedAt: new Date().toISOString().slice(0, 10) },
      });
      showToast(approve ? 'Promotion approved' : 'Promotion rejected');
    },

    // Admin + manager/director self-serve
    //
    // addUser is the single entry point for creating a user. Direct creation
    // by ADMIN is immediate; creation requested by a MANAGER or DIRECTOR
    // lands the user in state with pendingApproval=true and queues a NEW_USER
    // admin approval. decideApproval flips or removes.
    addUser: (user, requestedBy = ROLES.ADMIN) => {
      const emailKey = (user.email || '').trim().toLowerCase();
      const duplicate = state.users.some((u) => u.email?.toLowerCase() === emailKey);
      if (!emailKey || duplicate) {
        showToast(duplicate ? 'A user with that email already exists' : 'Email is required', 'error');
        return null;
      }
      const id = genId('u');
      const needsApproval = requestedBy !== ROLES.ADMIN;
      const record = {
        status: 'ACTIVE',
        pendingApproval: needsApproval,
        ...user,
        email: emailKey,
        id,
      };
      dispatch({ type: 'ADD_USER', user: record });
      if (needsApproval) {
        dispatch({
          type: 'ADD_APPROVAL',
          approval: {
            id: genId('appr'),
            type: APPROVAL_TYPES.NEW_USER,
            employeeId: id,
            managerId: user.managerId,
            status: APPROVAL_STATUS.PENDING,
            adminOnly: true,
            date: new Date().toISOString().slice(0, 10),
            detail: `${requestedBy} added ${user.name} (${user.role}${user.title ? ' — ' + user.title : ''})`,
          },
        });
        showToast('User added — pending admin approval. Temp password: Demo1234!', 'warning');
      } else {
        showToast('User added. They can sign in with Demo1234!');
      }
      return id;
    },
    updateUser: (id, patch) => { dispatch({ type: 'UPDATE_USER', id, patch }); showToast('User updated'); },
    deactivateUser: (id) => { dispatch({ type: 'UPDATE_USER', id, patch: { status: 'INACTIVE' } }); showToast('User deactivated'); },
    reactivateUser: (id) => { dispatch({ type: 'UPDATE_USER', id, patch: { status: 'ACTIVE' } }); showToast('User reactivated'); },

    // One-on-One --------------------------------------------------------------
    // Either party can initiate; the other party accepts / declines. Once done
    // the initiator can close the loop with notes.
    requestOneOnOne: (initiatorId, withUserId, topic, proposedDate, note) => {
      dispatch({
        type: 'ADD_ONE_ON_ONE',
        oneOnOne: {
          id: genId('oo'),
          initiatorId, withUserId, topic, proposedDate, note,
          status: 'PENDING',
          createdAt: new Date().toISOString().slice(0, 10),
        },
      });
      showToast('1:1 request sent');
    },
    respondOneOnOne: (id, accept) => {
      dispatch({ type: 'UPDATE_ONE_ON_ONE', id, patch: { status: accept ? 'ACCEPTED' : 'DECLINED' } });
      showToast(accept ? '1:1 accepted' : '1:1 declined');
    },
    completeOneOnOne: (id, notes) => {
      dispatch({ type: 'UPDATE_ONE_ON_ONE', id, patch: { status: 'DONE', notes, completedAt: new Date().toISOString().slice(0, 10) } });
      showToast('1:1 logged');
    },
    cancelOneOnOne: (id) => {
      dispatch({ type: 'UPDATE_ONE_ON_ONE', id, patch: { status: 'CANCELLED' } });
      showToast('1:1 cancelled');
    },

    // Manager → Employee written feedback. One-way, appended; goalId is optional
    // (null for general feedback unrelated to a specific goal).
    sendFeedback: (fromId, toId, goalId, text) => {
      dispatch({
        type: 'ADD_FEEDBACK',
        feedback: {
          id: genId('fb'),
          fromId, toId, goalId: goalId || null,
          text,
          createdAt: new Date().toISOString().slice(0, 10),
        },
      });
      showToast('Feedback sent');
    },
    // Director-initiated: promote an existing IC into a manager slot.
    // Queued as an admin approval; on approve, role/title/manager pointer flip.
    promoteToManager: (employeeId, newTitle, newManagerId, requestedBy) => {
      const emp = state.users.find((u) => u.id === employeeId);
      if (!emp) return;
      dispatch({
        type: 'ADD_APPROVAL',
        approval: {
          id: genId('appr'),
          type: APPROVAL_TYPES.ROLE_CHANGE,
          employeeId,
          managerId: newManagerId || emp.managerId,
          status: APPROVAL_STATUS.PENDING,
          adminOnly: true,
          date: new Date().toISOString().slice(0, 10),
          detail: `${requestedBy} proposes promoting ${emp.name} from ${emp.title || emp.role} to ${newTitle} (Manager)`,
          payload: { newRole: ROLES.MANAGER, newTitle, newManagerId: newManagerId || emp.managerId },
        },
      });
      showToast('Promotion to manager submitted for admin approval', 'warning');
    },
    addCatalogGoal: (goal) => { dispatch({ type: 'ADD_CATALOG_GOAL', goal: { ...goal, id: genId('g') } }); showToast('Goal added to catalog'); },
    updateCatalogGoal: (id, patch) => { dispatch({ type: 'UPDATE_CATALOG_GOAL', id, patch }); showToast('Goal updated'); },
    removeCatalogGoal: (id) => { dispatch({ type: 'REMOVE_CATALOG_GOAL', id }); showToast('Goal removed from catalog'); },
    addLifeEventType: (type) => { dispatch({ type: 'ADD_LIFE_EVENT_TYPE', lifeEventType: { ...type, id: genId('let') } }); showToast('Life event type added'); },
    updateLifeEventType: (id, patch) => { dispatch({ type: 'UPDATE_LIFE_EVENT_TYPE', id, patch }); showToast('Life event type updated'); },
    removeLifeEventType: (id) => { dispatch({ type: 'REMOVE_LIFE_EVENT_TYPE', id }); showToast('Life event type removed'); },
    addPeriod: (period) => { dispatch({ type: 'ADD_PERIOD', period: { ...period, id: genId('p') } }); showToast('Period added'); },
    updatePeriod: (id, patch) => { dispatch({ type: 'UPDATE_PERIOD', id, patch }); showToast('Period updated'); },
    addGroup: (group) => { dispatch({ type: 'ADD_GROUP', group: { ...group, id: genId('grp') } }); showToast('Group added'); },
    updateGroup: (id, patch) => dispatch({ type: 'UPDATE_GROUP', id, patch }),
    resetData: () => { dispatch({ type: 'RESET' }); showToast('Data reset to seed'); },
  }), [state, findUser, showToast]);

  const value = {
    state, user, page, setPage, pageParams, managerMode, setManagerMode,
    toast, showToast,
    login, logout,
    findUser, teamFor, goalTitle, goalsFor, eligibilityFor, activePeriod,
    computeRatingFor: (userId) => computeRating(
      goalsFor(userId).filter((g) => !g.selfProposed || g.proposalStatus === APPROVAL_STATUS.APPROVED),
      state.lifeEvents[userId] || [],
      state.lifeEventTypes,
    ),
    actions,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
