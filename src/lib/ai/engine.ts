import type { NextResponse } from "next/server";
import type { CreditActionType } from "@/lib/credits";
import {
  chargeAfterGate,
  gateCredits,
  type CreditGateSuccess,
} from "@/lib/credit-api";

export interface CreditRunResult<T> {
  ok: true;
  data: T;
  live: boolean;
}

export interface CreditRunError {
  ok: false;
  error: string;
  live: false;
  status?: number;
}

export type CreditRouteResult<T> =
  | CreditRunResult<T>
  | { ok: false; response: NextResponse };

/** Check credits → run handler → charge on success only. */
export async function runWithCredits<T>(
  action: CreditActionType,
  quantity: number,
  handler: (gate: CreditGateSuccess) => Promise<{ data: T; live?: boolean }>
): Promise<CreditRunResult<T> | CreditRunError> {
  const gate = await gateCredits(action, quantity);
  if (!gate.ok) {
    return { ok: false, error: "Insufficient credits", live: false, status: 402 };
  }

  try {
    const { data, live = true } = await handler(gate);
    if (live) {
      const charged = await chargeAfterGate(gate, action, quantity);
      if (!charged.ok) {
        console.error("[AIEngine] post-success charge failed:", charged.error);
      }
    }
    return { ok: true, data, live };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e), live: false };
  }
}

/** Like runWithCredits but preserves the gate NextResponse on credit failure. */
export async function runWithCreditsForRoute<T>(
  action: CreditActionType,
  quantity: number,
  handler: (gate: CreditGateSuccess) => Promise<{ data: T; live?: boolean }>
): Promise<CreditRouteResult<T>> {
  const gate = await gateCredits(action, quantity);
  if (!gate.ok) {
    return { ok: false, response: gate.response };
  }

  try {
    const { data, live = true } = await handler(gate);
    if (live) {
      const charged = await chargeAfterGate(gate, action, quantity);
      if (!charged.ok) {
        console.error("[AIEngine] post-success charge failed:", charged.error);
      }
    }
    return { ok: true, data, live };
  } catch (e) {
    const { NextResponse } = await import("next/server");
    return {
      ok: false,
      response: NextResponse.json({ error: String(e) }, { status: 500 }),
    };
  }
}

export class AIEngine {
  static run = runWithCredits;
  static runForRoute = runWithCreditsForRoute;
}
