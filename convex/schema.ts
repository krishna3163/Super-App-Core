import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  realtimeEvents: defineTable({
    channel: v.string(),
    event: v.any(),
    publishedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_channel", ["channel"])
    .index("by_channel_publishedAt", ["channel", "publishedAt"]),
});
