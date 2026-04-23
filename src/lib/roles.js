export const ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  MANAGER: 'MANAGER',
  DIRECTOR: 'DIRECTOR',
  ADMIN: 'ADMIN',
};

export const canManagePeople = (role) =>
  role === ROLES.MANAGER || role === ROLES.DIRECTOR;

export const hasEmployeeSurface = (role) =>
  role === ROLES.EMPLOYEE || role === ROLES.MANAGER || role === ROLES.DIRECTOR;

export const APPROVAL_TYPES = {
  WEIGHT_CHANGE: 'WEIGHT_CHANGE',
  LIFE_EVENT: 'LIFE_EVENT',
  TEAM_LINK: 'TEAM_LINK',
  SELF_PROPOSED_GOAL: 'SELF_PROPOSED_GOAL',
  PROMOTION: 'PROMOTION',
  NEW_USER: 'NEW_USER',
};

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export const APPROVAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};
