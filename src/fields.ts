export const USER_FIELDS = [
  "created_at",
  "description",
  "entities",
  "id",
  "location",
  "most_recent_tweet_id",
  "name",
  "pinned_tweet_id",
  "profile_image_url",
  "protected",
  "public_metrics",
  "url",
  "username",
  "verified",
  "verified_type",
  "withheld",
] as const;

export const DEFAULT_USER_FIELDS: readonly (typeof USER_FIELDS)[number][] = [
  "created_at",
  "description",
  "id",
  "location",
  "name",
  "profile_image_url",
  "public_metrics",
  "url",
  "username",
  "verified",
  "verified_type",
];

export const TWEET_FIELDS = [
  "attachments",
  "author_id",
  "context_annotations",
  "conversation_id",
  "created_at",
  "edit_controls",
  "entities",
  "geo",
  "id",
  "in_reply_to_user_id",
  "lang",
  "possibly_sensitive",
  "public_metrics",
  "referenced_tweets",
  "reply_settings",
  "source",
  "text",
  "withheld",
] as const;

export const DEFAULT_TWEET_FIELDS: readonly (typeof TWEET_FIELDS)[number][] = [
  "created_at",
  "text",
  "author_id",
  "public_metrics",
  "conversation_id",
  "referenced_tweets",
  "entities",
];

export const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
} as const;
