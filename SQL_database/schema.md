## Table `cards_a`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `front` | `text` |  |
| `back` | `text` |  Nullable |
| `audioUrl` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `deck_id` | `uuid` |  Nullable |

## Table `cards_c`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `front` | `text` |  |
| `reading` | `text` |  Nullable |
| `back` | `text` |  Nullable |
| `audioUrl` | `text` |  Nullable |
| `tones` | `_int4` |  Nullable |
| `strokeColors` | `_text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `deck_id` | `uuid` |  Nullable |

## Table `profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `username` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `global_streak` | `int4` |  Nullable |
| `global_max_streak` | `int4` |  Nullable |
| `global_last_active` | `timestamptz` |  Nullable |
| `email` | `text` |  |
| `review_limit` | `int4` |  |
| `learn_limit` | `int4` |  |
| `streak_goal` | `int4` |  |
| `avatar_url` | `text` |  Nullable |
| `avatar_history` | `jsonb` |  |
| `date_format` | `text` |  |
| `default_deck_view` | `text` |  |
| `heatmap_metric` | `text` |  |
| `avatar_icon` | `text` |  Nullable |
| `avatar_color` | `text` |  |
| `has_completed_onboarding` | `bool` |  |
| `lifetime_xp` | `int4` |  |

## Table `card_a_progress`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `uuid` | Primary |
| `card_id` | `uuid` | Primary |
| `deck_id` | `uuid` |  |
| `ease_factor` | `float8` |  |
| `review_interval` | `int4` |  |
| `repetitions` | `int4` |  |
| `due_date` | `timestamptz` |  Nullable |
| `last_studied` | `timestamptz` |  Nullable |
| `status` | `text` |  |
| `suspended` | `bool` |  |

## Table `card_c_progress`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `uuid` | Primary |
| `card_id` | `uuid` | Primary |
| `deck_id` | `uuid` |  |
| `ease_factor` | `float8` |  |
| `review_interval` | `int4` |  |
| `repetitions` | `int4` |  |
| `due_date` | `timestamptz` |  Nullable |
| `last_studied` | `timestamptz` |  Nullable |
| `status` | `text` |  |
| `suspended` | `bool` |  |

## Table `decks`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `name` | `text` |  |
| `description` | `text` |  Nullable |
| `language` | `text` |  |
| `study_mode` | `text` |  Nullable |
| `tags` | `_text` |  Nullable |
| `cards_count` | `int4` |  |
| `last_reviewed` | `date` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `status` | `text` |  |
| `mastered_at` | `timestamptz` |  Nullable |
| `due_count` | `int4` |  |
| `waiting_count` | `int4` |  |
| `new_count` | `int4` |  |
| `mastered_count` | `int4` |  |
| `suspended_count` | `int4` |  |
| `active_cards_count` | `int4` |  |
| `familiar_count` | `int4` |  |
| `solid_count` | `int4` |  |

## Table `daily_user_stats`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `date` | `date` |  |
| `total_xp` | `int4` |  Nullable |
| `time_studied_seconds` | `int4` |  Nullable |
| `cards_learned` | `int4` |  Nullable |
| `global_streak` | `int4` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `cards_reviewed` | `int4` |  Nullable |
| `streak_state` | `text` |  Nullable |
| `max_global_streak` | `int4` |  Nullable |

## Table `daily_deck_stats`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `deck_id` | `uuid` |  |
| `date` | `date` |  |
| `due_count` | `int4` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `max_streak` | `int2` |  Nullable |
| `deck_streak` | `int2` |  Nullable |
| `streak_state` | `text` |  Nullable |
| `new_count` | `int4` |  Nullable |
| `waiting_count` | `int4` |  Nullable |
| `cards_reviewed` | `int4` |  |
| `cards_learned` | `int4` |  |
| `review_available_count` | `int4` |  |
| `learn_available_count` | `int4` |  |
| `suspended_count` | `int4` |  |

