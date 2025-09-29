// hooks/useRentAnalytics.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function useRentAnalytics() {
  const [analytics, setAnalytics] = useState({
    total_collected: 0,
    total_outstanding: 0,
    total_late: 0,
    occupied_properties: 0,
    total_payments: 0,
  });

  const calculateAnalytics = (payments: any[]) => {
    const total_collected = payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    const total_late = payments
      .filter((p) => p.status === "late" || (p.status !== "paid" && new Date(p.due_date) < new Date()))
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    const total_outstanding = payments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    const occupied_properties = new Set(
      payments.filter((p) => p.status === "paid").map((p) => p.lease_id)
    ).size;

    const total_payments = payments.length;

    setAnalytics({ total_collected, total_outstanding, total_late, occupied_properties, total_payments });
  };

  useEffect(() => {
    const fetchPayments = async () => {
      const { data } = await supabase.from("rent_payment").select("*");
      if (data) calculateAnalytics(data);
    };

    fetchPayments();

    // ✅ Create a Realtime channel
    const channel = supabase
      .channel("rent_payment_channel") // any unique channel name
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rent_payment" },
        () => {
          fetchPayments();
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return analytics;
}