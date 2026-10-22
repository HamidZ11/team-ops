import type * as React from 'react';

export type RequestStatus = 'triage' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'declined';
export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none';
/** A Lucide icon name from the set Meridian uses (see the Icon card), or a node. */
export type IconRef = string | React.ReactNode;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Default 'secondary'. One 'primary' per area; 'danger' only for Decline and destructive confirmations. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Default 'sm' (28px). 'md' is 32px; icon sizes are square and need aria-label. */
  size?: 'sm' | 'md' | 'icon-sm' | 'icon-md';
}
export declare function Button(props: ButtonProps): React.ReactElement;

export interface KbdProps { children?: React.ReactNode; className?: string }
export declare function Kbd(props: KbdProps): React.ReactElement;

export interface AvatarProps {
  /** null or undefined draws the dashed "Unassigned" ring. */
  name: string | null | undefined;
  size?: 16 | 18 | 20 | 24 | 28 | 32;
  /** Default true. Set false when no visible name sits beside it. */
  decorative?: boolean;
  className?: string;
}
export declare function Avatar(props: AvatarProps): React.ReactElement;
export interface AvatarStackProps { names: string[]; size?: 18 | 20 | 24 }
export declare function AvatarStack(props: AvatarStackProps): React.ReactElement;

export interface StatusIconProps { status: RequestStatus; size?: number; className?: string }
export declare function StatusIcon(props: StatusIconProps): React.ReactElement;
export interface StatusChipProps { status: RequestStatus; label?: string; className?: string }
export declare function StatusChip(props: StatusChipProps): React.ReactElement;
export interface BlockedChipProps { label?: string; className?: string }
export declare function BlockedChip(props: BlockedChipProps): React.ReactElement;
export interface PriorityIconProps { priority: Priority; size?: number; className?: string }
export declare function PriorityIcon(props: PriorityIconProps): React.ReactElement;

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Renders a textarea that grows from 64px to 240px. */
  multiline?: boolean;
  /** Shown below in danger-fg with role="alert"; also marks the field invalid. */
  error?: string;
  invalid?: boolean;
}
export declare function Field(props: FieldProps): React.ReactElement;

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  indeterminate?: boolean;
}
export declare function Checkbox(props: CheckboxProps): React.ReactElement;

export interface SearchFieldProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Visually hidden label. Default "Search requests". */
  label?: string;
  /** Key hint. Default "/"; null hides it. */
  shortcut?: string | null;
  className?: string;
}
export declare function SearchField(props: SearchFieldProps): React.ReactElement;

export interface FilterChipProps {
  icon?: IconRef;
  label: string;
  /** Empty or null shows the resting chip; a value shows "Label: value". */
  value?: string | null;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
}
export declare function FilterChip(props: FilterChipProps): React.ReactElement;

export interface NavItemProps {
  icon: IconRef;
  label: string;
  active?: boolean;
  count?: number;
  /** Accent pill, for Inbox. */
  unread?: number;
  trailing?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
}
export declare function NavItem(props: NavItemProps): React.ReactElement;

export interface PaneHeaderProps {
  icon?: IconRef;
  title: string;
  count?: number;
  description?: string;
  /** Right-aligned actions. */
  children?: React.ReactNode;
  className?: string;
}
export declare function PaneHeader(props: PaneHeaderProps): React.ReactElement;

export interface TabItem { id: string; label?: string; status?: RequestStatus; count?: number }
export interface TabsProps {
  tabs: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  label?: string;
  className?: string;
}
export declare function Tabs(props: TabsProps): React.ReactElement;

export interface TrayProps {
  label?: string;
  tabs?: TabItem[];
  tab?: string;
  defaultTab?: string;
  onTabChange?: (id: string) => void;
  /** Contents of the 44px toolbar row inside the panel. */
  toolbar?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Tray(props: TrayProps): React.ReactElement;

export interface RequestRow {
  key: string;
  title: string;
  status: RequestStatus;
  priority?: Priority;
  owner?: string | null;
  due?: string;
  overdue?: boolean;
  blocked?: boolean;
  checked?: boolean;
  comments?: number;
}
export interface RequestTableProps {
  rows: RequestRow[];
  selected?: string | null;
  defaultSelected?: string | null;
  onOpen?: (key: string) => void;
  className?: string;
}
export declare function RequestTable(props: RequestTableProps): React.ReactElement;

export interface EmptyStateProps { title: string; body: string; action?: React.ReactNode; className?: string }
export declare function EmptyState(props: EmptyStateProps): React.ReactElement;

export interface MenuOption { value: string; label: string; icon?: IconRef; hint?: string; separated?: boolean }
export interface MenuProps {
  options: MenuOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  title?: string;
  searchable?: boolean;
  placeholder?: string;
  /** Highlighted option index. Default 0. */
  activeIndex?: number;
  /** px. Default 240. */
  width?: number;
  className?: string;
}
export declare function Menu(props: MenuProps): React.ReactElement;

export interface ModalProps {
  title: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}
export declare function Modal(props: ModalProps): React.ReactElement;

export interface WorkflowStepperProps {
  status: RequestStatus;
  /** Default true. False shows Approval as "No approval", struck through. */
  needsApproval?: boolean;
  blocked?: boolean;
  className?: string;
}
export declare function WorkflowStepper(props: WorkflowStepperProps): React.ReactElement;

export interface PropertyRow { label: string; value: React.ReactNode; editable?: boolean }
export interface PropertyListProps {
  rows: PropertyRow[];
  /** 'list' for the 288px inspector, 'facts' for the inline strip. */
  layout?: 'list' | 'facts';
  className?: string;
}
export declare function PropertyList(props: PropertyListProps): React.ReactElement;

export interface NextStepProps {
  title: string;
  body?: React.ReactNode;
  meta?: string;
  status?: RequestStatus;
  icon?: IconRef;
  tone?: 'default' | 'danger';
  /** Tint toward the status: only when the current person must act. */
  emphasis?: boolean;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}
export declare function NextStep(props: NextStepProps): React.ReactElement;

export interface ComposerProps {
  onSubmit?: (body: string) => void;
  placeholder?: string;
  submitLabel?: string;
  defaultValue?: string;
  className?: string;
}
export declare function Composer(props: ComposerProps): React.ReactElement;

export type TimelineItem =
  | { kind: 'comment'; author: string; at: string; body: string }
  | { kind: 'event'; actor: string; text: string; icon: IconRef; iconColor?: string; at: string; note?: string };
export interface TimelineProps {
  items: TimelineItem[];
  /** The surface it sits on. Default var(--color-canvas). */
  background?: string;
  className?: string;
}
export declare function Timeline(props: TimelineProps): React.ReactElement;

export interface IconProps {
  name: string;
  size?: number;
  strokeWidth?: number;
  /** Accessible name when the icon stands alone. */
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Icon(props: IconProps): React.ReactElement;

export declare const STATUS_META: Record<RequestStatus, { label: string; color: string; verb: string }>;
export declare const PRIORITY_META: Record<Priority, { label: string; rank: number }>;

declare global {
  interface Window {
    Meridian: {
      Button: typeof Button; Kbd: typeof Kbd; Avatar: typeof Avatar; AvatarStack: typeof AvatarStack;
      StatusIcon: typeof StatusIcon; StatusChip: typeof StatusChip; BlockedChip: typeof BlockedChip; PriorityIcon: typeof PriorityIcon;
      Field: typeof Field; Checkbox: typeof Checkbox; SearchField: typeof SearchField; FilterChip: typeof FilterChip;
      NavItem: typeof NavItem; PaneHeader: typeof PaneHeader; Tabs: typeof Tabs; Tray: typeof Tray;
      RequestTable: typeof RequestTable; EmptyState: typeof EmptyState; Menu: typeof Menu; Modal: typeof Modal;
      WorkflowStepper: typeof WorkflowStepper; PropertyList: typeof PropertyList; NextStep: typeof NextStep;
      Composer: typeof Composer; Timeline: typeof Timeline; Icon: typeof Icon;
      STATUS_META: typeof STATUS_META; PRIORITY_META: typeof PRIORITY_META;
    };
  }
}
