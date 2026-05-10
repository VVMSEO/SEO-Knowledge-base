# Security Spec for SEO Advisor

## 1. Data Invariants
- `documents` can only be read or written by the document's owner (`userId == request.auth.uid`).
- Document IDs must match the Google Drive file ID (alphanumeric and hyphens/underscores).
- All mandatory fields (`id`, `name`, `content`, `userId`, `folderId`, `createdAt`) must be provided and correctly typed.

## 2. The "Dirty Dozen" Payloads
1. Unauthorized write (unauthenticated).
2. Write with wrong `userId` (spoofing `userId`).
3. Write with missing required fields (e.g. `content`).
4. Read document of another user.
5. Create document with bad ID (1000 characters).
6. Update another user's document.
7. Set `createdAt` to a future timestamp or non-server timestamp.
8. Delete another user's document.
9. List documents without `where("userId", "==", auth.uid)`.
10. Update `userId` to a different user.
11. Write extra unapproved fields.
12. Write fields with incorrect types.

## 3. The Test Runner
A `firestore.rules.test.ts` will verify these payloads.
