# Yeda LMS - Developer Assignment

Your task is to build a small admin queue for course and bundle enrollment requests in a Yeda-like LMS.

Use the provided test input in `test_input.json`. You must implement the solution in React or Angular.

You are encouraged to use AI tools, documentation, and search during this assignment if it helps you move faster. AI usage is a positive signal only when the final code is still clean, maintainable, and clearly owned by you. Be ready to explain every line of code and every tradeoff in the live session.

No specific architecture pattern, state library, UI library, or testing library is required. Choose the implementation approach you think is best and be ready to defend it.

Timebox: 1-2 focused hours. Keep it small.

## Requirements

1. Load the assignment data from `test_input.json`.

2. Build an admin-facing enrollment requests queue.
   - Show requester name and email.
   - Show request type: `course` or `bundle`.
   - Show target course or bundle title.
   - Show branch, submitted date, status, source, and payment state.
   - Show an admin note if one exists.

3. Add filters.
   - Filter by status: all, pending, approved, rejected.
   - Filter by request type: all, course, bundle.
   - Filter by branch.
   - Include an empty state when no request matches the current filters.

4. Add counters.
   - Show total visible requests.
   - Show counts for pending, approved, and rejected.
   - Show counts for course requests and bundle requests.
   - Counters should update when filters change.

5. Support local approve/reject actions.
   - Pending requests can be approved or rejected.
   - Rejection requires a reason.
   - Approved/rejected requests should update locally without a backend.
   - Already approved/rejected requests should not be actionable.

6. Respect simple permission rules from the fixture's `currentUser`.
   - The current admin can act only on requests from their own `collegeId`.
   - If `allowedBranches` is not empty, the admin can act only on those branches.
   - Requests outside the allowed scope should remain visible but actions should be disabled with a clear reason.

7. Include a short backend note, no backend code.
   - Explain how this queue should persist approve/reject actions on the backend.
   - Explain what authorization checks the backend must enforce.
   - Briefly mention how duplicate approve/reject clicks should be handled.
   - Mention how AI was used, or explicitly state that it was not used.

8. Include light verification.
   - Add 1-2 tests, or describe 2-3 manual checks in your README.
   - Focus on filters/counters and approve/reject state changes.

9. Bonus: add Playwright E2E tests.
   - If you have time, cover one or two important user flows, for example approve/reject and a denied action state.
   - This is optional and should not come at the expense of a clean core implementation.

## Not Required

- A backend implementation.
- Database schema or migrations.
- Authentication implementation.
- Real role/permission system.
- Real payment provider integration.
- Salesforce integration.
- Email/SMS notification delivery.
- Pixel-perfect UI design.
- Full Yeda production repo setup.

## Submission Guidelines

- Share your solution as a public GitHub repository.
- Include clear setup and run instructions.
- Include a short note explaining:
  - What you implemented.
  - What you intentionally skipped.
  - How AI was used, what you reviewed, and what you changed after review. If you did not use AI, say so.
  - Why you chose React or Angular and your implementation approach.
  - How the backend should persist and authorize approve/reject actions.
  - What you would improve with more time.

## Evaluation Criteria

We will review:

- Correctness of filtering and counters.
- Correctness of approve/reject local state transitions.
- Clear handling of disabled actions and permission reasons.
- Clear and simple UI state.
- Quality of backend notes, not backend implementation.
- Test or manual verification discipline.
- Bonus: useful Playwright E2E coverage if it does not reduce core quality.
- Code readability and ability to explain decisions.
- Quality of AI-assisted code review and ownership.
- Scope control. A small complete solution is better than a large unfinished one.

Good luck.
