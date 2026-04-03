import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

export const publish = mutationGeneric({
  args: {
    channel: v.string(),
    event: v.any(),
    publishedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const eventDoc = {
      channel: args.channel,
      event: args.event,
      publishedAt: args.publishedAt,
      createdAt: Date.now(),
    };

    try {
      const id = await ctx.db.insert("realtimeEvents" as never, eventDoc as never);
      return { ok: true, id, channel: args.channel };
    } catch {
      return {
        ok: false,
        channel: args.channel,
        error: "Missing Convex table 'realtimeEvents'. Add it in schema and run convex dev.",
      };
    }
  },
});

export const byChannel = queryGeneric({
  args: {
    channel: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const max = Math.min(Math.max(args.limit ?? 50, 1), 200);
    const rows = await ctx.db
      .query("realtimeEvents" as never)
      .withIndex("by_channel" as never, (q: any) => q.eq("channel", args.channel))
      .order("desc")
      .take(max);

    return rows.reverse();
  },
});
