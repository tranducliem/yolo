import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin, AdminError } from "@/lib/admin";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { status, trackingNumber } = await request.json();

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (trackingNumber) updates.tracking_number = trackingNumber;

    const { error } = await supabaseAdmin.from("orders").update(updates).eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }

    // Notify user of status change
    if (status) {
      const { data: order } = await supabaseAdmin
        .from("orders")
        .select("user_id, order_number")
        .eq("id", id)
        .single();

      if (order) {
        const statusLabels: Record<string, string> = {
          processing: "準備中",
          shipping: "発送済み",
          completed: "配達完了",
        };
        await supabaseAdmin.from("notifications").insert({
          user_id: order.user_id,
          type: "order",
          title: "注文ステータス更新",
          body: `注文 ${order.order_number} が「${statusLabels[status] || status}」に更新されました`,
          icon: "📦",
          link: "/orders",
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[admin/orders/[id]] Error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
