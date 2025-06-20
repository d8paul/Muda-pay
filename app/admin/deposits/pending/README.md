# Pending Deposits Page - Refactored Structure

This page has been refactored into a clean, component-based architecture for better maintainability and reusability.

## File Structure

```
app/admin/deposits/pending/
├── page.tsx                    # Main page component (orchestrates everything)
├── types.ts                    # Shared TypeScript interfaces
├── components/
│   ├── DepositRow.tsx         # Individual deposit row component
│   ├── PendingDepositsTable.tsx # Table wrapper with loading/empty states
│   ├── RejectDepositDialog.tsx # Confirmation dialog for rejections
│   └── ApprovalFlow.tsx       # 2FA flow for approvals
└── hooks/
    ├── usePendingDeposits.ts  # Hook for fetching and managing deposits data
    └── useDepositActions.ts   # Hook for handling approve/reject actions
```

## Component Responsibilities

### `page.tsx`
- **Role**: Main orchestrator
- **Responsibilities**: 
  - Renders the page layout and header
  - Coordinates between hooks and components
  - Handles event delegation

### `components/PendingDepositsTable.tsx`
- **Role**: Table container
- **Responsibilities**:
  - Renders table structure
  - Handles loading and empty states
  - Maps deposits to DepositRow components

### `components/DepositRow.tsx`
- **Role**: Individual row renderer
- **Responsibilities**:
  - Displays deposit information
  - Renders action buttons
  - Delegates actions to parent

### `components/RejectDepositDialog.tsx`
- **Role**: Rejection confirmation
- **Responsibilities**:
  - Shows confirmation dialog for rejections
  - Handles user confirmation/cancellation

### `components/ApprovalFlow.tsx`
- **Role**: 2FA approval flow
- **Responsibilities**:
  - Wraps TwoFactorAuthDialog for approvals
  - Handles 2FA token submission

### `hooks/usePendingDeposits.ts`
- **Role**: Data management
- **Responsibilities**:
  - Fetches pending deposits from API
  - Manages deposits state
  - Provides deposit removal functionality

### `hooks/useDepositActions.ts`
- **Role**: Action management
- **Responsibilities**:
  - Handles approve/reject actions
  - Manages modal states
  - Provides action handlers with proper error handling

## Benefits of This Structure

1. **Separation of Concerns**: Each component has a single, clear responsibility
2. **Reusability**: Components can be easily reused in other parts of the app
3. **Testability**: Smaller components are easier to unit test
4. **Maintainability**: Changes to one aspect don't affect others
5. **Type Safety**: Centralized types prevent inconsistencies
6. **Custom Hooks**: Business logic is separated from UI components

## Usage Example

```tsx
// The main page coordinates everything:
const { isLoading, pendingDeposits, removeDeposit } = usePendingDeposits();
const { 
  openAction, 
  handleApprove, 
  handleReject,
  // ... other action states
} = useDepositActions();

// Components are composed together:
<PendingDepositsTable 
  deposits={pendingDeposits}
  onAction={openAction}
  isLoading={isLoading}
/>
```

This refactoring makes the code much more maintainable and follows React best practices for component composition and separation of concerns.
