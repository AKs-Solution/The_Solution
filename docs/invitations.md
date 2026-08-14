# Invitations

## Overview

The invitation system allows organization owners to invite new members by email. Invitations are token-based with a 7-day expiry.

## Invitation Flow

```
Owner enters email → System checks for existing membership
                     ↓
              Creates invitation record
                     ↓
              Token stored (crypto.randomBytes(32))
                     ↓
              Recipient logs in → Sees pending invitations at /invitations
                     ↓
              Accept or Decline
```

## API Endpoints

| Method | Path                             | Description                               |
| ------ | -------------------------------- | ----------------------------------------- |
| POST   | `/api/organizations/:id/members` | Invite a member by email                  |
| GET    | `/api/invitations`               | List pending invitations for current user |
| POST   | `/api/invitations/:id/accept`    | Accept an invitation                      |
| POST   | `/api/invitations/:id/decline`   | Decline an invitation                     |

## Invitation Validation

- Duplicate active invitations for the same email and organization are prevented
- Existing membership is checked before creating an invitation
- Invitations expire after 7 days
- Expired invitations cannot be accepted
- Accepted invitations cannot be replayed (status changed to "accepted")
- Declined invitations are marked but can be re-invited

## Membership After Acceptance

When a user accepts an invitation:

1. Invitation status changes to `accepted`
2. `OrganizationMember` record is created with the assigned role
3. `AuthEvent` is logged as `organization.invitation.accepted`

## Email Delivery

Invitation emails are sent via Resend when `RESEND_API_KEY` is configured (see `.env.example`). The invite link points to `/invitations`, where the recipient can sign in and accept. If no key is configured, emails are skipped with a server-log warning.

## Future Enhancements

- Reminder emails for pending invitations
- Bulk invitation support
- Invitation cancellation by owner
- Custom invitation messages
- Domain-restricted invitations
