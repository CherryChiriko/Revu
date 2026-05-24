# SQL Database

`supabase_sql.sql` is the canonical Supabase migration for study state.

It replaces the old numbered scratch snippets and defines:

- explicit card states: `new`, `waiting`, `due`, and `mastered`
- deck counts derived from both `cards_a` and `cards_c`
- per-deck daily reviewed/learned counters
- timezone-local daily streak rows
- limit-based active, inactive, and frozen streak states

Cards become `mastered` when `review_interval >= public.card_mastered_interval_days()`.
That helper currently returns `180`, so the threshold can be changed in one place if the SRS policy changes.

Use the JSONB overload for session updates when a session can touch more than one deck:

```sql
select public.update_streaks_after_session(
  auth.uid(),
  '[{"deck_id":"00000000-0000-0000-0000-000000000000","cards_reviewed":10,"cards_learned":0}]'::jsonb,
  10,
  5,
  'America/Los_Angeles'
);
```

The legacy overload is kept only for single-deck sessions because total counts cannot be split safely across multiple decks.
