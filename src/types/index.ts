export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  department: string;
  position: string;
  employeeId?: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
  leaveBalances?: LeaveBalance[];
  managerId?: string;
  createdAt?: string;
}

export interface LeaveBalance {
  leaveTypeId: LeaveType | string;
  allocated: number;
  used: number;
  remaining: number;
}

export interface LeaveType {
  _id: string;
  name: string;
  code: string;
  description: string;
  defaultDays: number;
  color: string;
  requiresDocument: boolean;
  minNoticeDays: number;
  maxConsecutiveDays: number;
  maxCarryForwardDays: number;
  carryForward: boolean;
  isActive: boolean;
}

export interface Leave {
  _id: string;
  userId: User | string;
  leaveTypeId: LeaveType | string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending_manager' | 'pending_admin' | 'approved' | 'rejected' | 'cancelled';
  managerApprovedBy?: { _id: string; firstName: string; lastName: string };
  managerApprovedOn?: string;
  managerComment?: string;
  attachments?: string[];
  appliedOn: string;
  reviewedBy?: User | string;
  reviewedOn?: string;
  adminComment?: string;
  isHalfDay?: boolean;
  halfDayPeriod?: 'morning' | 'afternoon';
  createdAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  leaveId?: string;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  userId: User;
  action: string;
  entity: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers?: number;
  pendingLeaves?: number;
  approvedThisYear?: number;
  totalLeaveTypes?: number;
  myPending?: number;
  myApproved?: number;
  myRejected?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
